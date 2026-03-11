const express = require('express')
const ExcelJS = require('exceljs')
const router = express.Router()
const { pool } = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const { requirePermission } = require('../middleware/requirePermission')

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
			{header: 'REGION', key: 'region', width: 20},
            {header: 'CENTRO DE COSTO', key: 'pdv', width: 20},
            {header: 'ZONA', key: 'zona_comercial', width: 22},
		{header: 'CIUDAD', key: 'ciudad', width: 20},
		{header: 'PROVEEDOR', key: 'proveedor', width: 30},
		{header: 'SUPERVISOR', key: 'supervisor', width: 30},
		{header: 'ESTADO', key: 'estado', width: 20},
		{header: 'DIRECCION', key: 'direccion', width: 40},
		{header: 'MONTOAUTORIZADO', key: 'monto_autorizado', width: 18}

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

module.exports = router
