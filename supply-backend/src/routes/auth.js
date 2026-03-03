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
      `SELECT u.id_departamento, u.nombres, d.descripcion as departmentName
       FROM usuarios u
       INNER JOIN departamentos d ON u.id_departamento = d.id_departamento
       WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(?))`,
      [username]
    )

    if (bdRows.length > 0) {
      // Usuario existe en BD, devolver su departamento configurado
      const user = bdRows[0]
      return res.json({
        id_departamento: user.id_departamento,
        departmentName: user.departmentName,
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
        'SELECT id_usuario, id_departamento, nombres, login, password FROM usuarios WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))',
        [username]
      )

      if (rows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(401).json({ error: 'Usuario no encontrado.' })
      }

      const user = rows[0]
      const userRealDepartmentId = user.id_departamento

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
      const [deptInfoRows] = await conn.query(
        'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
        [userRealDepartmentId]
      )
      const departmentName = deptInfoRows.length > 0 ? deptInfoRows[0].descripcion : null

      await conn.commit()
      conn.release()

      req.session.loggedin = true
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
        },
      })

    } else {
      // ── MODO PRODUCCIÓN: validar contra LDAP ───────────────────────
      const { authenticateUser, getUserDepartmentFromLDAP } = require('../config/ldap')

      // ✅ Autenticar en LDAP
      const user = await authenticateUser(username, password)

      // ✅ Obtener el departamento REAL del usuario desde la BD o LDAP
      const [userInDbRows] = await conn.query(
        'SELECT id_departamento FROM usuarios WHERE LOWER(TRIM(login)) = LOWER(TRIM(?))',
        [user.username]
      )

      let userRealDepartmentId = null

      if (userInDbRows.length > 0) {
        // Usuario ya existe en la BD — usar su departamento asignado
        userRealDepartmentId = userInDbRows[0].id_departamento
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
      await syncUser(conn, user.username, user.displayName, userRealDepartmentId)

      const [deptRows] = await conn.query(
        'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
        [userRealDepartmentId]
      )
      const departmentName = deptRows.length > 0 ? deptRows[0].descripcion : null

      await conn.commit()
      conn.release()

      req.session.loggedin = true
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
      const [deptRows] = await conn.query(
        'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
        [req.session.departamento]
      )
      conn.release()

      const departmentName = deptRows.length > 0 ? deptRows[0].descripcion : null

      return res.json({
        loggedin: true,
        login: req.session.userlogin,
        nombre: req.session.username,
        departamento: req.session.departamento,
        departmentName: departmentName,
      })
    }
    return res.status(401).json({ loggedin: false })
  } catch (err) {
    console.error('Error en /me:', err.message)
    return res.status(500).json({ error: 'Error interno.' })
  }
})

module.exports = router