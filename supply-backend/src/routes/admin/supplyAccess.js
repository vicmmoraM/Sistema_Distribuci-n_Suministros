const express = require('express')
const router = express.Router()
const { pool } = require('../../config/db')
const ExcelJS = require('exceljs')

const SCOPE_CONFIG = {
  pdv: {
    table: 'pdv_suministros',
    scopeColumn: 'id_pdv',
    existsTable: 'pdvs',
    existsColumn: 'id_pdv',
  },
  departamento: {
    table: 'departamento_suministros',
    scopeColumn: 'id_departamento',
    existsTable: 'departamentos',
    existsColumn: 'id_departamento',
  },
}

function getScopeConfig(scope) {
  return SCOPE_CONFIG[String(scope || '').toLowerCase()] || null
}

function normalizePositiveInt(value) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

function buildUniqueSheetName(baseName, existingNames) {
  const forbiddenCharsPattern = /[\\/*?:\[\]]/g
  const sanitizedBase = String(baseName || 'PDV')
    .replace(forbiddenCharsPattern, '-')
    .trim() || 'PDV'

  let candidate = sanitizedBase.slice(0, 31)
  let suffix = 1

  while (existingNames.has(candidate)) {
    const suffixText = ` (${suffix})`
    const allowedBaseLength = Math.max(1, 31 - suffixText.length)
    candidate = `${sanitizedBase.slice(0, allowedBaseLength)}${suffixText}`
    suffix += 1
  }

  existingNames.add(candidate)
  return candidate
}

router.get('/supply-access/options', async (_req, res) => {
  try {
    const [pdvs] = await pool.query(
      `SELECT
        p.id_pdv,
        p.codigo_centro_costo,
        p.id_proveedor_principal,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor_principal,
        z.zona,
        COALESCE(c.descripcion, 'Sin ciudad') AS ciudad,
        COALESCE(r.descripcion, 'Sin región') AS region
      FROM pdvs p
      LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
      INNER JOIN zonas_comerciales z ON z.id_zona_comercial = p.id_zona_comercial
      LEFT JOIN ciudades c ON c.id_ciudad = p.id_ciudad
      LEFT JOIN regiones r ON r.id_region = c.id_region
      ORDER BY p.codigo_centro_costo ASC`
    )

    const [departamentos] = await pool.query(
      `SELECT
        d.id_departamento,
        d.descripcion,
        dpr.id_proveedor,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor_principal
      FROM departamentos d
      LEFT JOIN (
        SELECT id_departamento, id_proveedor
        FROM departamento_proveedores_rotacion
        WHERE orden_rotacion = 1
      ) dpr ON dpr.id_departamento = d.id_departamento
      LEFT JOIN proveedores pr ON pr.id_proveedor = dpr.id_proveedor
      ORDER BY d.descripcion ASC`
    )

    const [suministros] = await pool.query(
      `SELECT
        s.id_suministro,
        s.descripcion,
        ts.descripcion AS tipo,
        es.descripcion AS estado,
        'Sin proveedor' AS proveedor
      FROM suministros s
      INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
      INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
      ORDER BY ts.descripcion ASC, s.descripcion ASC`
    )

    return res.json({ pdvs, departamentos, suministros })
  } catch (err) {
    console.error('Error cargando opciones de acceso de suministros:', err.message)
    return res.status(500).json({ error: 'Error al cargar opciones de acceso de suministros.' })
  }
})

router.get('/supply-access/supplies', async (req, res) => {
  const scope = String(req.query.scope || '').toLowerCase()
  const scopeId = normalizePositiveInt(req.query.scopeId)

  if (!scope || !scopeId) {
    return res.status(400).json({ error: 'Debes enviar scope y scopeId.' })
  }

  try {
    if (scope === 'pdv') {
      const [rows] = await pool.query(
        `SELECT
          s.id_suministro,
          s.descripcion,
          ts.descripcion AS tipo,
          es.descripcion AS estado,
          COALESCE(cv.nombre_proveedor, 'Sin proveedor') AS proveedor,
          p.id_proveedor_principal,
          COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor_principal
        FROM pdvs p
        LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
        INNER JOIN v_catalogo_disponible cv
          ON p.id_proveedor_principal IS NOT NULL
         AND cv.id_proveedor = p.id_proveedor_principal
        INNER JOIN suministros s ON s.id_suministro = cv.id_suministro
        INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
        INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
        WHERE p.id_pdv = ?
        GROUP BY
          s.id_suministro,
          s.descripcion,
          ts.descripcion,
          es.descripcion,
          cv.nombre_proveedor,
          p.id_proveedor_principal,
          pr.nombre_proveedor
        ORDER BY ts.descripcion ASC, s.descripcion ASC`,
        [scopeId]
      )

      return res.json(rows)
    }

    if (scope === 'departamento') {
      const [rows] = await pool.query(
        `SELECT
          s.id_suministro,
          s.descripcion,
          ts.descripcion AS tipo,
          es.descripcion AS estado,
          COALESCE(cv.nombre_proveedor, 'Sin proveedor') AS proveedor,
          dpr.id_proveedor,
          COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor_principal
        FROM departamentos d
        LEFT JOIN (
          SELECT id_departamento, id_proveedor
          FROM departamento_proveedores_rotacion
          WHERE orden_rotacion = 1
        ) dpr ON dpr.id_departamento = d.id_departamento
        LEFT JOIN proveedores pr ON pr.id_proveedor = dpr.id_proveedor
        INNER JOIN v_catalogo_disponible cv
          ON dpr.id_proveedor IS NOT NULL
         AND cv.id_proveedor = dpr.id_proveedor
        INNER JOIN suministros s ON s.id_suministro = cv.id_suministro
        INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
        INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
        WHERE d.id_departamento = ?
        GROUP BY
          s.id_suministro,
          s.descripcion,
          ts.descripcion,
          es.descripcion,
          cv.nombre_proveedor,
          dpr.id_proveedor,
          pr.nombre_proveedor
        ORDER BY ts.descripcion ASC, s.descripcion ASC`,
        [scopeId]
      )

      return res.json(rows)
    }

    return res.status(400).json({ error: 'Scope no valido. Usa pdv o departamento.' })
  } catch (err) {
    console.error('Error obteniendo suministros por alcance:', err.message)
    return res.status(500).json({ error: 'Error al obtener suministros por alcance.' })
  }
})

router.get('/supply-access/assignments', async (req, res) => {
  const scope = String(req.query.scope || '').toLowerCase()
  const scopeId = normalizePositiveInt(req.query.scopeId)
  const scopeConfig = getScopeConfig(scope)

  if (!scopeConfig || !scopeId) {
    return res.status(400).json({ error: 'Debes enviar scope valido (pdv o departamento) y scopeId numerico.' })
  }

  try {
    const [rows] = await pool.query(
      `SELECT id_suministro
       FROM ${scopeConfig.table}
       WHERE ${scopeConfig.scopeColumn} = ?
       ORDER BY id_suministro ASC`,
      [scopeId]
    )

    return res.json({
      scope,
      scopeId,
      supplyIds: rows.map((row) => Number(row.id_suministro)),
    })
  } catch (err) {
    console.error('Error obteniendo asignaciones de suministros:', err.message)
    return res.status(500).json({ error: 'Error al obtener asignaciones de suministros.' })
  }
})

router.get('/supply-access/export', async (req, res) => {
  const region = String(req.query.region || '').trim()

  try {
    const params = []
    const whereClause = region ? 'WHERE COALESCE(r.descripcion, \"Sin región\") = ?' : ''

    if (region) {
      params.push(region)
    }

    const [pdvs] = await pool.query(
      `SELECT
        p.id_pdv,
        p.codigo_centro_costo,
        COALESCE(z.zona, 'Sin zona') AS zona,
        COALESCE(r.descripcion, 'Sin región') AS region,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor_principal
      FROM pdvs p
      INNER JOIN zonas_comerciales z ON z.id_zona_comercial = p.id_zona_comercial
      LEFT JOIN ciudades c ON c.id_ciudad = p.id_ciudad
      LEFT JOIN regiones r ON r.id_region = c.id_region
      LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
      ${whereClause}
      ORDER BY p.codigo_centro_costo ASC`,
      params
    )

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Sistema de Suministros FarmCorp'
    workbook.created = new Date()

    const usedSheetNames = new Set()

    for (const pdv of pdvs) {
      const [assignedSupplies] = await pool.query(
        `SELECT
          ps.id_suministro,
          s.descripcion AS suministro,
          ts.descripcion AS tipo,
          COALESCE(MAX(cv.nombre_proveedor), MAX(pr.nombre_proveedor), 'Sin proveedor') AS proveedor,
          MIN(cv.precio_vigente) AS precio
        FROM pdv_suministros ps
        INNER JOIN pdvs p ON p.id_pdv = ps.id_pdv
        INNER JOIN suministros s ON s.id_suministro = ps.id_suministro
        INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
        LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
        LEFT JOIN v_catalogo_disponible cv
          ON cv.id_suministro = ps.id_suministro
         AND cv.id_proveedor = p.id_proveedor_principal
        WHERE ps.id_pdv = ?
        GROUP BY ps.id_suministro, s.descripcion, ts.descripcion
        ORDER BY ts.descripcion ASC, s.descripcion ASC`,
        [pdv.id_pdv]
      )

      const sheetName = buildUniqueSheetName(`${pdv.codigo_centro_costo} - ${pdv.zona}`, usedSheetNames)
      const worksheet = workbook.addWorksheet(sheetName)

      worksheet.getCell('A1').value = 'PDV'
      worksheet.getCell('B1').value = pdv.codigo_centro_costo
      worksheet.getCell('A2').value = 'Zona Comercial'
      worksheet.getCell('B2').value = pdv.zona
      worksheet.getCell('A3').value = 'Región'
      worksheet.getCell('B3').value = pdv.region
      worksheet.getCell('A4').value = 'Proveedor Principal'
      worksheet.getCell('B4').value = pdv.proveedor_principal

      ;['A1', 'A2', 'A3', 'A4'].forEach((cellRef) => {
        const cell = worksheet.getCell(cellRef)
        cell.font = { bold: true, color: { argb: 'FF1F2937' } }
      })

      worksheet.columns = [
        { key: 'suministro', width: 42 },
        { key: 'tipo', width: 24 },
        { key: 'proveedor', width: 30 },
        { key: 'precio', width: 16 },
      ]

      worksheet.getRow(6).values = ['Suministro Asignado', 'Tipo', 'Proveedor', 'Precio']
      worksheet.getRow(6).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      worksheet.getRow(6).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C2F88' },
      }
      worksheet.getRow(6).alignment = { vertical: 'middle', horizontal: 'left' }

      if (assignedSupplies.length === 0) {
        worksheet.getCell('A7').value = 'Sin suministros asignados para este PDV.'
        worksheet.mergeCells('A7:D7')
        worksheet.getCell('A7').font = { italic: true, color: { argb: 'FF6B7280' } }
      } else {
        assignedSupplies.forEach((row) => {
          const insertedRow = worksheet.addRow({
            suministro: row.suministro,
            tipo: row.tipo,
            proveedor: row.proveedor,
            precio: row.precio,
          })

          insertedRow.getCell('precio').numFmt = '#,##0.00'
        })
      }

      worksheet.views = [{ state: 'frozen', ySplit: 6 }]
    }

    if (pdvs.length === 0) {
      const worksheet = workbook.addWorksheet('Sin resultados')
      worksheet.getCell('A1').value = 'No existen PDVs para los filtros seleccionados.'
      worksheet.getCell('A1').font = { bold: true }
    }

    const fileDate = new Date().toISOString().slice(0, 10)
    const regionSuffix = region ? `_${region.replace(/\s+/g, '_')}` : '_todas'
    const fileName = `permisos_suministros_pdv${regionSuffix}_${fileDate}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

    await workbook.xlsx.write(res)
    return res.end()
  } catch (err) {
    console.error('Error exportando permisos de suministros a Excel:', err.message)
    return res.status(500).json({ error: 'No se pudo generar el archivo Excel.' })
  }
})

router.put('/supply-access/assignments', async (req, res) => {
  const scope = String(req.body.scope || '').toLowerCase()
  const scopeId = normalizePositiveInt(req.body.scopeId)
  const rawSupplyIds = Array.isArray(req.body.supplyIds) ? req.body.supplyIds : null
  const scopeConfig = getScopeConfig(scope)

  if (!scopeConfig || !scopeId || !rawSupplyIds) {
    return res.status(400).json({ error: 'Debes enviar scope, scopeId y supplyIds validos.' })
  }

  const supplyIds = [...new Set(rawSupplyIds
    .map(normalizePositiveInt)
    .filter((value) => value !== null))]

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [scopeRows] = await conn.query(
      `SELECT 1
       FROM ${scopeConfig.existsTable}
       WHERE ${scopeConfig.existsColumn} = ?
       LIMIT 1`,
      [scopeId]
    )

    if (scopeRows.length === 0) {
      await conn.rollback()
      return res.status(404).json({ error: 'No existe el registro objetivo para asignar suministros.' })
    }

    if (supplyIds.length > 0) {
      const [validSuppliesRows] = await conn.query(
        `SELECT id_suministro
         FROM suministros
         WHERE id_suministro IN (${supplyIds.map(() => '?').join(',')})`,
        supplyIds
      )

      const validSupplies = new Set(validSuppliesRows.map((row) => Number(row.id_suministro)))
      const invalidIds = supplyIds.filter((id) => !validSupplies.has(id))

      if (invalidIds.length > 0) {
        await conn.rollback()
        return res.status(400).json({ error: `Los siguientes suministros no existen: ${invalidIds.join(', ')}` })
      }

      if (scope === 'pdv') {
        const [allowedRows] = await conn.query(
          `SELECT DISTINCT cv.id_suministro
           FROM pdvs p
           INNER JOIN v_catalogo_disponible cv
             ON p.id_proveedor_principal IS NOT NULL
            AND cv.id_proveedor = p.id_proveedor_principal
           WHERE p.id_pdv = ?
             AND cv.id_suministro IN (${supplyIds.map(() => '?').join(',')})`,
          [scopeId, ...supplyIds]
        )

        const allowedSet = new Set(allowedRows.map((row) => Number(row.id_suministro)))
        const disallowedIds = supplyIds.filter((id) => !allowedSet.has(id))

        if (disallowedIds.length > 0) {
          await conn.rollback()
          return res.status(400).json({
            error: `Estos suministros no pertenecen al proveedor principal del PDV: ${disallowedIds.join(', ')}`,
          })
        }
      }
    }

    await conn.query(
      `DELETE FROM ${scopeConfig.table}
       WHERE ${scopeConfig.scopeColumn} = ?`,
      [scopeId]
    )

    if (supplyIds.length > 0) {
      const placeholders = supplyIds.map(() => '(?, ?)').join(', ')
      const params = []

      supplyIds.forEach((supplyId) => {
        params.push(scopeId, supplyId)
      })

      await conn.query(
        `INSERT INTO ${scopeConfig.table} (${scopeConfig.scopeColumn}, id_suministro)
         VALUES ${placeholders}`,
        params
      )
    }

    await conn.commit()

    return res.json({
      message: 'Asignaciones de suministros actualizadas correctamente.',
      scope,
      scopeId,
      totalAssigned: supplyIds.length,
    })
  } catch (err) {
    await conn.rollback()
    console.error('Error actualizando asignaciones de suministros:', err.message)
    return res.status(500).json({ error: 'Error al actualizar asignaciones de suministros.' })
  } finally {
    conn.release()
  }
})

module.exports = router
