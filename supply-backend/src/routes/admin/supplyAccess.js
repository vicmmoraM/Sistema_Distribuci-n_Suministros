const express = require('express')
const router = express.Router()
const { pool } = require('../../config/db')

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

router.get('/supply-access/options', async (_req, res) => {
  try {
    const [pdvs] = await pool.query(
      `SELECT
        p.id_pdv,
        p.codigo_centro_costo,
        p.id_proveedor_principal,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor_principal,
        z.zona,
        c.descripcion AS ciudad,
        r.descripcion AS region
      FROM pdvs p
      LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor_principal
      INNER JOIN zonas_comerciales z ON z.id_zona_comercial = p.id_zona_comercial
      INNER JOIN ciudades c ON c.id_ciudad = z.id_ciudad
      INNER JOIN regiones r ON r.id_region = c.id_region
      ORDER BY p.codigo_centro_costo ASC`
    )

    const [departamentos] = await pool.query(
      'SELECT id_departamento, descripcion FROM departamentos ORDER BY descripcion ASC'
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
          COALESCE(
            (
              SELECT cv.nombre_proveedor
              FROM v_catalogo_disponible cv
              WHERE cv.id_suministro = s.id_suministro
              ORDER BY cv.precio_vigente ASC, cv.id_proveedor ASC
              LIMIT 1
            ),
            'Sin proveedor'
          ) AS proveedor
        FROM suministros s
        INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
        INNER JOIN estado_suministros es ON es.id_estado_suministro = s.id_estado_suministro
        ORDER BY ts.descripcion ASC, s.descripcion ASC`
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
