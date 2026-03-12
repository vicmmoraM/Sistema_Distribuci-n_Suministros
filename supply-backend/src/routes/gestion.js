const express = require('express')
const ExcelJS = require('exceljs')
const router = express.Router()
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const { requirePermission } = require('../middleware/requirePermission')
const { ensureCurrentDepartmentBudgets, ensureCurrentPdvBudgets, getCurrentPeriod } = require('../services/BudgetPeriodService')

router.use(requireAuth, requirePermission('CONFIGURACION'))

router.get('/pdvs/export/excel', async (req, res) => {
	try {
		const {
			search = '',
			region = '',
			centroCosto = '',
			zone = '',
			city = '',
			provider = '',
			supervisor = '',
			status = ''
		} = req.query
		const params = []
		const conditions = []
		const isNumeric = (value) => /^\d+$/.test(String(value || '').trim())

		if (search) {
			conditions.push(`(
				p.codigo_centro_costo LIKE ?
				OR COALESCE(p.direccion, '') LIKE ?
				OR COALESCE(rp.descripcion, '') LIKE ?
				OR COALESCE(cp.descripcion, '') LIKE ?
				OR COALESCE(zc.zona, '') LIKE ?
				OR COALESCE(pr.nombre_proveedor, '') LIKE ?
				OR COALESCE(s.nombres, '') LIKE ?
				OR COALESCE(ep.descripcion, '') LIKE ?
			)`)
			params.push(
				`%${search}%`,
				`%${search}%`,
				`%${search}%`,
				`%${search}%`,
				`%${search}%`,
				`%${search}%`,
				`%${search}%`,
				`%${search}%`
			)
		}

		if (region) {
			if (isNumeric(region)) {
				conditions.push('cp.id_region = ?')
				params.push(Number(region))
			} else {
				conditions.push('rp.descripcion LIKE ?')
				params.push(`%${region}%`)
			}
		}

		if (centroCosto) {
			conditions.push('p.codigo_centro_costo LIKE ?')
			params.push(`%${centroCosto}%`)
		}

		if (zone) {
			if (isNumeric(zone)) {
				conditions.push('p.id_zona_comercial = ?')
				params.push(Number(zone))
			} else {
				conditions.push('zc.zona LIKE ?')
				params.push(`%${zone}%`)
			}
		}

		if (city) {
			if (isNumeric(city)) {
				conditions.push('p.id_ciudad = ?')
				params.push(Number(city))
			} else {
				conditions.push('cp.descripcion LIKE ?')
				params.push(`%${city}%`)
			}
		}

		if (provider) {
			if (isNumeric(provider)) {
				conditions.push('p.id_proveedor_principal = ?')
				params.push(Number(provider))
			} else {
				conditions.push('pr.nombre_proveedor LIKE ?')
				params.push(`%${provider}%`)
			}
		}

		if (supervisor) {
			if (isNumeric(supervisor)) {
				conditions.push('p.id_supervisor = ?')
				params.push(Number(supervisor))
			} else {
				conditions.push('s.nombres LIKE ?')
				params.push(`%${supervisor}%`)
			}
		}

		if (status) {
			if (isNumeric(status)) {
				conditions.push('p.id_estado_pdv = ?')
				params.push(Number(status))
			} else {
				conditions.push('ep.descripcion LIKE ?')
				params.push(`%${status}%`)
			}
		}

		const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

		const [pdvs] = await pool.query(
			`SELECT
				p.codigo_centro_costo AS pdv,
				COALESCE(p.direccion, '') AS direccion,
				COALESCE(rp.descripcion, 'Sin region') AS region,
				COALESCE(cp.descripcion, 'Sin ciudad') AS ciudad,
				zc.zona AS zona_comercial,
				gp.monto_autorizado,
				ep.descripcion AS estado,
				COALESCE(s.nombres, 'Sin asignar') AS supervisor,
				COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor
			FROM pdvs p
			INNER JOIN zonas_comerciales zc ON zc.id_zona_comercial = p.id_zona_comercial
			LEFT JOIN ciudades cp ON cp.id_ciudad = p.id_ciudad
			LEFT JOIN regiones rp ON rp.id_region = cp.id_region
			INNER JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
			INNER JOIN estado_pdvs ep ON ep.id_estado_pdv = p.id_estado_pdv
			LEFT JOIN supervisores s ON s.id_supervisor = p.id_supervisor
			LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
			${whereClause}
			ORDER BY p.codigo_centro_costo ASC`,
			params
		)

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('PDVs')
		const filtersWorksheet = workbook.addWorksheet('Filtros aplicados')

		worksheet.columns = [
			{ header: 'REGION', key: 'region', width: 20 },
			{ header: 'CENTRO DE COSTO', key: 'pdv', width: 20 },
			{ header: 'ZONA', key: 'zona_comercial', width: 22 },
			{ header: 'CIUDAD', key: 'ciudad', width: 20 },
			{ header: 'PROVEEDOR', key: 'proveedor', width: 30 },
			{ header: 'SUPERVISOR', key: 'supervisor', width: 30 },
			{ header: 'ESTADO', key: 'estado', width: 20 },
			{ header: 'DIRECCION', key: 'direccion', width: 40 },
			{ header: 'MONTOAUTORIZADO', key: 'monto_autorizado', width: 18 }

		]

		worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
		worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C2F88' } }
		worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' }
		worksheet.views = [{ state: 'frozen', ySplit: 1 }]
		worksheet.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: 1, column: 9 }
		}

		pdvs.forEach((pdv) => {
			worksheet.addRow(pdv)
		})

		worksheet.getColumn('monto_autorizado').numFmt = '$#,##0.00'
		worksheet.getColumn('monto_autorizado').alignment = { horizontal: 'right' }

		const filterRows = [
			['Filtro', 'Valor aplicado'],
			['Busqueda general', search || '(sin filtro)'],
			['Region', region || '(sin filtro)'],
			['Centro de costo', centroCosto || '(sin filtro)'],
			['Zona', zone || '(sin filtro)'],
			['Ciudad', city || '(sin filtro)'],
			['Proveedor', provider || '(sin filtro)'],
			['Supervisor', supervisor || '(sin filtro)'],
			['Estado', status || '(sin filtro)'],
			['Total registros exportados', String(pdvs.length)]
		]

		filterRows.forEach((row) => filtersWorksheet.addRow(row))
		filtersWorksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
		filtersWorksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C2F88' } }
		filtersWorksheet.columns = [
			{ width: 28 },
			{ width: 48 }
		]

		const buffer = await workbook.xlsx.writeBuffer()

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename=PDVs.xlsx')
		return res.send(buffer)
	} catch (err) {
		console.error('Error exportando PDVs a Excel:', err.message)
		return res.status(500).json({ error: 'Error al exportar PDVs a Excel.' })
	}
})

router.get('/supplies/export/excel', async (req, res) => {
	try {
		const {
			search = '',
			category = '',
			provider = ''
		} = req.query

		const params = []
		const conditions = []

		if (search) {
			conditions.push(`(
				s.descripcion LIKE ?
				OR COALESCE(ts.descripcion, '') LIKE ?
				OR COALESCE(pr.nombre_proveedor, '') LIKE ?
				OR COALESCE(es.descripcion, '') LIKE ?
			)`)
			params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
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

		const [supplies] = await pool.query(
			`SELECT
				s.descripcion AS suministro,
				ts.descripcion AS categoria,
				COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
				COALESCE(spv.precio_compra, 0) AS precio_compra,
				COALESCE(sps.stock, 0) AS stock,
				es.descripcion AS estado,
				DATE_FORMAT(s.fecha_actualizacion, '%Y-%m-%d %H:%i:%s') AS fecha_actualizacion
			FROM suministros s
			INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
			INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
			LEFT JOIN suministros_precios spv
				ON spv.id_suministro = s.id_suministro
				AND spv.fecha_vigencia_hasta IS NULL
			LEFT JOIN proveedores pr ON pr.id_proveedor = spv.id_proveedor
			LEFT JOIN suministro_proveedor_stock sps
				ON sps.id_suministro = s.id_suministro
				AND sps.id_proveedor = spv.id_proveedor
			${whereClause}
			ORDER BY s.descripcion ASC, pr.nombre_proveedor ASC, spv.id_suministro_precio ASC`,
			params
		)

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Suministros')
		const filtersWorksheet = workbook.addWorksheet('Filtros aplicados')

		worksheet.columns = [
			{ header: 'SUMINISTRO', key: 'suministro', width: 36 },
			{ header: 'CATEGORIA', key: 'categoria', width: 28 },
			{ header: 'PROVEEDOR', key: 'proveedor', width: 32 },
			{ header: 'PRECIO', key: 'precio_compra', width: 14 },
			{ header: 'STOCK', key: 'stock', width: 12 },
			{ header: 'ESTADO', key: 'estado', width: 18 },
			{ header: 'FECHA ACTUALIZACION', key: 'fecha_actualizacion', width: 24 }
		]

		worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
		worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C2F88' } }
		worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' }
		worksheet.views = [{ state: 'frozen', ySplit: 1 }]
		worksheet.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: 1, column: 7 }
		}

		supplies.forEach((supply) => {
			worksheet.addRow(supply)
		})

		worksheet.getColumn('precio_compra').numFmt = '$#,##0.00'
		worksheet.getColumn('precio_compra').alignment = { horizontal: 'right' }
		worksheet.getColumn('stock').alignment = { horizontal: 'right' }

		const filterRows = [
			['Filtro', 'Valor aplicado'],
			['Busqueda general', search || '(sin filtro)'],
			['Categoria', category || '(sin filtro)'],
			['Proveedor', provider || '(sin filtro)'],
			['Total registros exportados', String(supplies.length)]
		]

		filterRows.forEach((row) => filtersWorksheet.addRow(row))
		filtersWorksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
		filtersWorksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C2F88' } }
		filtersWorksheet.columns = [
			{ width: 28 },
			{ width: 48 }
		]

		const buffer = await workbook.xlsx.writeBuffer()

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename=Suministros.xlsx')
		return res.send(buffer)
	} catch (err) {
		console.error('Error exportando Suministros a Excel:', err.message)
		return res.status(500).json({ error: 'Error al exportar Suministros a Excel.' })
	}
})

// ============================================================
// NUEVA FUNCIONALIDAD: Gestión de Configuración de Departamentos y PDVs
// ============================================================

// GET: Obtener configuración de ventana de pedidos por departamento
router.get('/departamentos/ventana-pedidos', async (req, res) => {
	try {
		const [[windowColumnsInfo]] = await pool.query(`
			SELECT COUNT(*) AS total
			FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA = DATABASE()
			  AND TABLE_NAME = 'departamentos'
			  AND COLUMN_NAME IN ('dias_inicio_ventana', 'dias_fin_ventana')
		`)
		const hasDepartmentWindowColumns = Number(windowColumnsInfo?.total || 0) === 2

		const [rows] = await pool.query(`
			SELECT 
				id_departamento,
				descripcion,
				${hasDepartmentWindowColumns ? 'dias_inicio_ventana' : '1 AS dias_inicio_ventana'},
				${hasDepartmentWindowColumns ? 'dias_fin_ventana' : '3 AS dias_fin_ventana'}
			FROM departamentos
			ORDER BY descripcion ASC
		`)
		res.json(rows || [])
	} catch (err) {
		console.error('Error obteniendo ventana de pedidos:', err.message)
		res.status(500).json({ error: 'Error al obtener configuración de ventana de pedidos' })
	}
})

// PUT: Actualizar ventana de pedidos para todos los departamentos
router.put('/departamentos/ventana-pedidos/actualizar-todos', async (req, res) => {
	try {
		const { dias_inicio_ventana, dias_fin_ventana } = req.body

		const [[windowColumnsInfo]] = await pool.query(`
			SELECT COUNT(*) AS total
			FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA = DATABASE()
			  AND TABLE_NAME = 'departamentos'
			  AND COLUMN_NAME IN ('dias_inicio_ventana', 'dias_fin_ventana')
		`)
		const hasDepartmentWindowColumns = Number(windowColumnsInfo?.total || 0) === 2

		if (!dias_inicio_ventana || !dias_fin_ventana || dias_inicio_ventana < 1 || dias_fin_ventana > 31 || dias_inicio_ventana > dias_fin_ventana) {
			return res.status(400).json({ error: 'Valores inválidos para la ventana de pedidos' })
		}

		if (!hasDepartmentWindowColumns) {
			return res.status(400).json({ error: 'La base de datos aún no tiene los campos de ventana para departamentos. Ejecuta la migración correspondiente.' })
		}

		await pool.query(`
			UPDATE departamentos
			SET 
				dias_inicio_ventana = ?,
				dias_fin_ventana = ?
		`, [dias_inicio_ventana, dias_fin_ventana])

		res.json({ message: 'Ventana de pedidos actualizada para todos los departamentos', dias_inicio_ventana, dias_fin_ventana })
	} catch (err) {
		console.error('Error actualizando ventana de pedidos:', err.message)
		res.status(500).json({ error: 'Error al actualizar ventana de pedidos' })
	}
})

// GET: Obtener ventanas de pedido de PDVs agrupadas por región
router.get('/pdvs/configuracion-por-region', async (req, res) => {
	try {
		const [rows] = await pool.query(`
			SELECT 
				CASE
					WHEN UPPER(COALESCE(zc.codigo_zona, zc.zona)) = 'ORIENTE' THEN ro.id_region
					ELSE r.id_region
				END as id_region,
				CASE
					WHEN UPPER(COALESCE(zc.codigo_zona, zc.zona)) = 'ORIENTE' THEN ro.descripcion
					ELSE r.descripcion
				END as region,
				COUNT(DISTINCT p.id_pdv) as cantidad_pdvs,
				COUNT(DISTINCT zc.id_zona_comercial) as cantidad_zonas,
				CASE
					WHEN COUNT(DISTINCT CASE WHEN zvp.activo = 1 THEN zvp.dia_inicio END) = 1
					THEN MAX(CASE WHEN zvp.activo = 1 THEN zvp.dia_inicio END)
					ELSE NULL
				END as dia_inicio,
				CASE
					WHEN COUNT(DISTINCT CASE WHEN zvp.activo = 1 THEN zvp.dia_fin END) = 1
					THEN MAX(CASE WHEN zvp.activo = 1 THEN zvp.dia_fin END)
					ELSE NULL
				END as dia_fin,
				CASE
					WHEN COUNT(DISTINCT CONCAT(
						COALESCE(CASE WHEN zvp.activo = 1 THEN zvp.dia_inicio END, ''),
						'-',
						COALESCE(CASE WHEN zvp.activo = 1 THEN zvp.dia_fin END, '')
					)) <= 1
					THEN 1 ELSE 0
				END as ventana_uniforme,
				GROUP_CONCAT(DISTINCT zc.zona ORDER BY zc.zona SEPARATOR ', ') as zonas
			FROM regiones r
			INNER JOIN regiones ro ON ro.descripcion = 'Oriente'
			INNER JOIN ciudades c ON r.id_region = c.id_region
			INNER JOIN zonas_comerciales zc ON c.id_ciudad = zc.id_ciudad
			INNER JOIN pdvs p ON zc.id_zona_comercial = p.id_zona_comercial
			LEFT JOIN zona_ventanas_pedido zvp ON zc.id_zona_comercial = zvp.id_zona_comercial AND zvp.activo = 1
			WHERE r.descripcion <> 'Sin Region'
			GROUP BY 
				CASE
					WHEN UPPER(COALESCE(zc.codigo_zona, zc.zona)) = 'ORIENTE' THEN ro.id_region
					ELSE r.id_region
				END,
				CASE
					WHEN UPPER(COALESCE(zc.codigo_zona, zc.zona)) = 'ORIENTE' THEN ro.descripcion
					ELSE r.descripcion
				END
			HAVING COUNT(DISTINCT p.id_pdv) > 0
			ORDER BY region ASC
		`)
		res.json(rows || [])
	} catch (err) {
		console.error('Error obteniendo configuración por región:', err.message)
		res.status(500).json({ error: 'Error al obtener configuración por región' })
	}
})

// PUT: Actualizar ventana de pedidos de todos los PDVs de una región
router.put('/pdvs/ventana-pedidos/region/:id_region', async (req, res) => {
	try {
		const regionId = Number(req.params.id_region)
		const { dia_inicio, dia_fin } = req.body

		if (!regionId || !dia_inicio || !dia_fin || dia_inicio < 1 || dia_fin > 31 || dia_inicio > dia_fin) {
			return res.status(400).json({ error: 'Rango de fechas inválido para la región.' })
		}

		const conn = await pool.getConnection()
		try {
			await conn.beginTransaction()

			// Verificar si la región es "Oriente" para usar la misma lógica especial del GET
			const [[regionRow]] = await conn.query(
				`SELECT descripcion FROM regiones WHERE id_region = ?`,
				[regionId]
			)
			const isOriente = regionRow && regionRow.descripcion.trim().toLowerCase() === 'oriente'

			const [zones] = await conn.query(
				isOriente
					? `SELECT DISTINCT zc.id_zona_comercial
					   FROM zonas_comerciales zc
					   INNER JOIN pdvs p ON p.id_zona_comercial = zc.id_zona_comercial
					   WHERE UPPER(COALESCE(zc.codigo_zona, zc.zona)) = 'ORIENTE'`
					: `SELECT DISTINCT zc.id_zona_comercial
					   FROM ciudades c
					   INNER JOIN zonas_comerciales zc ON zc.id_ciudad = c.id_ciudad
					   INNER JOIN pdvs p ON p.id_zona_comercial = zc.id_zona_comercial
					   WHERE c.id_region = ?`,
				isOriente ? [] : [regionId]
			)

			if (zones.length === 0) {
				await conn.rollback()
				return res.status(404).json({ error: 'No se encontraron zonas con PDVs para esa región.' })
			}

			for (const zone of zones) {
				await conn.query(
					`INSERT INTO zona_ventanas_pedido (id_zona_comercial, dia_inicio, dia_fin, activo)
					 VALUES (?, ?, ?, 1)
					 ON DUPLICATE KEY UPDATE
					 dia_inicio = VALUES(dia_inicio),
					 dia_fin = VALUES(dia_fin),
					 activo = VALUES(activo),
					 actualizado_en = CURRENT_TIMESTAMP`,
					[zone.id_zona_comercial, dia_inicio, dia_fin]
				)
			}

			await conn.commit()
			res.json({
				message: 'Ventana de pedidos actualizada para la región.',
				id_region: regionId,
				dia_inicio,
				dia_fin,
				zonas_actualizadas: zones.length,
			})
		} catch (txErr) {
			await conn.rollback()
			throw txErr
		} finally {
			conn.release()
		}
	} catch (err) {
		console.error('Error actualizando ventana de pedidos por región:', err.message)
		res.status(500).json({ error: 'Error al actualizar la ventana de pedidos de la región' })
	}
})

// ============================================================
// RESET DE CUPOS
// ============================================================

/**
 * POST /api/gestion/pdvs/reset-cupos
 * Reinicia cupo_disponible de todos los PDVs al monto de su grupo.
 * Acepta body { id_pdv } para reiniciar solo uno (opcional).
 */
router.post('/pdvs/reset-cupos', async (req, res) => {
	try {
		const { id_pdv } = req.body || {}
		const { period, hasPdvPeriodTracking } = await ensureCurrentPdvBudgets(pool)

		const [[colInfo]] = await pool.query(
			`SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.COLUMNS
			 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pdvs' AND COLUMN_NAME = 'cupo_disponible'`
		)
		if (Number(colInfo?.total || 0) === 0) {
			return res.status(400).json({ error: 'La columna cupo_disponible no existe. Ejecuta la migración primero.' })
		}

		if (id_pdv) {
			await pool.query(
				`UPDATE pdvs p
				 JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
				 SET p.cupo_disponible = gp.monto_autorizado${hasPdvPeriodTracking ? ', p.cupo_periodo_anio = ?, p.cupo_periodo_mes = ?' : ''}
				 WHERE p.id_pdv = ?`,
				hasPdvPeriodTracking
					? [period.year, period.month, Number(id_pdv)]
					: [Number(id_pdv)]
			)
			return res.json({ message: `Cupo reiniciado para el PDV ${id_pdv}.` })
		}

		const [result] = await pool.query(
			`UPDATE pdvs p
			 JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
			 SET p.cupo_disponible = gp.monto_autorizado${hasPdvPeriodTracking ? ', p.cupo_periodo_anio = ?, p.cupo_periodo_mes = ?' : ''}`,
			hasPdvPeriodTracking ? [period.year, period.month] : []
		)
		return res.json({ message: `Cupos reiniciados para ${result.affectedRows} PDV(s).`, affectedRows: result.affectedRows })
	} catch (err) {
		console.error('Error reiniciando cupos de PDVs:', err.message)
		return res.status(500).json({ error: 'Error al reiniciar cupos de PDVs.' })
	}
})

/**
 * POST /api/gestion/departamentos/reset-presupuesto
 * Reinicia monto_ejecutado = 0 para los departamentos del periodo actual.
 * Acepta body { id_departamento } para reiniciar solo uno (opcional).
 */
router.post('/departamentos/reset-presupuesto', async (req, res) => {
	try {
		const { id_departamento } = req.body || {}
		const period = getCurrentPeriod()
		await ensureCurrentDepartmentBudgets(pool)

		const [[colInfo]] = await pool.query(
			`SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.COLUMNS
			 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'presupuesto_departamentos' AND COLUMN_NAME = 'monto_ejecutado'`
		)
		if (Number(colInfo?.total || 0) === 0) {
			return res.status(400).json({ error: 'La columna monto_ejecutado no existe. Ejecuta la migración primero.' })
		}

		if (id_departamento) {
			const [result] = await pool.query(
				`UPDATE presupuesto_departamentos
				 SET monto_ejecutado = 0
				 WHERE id_departamento = ? AND periodo_anio = ? AND periodo_mes = ?`,
				[Number(id_departamento), period.year, period.month]
			)
			return res.json({ message: `Presupuesto reiniciado para el departamento ${id_departamento}.`, affectedRows: result.affectedRows })
		}

		const [result] = await pool.query(
			`UPDATE presupuesto_departamentos
			 SET monto_ejecutado = 0
			 WHERE periodo_anio = ? AND periodo_mes = ?`,
			[period.year, period.month]
		)
		return res.json({ message: `Presupuesto reiniciado para ${result.affectedRows} registro(s).`, affectedRows: result.affectedRows })
	} catch (err) {
		console.error('Error reiniciando presupuesto de departamentos:', err.message)
		return res.status(500).json({ error: 'Error al reiniciar presupuesto de departamentos.' })
	}
})

module.exports = router
