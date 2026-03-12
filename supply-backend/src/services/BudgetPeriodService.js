function getCurrentPeriod(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

async function getColumnAvailability(executor, tableName, columnNames) {
  const placeholders = columnNames.map(() => '?').join(', ')
  const [rows] = await executor.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME IN (${placeholders})`,
    [tableName, ...columnNames]
  )

  const available = new Set(rows.map((row) => row.COLUMN_NAME))
  return columnNames.reduce((acc, columnName) => {
    acc[columnName] = available.has(columnName)
    return acc
  }, {})
}

async function ensureCurrentPdvBudgets(executor, date = new Date()) {
  const period = getCurrentPeriod(date)
  const availability = await getColumnAvailability(executor, 'pdvs', [
    'cupo_disponible',
    'cupo_periodo_anio',
    'cupo_periodo_mes',
  ])

  const hasPdvCupoDisponible = Boolean(availability.cupo_disponible)
  const hasPdvPeriodTracking = Boolean(availability.cupo_periodo_anio && availability.cupo_periodo_mes)

  if (!hasPdvCupoDisponible || !hasPdvPeriodTracking) {
    return { hasPdvCupoDisponible, hasPdvPeriodTracking, period }
  }

  await executor.query(
    `UPDATE pdvs p
     JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
     SET p.cupo_disponible = gp.monto_autorizado,
         p.cupo_periodo_anio = ?,
         p.cupo_periodo_mes = ?
     WHERE p.cupo_periodo_anio IS NULL
        OR p.cupo_periodo_mes IS NULL
        OR p.cupo_periodo_anio < ?
        OR (p.cupo_periodo_anio = ? AND p.cupo_periodo_mes < ?)`,
    [period.year, period.month, period.year, period.year, period.month]
  )

  return { hasPdvCupoDisponible, hasPdvPeriodTracking, period }
}

async function ensureCurrentDepartmentBudgets(executor, date = new Date()) {
  const period = getCurrentPeriod(date)
  const availability = await getColumnAvailability(executor, 'presupuesto_departamentos', ['monto_ejecutado'])
  const hasMontoEjecutado = Boolean(availability.monto_ejecutado)

  const [currentRows] = await executor.query(
    `SELECT id_departamento, id_grupo_presupuesto
     FROM presupuesto_departamentos
     WHERE periodo_anio = ? AND periodo_mes = ?`,
    [period.year, period.month]
  )

  const currentKeys = new Set(
    currentRows.map((row) => `${Number(row.id_departamento)}:${Number(row.id_grupo_presupuesto)}`)
  )

  const [sourceRows] = await executor.query(
    `SELECT id_departamento, id_grupo_presupuesto, monto_autorizado, periodo_anio, periodo_mes
     FROM presupuesto_departamentos
     WHERE periodo_anio < ?
        OR (periodo_anio = ? AND periodo_mes < ?)
     ORDER BY id_departamento ASC,
              id_grupo_presupuesto ASC,
              CASE WHEN periodo_anio = ? AND periodo_mes = 0 THEN 0 ELSE 1 END ASC,
              periodo_anio DESC,
              CASE WHEN periodo_mes = 0 THEN -1 ELSE periodo_mes END DESC`,
    [period.year, period.year, period.month, period.year]
  )

  const sourceByKey = new Map()
  for (const row of sourceRows) {
    const key = `${Number(row.id_departamento)}:${Number(row.id_grupo_presupuesto)}`
    if (!sourceByKey.has(key)) {
      sourceByKey.set(key, row)
    }
  }

  const rowsToInsert = []
  for (const [key, row] of sourceByKey.entries()) {
    if (!currentKeys.has(key)) {
      rowsToInsert.push(row)
    }
  }

  for (const row of rowsToInsert) {
    if (hasMontoEjecutado) {
      await executor.query(
        `INSERT INTO presupuesto_departamentos
           (id_departamento, id_grupo_presupuesto, periodo_anio, periodo_mes, monto_autorizado, monto_ejecutado)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [
          Number(row.id_departamento),
          Number(row.id_grupo_presupuesto),
          period.year,
          period.month,
          Number(row.monto_autorizado || 0),
        ]
      )
    } else {
      await executor.query(
        `INSERT INTO presupuesto_departamentos
           (id_departamento, id_grupo_presupuesto, periodo_anio, periodo_mes, monto_autorizado)
         VALUES (?, ?, ?, ?, ?)`,
        [
          Number(row.id_departamento),
          Number(row.id_grupo_presupuesto),
          period.year,
          period.month,
          Number(row.monto_autorizado || 0),
        ]
      )
    }
  }

  return { hasMontoEjecutado, period }
}

module.exports = {
  getCurrentPeriod,
  ensureCurrentPdvBudgets,
  ensureCurrentDepartmentBudgets,
}