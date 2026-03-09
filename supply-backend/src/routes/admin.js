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
    const [proveedores] = await pool.query(
      'SELECT id_proveedor, nombre_proveedor FROM proveedores ORDER BY nombre_proveedor ASC'
    )
    const [zonasComerciales] = await pool.query(
      'SELECT id_zona_comercial, zona, codigo_zona FROM zonas_comerciales ORDER BY zona ASC'
    )
    const [gruposPdvs] = await pool.query(
      'SELECT id_grupo_pdv, descripcion, monto_autorizado FROM grupo_pdvs ORDER BY descripcion ASC'
    )
    const [estadosPdvs] = await pool.query(
      'SELECT id_estado_pdv, descripcion FROM estado_pdvs ORDER BY descripcion ASC'
    )

    return res.json({ departamentos, roles, categorias, estadosSuministro, proveedores, zonasComerciales, gruposPdvs, estadosPdvs })
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
  const { nombres, email, id_rol, id_departamento, password, activo } = req.body

  // Para crear: se requieren todos los campos
  // Para editar: solo se requieren rol, departamento y activo
  if (!id_rol || !id_departamento) {
    return res.status(400).json({ error: 'Rol y departamento son obligatorios.' })
  }

  try {
    // Si tiene email y password, es una creación o actualización completa
    if (email && password) {
      await pool.query(
        `UPDATE usuarios
         SET nombres = ?, email = ?, id_rol = ?, id_departamento = ?, password = ?, activo = ?
         WHERE id_usuario = ?`,
        [nombres, email, id_rol, id_departamento, password, activo ? 1 : 0, userId]
      )
    } else {
      // Edición simple: solo rol, departamento y estado activo
      await pool.query(
        `UPDATE usuarios
         SET id_rol = ?, id_departamento = ?, activo = ?
         WHERE id_usuario = ?`,
        [id_rol, id_departamento, activo ? 1 : 0, userId]
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
  const { search = '', category = '', provider = '' } = req.query

  try {
    const params = []
    const conditions = []

    if (search) {
      conditions.push('(s.descripcion LIKE ? OR pr.nombre_proveedor LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category) {
      conditions.push('s.id_tipo_suministro = ?')
      params.push(Number(category))
    }

    if (provider) {
      conditions.push('sp.id_proveedor = ?')
      params.push(Number(provider))
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
        sp.id_suministro_precio,
        sp.id_proveedor,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
        sp.precio_compra,
        DATE_FORMAT(s.fecha_actualizacion, '%Y-%m-%d %H:%i:%s') AS fecha_actualizacion
      FROM suministros s
      INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
      INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
      LEFT JOIN suministros_precios sp ON sp.id_suministro = s.id_suministro
      LEFT JOIN proveedores pr ON pr.id_proveedor = sp.id_proveedor
      ${whereClause}
      ORDER BY s.descripcion ASC, pr.nombre_proveedor ASC, sp.id_suministro_precio ASC`,
      params
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando suministros:', err.message)
    return res.status(500).json({ error: 'Error al obtener suministros.' })
  }
})

router.post('/supplies', async (req, res) => {
  const {
    descripcion,
    id_tipo_suministro,
    stock = 0,
    id_estado_suministro = 1,
    id_proveedor,
    precio_compra,
  } = req.body

  if (!descripcion || !id_tipo_suministro) {
    return res.status(400).json({ error: 'Descripción y categoría son obligatorios.' })
  }

  if ((id_proveedor && precio_compra === undefined) || (!id_proveedor && precio_compra !== undefined)) {
    return res.status(400).json({ error: 'Debes enviar proveedor y precio juntos.' })
  }

  if (precio_compra !== undefined && Number(precio_compra) < 0) {
    return res.status(400).json({ error: 'El precio no puede ser negativo.' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO suministros (descripcion, id_tipo_suministro, stock, id_estado_suministro)
       VALUES (?, ?, ?, ?)`,
      [descripcion, id_tipo_suministro, Number(stock), id_estado_suministro]
    )

    if (id_proveedor && precio_compra !== undefined) {
      await pool.query(
        `INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           precio_compra = VALUES(precio_compra),
           ultima_actualizacion = CURRENT_TIMESTAMP`,
        [result.insertId, Number(id_proveedor), Number(precio_compra)]
      )
    }

    return res.status(201).json({ id_suministro: result.insertId, message: 'Suministro creado correctamente.' })
  } catch (err) {
    console.error('Error creando suministro:', err.message)
    return res.status(500).json({ error: 'Error al crear suministro.' })
  }
})

router.put('/supplies/:id', async (req, res) => {
  const supplyId = Number(req.params.id)
  const {
    descripcion,
    id_tipo_suministro,
    stock,
    id_estado_suministro,
    id_suministro_precio,
    id_proveedor,
    precio_compra,
  } = req.body

  if (!descripcion || !id_tipo_suministro || stock === undefined || !id_estado_suministro) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' })
  }

  if (!id_proveedor || precio_compra === undefined) {
    return res.status(400).json({ error: 'Proveedor y precio son obligatorios para editar suministro.' })
  }

  if (Number(precio_compra) < 0) {
    return res.status(400).json({ error: 'El precio no puede ser negativo.' })
  }

  try {
    await pool.query(
      `UPDATE suministros
       SET descripcion = ?, id_tipo_suministro = ?, stock = ?, id_estado_suministro = ?
       WHERE id_suministro = ?`,
      [descripcion, id_tipo_suministro, Number(stock), id_estado_suministro, supplyId]
    )

    if (id_suministro_precio) {
      const [rows] = await pool.query(
        `SELECT id_suministro_precio, id_suministro, id_proveedor
         FROM suministros_precios
         WHERE id_suministro_precio = ? AND id_suministro = ?
         LIMIT 1`,
        [Number(id_suministro_precio), supplyId]
      )

      if (rows.length === 0) {
        return res.status(404).json({ error: 'No se encontró el registro de proveedor/precio del suministro.' })
      }

      const current = rows[0]

      if (Number(current.id_proveedor) === Number(id_proveedor)) {
        await pool.query(
          `UPDATE suministros_precios
           SET precio_compra = ?, ultima_actualizacion = CURRENT_TIMESTAMP
           WHERE id_suministro_precio = ?`,
          [Number(precio_compra), Number(id_suministro_precio)]
        )
      } else {
        await pool.query(
          `INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             precio_compra = VALUES(precio_compra),
             ultima_actualizacion = CURRENT_TIMESTAMP`,
          [supplyId, Number(id_proveedor), Number(precio_compra)]
        )

        await pool.query(
          'DELETE FROM suministros_precios WHERE id_suministro_precio = ?',
          [Number(id_suministro_precio)]
        )
      }
    } else {
      await pool.query(
        `INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           precio_compra = VALUES(precio_compra),
           ultima_actualizacion = CURRENT_TIMESTAMP`,
        [supplyId, Number(id_proveedor), Number(precio_compra)]
      )
    }

    return res.json({ message: 'Suministro actualizado correctamente.' })
  } catch (err) {
    console.error('Error actualizando suministro:', err.message)
    return res.status(500).json({ error: 'Error al actualizar suministro.' })
  }
})

router.delete('/supplies/:id', async (req, res) => {
  const supplyId = Number(req.params.id)

  try {
    // Primero eliminar los precios asociados
    await pool.query('DELETE FROM suministros_precios WHERE id_suministro = ?', [supplyId])
    
    // Luego eliminar el suministro
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

// =====================================================
// PDVs - PROVEEDORES
// =====================================================

router.get('/pdvs', async (req, res) => {
  const { search = '', zone = '', provider = '' } = req.query

  try {
    const params = []
    const conditions = []

    if (search) {
      conditions.push('(p.descripcion LIKE ? OR p.direccion LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (zone) {
      conditions.push('p.id_zona_comercial = ?')
      params.push(Number(zone))
    }

    if (provider) {
      conditions.push('p.id_proveedor_principal = ?')
      params.push(Number(provider))
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        p.id_pdv,
        p.descripcion,
        p.direccion,
        p.id_proveedor_principal,
        p.id_grupo_pdv,
        p.id_estado_pdv,
        p.id_zona_comercial,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
        zc.zona AS zona_comercial,
        ep.descripcion AS estado,
        gp.descripcion AS grupo,
        gp.monto_autorizado
      FROM pdvs p
      LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
      INNER JOIN zonas_comerciales zc ON zc.id_zona_comercial = p.id_zona_comercial
      INNER JOIN estado_pdvs ep ON ep.id_estado_pdv = p.id_estado_pdv
      INNER JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
      ${whereClause}
      ORDER BY p.descripcion ASC`,
      params
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando PDVs:', err.message)
    return res.status(500).json({ error: 'Error al obtener PDVs.' })
  }
})

router.post('/pdvs', async (req, res) => {
  const {
    descripcion,
    direccion,
    id_grupo_pdv,
    id_estado_pdv,
    id_zona_comercial,
    id_proveedor_principal
  } = req.body

  if (!descripcion || !id_grupo_pdv || !id_estado_pdv || !id_zona_comercial) {
    return res.status(400).json({ error: 'Descripción, grupo, estado y zona comercial son obligatorios.' })
  }

  try {
    const proveedorValue = id_proveedor_principal === null || id_proveedor_principal === '' ? null : Number(id_proveedor_principal)

    const [result] = await pool.query(
      `INSERT INTO pdvs (descripcion, direccion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [descripcion, direccion || null, Number(id_grupo_pdv), Number(id_estado_pdv), Number(id_zona_comercial), proveedorValue]
    )

    return res.status(201).json({ id_pdv: result.insertId, message: 'PDV creado correctamente.' })
  } catch (err) {
    console.error('Error creando PDV:', err.message)
    return res.status(500).json({ error: 'Error al crear PDV.' })
  }
})

router.put('/pdvs/:id', async (req, res) => {
  const pdvId = Number(req.params.id)
  const { id_proveedor_principal, id_grupo_pdv } = req.body

  if (!id_grupo_pdv) {
    return res.status(400).json({ error: 'El grupo del PDV es obligatorio.' })
  }

  try {
    const proveedorValue = id_proveedor_principal === null || id_proveedor_principal === '' ? null : Number(id_proveedor_principal)

    await pool.query(
      'UPDATE pdvs SET id_proveedor_principal = ?, id_grupo_pdv = ? WHERE id_pdv = ?',
      [proveedorValue, Number(id_grupo_pdv), pdvId]
    )

    return res.json({ message: 'PDV actualizado correctamente.' })
  } catch (err) {
    console.error('Error actualizando PDV:', err.message)
    return res.status(500).json({ error: 'Error al actualizar PDV.' })
  }
})

// =====================================================
// CATEGORÍAS (TIPO_SUMINISTROS)
// =====================================================

router.get('/categories', async (req, res) => {
  const { search = '' } = req.query

  try {
    const params = []
    const conditions = []

    if (search) {
      conditions.push('ts.descripcion LIKE ?')
      params.push(`%${search}%`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        ts.id_tipo_suministro,
        ts.descripcion,
        COUNT(s.id_suministro) AS total_suministros
      FROM tipo_suministros ts
      LEFT JOIN suministros s ON s.id_tipo_suministro = ts.id_tipo_suministro
      ${whereClause}
      GROUP BY ts.id_tipo_suministro, ts.descripcion
      ORDER BY ts.descripcion ASC`,
      params
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando categorías:', err.message)
    return res.status(500).json({ error: 'Error al obtener categorías.' })
  }
})

router.post('/categories', async (req, res) => {
  const { descripcion } = req.body

  if (!descripcion || descripcion.trim() === '') {
    return res.status(400).json({ error: 'La descripción es obligatoria.' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tipo_suministros (descripcion) VALUES (?)',
      [descripcion.trim()]
    )

    return res.status(201).json({
      id_tipo_suministro: result.insertId,
      message: 'Categoría creada correctamente.'
    })
  } catch (err) {
    console.error('Error creando categoría:', err.message)
    return res.status(500).json({ error: 'Error al crear categoría.' })
  }
})

router.put('/categories/:id', async (req, res) => {
  const categoryId = Number(req.params.id)
  const { descripcion } = req.body

  if (!descripcion || descripcion.trim() === '') {
    return res.status(400).json({ error: 'La descripción es obligatoria.' })
  }

  try {
    await pool.query(
      'UPDATE tipo_suministros SET descripcion = ? WHERE id_tipo_suministro = ?',
      [descripcion.trim(), categoryId]
    )

    return res.json({ message: 'Categoría actualizada correctamente.' })
  } catch (err) {
    console.error('Error actualizando categoría:', err.message)
    return res.status(500).json({ error: 'Error al actualizar categoría.' })
  }
})

router.delete('/categories/:id', async (req, res) => {
  const categoryId = Number(req.params.id)

  try {
    // Verificar si hay suministros usando esta categoría
    const [[check]] = await pool.query(
      'SELECT COUNT(*) AS total FROM suministros WHERE id_tipo_suministro = ?',
      [categoryId]
    )

    if (check.total > 0) {
      return res.status(400).json({
        error: `No se puede eliminar esta categoría porque tiene ${check.total} suministro(s) asociado(s).`
      })
    }

    await pool.query('DELETE FROM tipo_suministros WHERE id_tipo_suministro = ?', [categoryId])

    return res.json({ message: 'Categoría eliminada correctamente.' })
  } catch (err) {
    console.error('Error eliminando categoría:', err.message)
    return res.status(500).json({ error: 'Error al eliminar categoría.' })
  }
})

module.exports = router
