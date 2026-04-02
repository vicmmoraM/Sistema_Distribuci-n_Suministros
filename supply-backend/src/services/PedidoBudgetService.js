function toSafeNumber(value) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  
  function buildOrderSubtotalsByBudgetGroup(items = []) {
    const subtotalsByGroup = new Map()
  
    for (const item of items) {
      const groupId = Number(item.idGrupoPresupuesto || 0)
      const current = subtotalsByGroup.get(groupId) || {
        id_grupo_presupuesto: groupId,
        grupo: item.grupoPresupuestoNombre || `Grupo ${groupId}`,
        subtotal_solicitado: 0,
      }
  
      current.subtotal_solicitado += toSafeNumber(item.total)
      subtotalsByGroup.set(groupId, current)
    }
  
    return Array.from(subtotalsByGroup.values())
  }
  
  function findExceededBudgetGroups({ subtotalsByGroup = [], availableBudgetByGroup = [] }) {
    const budgetIndex = new Map(
      availableBudgetByGroup.map((row) => [
        Number(row.id_grupo_presupuesto),
        {
          id_grupo_presupuesto: Number(row.id_grupo_presupuesto),
          grupo: row.grupo || `Grupo ${Number(row.id_grupo_presupuesto)}`,
          saldo_disponible: Math.max(0, toSafeNumber(row.saldo_disponible)),
        },
      ])
    )
  
    const exceeded = []
  
    for (const subtotalRow of subtotalsByGroup) {
      const groupId = Number(subtotalRow.id_grupo_presupuesto)
      const requestedSubtotal = toSafeNumber(subtotalRow.subtotal_solicitado)
      const budgetRow = budgetIndex.get(groupId) || {
        id_grupo_presupuesto: groupId,
        grupo: subtotalRow.grupo || `Grupo ${groupId}`,
        saldo_disponible: 0,
      }
  
      const overrun = requestedSubtotal - budgetRow.saldo_disponible
  
      if (overrun > 0) {
        exceeded.push({
          id_grupo_presupuesto: groupId,
          grupo: budgetRow.grupo,
          subtotal_solicitado: Number(requestedSubtotal.toFixed(2)),
          saldo_disponible: Number(budgetRow.saldo_disponible.toFixed(2)),
          excedente: Number(overrun.toFixed(2)),
        })
      }
    }
  
    return exceeded
  }
  
  module.exports = {
    buildOrderSubtotalsByBudgetGroup,
    findExceededBudgetGroups,
  }
  