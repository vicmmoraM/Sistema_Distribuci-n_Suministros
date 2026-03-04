// Login con soporte dual: LOCAL (pruebas) y LDAP (producción)
// AUTH_MODE=local  → valida contra tabla usuarios (para pruebas sin AD)
// AUTH_MODE=ldap   → valida contra Active Directory (producción)

const express = require('express')
const router = express.Router()
const { pool } = require('../config/db')

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function resolveDepartmentAlias(ldapDepartment, ldapDn = '') {
  const dep = normalizeText(ldapDepartment)
  const dn = normalizeText(ldapDn)

  if (dep === 'servidor' || dn.includes('ou=pdv')) {
    return 'comercial'
  }

  return dep
}

/**
 * syncUser — Upsert del usuario en la tabla usuarios
 * Si no existe lo crea, si existe actualiza nombre y departamento.
 * Esto garantiza que la BD esté siempre sincronizada con el AD.
 *
 * @param {object} conn        - Conexión MySQL activa
 * @param {string} login       - Usuario de red
 * @param {string} nombres     - Nombre completo (viene del AD)
 * @param {number} departamento- ID del departamento
 * @returns {number}           - ID del usuario en la tabla usuarios
 */
async function syncUser(conn, login, nombres, departamento) {
  // Verificar si ya existe
  const [rows] = await conn.query(
    'SELECT id_usuario, id_departamento FROM usuarios WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))',
    [login]
  )

  if (rows.length === 0) {
    // INSERT — usuario nuevo
    const [result] = await conn.query(
      `INSERT INTO usuarios (id_departamento, id_rol, login, nombres, email)
       VALUES (?, 1, ?, ?, ?)`,
      [departamento, login, nombres, `${login}@farmcorp.com.ec`]
    )
    return result.insertId
  } else {
    // UPDATE — solo actualizar el nombre, NO el departamento
    // El departamento es inmutable una vez asignado
    await conn.query(
      `UPDATE usuarios
       SET nombres = ?
       WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))`,
      [nombres, login]
    )
    return rows[0].id_usuario
  }
}

async function getDepartmentInfo(conn, departmentId) {
  const [deptRows] = await conn.query(
    `SELECT
      d.descripcion AS departmentName,
      COALESCE(pd.monto_autorizado, 0) AS departmentBudget
     FROM departamentos d
     LEFT JOIN presupuesto_departamentos pd ON pd.id_departamento = d.id_departamento
     WHERE d.id_departamento = ?
     LIMIT 1`,
    [departmentId]
  )

  if (deptRows.length === 0) {
    return { departmentName: null, departmentBudget: 0 }
  }

  return {
    departmentName: deptRows[0].departmentName,
    departmentBudget: Number(deptRows[0].departmentBudget || 0),
  }
}

async function getRolePermissions(conn, roleId) {
  if (!roleId) {
    return {
      pedidos: true,
      reportes: false,
      aprobacion: false,
      configuracion: false,
      roleId: null,
      roleName: null,
    }
  }

  const [rows] = await conn.query(
    `SELECT
      r.id_rol,
      r.descripcion AS roleName,
      COALESCE(rp.puede_pedidos, 1) AS pedidos,
      COALESCE(rp.puede_reportes, 0) AS reportes,
      COALESCE(rp.puede_aprobacion, 0) AS aprobacion,
      COALESCE(rp.puede_configuracion, 0) AS configuracion
     FROM roles r
     LEFT JOIN rol_permisos rp ON rp.id_rol = r.id_rol
     WHERE r.id_rol = ?
     LIMIT 1`,
    [roleId]
  )

  if (rows.length === 0) {
    return {
      pedidos: true,
      reportes: false,
      aprobacion: false,
      configuracion: false,
      roleId,
      roleName: null,
    }
  }

  return {
    pedidos: Boolean(rows[0].pedidos),
    reportes: Boolean(rows[0].reportes),
    aprobacion: Boolean(rows[0].aprobacion),
    configuracion: Boolean(rows[0].configuracion),
    roleId: rows[0].id_rol,
    roleName: rows[0].roleName,
  }
}

/**
 * GET /api/auth/departamento/:username
 * Obtiene el departamento de un usuario por su login (para pre-llenar el formulario)
 * En modo LOCAL: consulta la BD
 * En modo LDAP: consulta Active Directory
 */
router.get('/departamento/:username', async (req, res) => {
  try {
    const { username } = req.params

    if (!username) {
      return res.status(400).json({ error: 'Username requerido.' })
    }

    // Intentar buscar en la BD PRIMERO (funciona para usuarios existentes en ambos modos)
    const [bdRows] = await pool.query(
      `SELECT u.id_departamento, u.nombres, d.descripcion as departmentName,
              COALESCE(pd.monto_autorizado, 0) AS departmentBudget
       FROM usuarios u
       INNER JOIN departamentos d ON u.id_departamento = d.id_departamento
       LEFT JOIN presupuesto_departamentos pd ON pd.id_departamento = d.id_departamento
       WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(?))`,
      [username]
    )

    if (bdRows.length > 0) {
      // Usuario existe en BD, devolver su departamento configurado
      const user = bdRows[0]
      return res.json({
        id_departamento: user.id_departamento,
        departmentName: user.departmentName,
        departmentBudget: Number(user.departmentBudget || 0),
        nombres: user.nombres,
      })
    }

    // Usuario NO existe en BD, intentar extraer de LDAP (si está configurado)
    if (process.env.AUTH_MODE !== 'ldap') {
      return res.status(404).json({ error: 'Usuario no encontrado en el sistema.' })
    }

    // Modo LDAP: Consultar Active Directory
    const { getUserDepartmentFromLDAP } = require('../config/ldap')
    
    const ldapData = await getUserDepartmentFromLDAP(username)
    
    // Buscar el ID del departamento en la BD basándose en el nombre del LDAP
    const [allDepts] = await pool.query('SELECT id_departamento, descripcion FROM departamentos')

    const departamentoLDAP = resolveDepartmentAlias(ldapData.department, ldapData.dn)
    const deptMatch = allDepts.find(d => normalizeText(d.descripcion) === departamentoLDAP)

    if (!deptMatch) {
      return res.status(404).json({ 
        error: `Departamento "${ldapData.department}" no encontrado en el sistema. Contacta al administrador.` 
      })
    }

    return res.json({
      id_departamento: deptMatch.id_departamento,
      departmentName: deptMatch.descripcion,
      nombres: ldapData.displayName,
    })
  } catch (err) {
    console.error('Error en GET /auth/departamento:', err.message)
    return res.status(500).json({ error: err.message || 'Error al obtener departamento.' })
  }
})

/**
 * POST /api/auth/login
 * Body: { username, password, departmentId }
 */
router.post('/login', async (req, res) => {
  const { username, password, departmentId } = req.body

  if (!username || !password || !departmentId) {
    return res.status(400).json({ error: 'Usuario, contraseña y departamento son requeridos.' })
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    if (process.env.AUTH_MODE === 'local') {
      // ── MODO TEST: validar contra tabla usuarios ────────────────────
      // Primero obtener el usuario SIN validar departamento
      const [rows] = await conn.query(
        'SELECT id_usuario, id_departamento, id_rol, nombres, login, password, activo FROM usuarios WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))',
        [username]
      )

      if (rows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(401).json({ error: 'Usuario no encontrado.' })
      }

      const user = rows[0]
      const userRealDepartmentId = user.id_departamento

      if (!user.activo) {
        await conn.rollback()
        conn.release()
        return res.status(403).json({ error: 'Tu usuario está desactivado. Contacta al administrador.' })
      }

      if (user.password !== password) {
        await conn.rollback()
        conn.release()
        return res.status(401).json({ error: 'Contraseña incorrecta.' })
      }

      // ✅ VALIDAR que el departamento seleccionado = departamento real del usuario
      if (Number(userRealDepartmentId) !== Number(departmentId)) {
        await conn.rollback()
        conn.release()
        
        const [correctDept] = await pool.query(
          'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
          [userRealDepartmentId]
        )
        const correctDeptName = correctDept.length > 0 ? correctDept[0].descripcion : 'tu departamento asignado'
        
        return res.status(403).json({ 
          error: `Departamento incorrecto. Debes ingresar con: ${correctDeptName}` 
        })
      }

      // Upsert — sincronizar datos
      await syncUser(conn, user.login, user.nombres, userRealDepartmentId)

      // Obtener el nombre del departamento
      const { departmentName, departmentBudget } = await getDepartmentInfo(conn, userRealDepartmentId)
      const permissionsData = await getRolePermissions(conn, user.id_rol)

      await conn.commit()
      conn.release()

      req.session.loggedin = true
      req.session.userId = user.id_usuario
      req.session.userlogin = user.login
      req.session.username = user.nombres
      req.session.departamento = userRealDepartmentId

      return res.json({
        message: 'Login exitoso (modo local)',
        user: { 
          login: user.login, 
          nombre: user.nombres, 
          departamento: userRealDepartmentId,
          departmentName: departmentName,
          departmentBudget: departmentBudget,
          roleId: permissionsData.roleId,
          roleName: permissionsData.roleName,
          permissions: {
            pedidos: permissionsData.pedidos,
            reportes: permissionsData.reportes,
            aprobacion: permissionsData.aprobacion,
            configuracion: permissionsData.configuracion,
          },
        },
      })

    } else {
      // ── MODO PRODUCCIÓN: validar contra LDAP ───────────────────────
      const { authenticateUser, getUserDepartmentFromLDAP } = require('../config/ldap')

      // ✅ Autenticar en LDAP
      const user = await authenticateUser(username, password)

      // ✅ Obtener el departamento REAL del usuario desde la BD o LDAP
      const [userInDbRows] = await conn.query(
        'SELECT id_usuario, id_departamento, id_rol, activo FROM usuarios WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))',
        [user.username]
      )

      let userRealDepartmentId = null
      let userId = null
      let userRoleId = null

      if (userInDbRows.length > 0) {
        // Usuario ya existe en la BD — usar su departamento asignado
        userRealDepartmentId = userInDbRows[0].id_departamento
        userId = userInDbRows[0].id_usuario
        userRoleId = userInDbRows[0].id_rol

        if (!userInDbRows[0].activo) {
          await conn.rollback()
          conn.release()
          return res.status(403).json({ error: 'Tu usuario está desactivado. Contacta al administrador.' })
        }
      } else {
        // Usuario nuevo — extraer departamento de LDAP
        const ldapData = await getUserDepartmentFromLDAP(user.username)
        
        // Buscar el ID del departamento en la BD
        const [allDepts] = await conn.query('SELECT id_departamento, descripcion FROM departamentos')
        const departamentoLDAP = resolveDepartmentAlias(ldapData.department, ldapData.dn)
        const deptMatch = allDepts.find(d => normalizeText(d.descripcion) === departamentoLDAP)

        if (!deptMatch) {
          await conn.rollback()
          conn.release()
          return res.status(403).json({ 
            error: `Tu departamento "${ldapData.department}" no está configurado en el sistema. Contacta al administrador.` 
          })
        }

        userRealDepartmentId = deptMatch.id_departamento
      }

      // ✅ VALIDAR que el departamento seleccionado = departamento real
      if (Number(userRealDepartmentId) !== Number(departmentId)) {
        await conn.rollback()
        conn.release()
        
        const [correctDept] = await pool.query(
          'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
          [userRealDepartmentId]
        )
        const correctDeptName = correctDept.length > 0 ? correctDept[0].descripcion : 'tu departamento asignado'
        
        return res.status(403).json({ 
          error: `Departamento incorrecto. Debes ingresar con: ${correctDeptName}` 
        })
      }

      // Upsert — sincronizar nombre (el departamento es inmutable)
      const syncedUserId = await syncUser(conn, user.username, user.displayName, userRealDepartmentId)
      userId = userId || syncedUserId

      const [userRows] = await conn.query(
        'SELECT id_rol FROM usuarios WHERE id_usuario = ? LIMIT 1',
        [userId]
      )
      userRoleId = userRows.length > 0 ? userRows[0].id_rol : null

      const { departmentName, departmentBudget } = await getDepartmentInfo(conn, userRealDepartmentId)
      const permissionsData = await getRolePermissions(conn, userRoleId)

      await conn.commit()
      conn.release()

      req.session.loggedin = true
      req.session.userId = userId
      req.session.userlogin = user.username
      req.session.username = user.displayName
      req.session.departamento = userRealDepartmentId

      return res.json({
        message: 'Login exitoso',
        user: { 
          login: user.username, 
          nombre: user.displayName, 
          departamento: userRealDepartmentId,
          departmentName: departmentName,
          departmentBudget: departmentBudget,
          roleId: permissionsData.roleId,
          roleName: permissionsData.roleName,
          permissions: {
            pedidos: permissionsData.pedidos,
            reportes: permissionsData.reportes,
            aprobacion: permissionsData.aprobacion,
            configuracion: permissionsData.configuracion,
          },
        },
      })
    }

  } catch (err) {
    await conn.rollback()
    conn.release()
    console.error('Error en login:', err.message)
    return res.status(401).json({ error: err.message || 'Error de autenticación.' })
  }
})

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Error al cerrar sesión.' })
      res.clearCookie('connect.sid')
      return res.json({ message: 'Sesión cerrada correctamente.' })
    })
  } catch (err) {
    console.error('Error en logout:', err.message)
    return res.status(500).json({ error: 'Error interno al cerrar sesión.' })
  }
})

/**
 * GET /api/auth/me
 * Verifica si hay sesión activa (útil al recargar el frontend).
 * Devuelve también el nombre del departamento.
 */
router.get('/me', async (req, res) => {
  try {
    if (req.session && req.session.loggedin && req.session.userlogin) {
      const conn = await pool.getConnection()

      const [userRows] = await conn.query(
        `SELECT id_usuario, id_departamento, id_rol, nombres, login, activo
         FROM usuarios
         WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))
         LIMIT 1`,
        [req.session.userlogin]
      )

      if (userRows.length === 0 || !userRows[0].activo) {
        conn.release()
        req.session.destroy(() => {})
        return res.status(401).json({ loggedin: false })
      }

      const currentUser = userRows[0]
      const { departmentName, departmentBudget } = await getDepartmentInfo(conn, currentUser.id_departamento)
      const permissionsData = await getRolePermissions(conn, currentUser.id_rol)

      req.session.userId = currentUser.id_usuario
      req.session.userlogin = currentUser.login
      req.session.username = currentUser.nombres
      req.session.departamento = currentUser.id_departamento

      conn.release()

      return res.json({
        loggedin: true,
        login: currentUser.login,
        nombre: currentUser.nombres,
        departamento: currentUser.id_departamento,
        departmentName: departmentName,
        departmentBudget: departmentBudget,
        roleId: permissionsData.roleId,
        roleName: permissionsData.roleName,
        permissions: {
          pedidos: permissionsData.pedidos,
          reportes: permissionsData.reportes,
          aprobacion: permissionsData.aprobacion,
          configuracion: permissionsData.configuracion,
        },
      })
    }
    return res.status(401).json({ loggedin: false })
  } catch (err) {
    console.error('Error en /me:', err.message)
    return res.status(500).json({ error: 'Error interno.' })
  }
})

module.exports = router