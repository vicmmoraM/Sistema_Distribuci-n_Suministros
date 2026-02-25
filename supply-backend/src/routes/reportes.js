const express  = require('express')
const router   = express.Router()
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const ExcelJS  = require('exceljs')

/**
 * Construye el WHERE dinámico a partir de los query params.
 * Filtros soportados:
 *   mes       = 1-12
 *   anio      = ej. 2025
 *   fechaDesde, fechaHasta = YYYY-MM-DD
 *   pdv       = codigo del PDV
 *   usuario   = login del usuario
 */
function buildWhere(query, params) {
  const conditions = []

  if (query.mes && query.anio) {
    conditions.push('MONTH(cp.fecha) = ? AND YEAR(cp.fecha) = ?')
    params.push(Number(query.mes), Number(query.anio))
  } else if (query.anio) {
    conditions.push('YEAR(cp.fecha) = ?')
    params.push(Number(query.anio))
  }

  if (query.fechaDesde) {
    conditions.push('cp.fecha >= ?')
    params.push(query.fechaDesde)
  }

  if (query.fechaHasta) {
    conditions.push('cp.fecha <= ?')
    params.push(query.fechaHasta)
  }

  if (query.pdv) {
    conditions.push('cp.pdv = ?')
    params.push(Number(query.pdv))
  }

  if (query.usuario) {
    conditions.push('u.login = ?')
    params.push(query.usuario)
  }

  return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
}

/**
 * Query base que devuelve los pedidos con toda la info necesaria.
 */
const BASE_SELECT = `
  SELECT
    cp.codigo              AS id,
    cp.fecha,
    u.login                AS usuarioLogin,
    u.nombres              AS usuarioNombre,
    p.descripcion          AS pdvNombre,
    p.codigo               AS pdvCodigo,
    e.descripcion          AS estado,
    COALESCE(
      SUM(dp.cantidad * dp.precioUnitario), 0
    )                      AS total
  FROM cabecera_pedidos cp
  INNER JOIN usuarios u       ON cp.usuario     = u.codigo
  INNER JOIN pdvs p           ON cp.pdv         = p.codigo
  INNER JOIN estado_pedidos e ON cp.estadoPedido = e.codigo
  LEFT  JOIN detalle_pedidos dp ON dp.cabPedido  = cp.codigo
`
const GROUP_BY = `
  GROUP BY cp.codigo, cp.fecha, u.login, u.nombres,
           p.descripcion, p.codigo, e.descripcion
  ORDER BY cp.fecha DESC, cp.codigo DESC
`

/**
 * GET /api/reportes/pedidos
 * Devuelve lista paginada de pedidos con filtros opcionales.
 *
 * Query params opcionales:
 *   mes, anio, fechaDesde, fechaHasta, pdv, usuario
 *   page (default 1), limit (default 50)
 */
router.get('/pedidos', requireAuth, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(200, parseInt(req.query.limit) || 50)
    const offset = (page - 1) * limit

    const paramsCount = []
    const paramsData  = []
    const where       = buildWhere(req.query, paramsCount)

    // Clonar params para la query de datos (necesita los mismos valores)
    buildWhere(req.query, paramsData)

    // Total de registros (para paginación)
    const countSQL = `
      SELECT COUNT(DISTINCT cp.codigo) AS total
      FROM cabecera_pedidos cp
      INNER JOIN usuarios u       ON cp.usuario     = u.codigo
      INNER JOIN pdvs p           ON cp.pdv         = p.codigo
      INNER JOIN estado_pedidos e ON cp.estadoPedido = e.codigo
      ${where}
    `
    const [[{ total }]] = await pool.query(countSQL, paramsCount)

    // Datos paginados
    const dataSQL = `${BASE_SELECT} ${where} ${GROUP_BY} LIMIT ? OFFSET ?`
    paramsData.push(limit, offset)
    const [rows] = await pool.query(dataSQL, paramsData)

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
 * Genera y devuelve un archivo Excel con los pedidos filtrados.
 * Acepta los mismos query params que el endpoint de listado.
 */
router.get('/pedidos/excel', requireAuth, async (req, res) => {
  try {
    const params = []
    const where  = buildWhere(req.query, params)

    const dataSQL = `${BASE_SELECT} ${where} ${GROUP_BY}`
    const [rows]  = await pool.query(dataSQL, params)

    // ── Crear workbook ────────────────────────────────────────────────────
    const workbook  = new ExcelJS.Workbook()
    workbook.creator = 'Sistema de Suministros FarmCorp'

    const sheet = workbook.addWorksheet('Pedidos', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    })

    // Título
    sheet.mergeCells('A1:G1')
    const titleCell = sheet.getCell('A1')
    titleCell.value = 'Reporte de Pedidos de Suministros'
    titleCell.font  = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    sheet.getRow(1).height = 30

    // Subtítulo con filtros aplicados
    let filtroTexto = 'Todos los registros'
    if (req.query.mes && req.query.anio) {
      const meses = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
      filtroTexto = `${meses[req.query.mes]} ${req.query.anio}`
    } else if (req.query.fechaDesde || req.query.fechaHasta) {
      filtroTexto = `${req.query.fechaDesde || '...'} → ${req.query.fechaHasta || '...'}`
    }

    sheet.mergeCells('A2:G2')
    const subCell = sheet.getCell('A2')
    subCell.value = `Período: ${filtroTexto}  |  Generado: ${new Date().toLocaleString('es-EC')}`
    subCell.font  = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } }
    subCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF5' } }
    subCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    sheet.getRow(2).height = 18

    sheet.addRow([]) // fila en blanco

    // Cabeceras de la tabla
    const HEADERS = [
      { header: 'ID',        key: 'id',            width: 8  },
      { header: 'Fecha',     key: 'fecha',          width: 14 },
      { header: 'Usuario',   key: 'usuarioNombre',  width: 28 },
      { header: 'PDV',       key: 'pdvNombre',      width: 30 },
      { header: 'Estado',    key: 'estado',         width: 18 },
      { header: 'Total ($)', key: 'total',          width: 14 },
    ]

    sheet.columns = HEADERS.map(h => ({ key: h.key, width: h.width }))

    const headerRow = sheet.getRow(4)
    HEADERS.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h.header
      cell.font  = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
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

    // Datos
    rows.forEach((row, idx) => {
      const dataRow = sheet.addRow({
        id:            row.id,
        fecha:         row.fecha ? new Date(row.fecha).toLocaleDateString('es-EC') : '',
        usuarioNombre: row.usuarioNombre,
        pdvNombre:     row.pdvNombre,
        estado:        row.estado,
        total:         Number(row.total),
      })

      const isEven = idx % 2 === 0
      const bgColor = isEven ? 'FFF0F4FA' : 'FFFFFFFF'

      dataRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
        cell.font = { name: 'Calibri', size: 10 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
        cell.border = {
          top:    { style: 'hair', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } },
          left:   { style: 'hair', color: { argb: 'FFCCCCCC' } },
          right:  { style: 'hair', color: { argb: 'FFCCCCCC' } },
        }
        // Columna Total: alinear derecha y formato moneda
        if (colIdx === 6) {
          cell.numFmt = '"$"#,##0.00'
          cell.alignment = { horizontal: 'right' }
        } else if (colIdx === 1) {
          cell.alignment = { horizontal: 'center' }
        }
      })
    })

    // Fila de total general
    sheet.addRow([])
    const totalRow = sheet.addRow({
      id: '', fecha: '', usuarioNombre: '',
      pdvNombre: 'TOTAL GENERAL',
      estado: '',
      total: rows.reduce((s, r) => s + Number(r.total), 0),
    })
    totalRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      cell.font = { name: 'Calibri', size: 11, bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } }
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
      if (colIdx === 6) {
        cell.numFmt = '"$"#,##0.00'
        cell.alignment = { horizontal: 'right' }
      }
    })

    // Enviar respuesta
    const fechaArchivo = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition',
      `attachment; filename="reporte_pedidos_${fechaArchivo}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()

  } catch (err) {
    console.error('Error en GET /reportes/pedidos/excel:', err)
    return res.status(500).json({ error: 'Error al generar el Excel.' })
  }
})

module.exports = router