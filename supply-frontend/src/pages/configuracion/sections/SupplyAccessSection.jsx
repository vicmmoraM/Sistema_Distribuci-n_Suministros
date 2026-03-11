import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'

export default function SupplyAccessSection({ onNotify }) {
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingSupplies, setLoadingSupplies] = useState(false)

  const [targetType, setTargetType] = useState('pdv')
  const [targetId, setTargetId] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [options, setOptions] = useState({
    pdvs: [],
    departamentos: [],
    suministros: [],
  })

  const [assignedIds, setAssignedIds] = useState([])
  const [scopeSupplies, setScopeSupplies] = useState([])

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true)
      try {
        const response = await api.get('/admin/supply-access/options')
        setOptions(response.data)
      } catch (err) {
        onNotify?.(err.response?.data?.error || 'No se pudieron cargar las opciones de permisos.', 'error')
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [onNotify])

  useEffect(() => {
    const loadSupplies = async () => {
      if (!targetId) {
        setScopeSupplies([])
        return
      }

      setLoadingSupplies(true)
      try {
        const response = await api.get('/admin/supply-access/supplies', {
          params: {
            scope: targetType,
            scopeId: targetId,
          },
        })

        setScopeSupplies(response.data || [])
      } catch (err) {
        setScopeSupplies([])
        onNotify?.(err.response?.data?.error || 'No se pudo cargar el catalogo para el alcance seleccionado.', 'error')
      } finally {
        setLoadingSupplies(false)
      }
    }

    loadSupplies()
  }, [targetType, targetId, onNotify])

  useEffect(() => {
    const loadAssignments = async () => {
      if (!targetId) {
        setAssignedIds([])
        return
      }

      setLoadingAssignments(true)
      try {
        const response = await api.get('/admin/supply-access/assignments', {
          params: {
            scope: targetType,
            scopeId: targetId,
          },
        })

        setAssignedIds(response.data.supplyIds || [])
      } catch (err) {
        setAssignedIds([])
        onNotify?.(err.response?.data?.error || 'No se pudieron cargar las asignaciones.', 'error')
      } finally {
        setLoadingAssignments(false)
      }
    }

    loadAssignments()
  }, [targetType, targetId, onNotify])

  const targetOptions = targetType === 'pdv' ? options.pdvs : options.departamentos

  const selectedPdv = useMemo(() => {
    if (targetType !== 'pdv' || !targetId) return null
    return (options.pdvs || []).find((item) => Number(item.id_pdv) === Number(targetId)) || null
  }, [targetType, targetId, options.pdvs])

  const availableTypes = useMemo(() => {
    return [...new Set((scopeSupplies || []).map((item) => item.tipo))].sort((a, b) => a.localeCompare(b))
  }, [scopeSupplies])

  const filteredSupplies = useMemo(() => {
    const normalizedSearch = String(search || '').trim().toLowerCase()

    return (scopeSupplies || []).filter((item) => {
      if (typeFilter && item.tipo !== typeFilter) return false

      if (!normalizedSearch) return true

      return (
        String(item.descripcion || '').toLowerCase().includes(normalizedSearch) ||
        String(item.tipo || '').toLowerCase().includes(normalizedSearch)
      )
    })
  }, [scopeSupplies, search, typeFilter])

  useEffect(() => {
    if (!targetId || scopeSupplies.length === 0) return

    const visibleIds = new Set(scopeSupplies.map((item) => Number(item.id_suministro)))
    setAssignedIds((prev) => prev.filter((id) => visibleIds.has(Number(id))))
  }, [targetId, scopeSupplies])

  const assignedSet = useMemo(() => new Set(assignedIds), [assignedIds])

  const toggleSupply = (supplyId) => {
    setAssignedIds((prev) => {
      const exists = prev.includes(supplyId)
      if (exists) return prev.filter((id) => id !== supplyId)
      return [...prev, supplyId]
    })
  }

  const selectAllFiltered = () => {
    setAssignedIds((prev) => [...new Set([...prev, ...filteredSupplies.map((item) => item.id_suministro)])])
  }

  const clearAllFiltered = () => {
    const filteredIdSet = new Set(filteredSupplies.map((item) => item.id_suministro))
    setAssignedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)))
  }

  const saveAssignments = async () => {
    if (!targetId) {
      onNotify?.('Selecciona un objetivo antes de guardar.', 'error')
      return
    }

    setSaving(true)
    try {
      await api.put('/admin/supply-access/assignments', {
        scope: targetType,
        scopeId: Number(targetId),
        supplyIds: assignedIds,
      })

      onNotify?.('Permisos de suministros guardados correctamente.')
    } catch (err) {
      onNotify?.(err.response?.data?.error || 'No se pudieron guardar las asignaciones.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loadingOptions) {
    return (
      <div className="supply-access-empty-state">
        <span className="supply-access-empty-icon">⏳</span>
        <p className="supply-access-empty-title">Cargando panel de permisos...</p>
      </div>
    )
  }

  return (
    <div className="supply-access-panel">
      {/* Filtros con etiquetas */}
      <div className="supply-access-controls">
        <div className="supply-access-control-group">
          <label>Modo</label>
          <select
            value={targetType}
            onChange={(event) => {
              setTargetType(event.target.value)
              setTargetId('')
              setAssignedIds([])
            }}
          >
            <option value="pdv">Asignar por PDV</option>
            <option value="departamento">Asignar por Departamento</option>
          </select>
        </div>

        <div className="supply-access-control-group">
          <label>{targetType === 'pdv' ? 'Punto de Venta' : 'Departamento'}</label>
          <select
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            <option value="">Seleccionar...</option>
            {targetOptions.map((item) => (
              <option
                key={targetType === 'pdv' ? item.id_pdv : item.id_departamento}
                value={targetType === 'pdv' ? item.id_pdv : item.id_departamento}
              >
                {targetType === 'pdv'
                  ? `${item.codigo_centro_costo} — ${item.region} / ${item.zona}`
                  : item.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="supply-access-control-group">
          <label>Buscar suministro</label>
          <input
            type="text"
            placeholder="Nombre o tipo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="supply-access-control-group">
          <label>Filtrar por tipo</label>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="">Todos los tipos</option>
            {availableTypes.map((itemType) => (
              <option key={itemType} value={itemType}>{itemType}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Proveedor bloqueado */}
      {targetType === 'pdv' && selectedPdv && (
        <div className="supply-access-provider-lock">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            Proveedor bloqueado para este PDV:{' '}
            <strong>{selectedPdv.proveedor_principal}</strong>
          </span>
        </div>
      )}

      {/* Estado de carga */}
      {loadingAssignments || loadingSupplies ? (
        <div className="admin-loading">Cargando suministros y asignaciones...</div>
      ) : !targetId ? (
        <div className="supply-access-empty-state">
          <svg className="supply-access-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="2" />
            <path d="M9 12h6M9 16h4" />
          </svg>
          <p className="supply-access-empty-title">Selecciona un destino para continuar</p>
          <p>Elige un PDV o departamento para ver y configurar sus suministros permitidos.</p>
        </div>
      ) : (
        <>
          {/* Barra de stats + acciones */}
          <div className="supply-access-bar">
            <div className="supply-access-stats">
              <span className="supply-access-stat supply-access-stat--total">
                <strong>{filteredSupplies.length}</strong> visibles
              </span>
              <span className="supply-access-stat supply-access-stat--assigned">
                <strong>{assignedIds.length}</strong> asignados
              </span>
            </div>

            <div className="supply-access-actions">
              <button type="button" className="admin-secondary" onClick={selectAllFiltered}>
                Marcar visibles
              </button>
              <button type="button" className="admin-secondary" onClick={clearAllFiltered}>
                Limpiar visibles
              </button>
              <button type="button" className="admin-primary" onClick={saveAssignments} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar asignaciones'}
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="admin-table-wrap">
            <table className="admin-table supply-access-table">
              <thead>
                <tr>
                  <th>Asignado</th>
                  <th>Suministro</th>
                  <th>Tipo</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="supply-access-table-empty">
                      No hay suministros disponibles para los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredSupplies.map((item) => {
                    const isChecked = assignedSet.has(item.id_suministro)

                    return (
                      <tr
                        key={item.id_suministro}
                        className={isChecked ? 'supply-access-row--assigned' : ''}
                        onClick={() => toggleSupply(item.id_suministro)}
                      >
                        <td data-label="Asignado">
                          <span className={`supply-access-checkbox ${isChecked ? 'supply-access-checkbox--checked' : ''}`}>
                            {isChecked && (
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="2,6 5,9 10,3" />
                              </svg>
                            )}
                          </span>
                        </td>
                        <td data-label="Suministro">{item.descripcion}</td>
                        <td data-label="Tipo">
                          <span className="supply-access-type-badge">{item.tipo}</span>
                        </td>
                        <td data-label="Proveedor">{item.proveedor}</td>
                        <td data-label="Estado">
                          <span className={`supply-access-status ${item.estado === 'Disponible' ? 'supply-access-status--active' : 'supply-access-status--inactive'}`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
