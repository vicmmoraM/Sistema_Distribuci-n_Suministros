// Login con soporte dual: LOCAL (pruebas) y LDAP (producción)
// AUTH_MODE=local  → valida contra tabla usuarios (para pruebas sin AD)
// AUTH_MODE=ldap   → valida contra Active Directory (producción)

const express = require('express')
const router = express.Router()
const { pool } = require('../config/db')

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
    'SELECT id_usuario FROM usuarios WHERE login = ?',
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
    // UPDATE — sincronizar nombre y departamento con el AD
    await conn.query(
      `UPDATE usuarios
       SET nombres = ?, id_departamento = ?
       WHERE login = ?`,
      [nombres, departamento, login]
    )
    return rows[0].id_usuario
  }
}

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
      const [rows] = await conn.query(
        `SELECT id_usuario, nombres, login, password
         FROM usuarios
         WHERE login = ? AND id_departamento = ?`,
        [username, departmentId]
      )

      if (rows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(401).json({ error: 'Usuario no encontrado en ese departamento.' })
      }

      const user = rows[0]

      if (user.password !== password) {
        await conn.rollback()
        conn.release()
        return res.status(401).json({ error: 'Contraseña incorrecta.' })
      }

      // Upsert — sincronizar datos
      await syncUser(conn, user.login, user.nombres, departmentId)

      // Obtener el nombre del departamento
      const [deptInfoRows] = await conn.query(
        'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
        [departmentId]
      )
      const departmentName = deptInfoRows.length > 0 ? deptInfoRows[0].descripcion : null

      await conn.commit()
      conn.release()

      req.session.loggedin = true
      req.session.userlogin = user.login
      req.session.username = user.nombres
      req.session.departamento = departmentId

      return res.json({
        message: 'Login exitoso (modo local)',
        user: { 
          login: user.login, 
          nombre: user.nombres, 
          departamento: departmentId,
          departmentName: departmentName,
        },
      })

    } else {
      // ── MODO PRODUCCIÓN: validar contra LDAP ───────────────────────
      const { authenticateUser } = require('../config/ldap')

      const [deptRows] = await conn.query(
        'SELECT descripcion FROM departamentos WHERE id_departamento = ?',
        [departmentId]
      )

      if (deptRows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({ error: 'Departamento no válido.' })
      }

      // ✅ Ya no se pasa department — ldap.js busca en todo el BASE_DN
      const user = await authenticateUser(username, password)

      // Upsert — sincronizar con datos frescos del AD
      await syncUser(conn, user.username, user.displayName, departmentId)

      const departmentName = deptRows[0].descripcion

      await conn.commit()
      conn.release()

      req.session.loggedin = true
      req.session.userlogin = user.username
      req.session.username = user.displayName
      req.session.departamento = departmentId

      return res.json({
        message: 'Login exitoso',
        user: { 
          login: user.username, 
          nombre: user.displayName, 
          departamento: departmentId,
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