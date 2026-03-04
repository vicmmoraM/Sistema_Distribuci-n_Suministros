// Endpoints de reportes: listado con detalle por ítem y exportación Excel
// GET /api/reportes/pedidos        → lista con 1 fila por ítem
// GET /api/reportes/pedidos/excel  → descarga Excel con mismo detalle

const express  = require('express')
const router   = express.Router()
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const ExcelJS  = require('exceljs')

/**
 * Construye el WHERE dinámico a partir de los query params.
 */
function buildWhere(query, params) {
  const conditions = []

  if (query.mes && query.anio) {
    conditions.push('MONTH(cp.fecha_registro) = ? AND YEAR(cp.fecha_registro) = ?')
    params.push(Number(query.mes), Number(query.anio))
  } else if (query.anio) {
    conditions.push('YEAR(cp.fecha_registro) = ?')
    params.push(Number(query.anio))
  }

  if (query.fechaDesde) {
    conditions.push('cp.fecha_registro >= ?')
    params.push(query.fechaDesde)
  }

  if (query.fechaHasta) {
    conditions.push('cp.fecha_registro <= ?')
    params.push(query.fechaHasta)
  }

  if (query.pdv) {
    conditions.push('cp.id_pdv = ?')
    params.push(Number(query.pdv))
  }

  if (query.estado) {
    conditions.push('cp.id_estado_pedido = ?')
    params.push(Number(query.estado))
  }

  if (query.tipoSuministro) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM detalle_pedidos dpf
        INNER JOIN suministros sf ON sf.id_suministro = dpf.id_suministro
        WHERE dpf.id_pedido = cp.id_pedido
          AND sf.id_tipo_suministro = ?
      )
    `)
    params.push(Number(query.tipoSuministro))
  }

  if (query.usuario) {
    conditions.push('u.login = ?')
    params.push(query.usuario)
  }

  return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
}

/**
 * Query base: 1 fila por ítem.
 * Incluye suministro, tipo de suministro, cantidad, precio, proveedor, código zona y subtotal.
 */
const BASE_SELECT = `
  SELECT
    cp.id_pedido                              AS pedidoId,
    DATE_FORMAT(cp.fecha_registro, "%Y-%m-%d") AS fecha,
    u.login                           AS usuarioLogin,
    u.nombres                         AS usuarioNombre,
    COALESCE(p.descripcion, 'N/A')    AS pdvNombre,
    COALESCE(zc.codigo_zona, '') AS codigoZona,
    e.descripcion                     AS estado,
    ts.descripcion                    AS tipoSuministro,
    s.descripcion                     AS suministro,
    COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
    dp.cantidad,
    dp.precio_unitario AS precioUnitario,
    (dp.cantidad * dp.precio_unitario) AS subtotal
  FROM cabecera_pedidos cp
  INNER JOIN usuarios u          ON cp.id_usuario       = u.id_usuario
  LEFT JOIN pdvs p               ON cp.id_pdv           = p.id_pdv
  LEFT JOIN zonas_comerciales zc ON p.id_zona_comercial = zc.id_zona_comercial
  INNER JOIN estado_pedidos e    ON cp.id_estado_pedido = e.id_estado_pedido
  INNER JOIN detalle_pedidos dp  ON dp.id_pedido        = cp.id_pedido
  INNER JOIN suministros s       ON dp.id_suministro    = s.id_suministro
  INNER JOIN tipo_suministros ts ON s.id_tipo_suministro = ts.id_tipo_suministro
  LEFT JOIN suministros_precios sp ON dp.id_suministro = sp.id_suministro 
                                   AND dp.precio_unitario = sp.precio_compra
  LEFT JOIN proveedores pr       ON sp.id_proveedor = pr.id_proveedor
`
const ORDER_BY = `ORDER BY cp.fecha_registro DESC, cp.id_pedido DESC, ts.descripcion, s.descripcion`

/**
 * GET /api/reportes/pedidos
 * Paginación por pedidos distintos. Devuelve todos los ítems de los pedidos de esa página.
 */
router.get('/pedidos', requireAuth, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1)
    const limit  = Math.min(100, parseInt(req.query.limit) || 30)
    const offset = (page - 1) * limit

    // Contar pedidos distintos
    const paramsCount = []
    const where       = buildWhere(req.query, paramsCount)

    const countSQL = `
      SELECT COUNT(DISTINCT cp.id_pedido) AS total
      FROM cabecera_pedidos cp
      INNER JOIN usuarios u       ON cp.id_usuario = u.id_usuario
      LEFT JOIN pdvs p            ON cp.id_pdv = p.id_pdv
      INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
      ${where}
    `
    const [[{ total }]] = await pool.query(countSQL, paramsCount)

    // IDs de pedidos de esta página
    const paramsIds = []
    buildWhere(req.query, paramsIds)
    paramsIds.push(limit, offset)

    const idsSQL = `
      SELECT DISTINCT cp.id_pedido, DATE_FORMAT(cp.fecha_registro, "%Y-%m-%d") AS fecha
      FROM cabecera_pedidos cp
      INNER JOIN usuarios u       ON cp.id_usuario = u.id_usuario
      LEFT JOIN pdvs p            ON cp.id_pdv = p.id_pdv
      INNER JOIN estado_pedidos e ON cp.id_estado_pedido = e.id_estado_pedido
      ${where}
      ORDER BY fecha DESC, cp.id_pedido DESC
      LIMIT ? OFFSET ?
    `
    const [idRows] = await pool.query(idsSQL, paramsIds)

    if (idRows.length === 0) {
      return res.json({ data: [], total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) })
    }

    const ids          = idRows.map(r => r.id_pedido)
    const placeholders = ids.map(() => '?').join(',')

    const tipoSuministroFilter = req.query.tipoSuministro ? ' AND s.id_tipo_suministro = ?' : ''
    const dataSQL = `
      ${BASE_SELECT}
      WHERE cp.id_pedido IN (${placeholders})${tipoSuministroFilter}
      ${ORDER_BY}
    `
    const dataParams = [...ids]
    if (req.query.tipoSuministro) dataParams.push(Number(req.query.tipoSuministro))
    const [rows] = await pool.query(dataSQL, dataParams)

    return res.json({
      data:       rows,
      total:      Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    })
  } catch (err) {
    console.error('Error en GET /reportes/pedidos:', err)
    return res.status(500).json({ error: 'Error al obtener reportes.' })
  }
})

/**
 * GET /api/reportes/pedidos/excel
 * Excel con 1 fila por ítem, agrupado visualmente por pedido con subtotales.
 */
router.get('/pedidos/excel', requireAuth, async (req, res) => {
  try {
    const params = []
    const where  = buildWhere(req.query, params)

    let dataSQL = `${BASE_SELECT} ${where}`
    const dataParams = [...params]
    if (req.query.tipoSuministro) {
      dataSQL += `${where ? ' AND' : ' WHERE'} s.id_tipo_suministro = ?`
      dataParams.push(Number(req.query.tipoSuministro))
    }
    dataSQL += ` ${ORDER_BY}`
    const [rows]  = await pool.query(dataSQL, dataParams)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Sistema de Suministros FarmCorp'

    const sheet = workbook.addWorksheet('Pedidos', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    })

    // Título
    sheet.mergeCells('A1:L1')
    const titleCell = sheet.getCell('A1')
    titleCell.value = 'Reporte de Pedidos de Suministros'
    titleCell.font  = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getRow(1).height = 30

    // Subtítulo
    let filtroTexto = 'Todos los registros'
    if (req.query.mes && req.query.anio) {
      const meses = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      filtroTexto = `${meses[req.query.mes]} ${req.query.anio}`
    } else if (req.query.fechaDesde || req.query.fechaHasta) {
      filtroTexto = `${req.query.fechaDesde || '...'} → ${req.query.fechaHasta || '...'}`
    }

    const [estadoRows] = req.query.estado
      ? await pool.query('SELECT descripcion FROM estado_pedidos WHERE id_estado_pedido = ?', [Number(req.query.estado)])
      : [[]]
    const [tipoRows] = req.query.tipoSuministro
      ? await pool.query('SELECT descripcion FROM tipo_suministros WHERE id_tipo_suministro = ?', [Number(req.query.tipoSuministro)])
      : [[]]
    const estadoTexto = req.query.estado ? (estadoRows[0]?.descripcion || 'N/A') : 'Todos'
    const tipoTexto = req.query.tipoSuministro ? (tipoRows[0]?.descripcion || 'N/A') : 'Todos'
    const pdvTexto = req.query.pdv ? rows.find(r => String(r.pdvNombre || '').length > 0)?.pdvNombre || 'N/A' : 'Todos'

    sheet.mergeCells('A2:L2')
    const subCell = sheet.getCell('A2')
    subCell.value = `Período: ${filtroTexto}  |  PDV: ${pdvTexto}  |  Estado: ${estadoTexto}  |  Tipo: ${tipoTexto}  |  Generado: ${new Date().toLocaleString('es-EC')}`
    subCell.font  = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } }
    subCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF5' } }
    subCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    sheet.getRow(2).height = 18

    sheet.addRow([])

    // Cabeceras
    const HEADERS = [
      { header: 'Pedido #',         key: 'pedidoId',        width: 10 },
      { header: 'Fecha',            key: 'fecha',           width: 14 },
      { header: 'Usuario',          key: 'usuarioNombre',   width: 26 },
      { header: 'PDV',              key: 'pdvNombre',       width: 26 },
      { header: 'Código Zona',      key: 'codigoZona',      width: 14 },
      { header: 'Estado',           key: 'estado',          width: 14 },
      { header: 'Tipo Suministro',  key: 'tipoSuministro',  width: 20 },
      { header: 'Suministro',       key: 'suministro',      width: 30 },
      { header: 'Proveedor',        key: 'proveedor',       width: 24 },
      { header: 'Cantidad',         key: 'cantidad',        width: 10 },
      { header: 'P. Unitario ($)',  key: 'precioUnitario',  width: 15 },
      { header: 'Subtotal ($)',     key: 'subtotal',        width: 14 },
    ]

    sheet.columns = HEADERS.map(h => ({ key: h.key, width: h.width }))

    const headerRow = sheet.getRow(4)
    HEADERS.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h.header
      cell.font  = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E5FA3' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FF1B3A6B' } },
        bottom: { style: 'thin', color: { argb: 'FF1B3A6B' } },
        left:   { style: 'thin', color: { argb: 'FF1B3A6B' } },
        right:  { style: 'thin', color: { argb: 'FF1B3A6B' } },
      }
    })
    headerRow.height = 22

    // Activar filtros en encabezados (fila 4)
    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: HEADERS.length },
    }

    // Filas de datos
    let lastPedidoId = null
    let colorToggle  = false
    let pedidoTotal  = 0

    rows.forEach((row) => {
      const isPedidoNuevo = row.pedidoId !== lastPedidoId

      if (isPedidoNuevo && lastPedidoId !== null) {
        // Fila subtotal del pedido anterior
        const subRow = sheet.addRow({
          pedidoId: '', fecha: '', usuarioNombre: '', pdvNombre: '', codigoZona: '', estado: '',
          tipoSuministro: '', suministro: `Subtotal pedido #${lastPedidoId}`,
          proveedor: '', cantidad: '', precioUnitario: '', subtotal: pedidoTotal,
        })
        subRow.eachCell({ includeEmpty: true }, (cell, col) => {
          cell.font = { name: 'Calibri', size: 9, bold: true, italic: true, color: { argb: 'FF1B3A6B' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F7' } }
          if (col === 12) { cell.numFmt = '"$"#,##0.00'; cell.alignment = { horizontal: 'right' } }
          if (col === 8)  { cell.alignment = { horizontal: 'right' } }
        })
        pedidoTotal = 0
        colorToggle = !colorToggle
      }

      if (isPedidoNuevo) lastPedidoId = row.pedidoId
      pedidoTotal += Number(row.subtotal)

      const bg = colorToggle ? 'FFFFFFFF' : 'FFF0F4FA'

      const dataRow = sheet.addRow({
        pedidoId:       isPedidoNuevo ? row.pedidoId : '',
        fecha:          isPedidoNuevo && row.fecha ? new Date(row.fecha).toLocaleDateString('es-EC') : '',
        usuarioNombre:  isPedidoNuevo ? row.usuarioNombre : '',
        pdvNombre:      isPedidoNuevo ? row.pdvNombre : '',
        codigoZona:     isPedidoNuevo ? row.codigoZona : '',
        estado:         isPedidoNuevo ? row.estado : '',
        tipoSuministro: row.tipoSuministro,
        suministro:     row.suministro,
        proveedor:      row.proveedor,
        cantidad:       row.cantidad,
        precioUnitario: Number(row.precioUnitario),
        subtotal:       Number(row.subtotal),
      })

      dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.font = { name: 'Calibri', size: 10 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.border = {
          top:    { style: 'hair', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
          left:   { style: 'hair', color: { argb: 'FFDDDDDD' } },
          right:  { style: 'hair', color: { argb: 'FFDDDDDD' } },
        }
        if (col === 11 || col === 12) { cell.numFmt = '"$"#,##0.00'; cell.alignment = { horizontal: 'right' } }
        if (col === 10) cell.alignment = { horizontal: 'center' }
        if (col === 1) cell.alignment = { horizontal: 'center' }
      })
    })

    // Subtotal del último pedido
    if (lastPedidoId !== null) {
      const subRow = sheet.addRow({
        pedidoId: '', fecha: '', usuarioNombre: '', pdvNombre: '', codigoZona: '', estado: '',
        tipoSuministro: '', suministro: `Subtotal pedido #${lastPedidoId}`,
        proveedor: '', cantidad: '', precioUnitario: '', subtotal: pedidoTotal,
      })
      subRow.eachCell({ includeEmpty: true }, (cell, col) => {
        cell.font = { name: 'Calibri', size: 9, bold: true, italic: true, color: { argb: 'FF1B3A6B' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F7' } }
        if (col === 12) { cell.numFmt = '"$"#,##0.00'; cell.alignment = { horizontal: 'right' } }
        if (col === 8)  { cell.alignment = { horizontal: 'right' } }
      })
    }

    // Total general
    sheet.addRow([])
    const totalGeneral = rows.reduce((s, r) => s + Number(r.subtotal), 0)
    const totalRow = sheet.addRow({
      pedidoId: '', fecha: '', usuarioNombre: '', pdvNombre: '', codigoZona: '', estado: '',
      tipoSuministro: '', suministro: '', proveedor: '', cantidad: '', precioUnitario: 'TOTAL GENERAL',
      subtotal: totalGeneral,
    })
    totalRow.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } }
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
      if (col === 12) { cell.numFmt = '"$"#,##0.00'; cell.alignment = { horizontal: 'right' } }
      if (col === 11)  { cell.alignment = { horizontal: 'right' } }
    })

    const fechaArchivo = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="reporte_pedidos_${fechaArchivo}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()

  } catch (err) {
    console.error('Error en GET /reportes/pedidos/excel:', err)
    return res.status(500).json({ error: 'Error al generar el Excel.' })
  }
})

module.exports = router