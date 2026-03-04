const express = require('express')
const router = express.Router()
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')

async function requireAdminAccess(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
        u.activo,
        COALESCE(rp.puede_configuracion, 0) AS puede_configuracion
       FROM usuarios u
       LEFT JOIN rol_permisos rp ON rp.id_rol = u.id_rol
       WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(?))
       LIMIT 1`,
      [req.session.userlogin]
    )

    if (rows.length === 0 || !rows[0].activo || !rows[0].puede_configuracion) {
      return res.status(403).json({ error: 'No tienes permisos para acceder al panel administrativo.' })
    }

    next()
  } catch (err) {
    console.error('Error verificando acceso admin:', err.message)
    return res.status(500).json({ error: 'Error al validar permisos de administrador.' })
  }
}

router.use(requireAuth, requireAdminAccess)

router.get('/meta', async (req, res) => {
  try {
    const [departamentos] = await pool.query(
      'SELECT id_departamento, descripcion FROM departamentos ORDER BY descripcion ASC'
    )
    const [roles] = await pool.query(
      'SELECT id_rol, descripcion FROM roles ORDER BY descripcion ASC'
    )
    const [categorias] = await pool.query(
      'SELECT id_tipo_suministro, descripcion FROM tipo_suministros ORDER BY descripcion ASC'
    )
    const [estadosSuministro] = await pool.query(
      'SELECT id_estado_suministro, descripcion FROM estado_suministros ORDER BY descripcion ASC'
    )

    return res.json({ departamentos, roles, categorias, estadosSuministro })
  } catch (err) {
    console.error('Error cargando metadatos admin:', err.message)
    return res.status(500).json({ error: 'Error al cargar metadatos administrativos.' })
  }
})

router.get('/overview', async (req, res) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios')
    const [[usersActive]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1')
    const [[suppliesCount]] = await pool.query('SELECT COUNT(*) AS total FROM suministros')
    const [[suppliesLow]] = await pool.query('SELECT COUNT(*) AS total FROM suministros WHERE stock <= 10')

    return res.json({
      totalUsers: Number(usersCount.total || 0),
      activeUsers: Number(usersActive.total || 0),
      totalSupplies: Number(suppliesCount.total || 0),
      lowStockSupplies: Number(suppliesLow.total || 0),
    })
  } catch (err) {
    console.error('Error overview admin:', err.message)
    return res.status(500).json({ error: 'Error al obtener métricas del panel.' })
  }
})

router.get('/users', async (req, res) => {
  const { search = '', role = '', status = '' } = req.query

  try {
    const params = []
    const conditions = []

    if (search) {
      conditions.push('(u.nombres LIKE ? OR u.email LIKE ? OR u.login LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (role) {
      conditions.push('u.id_rol = ?')
      params.push(Number(role))
    }

    if (status === 'active') conditions.push('u.activo = 1')
    if (status === 'inactive') conditions.push('u.activo = 0')

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        u.id_usuario,
        u.nombres,
        u.login,
        u.email,
        u.id_rol,
        u.id_departamento,
        r.descripcion AS rol,
        u.activo,
        DATE_FORMAT(u.fecha_registro, '%Y-%m-%d %H:%i:%s') AS fecha_registro
      FROM usuarios u
      INNER JOIN roles r ON r.id_rol = u.id_rol
      ${whereClause}
      ORDER BY u.fecha_registro DESC, u.id_usuario DESC`,
      params
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando usuarios:', err.message)
    return res.status(500).json({ error: 'Error al obtener usuarios.' })
  }
})

router.post('/users', async (req, res) => {
  const { nombres, login, email, id_rol, id_departamento, password } = req.body

  if (!nombres || !login || !email || !id_rol || !id_departamento || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios (id_departamento, id_rol, login, password, nombres, email, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [id_departamento, id_rol, login, password, nombres, email]
    )

    return res.status(201).json({ id_usuario: result.insertId, message: 'Usuario creado correctamente.' })
  } catch (err) {
    console.error('Error creando usuario:', err.message)
    return res.status(500).json({ error: 'Error al crear usuario.' })
  }
})

router.put('/users/:id', async (req, res) => {
  const userId = Number(req.params.id)
  const { nombres, email, id_rol, id_departamento, password } = req.body

  if (!nombres || !email || !id_rol || !id_departamento) {
    return res.status(400).json({ error: 'Nombres, email, rol y departamento son obligatorios.' })
  }

  try {
    if (password) {
      await pool.query(
        `UPDATE usuarios
         SET nombres = ?, email = ?, id_rol = ?, id_departamento = ?, password = ?
         WHERE id_usuario = ?`,
        [nombres, email, id_rol, id_departamento, password, userId]
      )
    } else {
      await pool.query(
        `UPDATE usuarios
         SET nombres = ?, email = ?, id_rol = ?, id_departamento = ?
         WHERE id_usuario = ?`,
        [nombres, email, id_rol, id_departamento, userId]
      )
    }

    return res.json({ message: 'Usuario actualizado correctamente.' })
  } catch (err) {
    console.error('Error actualizando usuario:', err.message)
    return res.status(500).json({ error: 'Error al actualizar usuario.' })
  }
})

router.patch('/users/:id/status', async (req, res) => {
  const userId = Number(req.params.id)
  const { activo } = req.body

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El estado activo debe ser booleano.' })
  }

  try {
    await pool.query('UPDATE usuarios SET activo = ? WHERE id_usuario = ?', [activo ? 1 : 0, userId])
    return res.json({ message: activo ? 'Usuario activado.' : 'Usuario desactivado.' })
  } catch (err) {
    console.error('Error actualizando estado usuario:', err.message)
    return res.status(500).json({ error: 'Error al actualizar estado del usuario.' })
  }
})

router.delete('/users/:id', async (req, res) => {
  const userId = Number(req.params.id)

  try {
    await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [userId])
    return res.json({ message: 'Usuario eliminado correctamente.' })
  } catch (err) {
    console.error('Error eliminando usuario:', err.message)
    return res.status(500).json({ error: 'Error al eliminar usuario.' })
  }
})

router.get('/supplies', async (req, res) => {
  const { search = '', category = '' } = req.query

  try {
    const params = []
    const conditions = []

    if (search) {
      conditions.push('s.descripcion LIKE ?')
      params.push(`%${search}%`)
    }

    if (category) {
      conditions.push('s.id_tipo_suministro = ?')
      params.push(Number(category))
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        s.id_suministro,
        s.descripcion,
        s.id_tipo_suministro,
        ts.descripcion AS categoria,
        s.stock,
        s.id_estado_suministro,
        es.descripcion AS estado,
        DATE_FORMAT(s.fecha_actualizacion, '%Y-%m-%d %H:%i:%s') AS fecha_actualizacion
      FROM suministros s
      INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
      INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
      ${whereClause}
      ORDER BY s.fecha_actualizacion DESC, s.descripcion ASC`,
      params
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando suministros:', err.message)
    return res.status(500).json({ error: 'Error al obtener suministros.' })
  }
})

router.post('/supplies', async (req, res) => {
  const { descripcion, id_tipo_suministro, stock = 0, id_estado_suministro = 1 } = req.body

  if (!descripcion || !id_tipo_suministro) {
    return res.status(400).json({ error: 'Descripción y categoría son obligatorios.' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO suministros (descripcion, id_tipo_suministro, stock, id_estado_suministro)
       VALUES (?, ?, ?, ?)`,
      [descripcion, id_tipo_suministro, Number(stock), id_estado_suministro]
    )

    return res.status(201).json({ id_suministro: result.insertId, message: 'Suministro creado correctamente.' })
  } catch (err) {
    console.error('Error creando suministro:', err.message)
    return res.status(500).json({ error: 'Error al crear suministro.' })
  }
})

router.put('/supplies/:id', async (req, res) => {
  const supplyId = Number(req.params.id)
  const { descripcion, id_tipo_suministro, stock, id_estado_suministro } = req.body

  if (!descripcion || !id_tipo_suministro || stock === undefined || !id_estado_suministro) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' })
  }

  try {
    await pool.query(
      `UPDATE suministros
       SET descripcion = ?, id_tipo_suministro = ?, stock = ?, id_estado_suministro = ?
       WHERE id_suministro = ?`,
      [descripcion, id_tipo_suministro, Number(stock), id_estado_suministro, supplyId]
    )

    return res.json({ message: 'Suministro actualizado correctamente.' })
  } catch (err) {
    console.error('Error actualizando suministro:', err.message)
    return res.status(500).json({ error: 'Error al actualizar suministro.' })
  }
})

router.patch('/supplies/:id/stock', async (req, res) => {
  const supplyId = Number(req.params.id)
  const { stock } = req.body

  if (stock === undefined || Number(stock) < 0) {
    return res.status(400).json({ error: 'Stock inválido.' })
  }

  try {
    await pool.query('UPDATE suministros SET stock = ? WHERE id_suministro = ?', [Number(stock), supplyId])
    return res.json({ message: 'Stock actualizado correctamente.' })
  } catch (err) {
    console.error('Error actualizando stock:', err.message)
    return res.status(500).json({ error: 'Error al actualizar stock.' })
  }
})

router.delete('/supplies/:id', async (req, res) => {
  const supplyId = Number(req.params.id)

  try {
    await pool.query('DELETE FROM suministros WHERE id_suministro = ?', [supplyId])
    return res.json({ message: 'Suministro eliminado correctamente.' })
  } catch (err) {
    console.error('Error eliminando suministro:', err.message)
    return res.status(500).json({ error: 'Error al eliminar suministro.' })
  }
})

router.get('/roles', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        r.id_rol,
        r.descripcion,
        COALESCE(rp.puede_pedidos, 1) AS puede_pedidos,
        COALESCE(rp.puede_reportes, 0) AS puede_reportes,
        COALESCE(rp.puede_aprobacion, 0) AS puede_aprobacion,
        COALESCE(rp.puede_configuracion, 0) AS puede_configuracion,
        COUNT(u.id_usuario) AS total_usuarios
      FROM roles r
      LEFT JOIN rol_permisos rp ON rp.id_rol = r.id_rol
      LEFT JOIN usuarios u ON u.id_rol = r.id_rol
      GROUP BY r.id_rol, r.descripcion, rp.puede_pedidos, rp.puede_reportes, rp.puede_aprobacion, rp.puede_configuracion
      ORDER BY r.descripcion ASC`
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando roles:', err.message)
    return res.status(500).json({ error: 'Error al obtener roles.' })
  }
})

router.put('/roles/:id/permissions', async (req, res) => {
  const roleId = Number(req.params.id)
  const {
    puede_pedidos = false,
    puede_reportes = false,
    puede_aprobacion = false,
    puede_configuracion = false,
  } = req.body

  try {
    await pool.query(
      `INSERT INTO rol_permisos (id_rol, puede_pedidos, puede_reportes, puede_aprobacion, puede_configuracion)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         puede_pedidos = VALUES(puede_pedidos),
         puede_reportes = VALUES(puede_reportes),
         puede_aprobacion = VALUES(puede_aprobacion),
         puede_configuracion = VALUES(puede_configuracion)`,
      [
        roleId,
        puede_pedidos ? 1 : 0,
        puede_reportes ? 1 : 0,
        puede_aprobacion ? 1 : 0,
        puede_configuracion ? 1 : 0,
      ]
    )

    return res.json({ message: 'Permisos actualizados correctamente.' })
  } catch (err) {
    console.error('Error actualizando permisos:', err.message)
    return res.status(500).json({ error: 'Error al actualizar permisos del rol.' })
  }
})

module.exports = router
