const express = require('express')
const router = express.Router()
const { pool } = require('../../config/db')
const { ensureCurrentDepartmentBudgets } = require('../../services/BudgetPeriodService')

router.post('/departamentos', async (req, res) => {
  const { descripcion, id_proveedor, presupuestos } = req.body

  if (!descripcion || !String(descripcion).trim()) {
    return res.status(400).json({ error: 'La descripcion del departamento es obligatoria.' })
  }

  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const descripcionLimpia = String(descripcion).trim()

    const [result] = await pool.query(
      'INSERT INTO departamentos (descripcion) VALUES (?)',
      [descripcionLimpia]
    )

    const departmentId = Number(result.insertId)

    if (id_proveedor !== undefined && id_proveedor !== null && id_proveedor !== '') {
      await pool.query(
        'INSERT INTO departamento_proveedores_rotacion (id_departamento, id_proveedor, orden_rotacion) VALUES (?, ?, 1)',
        [departmentId, Number(id_proveedor)]
      )
    }

    if (Array.isArray(presupuestos)) {
      for (const p of presupuestos) {
        const monto = Number(p.monto_autorizado)
        if (!Number.isFinite(monto) || monto < 0) continue
        await pool.query(
          `INSERT INTO presupuesto_departamentos
             (id_departamento, id_grupo_presupuesto, periodo_anio, periodo_mes, monto_autorizado, monto_ejecutado)
           VALUES (?, ?, ?, ?, ?, 0)`,
          [departmentId, Number(p.id_grupo_presupuesto), currentYear, currentMonth, monto]
        )
      }
    }

    return res.status(201).json({ id_departamento: departmentId, message: 'Departamento creado correctamente.' })
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un departamento con ese nombre.' })
    }
    console.error('Error creando departamento:', err.message)
    return res.status(500).json({ error: 'Error al crear departamento.' })
  }
})

router.get('/departamentos', async (req, res) => {
  const { search = '' } = req.query

  try {
    await ensureCurrentDepartmentBudgets(pool)

    const params = []
    const conditions = []

    if (search) {
      conditions.push('d.descripcion LIKE ?')
      params.push(`%${search}%`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [rows] = await pool.query(
      `SELECT
        d.id_departamento,
        d.descripcion,
        COALESCE(dpr.id_proveedor, '') AS id_proveedor,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor') AS proveedor,
        COUNT(DISTINCT u.id_usuario) AS total_usuarios
      FROM departamentos d
      LEFT JOIN (
        SELECT id_departamento, id_proveedor
        FROM departamento_proveedores_rotacion
        WHERE orden_rotacion = 1
      ) dpr ON dpr.id_departamento = d.id_departamento
      LEFT JOIN proveedores pr ON pr.id_proveedor = dpr.id_proveedor
      LEFT JOIN usuarios u ON u.id_departamento = d.id_departamento
      ${whereClause}
      GROUP BY d.id_departamento, d.descripcion, dpr.id_proveedor, pr.nombre_proveedor
      ORDER BY d.descripcion ASC`,
      params
    )

    const [presupuestosRows] = await pool.query(
      `SELECT pp.id_departamento, pp.id_grupo_presupuesto, gp.descripcion AS descripcion_grupo,
              pp.monto_autorizado, pp.monto_ejecutado
       FROM presupuesto_departamentos pp
       JOIN grupos_presupuesto gp ON gp.id_grupo_presupuesto = pp.id_grupo_presupuesto
       WHERE pp.periodo_anio = ? AND pp.periodo_mes = ?`,
      [currentYear, currentMonth]
    )

    const presupuestosMap = {}
    for (const p of presupuestosRows) {
      if (!presupuestosMap[p.id_departamento]) presupuestosMap[p.id_departamento] = []
      presupuestosMap[p.id_departamento].push({
        id_grupo_presupuesto: p.id_grupo_presupuesto,
        descripcion_grupo: p.descripcion_grupo,
        monto_autorizado: Number(p.monto_autorizado),
        monto_ejecutado: Number(p.monto_ejecutado),
      })
    }

    const result = rows.map((row) => ({
      ...row,
      total_usuarios: Number(row.total_usuarios),
      presupuestos: presupuestosMap[row.id_departamento] || [],
    }))

    return res.json(result)
  } catch (err) {
    console.error('Error listando departamentos:', err.message)
    return res.status(500).json({ error: 'Error al obtener departamentos.' })
  }
})

router.put('/departamentos/:id', async (req, res) => {
  const departmentId = Number(req.params.id)
  const { descripcion, id_proveedor, presupuestos } = req.body

  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    if (descripcion !== undefined) {
      const descripcionLimpia = String(descripcion).trim()

      if (!descripcionLimpia) {
        return res.status(400).json({ error: 'La descripcion del departamento es obligatoria.' })
      }

      await pool.query(
        'UPDATE departamentos SET descripcion = ? WHERE id_departamento = ?',
        [descripcionLimpia, departmentId]
      )
    }

    if (id_proveedor !== undefined && id_proveedor !== null && id_proveedor !== '') {
      await pool.query(
        'DELETE FROM departamento_proveedores_rotacion WHERE id_departamento = ?',
        [departmentId]
      )

      await pool.query(
        'INSERT INTO departamento_proveedores_rotacion (id_departamento, id_proveedor, orden_rotacion) VALUES (?, ?, 1)',
        [departmentId, Number(id_proveedor)]
      )
    }

    if (Array.isArray(presupuestos)) {
      for (const p of presupuestos) {
        const monto = Number(p.monto_autorizado)
        if (!Number.isFinite(monto) || monto < 0) continue
        await pool.query(
          `INSERT INTO presupuesto_departamentos
             (id_departamento, id_grupo_presupuesto, periodo_anio, periodo_mes, monto_autorizado, monto_ejecutado)
           VALUES (?, ?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE monto_autorizado = VALUES(monto_autorizado)`,
          [departmentId, Number(p.id_grupo_presupuesto), currentYear, currentMonth, monto]
        )
      }
    }

    return res.json({ message: 'Departamento actualizado correctamente.' })
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un departamento con ese nombre.' })
    }
    console.error('Error actualizando departamento:', err.message)
    return res.status(500).json({ error: 'Error al actualizar departamento.' })
  }
})

router.delete('/departamentos/:id', async (req, res) => {
  const departmentId = Number(req.params.id)

  try {
    const [[usersCount]] = await pool.query(
      'SELECT COUNT(*) AS total FROM usuarios WHERE id_departamento = ?',
      [departmentId]
    )

    if (Number(usersCount.total || 0) > 0) {
      return res.status(400).json({
        error: `No se puede eliminar el departamento porque tiene ${usersCount.total} usuario(s) asociado(s).`,
      })
    }

    await pool.query('DELETE FROM presupuesto_departamentos WHERE id_departamento = ?', [departmentId])
    await pool.query('DELETE FROM departamento_proveedores_rotacion WHERE id_departamento = ?', [departmentId])

    const [result] = await pool.query('DELETE FROM departamentos WHERE id_departamento = ?', [departmentId])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Departamento no encontrado.' })
    }

    return res.json({ message: 'Departamento eliminado correctamente.' })
  } catch (err) {
    console.error('Error eliminando departamento:', err.message)
    return res.status(500).json({ error: 'Error al eliminar departamento.' })
  }
})

module.exports = router