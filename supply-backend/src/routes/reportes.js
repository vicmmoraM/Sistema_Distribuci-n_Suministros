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
    conditions.push('u.login LIKE ?')
    params.push(`%${query.usuario}%`)
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
    COALESCE(d.descripcion, 'Sin departamento') AS departamento,
    COALESCE(p.codigo_centro_costo, 'N/A')    AS pdvNombre,
    CASE WHEN cp.id_pdv IS NOT NULL THEN COALESCE(c.descripcion, '') ELSE '' END AS ciudad,
    CASE WHEN cp.id_pdv IS NOT NULL THEN COALESCE(r.descripcion, '') ELSE '' END AS region,
    CASE WHEN cp.id_pdv IS NOT NULL THEN COALESCE(sup.nombres, '') ELSE '' END AS supervisor,
    COALESCE(zc.codigo_zona, '') AS codigoZona,
    e.descripcion                     AS estado,
    ts.descripcion                    AS tipoSuministro,
    s.descripcion                     AS suministro,
    COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
    dp.cantidad,
    dp.precio_unitario AS precioUnitario,
    (dp.cantidad * dp.precio_unitario) AS subtotal,
    cp.observaciones_aprobacion AS observacionesAprobacion,
    cp.motivo_rechazo AS motivoRechazo
  FROM cabecera_pedidos cp
  INNER JOIN usuarios u          ON cp.id_usuario       = u.id_usuario
  LEFT JOIN departamentos d      ON u.id_departamento   = d.id_departamento
  LEFT JOIN pdvs p               ON cp.id_pdv           = p.id_pdv
  LEFT JOIN zonas_comerciales zc ON p.id_zona_comercial = zc.id_zona_comercial
  LEFT JOIN ciudades c           ON zc.id_ciudad        = c.id_ciudad
  LEFT JOIN regiones r           ON c.id_region         = r.id_region
  LEFT JOIN supervisores sup     ON p.id_supervisor     = sup.id_supervisor
  INNER JOIN estado_pedidos e    ON cp.id_estado_pedido = e.id_estado_pedido
  INNER JOIN detalle_pedidos dp  ON dp.id_pedido        = cp.id_pedido
  INNER JOIN suministros s       ON dp.id_suministro    = s.id_suministro
  INNER JOIN tipo_suministros ts ON s.id_tipo_suministro = ts.id_tipo_suministro
  LEFT JOIN proveedores pr       ON dp.id_proveedor = pr.id_proveedor
`
const ORDER_BY = `ORDER BY cp.fecha_registro DESC, cp.id_pedido DESC, ts.descripcion, s.descripcion`

/**
 * Configuración de campos disponibles para exportación personalizada.
 * Define las propiedades de cada columna: header, width, formato, etc.
 */
const CAMPOS_CONFIG = {
  pedidoId:        { header: 'Pedido #',        width: 10,  format: '@' },
  fecha:           { header: 'Fecha',           width: 14,  format: 'mm/dd/yyyy' },
  region:          { header: 'Region',          width: 18,  format: '@' },
  usuarioNombre:   { header: 'Usuario',         width: 26,  format: '@' },
  departamento:    { header: 'Departamento',    width: 26,  format: '@' },
  pdvNombre:       { header: 'PDV',             width: 20,  format: '@' },
  ciudad:          { header: 'Ciudad',          width: 20,  format: '@' },
  supervisor:      { header: 'Supervisor',      width: 24,  format: '@' },
  codigoZona:      { header: 'Código Zona',     width: 14,  format: '@' },
  estado:          { header: 'Estado',          width: 14,  format: '@' },
  tipoSuministro:  { header: 'Tipo Suministro', width: 20,  format: '@' },
  suministro:      { header: 'Suministro',      width: 30,  format: '@' },
  proveedor:       { header: 'Proveedor',       width: 24,  format: '@' },
  cantidad:        { header: 'Cantidad',        width: 10,  format: '0' },
  precioUnitario:  { header: 'P. Unitario ($)', width: 15,  format: '"$"#,##0.00' },
  subtotal:        { header: 'Subtotal ($)',    width: 14,  format: '"$"#,##0.00' },
}

/**
 * Construye el arreglo de columnas según los campos seleccionados.
 * @param {string[]} selectedFields - Array de campo IDs seleccionados
 * @returns {object[]} Array de configuración de columnas
 */
function buildColumnsConfig(selectedFields) {
  if (!selectedFields || selectedFields.length === 0) {
    // Si no hay campos seleccionados, usar todos
    return Object.entries(CAMPOS_CONFIG).map(([key, config]) => ({
      key,
      ...config,
    }))
  }

  return selectedFields
    .filter(fieldId => CAMPOS_CONFIG[fieldId])
    .map(fieldId => ({
      key: fieldId,
      ...CAMPOS_CONFIG[fieldId],
    }))
}

/**
 * Determina si un campo es de tipo moneda.
 */
function isCurrencyField(fieldId) {
  return fieldId === 'precioUnitario' || fieldId === 'subtotal'
}

/**
 * Determina si un campo es de tipo fecha.
 */
function isDateField(fieldId) {
  return fieldId === 'fecha'
}

/**
 * Determina si un campo es de tipo número (cantidad).
 */
function isNumberField(fieldId) {
  return fieldId === 'cantidad'
}

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
 * Soporta parámetro `campos` para personalizar columnas (ej: campos=pedidoId,fecha,estado,subtotal)
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

    // Parsear campos seleccionados desde el parámetro `campos`
    const selectedFields = req.query.campos
      ? req.query.campos.split(',').map(f => f.trim()).filter(f => f)
      : null

    const isCustomExport = !!req.query.campos
    const columnsConfig = buildColumnsConfig(selectedFields)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Sistema de Suministros FarmCorp'

    const sheet = workbook.addWorksheet('Pedidos', {
      pageSetup: { paperSize: 9, orientation: columnsConfig.length > 8 ? 'landscape' : 'portrait' },
    })

    // Título
    const titleColSpan = columnsConfig.length > 0 ? columnsConfig.length : 12
    sheet.mergeCells(`A1:${String.fromCharCode(64 + titleColSpan)}1`)
    const titleCell = sheet.getCell('A1')
    titleCell.value = isCustomExport 
      ? 'Reporte de Pedidos - Exportación Personalizada'
      : 'Reporte de Pedidos de Suministros'
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

    sheet.mergeCells(`A2:${String.fromCharCode(64 + titleColSpan)}2`)
    const subCell = sheet.getCell('A2')
    subCell.value = `Período: ${filtroTexto}  |  PDV: ${pdvTexto}  |  Estado: ${estadoTexto}  |  Tipo: ${tipoTexto}  |  Generado: ${new Date().toLocaleString('es-EC')}`
    subCell.font  = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } }
    subCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF5' } }
    subCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    sheet.getRow(2).height = 18

    sheet.addRow([])

    // Configurar columnas dinámicamente
    sheet.columns = columnsConfig.map(col => ({ key: col.key, width: col.width }))

    // Encabezados
    const headerRow = sheet.getRow(4)
    columnsConfig.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = col.header
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

    // Filtros en encabezados
    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: columnsConfig.length },
    }

    // Verificar si la columna 'subtotal' está seleccionada
    const includeSubtotal = columnsConfig.some(col => col.key === 'subtotal')

    // Columnas que se repiten por pedido y conviene fusionar verticalmente
    const mergeablePedidoKeys = new Set([
      'pedidoId',
      'fecha',
      'usuarioLogin',
      'usuarioNombre',
      'departamento',
      'pdvNombre',
      'ciudad',
      'region',
      'supervisor',
      'codigoZona',
      'estado',
    ])
    const mergeableColumns = columnsConfig
      .map((col, idx) => ({ key: col.key, colNumber: idx + 1 }))
      .filter((col) => mergeablePedidoKeys.has(col.key))

    const mergePedidoGroupCells = (startRow, endRow) => {
      if (!startRow || !endRow || startRow >= endRow) return

      mergeableColumns.forEach(({ key, colNumber }) => {
        const topCell = sheet.getCell(startRow, colNumber)
        if (topCell.value === null || topCell.value === undefined || topCell.value === '') return

        // Evita reintentar merges sobre celdas ya fusionadas.
        if (topCell.isMerged) return

        try {
          sheet.mergeCells(startRow, colNumber, endRow, colNumber)
        } catch (mergeError) {
          // No bloqueamos la generación completa del archivo por un merge puntual.
          console.warn(`No se pudo fusionar columna ${colNumber} entre filas ${startRow}-${endRow}:`, mergeError.message)
          return
        }

        topCell.alignment = {
          ...(topCell.alignment || {}),
          vertical: 'middle',
          horizontal: (key === 'pedidoId' || key === 'fecha') ? 'center' : (topCell.alignment?.horizontal || 'left'),
        }
      })
    }

    // Filas de datos
    let lastPedidoId = null
    let colorToggle  = false
    let pedidoTotal  = 0
    let currentPedidoStartRow = null
    let currentPedidoEndRow = null

    rows.forEach((row) => {
      const isPedidoNuevo = row.pedidoId !== lastPedidoId

      if (isPedidoNuevo && lastPedidoId !== null) {
        mergePedidoGroupCells(currentPedidoStartRow, currentPedidoEndRow)
        currentPedidoStartRow = null
        currentPedidoEndRow = null
      }

      // Subtotal del pedido anterior (solo si la columna subtotal está activa)
      if (isPedidoNuevo && lastPedidoId !== null && includeSubtotal) {
        const subRow = sheet.addRow({})
        
        // Llenar campos según columnas configuradas
        columnsConfig.forEach((col, colIdx) => {
          const cell = subRow.getCell(colIdx + 1)
          if (col.key === 'suministro') {
            cell.value = `Subtotal pedido #${lastPedidoId}`
          } else if (col.key === 'subtotal') {
            cell.value = pedidoTotal
          }
          
          cell.font = { name: 'Calibri', size: 9, bold: true, italic: true, color: { argb: 'FF1B3A6B' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F7' } }
          if (isCurrencyField(col.key)) {
            cell.numFmt = col.format
            cell.alignment = { horizontal: 'right' }
          }
        })
      }

      // Actualizar contadores y colores al cambiar de pedido
      if (isPedidoNuevo && lastPedidoId !== null) {
        pedidoTotal = 0
        colorToggle = !colorToggle
      }

      if (isPedidoNuevo) lastPedidoId = row.pedidoId
      pedidoTotal += Number(row.subtotal)

      const bg = colorToggle ? 'FFFFFFFF' : 'FFF0F4FA'

      const dataRow = sheet.addRow({})
      
      // Llenar datos según columnas configuradas
      columnsConfig.forEach((col, colIdx) => {
        const cell = dataRow.getCell(colIdx + 1)
        
        if (col.key === 'fecha' && isPedidoNuevo && row.fecha) {
          cell.value = new Date(row.fecha)
        } else if (col.key === 'cantidad' || col.key === 'precioUnitario' || col.key === 'subtotal') {
          cell.value = Number(row[col.key])
        } else if (isPedidoNuevo || !['pedidoId', 'fecha', 'usuarioNombre', 'usuarioLogin', 'departamento', 'pdvNombre', 'ciudad', 'region', 'supervisor', 'codigoZona', 'estado'].includes(col.key)) {
          cell.value = row[col.key]
        }

        cell.font = { name: 'Calibri', size: 10 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.border = {
          top:    { style: 'hair', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } },
          left:   { style: 'hair', color: { argb: 'FFDDDDDD' } },
          right:  { style: 'hair', color: { argb: 'FFDDDDDD' } },
        }

        // Aplicar formatos según tipo de dato
        if (isCurrencyField(col.key)) {
          cell.numFmt = col.format
          cell.alignment = { horizontal: 'right' }
        } else if (isDateField(col.key)) {
          cell.numFmt = col.format
          cell.alignment = { horizontal: 'center' }
        } else if (isNumberField(col.key)) {
          cell.numFmt = col.format
          cell.alignment = { horizontal: 'center' }
        } else if (['pedidoId'].includes(col.key)) {
          cell.alignment = { horizontal: 'center' }
        }
      })

      if (isPedidoNuevo) currentPedidoStartRow = dataRow.number
      currentPedidoEndRow = dataRow.number
    })

    // Aplicar merge al último grupo de pedido
    mergePedidoGroupCells(currentPedidoStartRow, currentPedidoEndRow)

    // Subtotal del último pedido (solo si la columna subtotal está activa)
    if (lastPedidoId !== null && includeSubtotal) {
      const subRow = sheet.addRow({})
      
      columnsConfig.forEach((col, colIdx) => {
        const cell = subRow.getCell(colIdx + 1)
        if (col.key === 'suministro') {
          cell.value = `Subtotal pedido #${lastPedidoId}`
        } else if (col.key === 'subtotal') {
          cell.value = pedidoTotal
        }
        
        cell.font = { name: 'Calibri', size: 9, bold: true, italic: true, color: { argb: 'FF1B3A6B' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F7' } }
        if (isCurrencyField(col.key)) {
          cell.numFmt = col.format
          cell.alignment = { horizontal: 'right' }
        }
      })
    }

    // Total general - calculado siempre desde la BD, independiente de si la columna está visible
    sheet.addRow([])
    const totalGeneral = rows.reduce((s, r) => s + Number(r.subtotal), 0)
    const totalRow = sheet.addRow({})
    
    // Determinar dónde colocar el total: priorizar columna 'subtotal', luego 'precioUnitario', o la última disponible
    const subtotalColIdx = columnsConfig.findIndex(col => col.key === 'subtotal')
    const precioColIdx = columnsConfig.findIndex(col => col.key === 'precioUnitario')
    const lastColIdx = columnsConfig.length - 1
    
    // Índice donde se mostrará el monto del total
    const totalValueColIdx = subtotalColIdx !== -1 ? subtotalColIdx : 
                             (precioColIdx !== -1 ? precioColIdx : lastColIdx)
    
    // Índice donde se mostrará la etiqueta "TOTAL GENERAL"
    // Si hay más de una columna, usar la anterior al valor; si no, usar la misma
    const totalLabelColIdx = totalValueColIdx > 0 ? totalValueColIdx - 1 : 0
    
    columnsConfig.forEach((col, colIdx) => {
      const cell = totalRow.getCell(colIdx + 1)
      
      if (colIdx === totalLabelColIdx) {
        // Colocar etiqueta del total
        cell.value = 'TOTAL GENERAL'
        cell.alignment = { horizontal: 'right' }
      } else if (colIdx === totalValueColIdx) {
        // Colocar valor del total
        cell.value = totalGeneral
        // Usar formato de moneda del campo correspondiente
        if (isCurrencyField(col.key)) {
          cell.numFmt = col.format
        } else {
          cell.numFmt = '"$"#,##0.00'
        }
        cell.alignment = { horizontal: 'right' }
      }
      
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } }
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
    })

    const fechaArchivo = new Date().toISOString().slice(0, 10)
    const nombreArchivo = isCustomExport 
      ? `reporte_personalizado_${fechaArchivo}.xlsx`
      : `reporte_pedidos_${fechaArchivo}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`)

    await workbook.xlsx.write(res)
    res.end()

  } catch (err) {
    console.error('Error en GET /reportes/pedidos/excel:', err)
    return res.status(500).json({ error: 'Error al generar el Excel.' })
  }
})

module.exports = router