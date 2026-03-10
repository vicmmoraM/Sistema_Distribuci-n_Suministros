const express = require('express')
const router = express.Router()
const { pool } = require('../../config/db')

router.post('/departamentos', async (req, res) => {
  const { descripcion, id_proveedor, presupuesto_autorizado } = req.body

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

    if (presupuesto_autorizado !== undefined && presupuesto_autorizado !== null && String(presupuesto_autorizado).trim() !== '') {
      const presupuesto = Number(presupuesto_autorizado)

      if (presupuesto < 0) {
        return res.status(400).json({ error: 'El presupuesto no puede ser negativo.' })
      }

      await pool.query(
        `INSERT INTO presupuesto_departamentos (id_departamento, periodo_anio, periodo_mes, monto_autorizado, monto_ejecutado)
         VALUES (?, ?, ?, ?, 0)`,
        [departmentId, currentYear, currentMonth, presupuesto]
      )
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
        COALESCE(pp.monto_autorizado, 0) AS presupuesto_autorizado,
        COALESCE(pp.monto_ejecutado, 0) AS presupuesto_ejecutado,
        COUNT(u.id_usuario) AS total_usuarios
      FROM departamentos d
      LEFT JOIN (
        SELECT id_departamento, id_proveedor, orden_rotacion
        FROM departamento_proveedores_rotacion
        WHERE orden_rotacion = 1
      ) dpr ON dpr.id_departamento = d.id_departamento
      LEFT JOIN proveedores pr ON pr.id_proveedor = dpr.id_proveedor
      LEFT JOIN presupuesto_departamentos pp
        ON pp.id_presupuesto_departamento = (
          SELECT p2.id_presupuesto_departamento
          FROM presupuesto_departamentos p2
          WHERE p2.id_departamento = d.id_departamento
          ORDER BY
            CASE
              WHEN p2.periodo_anio = ? AND p2.periodo_mes = ? THEN 0
              WHEN p2.periodo_anio = ? AND p2.periodo_mes = 0 THEN 1
              ELSE 2
            END,
            p2.periodo_anio DESC,
            p2.periodo_mes DESC
          LIMIT 1
        )
      LEFT JOIN usuarios u ON u.id_departamento = d.id_departamento
      ${whereClause}
      GROUP BY d.id_departamento, d.descripcion, dpr.id_proveedor, pr.nombre_proveedor, pp.monto_autorizado, pp.monto_ejecutado
      ORDER BY d.descripcion ASC`,
      [currentYear, currentMonth, currentYear, ...params]
    )

    return res.json(rows)
  } catch (err) {
    console.error('Error listando departamentos:', err.message)
    return res.status(500).json({ error: 'Error al obtener departamentos.' })
  }
})

router.put('/departamentos/:id', async (req, res) => {
  const departmentId = Number(req.params.id)
  const { descripcion, id_proveedor, presupuesto_autorizado } = req.body

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

    if (presupuesto_autorizado !== undefined && presupuesto_autorizado !== null) {
      const presupuesto = Number(presupuesto_autorizado)

      if (presupuesto < 0) {
        return res.status(400).json({ error: 'El presupuesto no puede ser negativo.' })
      }

      await pool.query(
        `INSERT INTO presupuesto_departamentos (id_departamento, periodo_anio, periodo_mes, monto_autorizado, monto_ejecutado)
         VALUES (?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           monto_autorizado = VALUES(monto_autorizado)`,
        [departmentId, currentYear, currentMonth, presupuesto]
      )
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