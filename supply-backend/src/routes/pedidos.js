// Endpoint principal: registrar pedido, validar datos contra BD,
// generar CSV y enviar email

const express    = require('express')
const router     = express.Router()
const path       = require('path')
const fs         = require('fs')
const { pool }   = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const { createObjectCsvWriter } = require('csv-writer')
const nodemailer = require('nodemailer')
const PedidoRepository = require('../repositories/PedidoRepository')

const pedidoRepository = new PedidoRepository()

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
})

/**
 * POST /api/pedidos
 * Registra un pedido completo con validaciones server-side.
 * No confía en precios ni totales del frontend — los recalcula desde BD.
 */
router.post('/', requireAuth, async (req, res) => {
  const { pdvId, items } = req.body

  // ── 1. Validación básica de estructura ─────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Los ítems son requeridos.' })
  }

  const fecha = new Date().toISOString().split('T')[0]
  const conn  = await pool.getConnection()

  try {
    await conn.beginTransaction()

    // Compatibilidad de esquema: algunas BD antiguas no tienen estas estructuras.
    const [[rotacionTableInfo]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'departamento_proveedores_rotacion'`
    )
    const hasDepartamentoProveedorRotacion = Number(rotacionTableInfo?.total || 0) > 0

    const [[detalleProveedorColumnInfo]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'detalle_pedidos'
         AND COLUMN_NAME = 'id_proveedor'`
    )
    const hasDetalleProveedorColumn = Number(detalleProveedorColumnInfo?.total || 0) > 0

    // ── 2. Contexto del usuario (departamento y presupuesto) ───────────────
    const [deptRows] = await conn.query(
      `SELECT
        LOWER(TRIM(d.descripcion)) AS departmentName,
        COALESCE(pd.monto_autorizado, 0) AS departmentBudget
       FROM departamentos d
       LEFT JOIN presupuesto_departamentos pd ON pd.id_departamento = d.id_departamento
       WHERE d.id_departamento = ?
       LIMIT 1`,
      [req.session.departamento]
    )

    const departmentName = deptRows.length > 0 ? deptRows[0].departmentName : ''
    const departmentBudget = deptRows.length > 0 ? Number(deptRows[0].departmentBudget || 0) : 0
    const esComercial = departmentName === 'comercial'

    if (esComercial && !pdvId) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({ error: 'PDV es requerido para el departamento Comercial.' })
    }

    let pdv = null
    let proveedorDepartamento = null
    
    if (esComercial) {
      const [pdvRows] = await conn.query(
        `SELECT p.id_pdv, p.codigo_centro_costo AS descripcion, p.direccion,
                p.id_proveedor_principal,
          c.descripcion AS ciudad,
                gp.monto_autorizado AS cupo
         FROM pdvs p
         INNER JOIN zonas_comerciales z ON p.id_zona_comercial = z.id_zona_comercial
         INNER JOIN ciudades c ON z.id_ciudad = c.id_ciudad
         INNER JOIN grupo_pdvs gp       ON p.id_grupo_pdv = gp.id_grupo_pdv
         WHERE p.id_pdv = ? AND p.id_estado_pdv = 1`,
        [pdvId]
      )

      if (pdvRows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({ error: 'PDV no válido o inactivo.' })
      }

      pdv = pdvRows[0]

      const inOrderWindow = await pedidoRepository.isPdvInOrderWindow(Number(pdvId), conn)
      if (!inOrderWindow) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({ error: 'Fuera de ventana de pedido para esta zona' })
      }
    } else if (hasDepartamentoProveedorRotacion) {
      // Para departamentos NO comerciales, calcular proveedor según rotación automática
      const mesActual = new Date().getMonth() + 1
      
      const [provRows] = await conn.query(
        `SELECT dpr.id_proveedor
         FROM departamento_proveedores_rotacion dpr
         WHERE dpr.id_departamento = ?
           AND dpr.orden_rotacion = (
             SELECT (((? - 1) % COUNT(*)) + 1)
             FROM departamento_proveedores_rotacion
             WHERE id_departamento = ?
           )
         LIMIT 1`,
        [req.session.departamento, mesActual, req.session.departamento]
      )
      
      if (provRows.length > 0) {
        proveedorDepartamento = provRows[0].id_proveedor
      }
    }

    // ── 4. Validar y recalcular cada ítem desde BD ──────────────────────────
    // No confiamos en precios ni totales del frontend
    const itemsValidados = []

    for (const item of items) {
      // Validar estructura del ítem
      if (!item.suministroId || !item.cantidad || item.cantidad < 1 || item.cantidad > 10) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `Ítem inválido: cantidad debe estar entre 1 y 10.`
        })
      }

      // Verificar que el suministro existe y está disponible
      // Prioridad: 1) Proveedor principal del PDV (Comercial), 2) Proveedor del departamento (mes actual), 3) Más barato
      const proveedorPreferido = esComercial && pdv ? pdv.id_proveedor_principal : proveedorDepartamento
      
      const [sumRows] = await conn.query(
        `SELECT 
          s.id_suministro, 
          s.descripcion,
          COALESCE(
            (
              SELECT sp.id_proveedor
              FROM suministros_precios sp
              WHERE sp.id_suministro = s.id_suministro
                AND sp.fecha_vigencia_hasta IS NULL
                AND (? IS NULL OR sp.id_proveedor = ?)
              ORDER BY sp.precio_compra ASC, sp.id_suministro_precio DESC
              LIMIT 1
            ),
            (
              SELECT sp.id_proveedor
              FROM suministros_precios sp
              WHERE sp.id_suministro = s.id_suministro
                AND sp.fecha_vigencia_hasta IS NULL
              ORDER BY sp.precio_compra ASC, sp.id_suministro_precio DESC
              LIMIT 1
            )
          ) AS proveedorId,
          COALESCE(
            (
              SELECT sp.precio_compra
              FROM suministros_precios sp
              WHERE sp.id_suministro = s.id_suministro
                AND sp.fecha_vigencia_hasta IS NULL
                AND (? IS NULL OR sp.id_proveedor = ?)
              ORDER BY sp.precio_compra ASC, sp.id_suministro_precio DESC
              LIMIT 1
            ),
            (
              SELECT sp.precio_compra
              FROM suministros_precios sp
              WHERE sp.id_suministro = s.id_suministro
                AND sp.fecha_vigencia_hasta IS NULL
              ORDER BY sp.precio_compra ASC, sp.id_suministro_precio DESC
              LIMIT 1
            ),
            0
          ) AS precio,
          t.id_tipo_suministro AS tipoId, 
          t.descripcion AS tipoNombre
         FROM suministros s
         INNER JOIN tipo_suministros t ON s.id_tipo_suministro = t.id_tipo_suministro
         WHERE s.id_suministro = ? AND s.id_estado_suministro = 1`,
        [proveedorPreferido, proveedorPreferido, proveedorPreferido, proveedorPreferido, item.suministroId]
      )

      if (sumRows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `Suministro ID ${item.suministroId} no existe o no está disponible.`
        })
      }

      const suministro = sumRows[0]

      // Recalcular precio y total desde BD — ignoramos lo que mandó el frontend
      itemsValidados.push({
        suministroId:     suministro.id_suministro,
        proveedorId:      suministro.proveedorId,
        suministroNombre: suministro.descripcion,
        tipoId:           suministro.tipoId,
        tipoNombre:       suministro.tipoNombre,
        cantidad:         Number(item.cantidad),
        precioUnitario:   Number(suministro.precio),
        total:            Number(item.cantidad) * Number(suministro.precio),
      })
    }

    // ── 5. Verificar límite en el backend ───────────────────────────────────
    const totalPedido = itemsValidados.reduce((s, i) => s + i.total, 0)

    if (esComercial) {
      if (totalPedido > Number(pdv.cupo)) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `El total $${totalPedido.toFixed(2)} supera el cupo asignado $${Number(pdv.cupo).toFixed(2)}.`
        })
      }
    } else if (totalPedido > departmentBudget) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({
        error: `El total $${totalPedido.toFixed(2)} supera el presupuesto del departamento $${departmentBudget.toFixed(2)}.`
      })
    }

    // ── 6. Obtener o crear usuario (Upsert) ────────────────────────────────
    const [usuRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE login = ?',
      [req.session.userlogin]
    )

    let usuarioId
    if (usuRows.length === 0) {
      const [ins] = await conn.query(
        'INSERT INTO usuarios (id_departamento, id_rol, login, nombres, email) VALUES (?, 1, ?, ?, ?)',
        [req.session.departamento, req.session.userlogin, req.session.username,
         `${req.session.userlogin}@farmcorp.com.ec`]
      )
      usuarioId = ins.insertId
    } else {
      // Upsert — mantener datos sincronizados
      await conn.query(
        'UPDATE usuarios SET nombres = ?, id_departamento = ? WHERE login = ?',
        [req.session.username, req.session.departamento, req.session.userlogin]
      )
      usuarioId = usuRows[0].id_usuario
    }

    // ── 7. Insertar cabecera del pedido ────────────────────────────────────
    const [cabIns] = await conn.query(
      'INSERT INTO cabecera_pedidos (id_usuario, id_pdv, id_estado_pedido) VALUES (?, ?, 1)',
      [usuarioId, esComercial ? pdvId : null]
    )
    const cabeceraPedidoId = cabIns.insertId

    // ── 8. Insertar detalles ───────────────────────────────────────────────
    for (const item of itemsValidados) {
      if (hasDetalleProveedorColumn) {
        await conn.query(
          'INSERT INTO detalle_pedidos (id_pedido, id_suministro, cantidad, precio_unitario, id_proveedor) VALUES (?, ?, ?, ?, ?)',
          [cabeceraPedidoId, item.suministroId, item.cantidad, item.precioUnitario, item.proveedorId]
        )
      } else {
        await conn.query(
          'INSERT INTO detalle_pedidos (id_pedido, id_suministro, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [cabeceraPedidoId, item.suministroId, item.cantidad, item.precioUnitario]
        )
      }
    }

    await conn.commit()
    conn.release()

    // ── 9. Calcular subtotales ─────────────────────────────────────────────
    const subtotalOficina  = itemsValidados.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
    const subtotalLimpieza = itemsValidados.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)

    // ── 10. Generar CSV ────────────────────────────────────────────────────
    const filesPath = process.env.FILES_PATH || './temp_files'
    if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath, { recursive: true })

    const nombreArchivo = `pedidoSuministro_${req.session.userlogin}_${fecha}`
    const csvPath       = path.join(filesPath, `${nombreArchivo}.csv`)

    const lugarSolicitud = esComercial
      ? (pdv?.descripcion || req.session.userlogin)
      : `Departamento ${departmentName.toUpperCase()}`
    const ciudadSolicitud = esComercial ? (pdv?.ciudad || 'N/A') : 'N/A'
    const direccionSolicitud = esComercial ? (pdv?.direccion || 'N/A') : 'N/A'
    const limiteMonto = esComercial ? Number(pdv?.cupo || 0) : Number(departmentBudget || 0)
    const limiteEtiqueta = esComercial ? 'Cupo PDV' : 'Presupuesto Departamento'

    const headerLines = [
      `Solicitado por:,${req.session.username}`,
      `Origen:,${lugarSolicitud}`,
      `Ciudad:,${ciudadSolicitud}`,
      `Dirección:,${direccionSolicitud}`,
      `${limiteEtiqueta}:,$${limiteMonto.toFixed(2)}`,
      '',
    ].join('\n')

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'descripcion',    title: 'Descripcion' },
        { id: 'tipo',           title: 'Tipo de Suministro' },
        { id: 'cantidad',       title: 'Cantidad' },
        { id: 'precioUnitario', title: 'Precio Unitario' },
        { id: 'total',          title: 'Total' },
      ],
    })

    fs.writeFileSync(csvPath, headerLines)
    await csvWriter.writeRecords(itemsValidados.map(i => ({
      descripcion:    i.suministroNombre,
      tipo:           i.tipoNombre,
      cantidad:       i.cantidad,
      precioUnitario: i.precioUnitario,
      total:          i.total.toFixed(2),
    })))

    fs.appendFileSync(csvPath, [
      '',
      `,,, Total S. Oficina:,${subtotalOficina.toFixed(2)}`,
      `,,, Total S. Limpieza:,${subtotalLimpieza.toFixed(2)}`,
      '',
      `,,, Total:,${totalPedido.toFixed(2)}`,
    ].join('\n'))

    // ── 11. Enviar email ───────────────────────────────────────────────────
    let emailEnviado = false

    if (process.env.MAIL_ENABLED === 'true') {
      try {
        await transporter.sendMail({
          from:    `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
          replyTo: process.env.MAIL_REPLY_TO,
          to:      process.env.MAIL_TO,
          subject: 'Pedido de Suministro',
          html:    `<font face="verdana" size="3">
                      Hola,<br><br>
                      Tienes un nuevo pedido de suministro por atender.<br><br>
                      Se adjunta la solicitud en formato CSV.<br><br>
                      <strong>Atentamente,</strong><br>Sistema de Pedidos.
                    </font>`,
          attachments: [{ filename: `${nombreArchivo}.csv`, path: csvPath }],
        })
        emailEnviado = true
      } catch (mailErr) {
        console.error('Error enviando email:', mailErr.message)
      } finally {
        if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath)
      }
    } else {
      // En modo test simplemente eliminamos el CSV
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath)
    }

    return res.json({
      success: true,
      pedidoId: cabeceraPedidoId,
      emailEnviado,
      mensaje: emailEnviado
        ? 'Su requerimiento ha sido enviado.'
        : 'Pedido registrado correctamente.',
    })

  } catch (err) {
    await conn.rollback()
    conn.release()
    console.error('Error en pedido:', err)
    return res.status(500).json({ error: 'Error al procesar el pedido.' })
  }
})

/**
 * GET /api/pedidos/aprobaciones
 * Lista de pedidos con filtros para el módulo de aprobaciones
 */
router.get('/aprobaciones', requireAuth, async (req, res) => {
  try {
    console.log('GET /api/pedidos/aprobaciones - Query params:', req.query)
    
    const { search, departamento, estado, fechaDesde, fechaHasta, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    
    const conditions = []
    const paramsCount = []
    
    // Filtro de búsqueda por ID o nombre de usuario
    if (search) {
      conditions.push('(cp.id_pedido = ? OR u.nombres LIKE ? OR u.login LIKE ?)')
      paramsCount.push(search, `%${search}%`, `%${search}%`)
    }
    
    // Filtro por departamento
    if (departamento) {
      conditions.push('d.id_departamento = ?')
      paramsCount.push(departamento)
    }
    
    // Filtro por estado
    if (estado) {
      conditions.push('cp.id_estado_pedido = ?')
      paramsCount.push(estado)
    }
    
    // Filtro por rango de fechas
    if (fechaDesde) {
      conditions.push('DATE(cp.fecha_registro) >= ?')
      paramsCount.push(fechaDesde)
    }
    
    if (fechaHasta) {
      conditions.push('DATE(cp.fecha_registro) <= ?')
      paramsCount.push(fechaHasta)
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
    
    // Contar total de registros
    const countSQL = `
      SELECT COUNT(*) as total
      FROM cabecera_pedidos cp
      INNER JOIN usuarios u ON cp.id_usuario = u.id_usuario
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
      ${whereClause}
    `
    const [[{ total }]] = await pool.query(countSQL, paramsCount)
    
    // Crear parámetros para el SELECT (duplicar los filtros)
    const paramsData = [...paramsCount, Number(limit), offset]
    
    // Obtener datos paginados
    const dataSQL = `
      SELECT 
        cp.id_pedido,
        cp.fecha_registro,
        u.nombres AS usuario_nombre,
        u.login AS usuario_login,
        COALESCE(d.descripcion, 'Sin departamento') AS departamento,
        e.descripcion AS estado,
        COALESCE(
          (SELECT SUM(dp.cantidad * dp.precio_unitario)
           FROM detalle_pedidos dp
           WHERE dp.id_pedido = cp.id_pedido), 0
        ) AS total
      FROM cabecera_pedidos cp
      INNER JOIN usuarios u ON cp.id_usuario = u.id_usuario
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
      ${whereClause}
      ORDER BY cp.fecha_registro DESC
      LIMIT ? OFFSET ?
    `
    const [rows] = await pool.query(dataSQL, paramsData)
    
    const response = {
      data: rows,
      total: Number(total),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    }
    return res.json(response)
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener pedidos', details: error.message })
  }
})

/**
 * GET /api/pedidos/:id
 * Obtener detalle completo de un pedido
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    
    // Obtener cabecera del pedido
    const [cabRows] = await pool.query(
      `SELECT 
        cp.id_pedido,
        cp.fecha_registro,
        u.nombres AS usuario_nombre,
        u.login AS usuario_login,
        COALESCE(d.descripcion, 'Sin departamento') AS departamento,
        e.descripcion AS estado,
        cp.id_estado_pedido,
        cp.observaciones_aprobacion,
        cp.motivo_rechazo
      FROM cabecera_pedidos cp
      INNER JOIN usuarios u ON cp.id_usuario = u.id_usuario
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
      WHERE cp.id_pedido = ?`,
      [id]
    )
    
    if (cabRows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }
    
    // Obtener items del pedido
    const [itemRows] = await pool.query(
      `SELECT 
        dp.id_suministro,
        s.descripcion AS suministro,
        ts.descripcion AS tipo_suministro,
        dp.cantidad,
        dp.precio_unitario,
        (dp.cantidad * dp.precio_unitario) AS subtotal,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor
      FROM detalle_pedidos dp
      INNER JOIN suministros s ON dp.id_suministro = s.id_suministro
      INNER JOIN tipo_suministros ts ON s.id_tipo_suministro = ts.id_tipo_suministro
      LEFT JOIN proveedores pr ON dp.id_proveedor = pr.id_proveedor
      WHERE dp.id_pedido = ?
      ORDER BY ts.descripcion, s.descripcion`,
      [id]
    )
    
    const total = itemRows.reduce((sum, item) => sum + Number(item.subtotal), 0)
    
    return res.json({
      ...cabRows[0],
      items: itemRows,
      total,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el pedido' })
  }
})

/**
 * PUT /api/pedidos/:id/items
 * Actualiza los items de un pedido pendiente (cantidades y eliminaciones).
 */
router.put('/:id/items', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { items } = req.body || {}

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un producto.' })
    }

    const parsedItems = items.map((item) => ({
      suministroId: Number(item?.suministroId),
      cantidad: Number(item?.cantidad),
    }))

    const hasInvalidItem = parsedItems.some(
      (item) => !Number.isInteger(item.suministroId)
        || item.suministroId <= 0
        || !Number.isInteger(item.cantidad)
        || item.cantidad <= 0
    )

    if (hasInvalidItem) {
      return res.status(400).json({ error: 'Items inválidos. Verifica producto y cantidad.' })
    }

    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      const [[pedido]] = await conn.query(
        `SELECT cp.id_pedido, cp.id_estado_pedido, e.descripcion AS estado
         FROM cabecera_pedidos cp
         INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
         WHERE cp.id_pedido = ?`,
        [id]
      )

      if (!pedido) {
        await conn.rollback()
        conn.release()
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }

      const estado = String(pedido.estado || '').toLowerCase()
      if (!(estado.includes('pend') || estado.includes('espera'))) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({ error: 'Solo se pueden editar pedidos pendientes.' })
      }

      const [currentDetailRows] = await conn.query(
        `SELECT id_suministro, precio_unitario, id_proveedor
         FROM detalle_pedidos
         WHERE id_pedido = ?`,
        [id]
      )

      const detailBySupply = new Map(
        currentDetailRows.map((row) => [Number(row.id_suministro), row])
      )

      const hasUnknownSupply = parsedItems.some(
        (item) => !detailBySupply.has(item.suministroId)
      )

      if (hasUnknownSupply) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({ error: 'No se puede agregar productos nuevos en esta edición.' })
      }

      await conn.query('DELETE FROM detalle_pedidos WHERE id_pedido = ?', [id])

      for (const item of parsedItems) {
        const current = detailBySupply.get(item.suministroId)
        await conn.query(
          `INSERT INTO detalle_pedidos (id_pedido, id_suministro, cantidad, precio_unitario, id_proveedor)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            item.suministroId,
            item.cantidad,
            Number(current.precio_unitario || 0),
            current.id_proveedor || null,
          ]
        )
      }

      const [cabRows] = await conn.query(
        `SELECT 
          cp.id_pedido,
          cp.fecha_registro,
          u.nombres AS usuario_nombre,
          u.login AS usuario_login,
          COALESCE(d.descripcion, 'Sin departamento') AS departamento,
          e.descripcion AS estado,
          cp.id_estado_pedido
        FROM cabecera_pedidos cp
        INNER JOIN usuarios u ON cp.id_usuario = u.id_usuario
        LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
        INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
        WHERE cp.id_pedido = ?`,
        [id]
      )

      const [itemRows] = await conn.query(
        `SELECT 
          dp.id_suministro,
          s.descripcion AS suministro,
          ts.descripcion AS tipo_suministro,
          dp.cantidad,
          dp.precio_unitario,
          (dp.cantidad * dp.precio_unitario) AS subtotal,
          COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor
        FROM detalle_pedidos dp
        INNER JOIN suministros s ON dp.id_suministro = s.id_suministro
        INNER JOIN tipo_suministros ts ON s.id_tipo_suministro = ts.id_tipo_suministro
        LEFT JOIN proveedores pr ON dp.id_proveedor = pr.id_proveedor
        WHERE dp.id_pedido = ?
        ORDER BY ts.descripcion, s.descripcion`,
        [id]
      )

      const total = itemRows.reduce((sum, item) => sum + Number(item.subtotal), 0)

      await conn.commit()
      conn.release()

      return res.json({
        success: true,
        message: 'Pedido actualizado correctamente',
        pedido: {
          ...cabRows[0],
          items: itemRows,
          total,
        },
      })
    } catch (error) {
      await conn.rollback()
      conn.release()
      throw error
    }
  } catch (error) {
    console.error('Error en PUT /pedidos/:id/items:', error)
    return res.status(500).json({ error: 'Error al actualizar el pedido', details: error.message })
  }
})

/**
 * POST /api/pedidos/:id/aprobar
 * Aprobar un pedido (cambiar estado a Aprobado)
 */
router.post('/:id/aprobar', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { items, observaciones } = req.body || {}
    const conn = await pool.getConnection()
    
    try {
      await conn.beginTransaction()
      
      // Verificar que el pedido existe y está pendiente
      const [[pedido]] = await conn.query(
        'SELECT id_estado_pedido FROM cabecera_pedidos WHERE id_pedido = ?',
        [id]
      )
      
      if (!pedido) {
        await conn.rollback()
        conn.release()
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }

      // Si vienen items editados desde aprobaciones, persistirlos antes de aprobar.
      if (Array.isArray(items)) {
        if (items.length === 0) {
          await conn.rollback()
          conn.release()
          return res.status(400).json({ error: 'El pedido debe tener al menos un producto.' })
        }

        const [currentDetailRows] = await conn.query(
          `SELECT id_suministro, precio_unitario, id_proveedor
           FROM detalle_pedidos
           WHERE id_pedido = ?`,
          [id]
        )

        const detailBySupply = new Map(
          currentDetailRows.map((row) => [Number(row.id_suministro), row])
        )

        const parsedItems = items.map((item) => ({
          suministroId: Number(item?.suministroId),
          cantidad: Number(item?.cantidad),
        }))

        const hasInvalidItem = parsedItems.some(
          (item) => !Number.isInteger(item.suministroId)
            || item.suministroId <= 0
            || !Number.isInteger(item.cantidad)
            || item.cantidad <= 0
        )

        if (hasInvalidItem) {
          await conn.rollback()
          conn.release()
          return res.status(400).json({ error: 'Items editados inválidos. Verifica cantidad y suministro.' })
        }

        const hasUnknownSupply = parsedItems.some(
          (item) => !detailBySupply.has(item.suministroId)
        )

        if (hasUnknownSupply) {
          await conn.rollback()
          conn.release()
          return res.status(400).json({ error: 'No se puede agregar productos nuevos en aprobación, solo editar/eliminar existentes.' })
        }

        await conn.query('DELETE FROM detalle_pedidos WHERE id_pedido = ?', [id])

        for (const item of parsedItems) {
          const current = detailBySupply.get(item.suministroId)
          await conn.query(
            `INSERT INTO detalle_pedidos (id_pedido, id_suministro, cantidad, precio_unitario, id_proveedor)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              item.suministroId,
              item.cantidad,
              Number(current.precio_unitario || 0),
              current.id_proveedor || null,
            ]
          )
        }
      }
      
      const observacionesLimpias = String(observaciones || '').trim()

      // Regla de negocio centralizada en SP: valida stock y cambia estado en transacción.
      await conn.query('CALL sp_aprobar_pedido(?, ?, ?)', [
        Number(id),
        Number(req.session.userId),
        observacionesLimpias || null,
      ])
      
      await conn.commit()
      conn.release()
      
      return res.json({ 
        success: true, 
        message: `Pedido #${id} aprobado correctamente` 
      })
      
    } catch (error) {
      await conn.rollback()
      conn.release()
      throw error
    }
  } catch (error) {
    console.error('Error en POST /pedidos/:id/aprobar:', error)
    return res.status(500).json({ error: 'Error al aprobar el pedido', details: error.message })
  }
})

/**
 * POST /api/pedidos/:id/rechazar
 * Rechazar un pedido con motivo
 */
router.post('/:id/rechazar', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { motivo } = req.body
    
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ error: 'El motivo de rechazo es requerido' })
    }
    
    const conn = await pool.getConnection()
    
    try {
      await conn.beginTransaction()
      
      // Verificar que el pedido existe
      const [[pedido]] = await conn.query(
        'SELECT id_estado_pedido FROM cabecera_pedidos WHERE id_pedido = ?',
        [id]
      )
      
      if (!pedido) {
        await conn.rollback()
        conn.release()
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }
      
      // Obtener el ID del estado rechazado (soporta variantes)
      const [[estadoRechazado]] = await conn.query(
        "SELECT id_estado_pedido FROM estado_pedidos WHERE LOWER(descripcion) LIKE 'rechaz%' LIMIT 1"
      )
      
      if (!estadoRechazado) {
        await conn.rollback()
        conn.release()
        return res.status(500).json({ error: 'Estado "Rechazado" no encontrado en la BD' })
      }
      
      // Actualizar estado del pedido y guardar el motivo de rechazo
      const motivoLimpio = String(motivo || '').trim()
      
      // Verificar si existe la columna motivo_rechazo
      const [motivoColumnRows] = await conn.query(
        `SELECT COUNT(*) AS total
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'cabecera_pedidos'
           AND COLUMN_NAME = 'motivo_rechazo'`
      )
      const hasMotivoColumn = Number(motivoColumnRows?.[0]?.total || 0) > 0

      if (hasMotivoColumn) {
        await conn.query(
          `UPDATE cabecera_pedidos 
           SET id_estado_pedido = ?, motivo_rechazo = ?
           WHERE id_pedido = ?`,
          [estadoRechazado.id_estado_pedido, motivoLimpio, id]
        )
      } else {
        await conn.query(
          `UPDATE cabecera_pedidos 
           SET id_estado_pedido = ?
           WHERE id_pedido = ?`,
          [estadoRechazado.id_estado_pedido, id]
        )
      }
      
      await conn.commit()
      conn.release()
      
      return res.json({ 
        success: true, 
        message: `Pedido #${id} rechazado correctamente` 
      })
      
    } catch (error) {
      await conn.rollback()
      conn.release()
      throw error
    }
  } catch (error) {
    console.error('Error en POST /pedidos/:id/rechazar:', error)
    return res.status(500).json({ error: 'Error al rechazar el pedido', details: error.message })
  }
})

module.exports = router