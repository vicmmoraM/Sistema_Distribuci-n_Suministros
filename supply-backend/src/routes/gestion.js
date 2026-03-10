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
				OR COALESCE(r.descripcion, '') LIKE ?
				OR COALESCE(c.descripcion, '') LIKE ?
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
				conditions.push('c.id_region = ?')
				params.push(Number(region))
			} else {
				conditions.push('r.descripcion LIKE ?')
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
				conditions.push('c.descripcion LIKE ?')
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
				COALESCE(r.descripcion, 'Sin region') AS region,
				COALESCE(c.descripcion, 'Sin ciudad') AS ciudad,
				zc.zona AS zona_comercial,
				gp.monto_autorizado,
				ep.descripcion AS estado,
				COALESCE(s.nombres, 'Sin asignar') AS supervisor,
				COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor
			FROM pdvs p
			LEFT JOIN ciudades c ON c.id_ciudad = p.id_ciudad
			LEFT JOIN regiones r ON r.id_region = c.id_region
			INNER JOIN zonas_comerciales zc ON zc.id_zona_comercial = p.id_zona_comercial
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

module.exports = router
