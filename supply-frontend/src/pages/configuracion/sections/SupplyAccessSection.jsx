import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'

export default function SupplyAccessSection({ onNotify }) {
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copying, setCopying] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [loadingSupplies, setLoadingSupplies] = useState(false)

  const [targetType, setTargetType] = useState('pdv')
  const [targetId, setTargetId] = useState('')
  const [copyFromType, setCopyFromType] = useState('pdv')
  const [copyFromId, setCopyFromId] = useState('')
  const [copyRangeStartId, setCopyRangeStartId] = useState('')
  const [copyRangeEndId, setCopyRangeEndId] = useState('')
  const [copyRegionFilter, setCopyRegionFilter] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [options, setOptions] = useState({
    pdvs: [],
    departamentos: [],
    suministros: [],
  })

  const [assignedIds, setAssignedIds] = useState([])
  const [scopeSupplies, setScopeSupplies] = useState([])

  const normalizeId = (value) => Number(value)

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
  }, [])

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
  }, [targetType, targetId])

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

        setAssignedIds((response.data.supplyIds || []).map((id) => normalizeId(id)))
      } catch (err) {
        setAssignedIds([])
        onNotify?.(err.response?.data?.error || 'No se pudieron cargar las asignaciones.', 'error')
      } finally {
        setLoadingAssignments(false)
      }
    }

    loadAssignments()
  }, [targetType, targetId])

  const targetOptions = targetType === 'pdv' ? options.pdvs : options.departamentos
  const copyFromOptions = copyFromType === 'pdv' ? options.pdvs : options.departamentos
  const targetTypeLabelPlural = targetType === 'pdv' ? 'PDVs' : 'departamentos'

  const getScopeOptionId = (scope, item) => normalizeId(scope === 'pdv' ? item.id_pdv : item.id_departamento)
  const getScopeOptionProviderId = (scope, item) => normalizeId(scope === 'pdv' ? item.id_proveedor_principal : item.id_proveedor)

  const selectedPdv = useMemo(() => {
    if (targetType !== 'pdv' || !targetId) return null
    return (options.pdvs || []).find((item) => Number(item.id_pdv) === Number(targetId)) || null
  }, [targetType, targetId, options.pdvs])

  const selectedDepartment = useMemo(() => {
    if (targetType !== 'departamento' || !targetId) return null
    return (options.departamentos || []).find((item) => Number(item.id_departamento) === Number(targetId)) || null
  }, [targetType, targetId, options.departamentos])

  const copySourceOption = useMemo(() => {
    if (!copyFromId) return null
    return copyFromOptions.find((item) => getScopeOptionId(copyFromType, item) === normalizeId(copyFromId)) || null
  }, [copyFromId, copyFromOptions, copyFromType])

  const selectedTargetOption = useMemo(() => {
    if (!targetId) return null
    return targetOptions.find((item) => getScopeOptionId(targetType, item) === normalizeId(targetId)) || null
  }, [targetId, targetOptions, targetType])

  const availableRegions = useMemo(() => {
    return [...new Set((options.pdvs || []).map((item) => String(item.region || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
  }, [options.pdvs])

  const filteredTargetOptions = useMemo(() => {
    if (targetType !== 'pdv' || !copyRegionFilter) return targetOptions
    return targetOptions.filter((item) => String(item.region || '').trim() === copyRegionFilter)
  }, [copyRegionFilter, targetOptions, targetType])

  const filteredCopyFromOptions = useMemo(() => {
    if (copyFromType !== 'pdv' || !copyRegionFilter) return copyFromOptions
    return copyFromOptions.filter((item) => String(item.region || '').trim() === copyRegionFilter)
  }, [copyFromOptions, copyFromType, copyRegionFilter])

  const rangeDestinationOptions = useMemo(() => {
    if (!copyRangeStartId || !copyRangeEndId) return []

    const startIndex = filteredTargetOptions.findIndex((item) => getScopeOptionId(targetType, item) === normalizeId(copyRangeStartId))
    const endIndex = filteredTargetOptions.findIndex((item) => getScopeOptionId(targetType, item) === normalizeId(copyRangeEndId))

    if (startIndex === -1 || endIndex === -1) return []

    const fromIndex = Math.min(startIndex, endIndex)
    const toIndex = Math.max(startIndex, endIndex)

    return filteredTargetOptions.slice(fromIndex, toIndex + 1).filter((item) => {
      const optionId = getScopeOptionId(targetType, item)
      if (targetType === copyFromType && optionId === normalizeId(copyFromId)) {
        return false
      }
      if (!copySourceOption) return false
      return getScopeOptionProviderId(targetType, item) === getScopeOptionProviderId(copyFromType, copySourceOption)
    })
  }, [copyFromId, copyFromType, copyRangeEndId, copyRangeStartId, copySourceOption, filteredTargetOptions, targetType])

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
    setAssignedIds((prev) => prev.map((id) => normalizeId(id)).filter((id) => visibleIds.has(id)))
  }, [targetId, scopeSupplies])

  const assignedSet = useMemo(() => new Set(assignedIds), [assignedIds])

  const toggleSupply = (supplyId) => {
    const normalizedSupplyId = normalizeId(supplyId)
    setAssignedIds((prev) => {
      const normalizedPrev = prev.map((id) => normalizeId(id))
      const exists = normalizedPrev.includes(normalizedSupplyId)
      if (exists) return normalizedPrev.filter((id) => id !== normalizedSupplyId)
      return [...normalizedPrev, normalizedSupplyId]
    })
  }

  const selectAllFiltered = () => {
    setAssignedIds((prev) => [
      ...new Set([
        ...prev.map((id) => normalizeId(id)),
        ...filteredSupplies.map((item) => normalizeId(item.id_suministro)),
      ]),
    ])
  }

  const clearAllFiltered = () => {
    const filteredIdSet = new Set(filteredSupplies.map((item) => normalizeId(item.id_suministro)))
    setAssignedIds((prev) => prev.map((id) => normalizeId(id)).filter((id) => !filteredIdSet.has(id)))
  }

  const copyAssignments = async () => {
    if (!copyFromId) {
      onNotify?.('Selecciona el origen desde donde quieres copiar permisos.', 'error')
      return
    }

    if (targetType !== copyFromType) {
      onNotify?.('La copia por proveedor solo funciona entre elementos del mismo tipo: PDV a PDV o departamento a departamento.', 'error')
      return
    }

    if (!targetId) {
      onNotify?.('Selecciona primero el destino donde quieres copiar permisos.', 'error')
      return
    }

    if (!copySourceOption || !selectedTargetOption) {
      onNotify?.('No se pudo identificar el proveedor del origen o destino.', 'error')
      return
    }

    const sourceProviderId = getScopeOptionProviderId(copyFromType, copySourceOption)
    const targetProviderId = getScopeOptionProviderId(targetType, selectedTargetOption)

    if (!sourceProviderId || !targetProviderId) {
      onNotify?.('Origen o destino no tienen proveedor asignado. El copy por proveedor requiere proveedor configurado.', 'error')
      return
    }

    if (sourceProviderId !== targetProviderId) {
      onNotify?.('El destino no pertenece al mismo proveedor del origen. El copy fue bloqueado para evitar checks incompatibles.', 'error')
      return
    }

    if (targetType === copyFromType && Number(targetId) === Number(copyFromId)) {
      onNotify?.('El origen y destino no pueden ser el mismo.', 'error')
      return
    }

    setCopying(true)
    try {
      const response = await api.get('/admin/supply-access/assignments', {
        params: {
          scope: copyFromType,
          scopeId: copyFromId,
        },
      })

      const sourceIds = (response.data?.supplyIds || []).map((id) => normalizeId(id))
      const visibleIds = new Set((scopeSupplies || []).map((item) => normalizeId(item.id_suministro)))
      const copiedIds = sourceIds.filter((id) => visibleIds.has(id))

      await api.put('/admin/supply-access/assignments', {
        scope: targetType,
        scopeId: normalizeId(targetId),
        supplyIds: copiedIds,
      })

      setAssignedIds([...new Set(copiedIds)])
      onNotify?.(`Permisos copiados y guardados: ${copiedIds.length} suministros asignados.`)
    } catch (err) {
      onNotify?.(err.response?.data?.error || 'No se pudieron copiar los permisos.', 'error')
    } finally {
      setCopying(false)
    }
  }

  const copyAssignmentsByRange = async () => {
    if (!copyFromId) {
      onNotify?.('Selecciona el origen desde donde quieres copiar permisos.', 'error')
      return
    }

    if (targetType !== copyFromType) {
      onNotify?.('La copia por proveedor solo funciona entre elementos del mismo tipo: PDV a PDV o departamento a departamento.', 'error')
      return
    }

    if (!copySourceOption) {
      onNotify?.('No se pudo identificar el proveedor del origen.', 'error')
      return
    }

    const sourceProviderId = getScopeOptionProviderId(copyFromType, copySourceOption)
    if (!sourceProviderId) {
      onNotify?.('El origen no tiene proveedor asignado. El copy por proveedor requiere proveedor configurado.', 'error')
      return
    }

    if (!copyRangeStartId || !copyRangeEndId) {
      onNotify?.(`Selecciona el rango inicial y final de ${targetTypeLabelPlural}.`, 'error')
      return
    }

    if (rangeDestinationOptions.length === 0) {
      onNotify?.(`No hay ${targetTypeLabelPlural} del mismo proveedor dentro del rango seleccionado.`, 'error')
      return
    }

    setCopying(true)
    try {
      const sourceResponse = await api.get('/admin/supply-access/assignments', {
        params: {
          scope: copyFromType,
          scopeId: copyFromId,
        },
      })

      const sourceIds = (sourceResponse.data?.supplyIds || []).map((id) => normalizeId(id))

      const successful = []
      const failed = []

      for (const item of rangeDestinationOptions) {
        const scopeId = getScopeOptionId(targetType, item)
        try {
          const suppliesResponse = await api.get('/admin/supply-access/supplies', {
            params: {
              scope: targetType,
              scopeId,
            },
          })

          const allowedIds = new Set((suppliesResponse.data || []).map((supply) => normalizeId(supply.id_suministro)))
          const filteredIds = sourceIds.filter((id) => allowedIds.has(id))

          await api.put('/admin/supply-access/assignments', {
            scope: targetType,
            scopeId,
            supplyIds: filteredIds,
          })

          successful.push({ scopeId, assignedTotal: filteredIds.length })
        } catch (error) {
          failed.push({ scopeId, error })
        }
      }

      if (targetId) {
        const currentTargetResult = successful.find((result) => result.scopeId === normalizeId(targetId))
        if (currentTargetResult) {
          const refreshedSupplies = await api.get('/admin/supply-access/supplies', {
            params: {
              scope: targetType,
              scopeId: targetId,
            },
          })

          const visibleIds = new Set((refreshedSupplies.data || []).map((item) => normalizeId(item.id_suministro)))
          setScopeSupplies(refreshedSupplies.data || [])
          setAssignedIds(sourceIds.filter((id) => visibleIds.has(id)))
        }
      }

      if (failed.length > 0) {
        onNotify?.(
          `Copia masiva completada parcialmente: ${successful.length} ${targetTypeLabelPlural} actualizados y ${failed.length} con error.`,
          'error'
        )
        return
      }

      onNotify?.(`Copia por proveedor completada: ${successful.length} ${targetTypeLabelPlural} actualizados.`)
    } catch (err) {
      onNotify?.(err.response?.data?.error || `No se pudo copiar a todos los ${targetTypeLabelPlural}.`, 'error')
    } finally {
      setCopying(false)
    }
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

  const exportAssignmentsToExcel = async () => {
    if (targetType !== 'pdv') {
      onNotify?.('La exportacion a Excel por pestañas esta disponible solo en modo PDV.', 'error')
      return
    }

    setExporting(true)
    try {
      const response = await api.get('/admin/supply-access/export', {
        params: {
          region: copyRegionFilter || undefined,
        },
        responseType: 'blob',
      })

      const contentDisposition = response.headers?.['content-disposition'] || ''
      const fileNameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i)
      const fileName = fileNameMatch?.[1] || 'permisos_suministros_pdv.xlsx'

      const blob = new Blob([
        response.data,
      ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      onNotify?.('Excel generado correctamente.')
    } catch (err) {
      onNotify?.(err.response?.data?.error || 'No se pudo exportar el Excel de permisos.', 'error')
    } finally {
      setExporting(false)
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
              setCopyFromType(event.target.value)
              setCopyFromId('')
              setCopyRangeStartId('')
              setCopyRangeEndId('')
              setCopyRegionFilter('')
            }}
          >
            <option value="pdv">Asignar por PDV</option>
            <option value="departamento">Asignar por Departamento</option>
          </select>
        </div>

        {targetType === 'pdv' && (
          <div className="supply-access-control-group">
            <label>Region (copiado)</label>
            <select
              value={copyRegionFilter}
              onChange={(event) => {
                setCopyRegionFilter(event.target.value)
                setCopyFromId('')
                setCopyRangeStartId('')
                setCopyRangeEndId('')
              }}
            >
              <option value="">Todas las regiones</option>
              {availableRegions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        )}

        <div className="supply-access-control-group">
          <label>{targetType === 'pdv' ? 'Punto de Venta' : 'Departamento'}</label>
          <select
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            <option value="">Seleccionar...</option>
            {filteredTargetOptions.map((item) => (
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

        <div className="supply-access-control-group">
          <label>Copiar desde modo</label>
          <select
            value={copyFromType}
            onChange={(event) => {
              setCopyFromType(event.target.value)
              setCopyFromId('')
            }}
          >
            <option value="pdv">PDV</option>
            <option value="departamento">Departamento</option>
          </select>
        </div>

        <div className="supply-access-control-group">
          <label>{copyFromType === 'pdv' ? 'Origen PDV' : 'Origen Departamento'}</label>
          <select
            value={copyFromId}
            onChange={(event) => setCopyFromId(event.target.value)}
          >
            <option value="">Seleccionar origen...</option>
            {filteredCopyFromOptions.map((item) => (
              <option
                key={copyFromType === 'pdv' ? item.id_pdv : item.id_departamento}
                value={copyFromType === 'pdv' ? item.id_pdv : item.id_departamento}
              >
                {copyFromType === 'pdv'
                  ? `${item.codigo_centro_costo} — ${item.region} / ${item.zona}`
                  : item.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="supply-access-control-group">
          <label>{targetType === 'pdv' ? 'Copiar desde PDV' : 'Copiar desde departamento'}</label>
          <select
            value={copyRangeStartId}
            onChange={(event) => setCopyRangeStartId(event.target.value)}
          >
            <option value="">Seleccionar inicio...</option>
            {filteredTargetOptions.map((item) => (
              <option
                key={`start-${getScopeOptionId(targetType, item)}`}
                value={getScopeOptionId(targetType, item)}
              >
                {targetType === 'pdv'
                  ? `${item.codigo_centro_costo} — ${item.region} / ${item.zona}`
                  : item.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="supply-access-control-group">
          <label>{targetType === 'pdv' ? 'Copiar hasta PDV' : 'Copiar hasta departamento'}</label>
          <select
            value={copyRangeEndId}
            onChange={(event) => setCopyRangeEndId(event.target.value)}
          >
            <option value="">Seleccionar fin...</option>
            {filteredTargetOptions.map((item) => (
              <option
                key={`end-${getScopeOptionId(targetType, item)}`}
                value={getScopeOptionId(targetType, item)}
              >
                {targetType === 'pdv'
                  ? `${item.codigo_centro_costo} — ${item.region} / ${item.zona}`
                  : item.descripcion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {copySourceOption && (
        <div className="supply-access-provider-lock">
          <span>
            La copia se limita al mismo proveedor del origen:{' '}
            <strong>{copySourceOption.proveedor_principal || 'Sin proveedor asignado'}</strong>
          </span>
        </div>
      )}

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

      {/* Proveedor asignado para departamento */}
      {targetType === 'departamento' && selectedDepartment && (
        <div className="supply-access-provider-lock">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            Proveedor asignado a este departamento:{' '}
            <strong>{selectedDepartment.proveedor_principal || 'Sin proveedor asignado'}</strong>
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
              <button type="button" className="admin-secondary" onClick={copyAssignments} disabled={copying || !targetId || !copyFromId}>
                {copying ? 'Copiando...' : 'Copiar y guardar'}
              </button>
              <button type="button" className="admin-secondary" onClick={copyAssignmentsByRange} disabled={copying || !copyFromId || !copyRangeStartId || !copyRangeEndId}>
                {copying ? 'Copiando...' : 'Copiar por rango'}
              </button>
              <button type="button" className="admin-secondary" onClick={selectAllFiltered}>
                Marcar visibles
              </button>
              <button type="button" className="admin-secondary" onClick={clearAllFiltered}>
                Limpiar visibles
              </button>
              <button type="button" className="admin-secondary" onClick={exportAssignmentsToExcel} disabled={exporting || targetType !== 'pdv'}>
                {exporting ? 'Exportando...' : 'Descargar Excel'}
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
                    const isChecked = assignedSet.has(normalizeId(item.id_suministro))

                    return (
                      <tr
                        key={item.id_suministro}
                        className={isChecked ? 'supply-access-row--assigned' : ''}
                        onClick={() => toggleSupply(normalizeId(item.id_suministro))}
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
