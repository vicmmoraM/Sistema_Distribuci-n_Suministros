// Endpoint principal: registrar pedido, validar datos contra BD,
// generar CSV y enviar email

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const { createObjectCsvWriter } = require('csv-writer')
const nodemailer = require('nodemailer')
const PedidoRepository = require('../repositories/PedidoRepository')
const { ensureCurrentDepartmentBudgets, ensureCurrentPdvBudgets } = require('../services/BudgetPeriodService')

const pedidoRepository = new PedidoRepository()
const outsideOrderWindowLogPath = path.resolve(__dirname, '../../../temp_files/outside-order-window.log')

async function logOutsideOrderWindowAttempt({ req, pdv, orderWindow, items }) {
  const payload = {
    timestamp: new Date().toISOString(),
    userLogin: req.session?.userlogin || null,
    userId: req.session?.userId || null,
    departmentId: req.session?.departamento || null,
    pdvId: pdv?.id_pdv || null,
    pdvCodigo: pdv?.descripcion || null,
    zona: pdv?.zona || orderWindow?.zona || null,
    codigoZona: pdv?.codigo_zona || orderWindow?.codigo_zona || null,
    ciudad: pdv?.ciudad || null,
    region: pdv?.region || null,
    windowStartDay: orderWindow?.dia_inicio || null,
    windowEndDay: orderWindow?.dia_fin || null,
    attemptedItems: Array.isArray(items)
      ? items.map((item) => ({
        suministroId: item?.suministroId || null,
        cantidad: item?.cantidad || null,
      }))
      : [],
  }

  try {
    await fs.promises.mkdir(path.dirname(outsideOrderWindowLogPath), { recursive: true })
    await fs.promises.appendFile(outsideOrderWindowLogPath, `${JSON.stringify(payload)}\n`, 'utf8')
  } catch (logErr) {
    console.error('No se pudo escribir log de pedido fuera de ventana:', logErr.message)
  }

  console.warn('Pedido fuera de ventana detectado:', payload)
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
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
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await ensureCurrentDepartmentBudgets(conn)
    await ensureCurrentPdvBudgets(conn)

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

    const [[departmentWindowColumnsInfo]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'departamentos'
         AND COLUMN_NAME IN ('dias_inicio_ventana', 'dias_fin_ventana')`
    )
    const hasDepartmentWindowColumns = Number(departmentWindowColumnsInfo?.total || 0) === 2

    // Verificar si pdvs.cupo_disponible existe (seguimiento por PDV)
    const [[pdvCupoColInfo]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'pdvs'
         AND COLUMN_NAME = 'cupo_disponible'`
    )
    const hasPdvCupoDisponible = Number(pdvCupoColInfo?.total || 0) > 0

    // Verificar si presupuesto_departamentos.monto_ejecutado existe
    const [[montoEjColInfo]] = await conn.query(
      `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'presupuesto_departamentos'
         AND COLUMN_NAME = 'monto_ejecutado'`
    )
    const hasMontoEjecutado = Number(montoEjColInfo?.total || 0) > 0

    // ── 2. Contexto del usuario (departamento y presupuesto) ───────────────
    // Buscar el registro de presupuesto del periodo actual (mes > anual > cualquiera)
    const anioActual = new Date().getFullYear()
    const mesActual  = new Date().getMonth() + 1

    const deptBudgetSelect = hasMontoEjecutado
      ? 'COALESCE(pd.monto_autorizado, 0) AS monto_autorizado, COALESCE(pd.monto_ejecutado, 0) AS monto_ejecutado'
      : 'COALESCE(pd.monto_autorizado, 0) AS monto_autorizado, 0 AS monto_ejecutado'

    const [deptRows] = await conn.query(
      `SELECT
        LOWER(TRIM(d.descripcion)) AS departmentName,
        pd.id_presupuesto_departamento,
        ${deptBudgetSelect}
       FROM departamentos d
       LEFT JOIN presupuesto_departamentos pd
         ON pd.id_departamento = d.id_departamento
        AND pd.periodo_anio = ?
        AND pd.periodo_mes IN (?, 0)
       WHERE d.id_departamento = ?
       ORDER BY pd.periodo_mes DESC
       LIMIT 1`,
      [anioActual, mesActual, req.session.departamento]
    )

    const departmentName       = deptRows.length > 0 ? deptRows[0].departmentName : ''
    const presupuestoId        = deptRows.length > 0 ? deptRows[0].id_presupuesto_departamento : null
    const montoAutorizado      = deptRows.length > 0 ? Number(deptRows[0].monto_autorizado || 0) : 0
    const montoEjecutado       = deptRows.length > 0 ? Number(deptRows[0].monto_ejecutado  || 0) : 0
    const departmentBudget     = montoAutorizado - montoEjecutado          // saldo disponible
    const esComercial          = departmentName === 'comercial'

    if (esComercial && !pdvId) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({ error: 'PDV es requerido para el departamento Comercial.' })
    }

    let pdv = null
    let proveedorDepartamento = null

    if (esComercial) {
      const pdvCupoExpr = hasPdvCupoDisponible
        ? 'COALESCE(p.cupo_disponible, gp.monto_autorizado) AS cupo, gp.monto_autorizado AS cupoGrupo'
        : 'gp.monto_autorizado AS cupo, gp.monto_autorizado AS cupoGrupo'

      const [pdvRows] = await conn.query(
        `SELECT p.id_pdv, p.codigo_centro_costo AS descripcion, p.direccion,
                p.id_proveedor_principal,
          z.zona,
          z.codigo_zona,
          c.descripcion AS ciudad,
          r.descripcion AS region,
                ${pdvCupoExpr}
         FROM pdvs p
         INNER JOIN zonas_comerciales z ON p.id_zona_comercial = z.id_zona_comercial
         LEFT JOIN ciudades c ON p.id_ciudad = c.id_ciudad
         LEFT JOIN regiones r ON r.id_region = c.id_region
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
        const orderWindow = await pedidoRepository.getPdvOrderWindow(Number(pdvId), conn)
        await logOutsideOrderWindowAttempt({
          req,
          pdv,
          orderWindow,
          items,
        })
        await conn.rollback()
        conn.release()

        if (orderWindow) {
          return res.status(400).json({
            error: `No se pudo realizar el pedido. Las fechas habilitadas para esta zona son del ${orderWindow.dia_inicio} al ${orderWindow.dia_fin} de cada mes.`,
          })
        }

        return res.status(400).json({
          error: 'No se pudo realizar el pedido. Esta zona no tiene una ventana de pedido configurada.',
        })
      }
    } else if (hasDepartamentoProveedorRotacion) {
      // Para departamentos NO comerciales, primero validar su ventana de pedidos configurada.
      const hoy = new Date()
      const diaDelMes = hoy.getDate()

      let departmentWindowStart = 1
      let departmentWindowEnd = 3

      if (hasDepartmentWindowColumns) {
        const [departmentWindowRows] = await conn.query(
          `SELECT COALESCE(dias_inicio_ventana, 1) AS dia_inicio,
                COALESCE(dias_fin_ventana, 3) AS dia_fin
         FROM departamentos
         WHERE id_departamento = ?
         LIMIT 1`,
          [req.session.departamento]
        )

        if (departmentWindowRows.length > 0) {
          departmentWindowStart = Number(departmentWindowRows[0].dia_inicio || 1)
          departmentWindowEnd = Number(departmentWindowRows[0].dia_fin || 3)
        }
      }

      if (diaDelMes < departmentWindowStart || diaDelMes > departmentWindowEnd) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `Los departamentos solo pueden hacer pedidos del ${departmentWindowStart} al ${departmentWindowEnd} de cada mes.`,
        })
      }

      // Luego calcular proveedor según rotación automática
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

      const [accessRows] = await conn.query(
        esComercial
          ? `SELECT 1
             FROM v_suministros_efectivos_pdv vsp
             WHERE vsp.id_pdv = ?
               AND vsp.id_suministro = ?
             LIMIT 1`
          : `SELECT 1
             FROM departamento_suministros ds
             WHERE ds.id_departamento = ?
               AND ds.id_suministro = ?
             LIMIT 1`,
        esComercial
          ? [pdv.id_pdv, Number(item.suministroId)]
          : [Number(req.session.departamento), Number(item.suministroId)]
      )

      if (accessRows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(403).json({
          error: `No tienes permiso para solicitar el suministro ID ${item.suministroId} en este contexto.`,
        })
      }

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
        suministroId: suministro.id_suministro,
        proveedorId: suministro.proveedorId,
        suministroNombre: suministro.descripcion,
        tipoId: suministro.tipoId,
        tipoNombre: suministro.tipoNombre,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(suministro.precio),
        total: Number(item.cantidad) * Number(suministro.precio),
      })
    }

    // ── 5. Verificar límite en el backend ───────────────────────────────────
    const totalPedido = itemsValidados.reduce((s, i) => s + i.total, 0)

    if (esComercial) {
      const cupoDisponible = Number(pdv.cupo)
      if (cupoDisponible <= 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `Este PDV ha agotado su cupo ($${Number(pdv.cupoGrupo).toFixed(2)}). Espera el reinicio de cupos.`
        })
      }
      if (totalPedido > cupoDisponible) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `El total $${totalPedido.toFixed(2)} supera el cupo disponible $${cupoDisponible.toFixed(2)} (cupo del grupo: $${Number(pdv.cupoGrupo).toFixed(2)}).`
        })
      }
    } else {
      if (departmentBudget <= 0 && montoAutorizado > 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `El departamento ha agotado su presupuesto ($${montoAutorizado.toFixed(2)}). Espera el reinicio del presupuesto.`
        })
      }
      if (totalPedido > departmentBudget) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `El total $${totalPedido.toFixed(2)} supera el presupuesto disponible $${departmentBudget.toFixed(2)}.`
        })
      }
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

    // ── 8b. Descontar cupo/presupuesto ────────────────────────────────────
    if (esComercial && hasPdvCupoDisponible) {
      await conn.query(
        'UPDATE pdvs SET cupo_disponible = GREATEST(0, COALESCE(cupo_disponible, ?) - ?) WHERE id_pdv = ?',
        [Number(pdv.cupoGrupo), totalPedido, pdvId]
      )
    } else if (!esComercial && hasMontoEjecutado && presupuestoId) {
      await conn.query(
        'UPDATE presupuesto_departamentos SET monto_ejecutado = monto_ejecutado + ? WHERE id_presupuesto_departamento = ?',
        [totalPedido, presupuestoId]
      )
    }

    await conn.commit()
    conn.release()

    // ── 9. Calcular subtotales ─────────────────────────────────────────────
    const subtotalOficina = itemsValidados.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
    const subtotalLimpieza = itemsValidados.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)

    // ── 10. Generar CSV ────────────────────────────────────────────────────
    const filesPath = process.env.FILES_PATH || './temp_files'
    if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath, { recursive: true })

    const nombreArchivo = `pedidoSuministro_${req.session.userlogin}_${fecha}`
    const csvPath = path.join(filesPath, `${nombreArchivo}.csv`)

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
        { id: 'descripcion', title: 'Descripcion' },
        { id: 'tipo', title: 'Tipo de Suministro' },
        { id: 'cantidad', title: 'Cantidad' },
        { id: 'precioUnitario', title: 'Precio Unitario' },
        { id: 'total', title: 'Total' },
      ],
    })

    fs.writeFileSync(csvPath, headerLines)
    await csvWriter.writeRecords(itemsValidados.map(i => ({
      descripcion: i.suministroNombre,
      tipo: i.tipoNombre,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      total: i.total.toFixed(2),
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
      console.log('📧 MAIL_ENABLED=true — intentando enviar correo a:', process.env.MAIL_TO)
      console.log('   CSV path:', csvPath, '| existe:', fs.existsSync(csvPath))
      try {
        const info = await transporter.sendMail({
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
          replyTo: process.env.MAIL_REPLY_TO,
          to: process.env.MAIL_TO,
          subject: 'Pedido de Suministro',
          html: `<font face="verdana" size="3">
                      Hola,<br><br>
                      Tienes un nuevo pedido de suministro por atender.<br><br>
                      Se adjunta la solicitud en formato CSV.<br><br>
                      <strong>Atentamente,</strong><br>Sistema de Pedidos.
                    </font>`,
          attachments: [{ filename: `${nombreArchivo}.csv`, path: csvPath }],
        })
        emailEnviado = true
        console.log('✅ Email aceptado! MessageID:', info.messageId, '| Respuesta:', info.response)
      } catch (mailErr) {
        console.error('❌ Error enviando email:')
        console.error('   Código    :', mailErr.code)
        console.error('   Respuesta :', mailErr.responseCode)
        console.error('   Mensaje   :', mailErr.message)
        console.error('   Detalle   :', mailErr.response)
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

      // Verificar que el pedido existe y obtener datos para restauración
      const [[pedido]] = await conn.query(
        `SELECT cp.id_estado_pedido, cp.id_pdv, u.id_departamento,
                COALESCE((
                  SELECT SUM(dp.cantidad * dp.precio_unitario)
                  FROM detalle_pedidos dp WHERE dp.id_pedido = cp.id_pedido
                ), 0) AS total_pedido
         FROM cabecera_pedidos cp
         JOIN usuarios u ON u.id_usuario = cp.id_usuario
         WHERE cp.id_pedido = ?`,
        [id]
      )

      if (!pedido) {
        await conn.rollback()
        conn.release()
        return res.status(404).json({ error: 'Pedido no encontrado' })
      }

      // Solo restaurar cupos si el pedido estaba pendiente (estado 1 = En espera)
      const estabaPendiente = Number(pedido.id_estado_pedido) === 1
      const totalPedido     = Number(pedido.total_pedido || 0)

      if (estabaPendiente && totalPedido > 0) {
        // Revisar si las columnas de tracking existen
        const [[pdvColInfo]] = await conn.query(
          `SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pdvs' AND COLUMN_NAME = 'cupo_disponible'`
        )
        const hasPdvCupo = Number(pdvColInfo?.total || 0) > 0

        const [[montoEjColInfo]] = await conn.query(
          `SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'presupuesto_departamentos' AND COLUMN_NAME = 'monto_ejecutado'`
        )
        const hasMontoEj = Number(montoEjColInfo?.total || 0) > 0

        if (pedido.id_pdv && hasPdvCupo) {
          // Restaurar cupo del PDV sin superar el cupo del grupo
          await conn.query(
            `UPDATE pdvs p
             JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
             SET p.cupo_disponible = LEAST(gp.monto_autorizado, COALESCE(p.cupo_disponible, 0) + ?)
             WHERE p.id_pdv = ?`,
            [totalPedido, pedido.id_pdv]
          )
        } else if (!pedido.id_pdv && hasMontoEj && pedido.id_departamento) {
          // Restaurar presupuesto del departamento (periodo actual)
          const anio = new Date().getFullYear()
          const mes  = new Date().getMonth() + 1
          await conn.query(
            `UPDATE presupuesto_departamentos
             SET monto_ejecutado = GREATEST(0, monto_ejecutado - ?)
             WHERE id_departamento = ?
               AND periodo_anio = ?
               AND periodo_mes IN (?, 0)
             ORDER BY periodo_mes DESC
             LIMIT 1`,
            [totalPedido, pedido.id_departamento, anio, mes]
          )
        }
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