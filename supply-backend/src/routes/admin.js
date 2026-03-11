const express = require('express')
const router = express.Router()
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const bcrypt = require('bcrypt')
const adminDepartamentosRoutes = require('./admin/departamentos')
const adminSupplyAccessRoutes = require('./admin/supplyAccess')

async function requireAdminAccess(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
        u.activo,
        MAX(CASE WHEN vrp.permiso = 'CONFIGURACION' THEN 1 ELSE 0 END) AS puede_configuracion
       FROM usuarios u
       LEFT JOIN v_rol_permisos vrp ON vrp.id_rol = u.id_rol
       WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(?))
       GROUP BY u.id_usuario, u.activo
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
router.use(adminDepartamentosRoutes)
router.use(adminSupplyAccessRoutes)

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
      'SELECT id_zona_comercial, id_ciudad, zona, codigo_zona FROM zonas_comerciales ORDER BY zona ASC'
    )
    const [ciudades] = await pool.query(
      'SELECT id_ciudad, id_region, descripcion FROM ciudades ORDER BY descripcion ASC'
    )
    const [gruposPdvs] = await pool.query(
      'SELECT id_grupo_pdv, descripcion, monto_autorizado FROM grupo_pdvs ORDER BY descripcion ASC'
    )
    const [estadosPdvs] = await pool.query(
      'SELECT id_estado_pdv, descripcion FROM estado_pdvs ORDER BY descripcion ASC'
    )
    const [supervisores] = await pool.query(
      'SELECT id_supervisor, nombres FROM supervisores WHERE activo = 1 ORDER BY nombres ASC'
    )
    const [regiones] = await pool.query(
      'SELECT id_region, descripcion FROM regiones ORDER BY descripcion ASC'
    )

    return res.json({ departamentos, roles, categorias, estadosSuministro, proveedores, zonasComerciales, ciudades, gruposPdvs, estadosPdvs, supervisores, regiones })
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
    const [[suppliesLow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM (
         SELECT s.id_suministro, COALESCE(SUM(sps.stock), 0) AS stock_total
         FROM suministros s
         LEFT JOIN suministro_proveedor_stock sps ON sps.id_suministro = s.id_suministro
         GROUP BY s.id_suministro
       ) x
       WHERE x.stock_total <= 10`
    )

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
    const passwordHash = await bcrypt.hash(String(password), 12)
    const [result] = await pool.query(
      `INSERT INTO usuarios (id_departamento, id_rol, login, password, nombres, email, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [id_departamento, id_rol, login, passwordHash, nombres, email]
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
    // Si viene password, se actualiza con hash.
    if (password && String(password).trim()) {
      const passwordHash = await bcrypt.hash(String(password), 12)
      await pool.query(
        `UPDATE usuarios
         SET nombres = ?, email = ?, id_rol = ?, id_departamento = ?, password = ?, activo = ?
         WHERE id_usuario = ?`,
        [nombres, email, id_rol, id_departamento, passwordHash, activo ? 1 : 0, userId]
      )
    } else {
      // Edición simple: no toca contraseña.
      await pool.query(
        `UPDATE usuarios
         SET nombres = COALESCE(?, nombres),
             email = COALESCE(?, email),
             id_rol = ?,
             id_departamento = ?,
             activo = ?
         WHERE id_usuario = ?`,
        [nombres || null, email || null, id_rol, id_departamento, activo ? 1 : 0, userId]
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
      conditions.push('spv.id_proveedor = ?')
      params.push(Number(provider))
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT
        s.id_suministro,
        s.descripcion,
        s.id_tipo_suministro,
        ts.descripcion AS categoria,
        COALESCE(sps.stock, 0) AS stock,
        COALESCE(sps.id_estado_suministro, s.id_estado_suministro) AS id_estado_suministro,
        es.descripcion AS estado,
        spv.id_suministro_precio,
        spv.id_proveedor,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
        spv.precio_compra,
        DATE_FORMAT(s.fecha_actualizacion, '%Y-%m-%d %H:%i:%s') AS fecha_actualizacion
      FROM suministros s
      INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
      LEFT JOIN suministros_precios spv
        ON spv.id_suministro = s.id_suministro
       AND spv.fecha_vigencia_hasta IS NULL
      LEFT JOIN proveedores pr ON pr.id_proveedor = spv.id_proveedor
      LEFT JOIN suministro_proveedor_stock sps
        ON sps.id_suministro = s.id_suministro
       AND sps.id_proveedor = spv.id_proveedor
      LEFT JOIN estado_suministros es
        ON es.id_estado_suministro = COALESCE(sps.id_estado_suministro, s.id_estado_suministro)
      ${whereClause}
      ORDER BY s.descripcion ASC, pr.nombre_proveedor ASC, spv.id_suministro_precio ASC`,
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
      `INSERT INTO suministros (descripcion, id_tipo_suministro, id_estado_suministro)
       VALUES (?, ?, ?)`,
      [descripcion, id_tipo_suministro, id_estado_suministro]
    )

    if (id_proveedor && precio_compra !== undefined) {
      await pool.query('CALL sp_actualizar_precio(?, ?, ?, ?)', [
        result.insertId,
        Number(id_proveedor),
        Number(precio_compra),
        req.session?.userId || null,
      ])

      await pool.query(
        `INSERT INTO suministro_proveedor_stock (id_suministro, id_proveedor, stock, id_estado_suministro)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           stock = VALUES(stock),
           id_estado_suministro = VALUES(id_estado_suministro)`,
        [result.insertId, Number(id_proveedor), Number(stock || 0), Number(id_estado_suministro || 1)]
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
       SET descripcion = ?, id_tipo_suministro = ?
       WHERE id_suministro = ?`,
      [descripcion, id_tipo_suministro, supplyId]
    )

    await pool.query('CALL sp_actualizar_precio(?, ?, ?, ?)', [
      supplyId,
      Number(id_proveedor),
      Number(precio_compra),
      req.session?.userId || null,
    ])

    await pool.query(
      `INSERT INTO suministro_proveedor_stock (id_suministro, id_proveedor, stock, id_estado_suministro)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         stock = VALUES(stock),
         id_estado_suministro = VALUES(id_estado_suministro)` ,
      [supplyId, Number(id_proveedor), Number(stock || 0), Number(id_estado_suministro)]
    )

    return res.json({ message: 'Suministro actualizado correctamente.' })
  } catch (err) {
    console.error('Error actualizando suministro:', err.message)
    return res.status(500).json({ error: 'Error al actualizar suministro.' })
  }
})

router.delete('/supplies/:id', async (req, res) => {
  const supplyId = Number(req.params.id)

  try {
    await pool.query('DELETE FROM suministro_proveedor_stock WHERE id_suministro = ?', [supplyId])
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
        MAX(CASE WHEN vrp.permiso = 'PEDIDOS' THEN 1 ELSE 0 END) AS puede_pedidos,
        MAX(CASE WHEN vrp.permiso = 'REPORTES' THEN 1 ELSE 0 END) AS puede_reportes,
        MAX(CASE WHEN vrp.permiso = 'APROBACION' THEN 1 ELSE 0 END) AS puede_aprobacion,
        MAX(CASE WHEN vrp.permiso = 'CONFIGURACION' THEN 1 ELSE 0 END) AS puede_configuracion,
        COUNT(u.id_usuario) AS total_usuarios
      FROM roles r
      LEFT JOIN v_rol_permisos vrp ON vrp.id_rol = r.id_rol
      LEFT JOIN usuarios u ON u.id_rol = r.id_rol
      GROUP BY r.id_rol, r.descripcion
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
    await pool.query('DELETE FROM rol_has_permisos WHERE id_rol = ?', [roleId])

    const permissionsToSet = [
      puede_pedidos ? 'PEDIDOS' : null,
      puede_reportes ? 'REPORTES' : null,
      puede_aprobacion ? 'APROBACION' : null,
      puede_configuracion ? 'CONFIGURACION' : null,
    ].filter(Boolean)

    for (const permissionCode of permissionsToSet) {
      await pool.query(
        `INSERT INTO rol_has_permisos (id_rol, id_permiso)
         SELECT ?, p.id_permiso
         FROM permisos p
         WHERE p.codigo = ?`,
        [roleId, permissionCode]
      )
    }

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
  const { search = '', region = '', zone = '', provider = '' } = req.query

  try {
    const params = []
    const conditions = []

    if (search) {
      conditions.push('(p.codigo_centro_costo LIKE ? OR p.direccion LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (region) {
      conditions.push('cp.id_region = ?')
      params.push(Number(region))
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
        p.codigo_centro_costo AS descripcion,
        p.direccion,
        p.id_proveedor_principal,
        p.id_grupo_pdv,
        p.id_estado_pdv,
        p.id_zona_comercial,
        p.id_supervisor,
        p.id_ciudad,
        cp.id_region,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
        COALESCE(cp.descripcion, 'Sin ciudad') AS ciudad,
        COALESCE(rp.descripcion, 'Sin región') AS region,
        zc.zona AS zona_comercial,
        ep.descripcion AS estado,
        gp.descripcion AS grupo,
        gp.monto_autorizado,
        COALESCE(sv.nombres, 'Sin supervisor') AS supervisor
      FROM pdvs p
      LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
      INNER JOIN zonas_comerciales zc ON zc.id_zona_comercial = p.id_zona_comercial
      LEFT JOIN ciudades cp ON cp.id_ciudad = p.id_ciudad
      LEFT JOIN regiones rp ON rp.id_region = cp.id_region
      LEFT JOIN supervisores sv ON sv.id_supervisor = p.id_supervisor
      INNER JOIN estado_pdvs ep ON ep.id_estado_pdv = p.id_estado_pdv
      INNER JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
      ${whereClause}
      ORDER BY p.codigo_centro_costo ASC`,
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
    id_ciudad,
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
    const ciudadValue = id_ciudad === null || id_ciudad === '' ? null : Number(id_ciudad)

    const [result] = await pool.query(
      `INSERT INTO pdvs (codigo_centro_costo, direccion, id_ciudad, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [descripcion, direccion || null, ciudadValue, Number(id_grupo_pdv), Number(id_estado_pdv), Number(id_zona_comercial), proveedorValue]
    )

    return res.status(201).json({ id_pdv: result.insertId, message: 'PDV creado correctamente.' })
  } catch (err) {
    console.error('Error creando PDV:', err.message)
    return res.status(500).json({ error: 'Error al crear PDV.' })
  }
})

router.put('/pdvs/:id', async (req, res) => {
  const pdvId = Number(req.params.id)
  const { id_proveedor_principal, id_grupo_pdv, direccion, id_zona_comercial, id_supervisor, id_ciudad } = req.body

  if (!id_grupo_pdv) {
    return res.status(400).json({ error: 'El grupo del PDV es obligatorio.' })
  }

  try {
    const proveedorValue = id_proveedor_principal === null || id_proveedor_principal === '' ? null : Number(id_proveedor_principal)
    const zonaValue = id_zona_comercial === null || id_zona_comercial === '' ? null : Number(id_zona_comercial)
    const supervisorValue = id_supervisor === null || id_supervisor === '' ? null : Number(id_supervisor)
    const ciudadValue = id_ciudad === null || id_ciudad === '' ? null : Number(id_ciudad)

    await pool.query(
      'UPDATE pdvs SET id_proveedor_principal = ?, id_grupo_pdv = ?, direccion = ?, id_zona_comercial = ?, id_supervisor = ?, id_ciudad = ? WHERE id_pdv = ?',
      [proveedorValue, Number(id_grupo_pdv), direccion || null, zonaValue, supervisorValue, ciudadValue, pdvId]
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