import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { useDataRefresh } from '../context/DataRefreshContext'
import { usePermissions } from '../hooks/usePermissions'
import { useUIFeedback } from '../context/UIFeedbackContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import { createId } from '../utils/id'
import '../style/Home.css'

const ESTADO_BADGE = {
  'Pendiente': 'badge--pendiente',
  'Aprobado': 'badge--aprobado',
  'Rechazado': 'badge--rechazado',
  'Entregado': 'badge--entregado',
  'En espera': 'badge--pendiente',
}

export default function Home() {
  const { user, loading, refreshUser } = useAuth()
  const { isCollapsed } = useSidebar()
  const { refreshTriggers } = useDataRefresh()
  const { esComercial } = usePermissions()
  const { notify } = useUIFeedback()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const pedidosAbortRef = useRef(null)

  // Determinar vista según el hash
  const vistaActual = hash === '#mis-pedidos' ? 'mis-pedidos' : 'nuevo-pedido'
  // Estados para "Mis Pedidos"
  const [vistaPedidos, setVistaPedidos] = useState('todos') // todos, pendientes, aprobados, rechazados
  const [pedidos, setPedidos] = useState([])
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroMontoMin, setFiltroMontoMin] = useState('')
  const [filtroMontoMax, setFiltroMontoMax] = useState('')

  // Catálogos
  const [pdvs, setPdvs] = useState([])
  const [tiposSuministro, setTipos] = useState([])
  const [suministros, setSuministros] = useState([])

  // Selección
  const [pdvSeleccionado, setPdv] = useState(null)
  const [tipoSeleccionado, setTipo] = useState('')
  const [suministroId, setSuministroId] = useState('')
  const [suministroSearch, setSuministroSearch] = useState('')
  const [showSuministroDropdown, setShowSuministroDropdown] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [suministrosBusqueda, setSuministrosBusqueda] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [highlightedSuministroIndex, setHighlightedSuministroIndex] = useState(-1)
  const debounceRef = useRef()
  const searchAbortRef = useRef(null)
  const suministroInputRef = useRef(null)
  const tipoSelectRef = useRef(null)

  // Carrito
  const [carrito, setCarrito] = useState([])

  // UI
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')


  const tiposSuministroUnicos = Array.from(
    new Map(tiposSuministro.map(t => [t.descripcion, t])).values()
  )

  const cargarTiposSuministro = useCallback(async (signal) => {
    try {
      const params = {}
      if (esComercial && pdvSeleccionado?.id_pdv) {
        params.pdv = pdvSeleccionado.id_pdv
      }

      const response = await api.get('/catalogos/tipo-suministros', {
        params,
        signal,
      })

      setTipos(response.data || [])
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
      notify('No se pudo cargar categorias de suministros permitidas.', 'error')
    }
  }, [esComercial, pdvSeleccionado?.id_pdv, notify])

  // Cargar PDVs y tipos al montar
  useEffect(() => {
    if (loading) return

    let cancelled = false
    const controller = new AbortController()

    const loadCatalogosBase = async () => {
      try {
        const promises = []
        if (esComercial) {
          promises.push(api.get('/catalogos/pdvs', { signal: controller.signal }))
        }

        const results = await Promise.all(promises)
        if (cancelled) return

        if (esComercial && results[0]) {
          const pdvData = results[0].data || []
          setPdvs(pdvData)
          if (user?.login) {
            const pdvDelUsuario = pdvData.find((p) =>
              p.descripcion.toLowerCase() === user.login.toLowerCase()
            )
            if (pdvDelUsuario) setPdv(pdvDelUsuario)
          }
        } else {
          setPdvs([])
          setPdv(null)
        }
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
        notify('No se pudo cargar la informacion inicial.', 'error')
      }
    }

    loadCatalogosBase()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [loading, user?.login, esComercial, notify])

  useEffect(() => {
    if (loading) return
    if (esComercial && !pdvSeleccionado?.id_pdv) {
      setTipos([])
      setTipo('')
      setSuministros([])
      return
    }

    const controller = new AbortController()
    cargarTiposSuministro(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loading, esComercial, pdvSeleccionado?.id_pdv, cargarTiposSuministro])

  // Cargar suministros cuando cambia el tipo
  useEffect(() => {
    if (!tipoSeleccionado) {
      setSuministros([])
      setSuministroId('')
      setSuministroSearch('')
      setShowSuministroDropdown(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    const pdvQuery = pdvSeleccionado?.id_pdv ? `&pdv=${pdvSeleccionado.id_pdv}` : ''

    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}${pdvQuery}`, { signal: controller.signal })
      .then(r => {
        if (cancelled) return
        setSuministros(r.data)
        setSuministroId('')
        setSuministroSearch('')
        setShowSuministroDropdown(false)
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
        notify('No se pudo cargar la lista de suministros.', 'error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [tipoSeleccionado, pdvSeleccionado?.id_pdv, notify])

  //  Recargar PDVs cuando se actualicen en Configuración
  useEffect(() => {
    if (loading || !esComercial) return

    let cancelled = false
    const controller = new AbortController()
    api.get('/catalogos/pdvs', { signal: controller.signal }).then(r => {
      if (cancelled) return
      setPdvs(r.data)
      // Si había un PDV seleccionado, actualizar sus datos
      if (pdvSeleccionado) {
        const pdvActualizado = r.data.find(p => p.id_pdv === pdvSeleccionado.id_pdv)
        if (pdvActualizado) {
          setPdv(pdvActualizado)
        }
      }
    }).catch((err) => {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
      notify('No se pudo recargar la lista de PDVs.', 'error')
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [refreshTriggers.pdvs, loading, esComercial, pdvSeleccionado?.id_pdv, notify])

  useEffect(() => {
    if (loading) return undefined

    const controller = new AbortController()
    refreshUser(controller.signal).catch(() => {})

    const handleWindowFocus = () => {
      refreshUser().catch(() => {})
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      controller.abort()
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [loading, hash, refreshUser])

  // 🔄 Recargar suministros cuando se actualicen en Configuración
  useEffect(() => {
    if (!tipoSeleccionado || loading) return

    let cancelled = false
    const controller = new AbortController()
    const pdvQuery = pdvSeleccionado?.id_pdv ? `&pdv=${pdvSeleccionado.id_pdv}` : ''
    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}${pdvQuery}`, { signal: controller.signal })
      .then(r => {
        if (!cancelled) setSuministros(r.data)
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
        notify('No se pudo actualizar el listado de suministros.', 'error')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [refreshTriggers.suministros, tipoSeleccionado, loading, pdvSeleccionado?.id_pdv, notify])

  const getSuministroLabel = (s) => `${s.descripcion} - $${Number(s.precio).toFixed(2)} `

  // Live search: sugerencias
  const suministroSearchTerm = suministroSearch.trim().toLowerCase()
  const sugerencias = suministroSearchTerm.length > 0 ? suministrosBusqueda : suministros
  const visibleSugerencias = sugerencias.slice(0, 12)

  // Totales por grupo de presupuesto
  const subtotalOficina = carrito.filter(i => i.grupoPresupuestoId === 1).reduce((s, i) => s + i.total, 0)
  const subtotalLimpieza = carrito.filter(i => i.grupoPresupuestoId === 2).reduce((s, i) => s + i.total, 0)
  const totalPedido = carrito.reduce((s, i) => s + i.total, 0)
  const groupedDepartmentTotals = carrito.reduce((acc, item) => {
    const groupId = Number(item.grupoPresupuestoId || 0)
    acc[groupId] = (acc[groupId] || 0) + Number(item.total || 0)
    return acc
  }, {})
  const departmentBudgetMap = (user?.departmentBudgets || []).reduce((acc, budget) => {
    const groupId = Number(budget.id_grupo_presupuesto)
    acc[groupId] = {
      ...budget,
      saldo: Math.max(0, Number(budget.monto_autorizado || 0) - Number(budget.monto_ejecutado || 0)),
    }
    return acc
  }, {})
  const tipoSeleccionadoObj = tiposSuministro.find((tipo) => String(tipo.id_tipo_suministro) === String(tipoSeleccionado))
  const selectedGroupId = Number(tipoSeleccionadoObj?.id_grupo_presupuesto || 0)
  const selectedDepartmentBudget = selectedGroupId ? departmentBudgetMap[selectedGroupId] : null
  const limiteDisponible = esComercial
    ? Number(pdvSeleccionado?.cupo_disponible ?? pdvSeleccionado?.cupo ?? 0)
    : Number(selectedDepartmentBudget?.saldo || 0)
  const departmentExceededGroups = Object.entries(groupedDepartmentTotals)
    .filter(([groupId, total]) => Number(total) > Number(departmentBudgetMap[Number(groupId)]?.saldo || 0))
    .map(([groupId]) => departmentBudgetMap[Number(groupId)]?.descripcion || 'categoria seleccionada')
  const cupoExcedido = esComercial ? totalPedido > limiteDisponible : departmentExceededGroups.length > 0
  const debeDeshabilitarBoton = carrito.length === 0 || (esComercial && !pdvSeleccionado)

  const ejecutarBusquedaSuministros = useCallback(async (rawValue) => {
    if (!tipoSeleccionado) return

    const value = rawValue.trim()
    if (searchAbortRef.current) searchAbortRef.current.abort()

    if (value.length === 0) {
      setSuministrosBusqueda([])
      setBuscando(false)
      setHighlightedSuministroIndex(-1)
      return
    }

    const controller = new AbortController()
    searchAbortRef.current = controller
    setBuscando(true)

    try {
      const pdvQuery = pdvSeleccionado?.id_pdv ? `&pdv=${pdvSeleccionado.id_pdv}` : ''
      const resp = await api.get(
        `/catalogos/suministros?tipo=${tipoSeleccionado}${pdvQuery}&q=${encodeURIComponent(value)}`,
        { signal: controller.signal }
      )
      setSuministrosBusqueda(resp.data || [])
      setHighlightedSuministroIndex(-1)
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
      setSuministrosBusqueda([])
      setHighlightedSuministroIndex(-1)
    } finally {
      if (searchAbortRef.current === controller) searchAbortRef.current = null
      setBuscando(false)
    }
  }, [tipoSeleccionado, pdvSeleccionado?.id_pdv])

  useEffect(() => {
    const handleGlobalSearchShortcut = (e) => {
      if (vistaActual !== 'nuevo-pedido') return
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return

      const activeElement = document.activeElement
      const isEditingInField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      )
      if (isEditingInField) return

      const key = e.key.toLowerCase()
      if (key === 'a') {
        e.preventDefault()
        const tipoSelect = tipoSelectRef.current
        if (!tipoSelect) return

        tipoSelect.focus()
        if (typeof tipoSelect.showPicker === 'function') {
          tipoSelect.showPicker()
        }
        return
      }

      if (key !== 's' && key !== '/') return

      if (!tipoSeleccionado) return

      e.preventDefault()
      suministroInputRef.current?.focus()
      suministroInputRef.current?.select()
      setShowSuministroDropdown(true)
      setHighlightedSuministroIndex(-1)
    }

    window.addEventListener('keydown', handleGlobalSearchShortcut)

    return () => {
      window.removeEventListener('keydown', handleGlobalSearchShortcut)
    }
  }, [vistaActual, tipoSeleccionado])

  const handleAgregar = () => {
    if (!suministroId || !tipoSeleccionado || !cantidad) return
    const sum = suministros.find(s => s.id_suministro === Number(suministroId))
    const tipo = tiposSuministro.find(t => t.id_tipo_suministro === Number(tipoSeleccionado))
    if (!sum || !tipo) return

    setCarrito(prev => [...prev, {
      id: createId('cart-item'),
      suministroId: sum.id_suministro,
      suministroNombre: sum.descripcion,
      tipoId: tipo.id_tipo_suministro,
      tipoNombre: tipo.descripcion,
      grupoPresupuestoId: tipo.id_grupo_presupuesto,
      cantidad: Number(cantidad),
      precioUnitario: Number(sum.precio),
      total: Number(cantidad) * Number(sum.precio),
    }])
    setSuministroId('')
    setSuministroSearch('')
    setShowSuministroDropdown(false)
    setCantidad(1)
  }

  const handleSelectSuministro = (suministro) => {
    setSuministroId(String(suministro.id_suministro))
    setSuministroSearch(getSuministroLabel(suministro))
    setShowSuministroDropdown(false)
    setHighlightedSuministroIndex(-1)
  }

  const handleEliminar = (id) => setCarrito(prev => prev.filter(i => i.id !== id))

  const handlePedido = async () => {
    if (carrito.length === 0) return
    if (esComercial && !pdvSeleccionado) return

    setEnviando(true)
    setError('')
    try {
      const payload = { items: carrito }
      if (esComercial && pdvSeleccionado) {
        payload.pdvId = pdvSeleccionado.id_pdv
      }
      const res = await api.post('/pedidos', payload)
      await refreshUser()
      navigate('/notificacion', { state: { mensaje: res.data.mensaje, emailEnviado: res.data.emailEnviado } })
    } catch (err) {
      const responseData = err?.response?.data
      setError(responseData?.shortError || responseData?.error || 'Error al procesar el pedido.')
    } finally {
      setEnviando(false)
    }
  }

  // Función para cargar pedidos (vista "Mis Pedidos")
  const cargarPedidos = useCallback(async () => {
    pedidosAbortRef.current?.abort()
    const controller = new AbortController()
    pedidosAbortRef.current = controller

    setCargandoPedidos(true)
    try {
      const params = { usuario: user?.login }
      if (vistaPedidos === 'pendientes') params.estado = 1
      if (vistaPedidos === 'aprobados') params.estado = 2
      if (vistaPedidos === 'rechazados') params.estado = 3

      const { data } = await api.get('/reportes/pedidos', {
        params,
        signal: controller.signal,
      })

      // Agrupar por pedidoId
      const pedidosMap = new Map()
      data.data.forEach(row => {
        const id = row.pedidoId
        if (!pedidosMap.has(id)) {
          pedidosMap.set(id, {
            pedidoId: id,
            fecha: new Date(`${row.fecha}T00:00:00`).toLocaleDateString('es-EC'),
            fechaISO: row.fecha,
            estado: row.estado,
            observacionesAprobacion: row.observacionesAprobacion || null,
            motivoRechazo: row.motivoRechazo || null,
            items: [],
            total: 0,
          })
        }
        const pedido = pedidosMap.get(id)
        pedido.items.push({
          suministro: row.suministro,
          cantidad: row.cantidad,
          precioUnitario: Number(row.precioUnitario),
          subtotal: Number(row.precioUnitario) * Number(row.cantidad),
        })
        pedido.total += Number(row.precioUnitario) * Number(row.cantidad)
      })

      if (!controller.signal.aborted) {
        setPedidos(Array.from(pedidosMap.values()))
      }
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
      console.error('Error cargando pedidos:', err)
      notify('No se pudieron cargar tus pedidos.', 'error')
    } finally {
      if (!controller.signal.aborted) {
        setCargandoPedidos(false)
      }
    }
  }, [user?.login, vistaPedidos, notify])

  // Cargar pedidos cuando cambia la vista a "Mis Pedidos"
  useEffect(() => {
    if (vistaActual === 'mis-pedidos' && !loading) {
      cargarPedidos()
    }
    return () => {
      pedidosAbortRef.current?.abort()
    }
  }, [vistaActual, loading, cargarPedidos])

  const terminoBusqueda = filtroTexto.trim().toLowerCase()
  const montoMin = filtroMontoMin === '' ? null : Number(filtroMontoMin)
  const montoMax = filtroMontoMax === '' ? null : Number(filtroMontoMax)

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (terminoBusqueda) {
      const coincideId = String(pedido.pedidoId).includes(terminoBusqueda)
      const coincideSuministro = pedido.items.some(item =>
        item.suministro.toLowerCase().includes(terminoBusqueda)
      )
      if (!coincideId && !coincideSuministro) return false
    }

    if (filtroFechaDesde && pedido.fechaISO && pedido.fechaISO < filtroFechaDesde) return false
    if (filtroFechaHasta && pedido.fechaISO && pedido.fechaISO > filtroFechaHasta) return false

    if (montoMin !== null && !Number.isNaN(montoMin) && pedido.total < montoMin) return false
    if (montoMax !== null && !Number.isNaN(montoMax) && pedido.total > montoMax) return false

    return true
  })

  const limpiarFiltrosPedidos = () => {
    setVistaPedidos('todos')
    setPedidoSeleccionado(null)
    setFiltroTexto('')
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroMontoMin('')
    setFiltroMontoMax('')
  }

  return (
    <div className="home-container">
      <Layout />

      <main className="home-main" style={{ marginLeft: isCollapsed ? 70 : 250 }}>

        {vistaActual === 'nuevo-pedido' && (
          <>
            {/* Departamento / Punto de venta */}
            <section className="section-card">
              <h2 className="section-header section-header--with-logo">
                <span>{esComercial ? 'Punto de venta' : 'Departamento'}</span>
                <img
                  src="/images/LOGO OFICIAL FC COMPLETO FONDO TRANSPARENTE.png"
                  alt="Logo Farmcorp"
                  className="home-logo"
                />
              </h2>
              <div className="pdv-selector-wrapper">
                <input
                  type="text"
                  value={esComercial
                    ? (pdvSeleccionado?.descripcion || user?.login || 'Sin PDV asignado')
                    : (user?.departmentName || 'Sin departamento')}
                  readOnly
                  className="form-input"
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />

                {esComercial && pdvSeleccionado && (
                  <div className="pdv-info-tags">
                    <span className="pdv-tag cupo">
                      Disponible: ${Number(pdvSeleccionado.cupo_disponible ?? pdvSeleccionado.cupo).toFixed(2)} / ${Number(pdvSeleccionado.cupo).toFixed(2)}
                    </span>
                    <span className="pdv-tag info">PDV: {pdvSeleccionado.descripcion}</span>
                    <span className="pdv-tag info">{pdvSeleccionado.ciudad}</span>
                  </div>
                )}

                {!esComercial && (user?.departmentBudgets || []).length > 0 && (
                  <div className="pdv-info-tags">
                    {selectedDepartmentBudget ? (
                      <>
                        <span className="pdv-tag cupo">
                          {selectedDepartmentBudget.descripcion}: ${Number(selectedDepartmentBudget.saldo || 0).toFixed(2)} / ${Number(selectedDepartmentBudget.monto_autorizado || 0).toFixed(2)}
                        </span>
                        <span className="pdv-tag info">
                          Ejecutado: ${Number(selectedDepartmentBudget.monto_ejecutado || 0).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="pdv-tag info">
                        Selecciona una categoria para ver el saldo disponible.
                      </span>
                    )}
                  </div>
                )}

                {esComercial && !pdvSeleccionado && (
                  <div style={{ marginTop: '0.5rem', color: '#b91c1c', fontSize: '0.875rem' }}>
                    No se encontró un PDV asignado para tu usuario.
                  </div>
                )}
              </div>
            </section>

            {/* Add Item */}
            <section className="section-card">
              <h2 className="section-header">Agregar Suministro</h2>
              <div className="add-item-grid">
                <select value={tipoSeleccionado} onChange={e => setTipo(e.target.value)}
                  ref={tipoSelectRef}
                  className="form-select">
                  <option value="">Tipo de suministro...</option>
                  {tiposSuministroUnicos.map(t => (
                    <option key={t.id_tipo_suministro} value={t.id_tipo_suministro}>{t.descripcion}</option>
                  ))}
                </select>

                <div className="supply-picker-group">
                  <input
                    ref={suministroInputRef}
                    type="text"
                    value={suministroSearch}
                    onChange={e => {
                      const value = e.target.value;
                      setSuministroSearch(value);
                      setSuministroId('');
                      setShowSuministroDropdown(true);
                      setHighlightedSuministroIndex(-1);
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      if (searchAbortRef.current) searchAbortRef.current.abort();
                      setSuministrosBusqueda([]);

                      if (!tipoSeleccionado || value.trim().length === 0) {
                        setBuscando(false);
                        return;
                      }

                      setBuscando(true);
                      debounceRef.current = setTimeout(() => {
                        ejecutarBusquedaSuministros(value);
                      }, 350);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'ArrowDown') {
                        if (visibleSugerencias.length === 0) return;
                        e.preventDefault();
                        setShowSuministroDropdown(true);
                        setHighlightedSuministroIndex(prev => (
                          prev < visibleSugerencias.length - 1 ? prev + 1 : 0
                        ));
                        return;
                      }

                      if (e.key === 'ArrowUp') {
                        if (visibleSugerencias.length === 0) return;
                        e.preventDefault();
                        setShowSuministroDropdown(true);
                        setHighlightedSuministroIndex(prev => (
                          prev > 0 ? prev - 1 : visibleSugerencias.length - 1
                        ));
                        return;
                      }

                      if (e.key === 'Enter') {
                        e.preventDefault();

                        if (
                          showSuministroDropdown &&
                          highlightedSuministroIndex >= 0 &&
                          visibleSugerencias[highlightedSuministroIndex]
                        ) {
                          handleSelectSuministro(visibleSugerencias[highlightedSuministroIndex]);
                          return;
                        }

                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        setShowSuministroDropdown(true);
                        ejecutarBusquedaSuministros(suministroSearch);
                      }

                      if (e.key === 'Escape') {
                        e.preventDefault();
                        if (debounceRef.current) clearTimeout(debounceRef.current);
                        if (searchAbortRef.current) searchAbortRef.current.abort();
                        setSuministroSearch('');
                        setSuministroId('');
                        setSuministrosBusqueda([]);
                        setShowSuministroDropdown(false);
                        setBuscando(false);
                        setHighlightedSuministroIndex(-1);
                      }
                    }}
                    onFocus={() => {
                      setShowSuministroDropdown(true)
                      setHighlightedSuministroIndex(-1)
                    }}
                    onBlur={() => setTimeout(() => {
                      setShowSuministroDropdown(false)
                      setHighlightedSuministroIndex(-1)
                    }, 120)}
                    disabled={!tipoSeleccionado}
                    placeholder={tipoSeleccionado ? 'Buscar suministro por nombre o proveedor...' : 'Selecciona primero el tipo'}
                    className="form-input"
                  />
                  {showSuministroDropdown && tipoSeleccionado && (
                    <div className="supply-dropdown" role="listbox" aria-label="Suministros sugeridos">
                      {sugerencias.length === 0 ? (
                        <div className="supply-dropdown-item supply-dropdown-item--empty">
                          {buscando ? 'Buscando...' : 'Sin coincidencias'}
                        </div>
                      ) : (
                        visibleSugerencias.map((s, idx) => (
                          <button
                            key={s.id_suministro}
                            type="button"
                            className={`supply-dropdown-item ${idx === highlightedSuministroIndex ? 'supply-dropdown-item--active' : ''}`}
                            role="option"
                            aria-selected={idx === highlightedSuministroIndex}
                            onMouseEnter={() => setHighlightedSuministroIndex(idx)}
                            onMouseDown={() => handleSelectSuministro(s)}
                          >
                            {getSuministroLabel(s)}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="number" min={1} value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                  placeholder="Cantidad"
                  className="form-input"
                />

                <button
                  onClick={handleAgregar}
                  disabled={!suministroId || !tipoSeleccionado}
                  className="add-button">
                  + Agregar
                </button>
              </div>
            </section>

            {/* Cart */}
            <section className="cart-section">
              <div className="cart-header">
                <h2 className="section-header">Detalle del Pedido</h2>
              </div>

              {carrito.length === 0 ? (
                <div className="cart-empty">
                  Aún no has agregado suministros al pedido.
                </div>
              ) : (
                <>
                  <div className="cart-table-wrapper">
                    <table className="cart-table">
                      <thead>
                        <tr>
                          <th>Descripción</th>
                          <th>Tipo</th>
                          <th>Cantidad</th>
                          <th>P. Unitario</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrito.map(item => (
                          <tr key={item.id}>
                            <td className="item-name">{item.suministroNombre}</td>
                            <td>
                              <span className={`type-badge ${item.grupoPresupuestoId === 1 ? 'oficina' : 'limpieza'}`}>
                                {item.tipoNombre}
                              </span>
                            </td>
                            <td>
                              <input
                                type="number"
                                min={1}
                                value={item.cantidad === 0 ? '' : item.cantidad}
                                style={{ width: '60px' }}
                                onChange={e => {
                                  const val = e.target.value;
                                  // Permitir vacío temporalmente
                                  if (val === '') {
                                    setCarrito(prev => prev.map(i =>
                                      i.id === item.id
                                        ? { ...i, cantidad: 0, total: 0 }
                                        : i
                                    ));
                                    return;
                                  }
                                  const nuevaCantidad = Number(val);
                                  if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
                                    setCarrito(prev => prev.map(i =>
                                      i.id === item.id
                                        ? { ...i, cantidad: nuevaCantidad, total: nuevaCantidad * i.precioUnitario }
                                        : i
                                    ));
                                  }
                                }}
                              />
                            </td>
                            <td>${item.precioUnitario.toFixed(2)}</td>
                            <td className="item-name">${item.total.toFixed(2)}</td>
                            <td>
                              <button onClick={() => handleEliminar(item.id)} className="remove-button">
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="totals-section">
                    <div className="total-row">
                      <span className="label">Total Oficina</span>
                      <span className="value">${subtotalOficina.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span className="label">Total Limpieza</span>
                      <span className="value">${subtotalLimpieza.toFixed(2)}</span>
                    </div>
                    <div className="total-row grand-total">
                      <span className="label">
                        Total
                        {cupoExcedido && <span className="exceeded-badge">EXCEDIDO</span>}
                      </span>
                      <span className={`value ${cupoExcedido ? 'exceeded' : ''}`}>
                        ${totalPedido.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Error */}
            {error && <div className="error-alert">{error}</div>}

            {/* Submit */}
            <div className="submit-section">
              <button
                onClick={handlePedido}
                disabled={debeDeshabilitarBoton}
                className="submit-button">
                {enviando ? 'Enviando pedido...' : 'Realizar Pedido'}
              </button>
            </div>
          </>
        )}

        {vistaActual === 'mis-pedidos' && (
          <div className="mispedidos-wrapper-home">
            {/* Barra superior con filtros */}
            <div className="mispedidos-topbar">
              <div className="mispedidos-topbar__title">
                <h2>Mis Suministros</h2>
              </div>

              <div className="mispedidos-filters-inline">
                <input
                  type="text"
                  className="mispedidos-filter-input"
                  placeholder="Buscar por pedido o suministro"
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                />

                <input
                  type="date"
                  className="mispedidos-filter-input"
                  value={filtroFechaDesde}
                  onChange={e => setFiltroFechaDesde(e.target.value)}
                  title="Fecha desde"
                />

                <input
                  type="date"
                  className="mispedidos-filter-input"
                  value={filtroFechaHasta}
                  onChange={e => setFiltroFechaHasta(e.target.value)}
                  title="Fecha hasta"
                />

                <input
                  type="number"
                  className="mispedidos-filter-input"
                  placeholder="Monto mín."
                  value={filtroMontoMin}
                  onChange={e => setFiltroMontoMin(e.target.value)}
                />

                <input
                  type="number"
                  className="mispedidos-filter-input"
                  placeholder="Monto máx."
                  value={filtroMontoMax}
                  onChange={e => setFiltroMontoMax(e.target.value)}
                />

                <select
                  className="mispedidos-filter-input"
                  value={vistaPedidos}
                  onChange={e => { setVistaPedidos(e.target.value); setPedidoSeleccionado(null) }}
                >
                  <option value="todos">Todos</option>
                  <option value="pendientes">Pendientes</option>
                  <option value="aprobados">Aprobados</option>
                  <option value="rechazados">Rechazados</option>
                </select>

                <button className="mispedidos-filter-clear" onClick={limpiarFiltrosPedidos}>
                  Limpiar
                </button>
              </div>
            </div>

            {/* Contenido Principal - Tabla de pedidos */}
            <div className="mispedidos-table-container">
              {cargandoPedidos ? (
                <div className="mispedidos-loading">
                  <div className="mispedidos-loading__spinner"></div>
                  <p>Cargando pedidos...</p>
                </div>
              ) : pedidosFiltrados.length === 0 ? (
                <div className="mispedidos-empty">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <h3>No hay pedidos</h3>
                  <p>No tienes pedidos registrados.</p>
                </div>
              ) : (
                <>
                  <table className="mispedidos-table">
                    <thead>
                      <tr>
                        <th>ID Pedido</th>
                        <th>Fecha</th>
                        <th>Artículos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosFiltrados.map(pedido => (
                        <tr key={pedido.pedidoId} className={pedidoSeleccionado?.pedidoId === pedido.pedidoId ? 'active' : ''}>
                          <td className="td-id">#{pedido.pedidoId}</td>
                          <td>{pedido.fecha}</td>
                          <td className="td-items">{pedido.items.length}</td>
                          <td className="td-total">${pedido.total.toFixed(2)}</td>
                          <td>
                            <span className={`mispedidos-badge ${ESTADO_BADGE[pedido.estado] || ''}`}>
                              {pedido.estado}
                            </span>
                          </td>
                          <td className="td-actions">
                            <button
                              className="mispedidos-btn-view"
                              title="Ver detalles"
                              onClick={() => {
                                setPedidoSeleccionado(pedido)
                                setShowDetailModal(true)
                              }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>


                  {/* Modal de Detalles */}
                  {showDetailModal && pedidoSeleccionado && (
                    <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h2>Detalle del Pedido #{pedidoSeleccionado.pedidoId}</h2>
                          <button onClick={() => setShowDetailModal(false)} className="btn-close">×</button>
                        </div>
                        <div className="modal-body">
                          <div className="pedido-info">
                            <div className="info-row">
                              <strong>Fecha:</strong> {pedidoSeleccionado.fecha}
                            </div>
                            <div className="info-row">
                              <strong>Estado:</strong>
                              <span className={`mispedidos-badge ${ESTADO_BADGE[pedidoSeleccionado.estado] || ''}`}>
                                {pedidoSeleccionado.estado}
                              </span>
                            </div>
                            <div className="info-row">
                              <strong>Total:</strong> ${pedidoSeleccionado.total.toFixed(2)}
                            </div>
                            
                            {/* Mostrar observaciones si fue aprobado */}
                            {pedidoSeleccionado.estado === 'Aprobado' && pedidoSeleccionado.observacionesAprobacion && (
                              <div className="info-row" style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderLeft: '3px solid #10b981', borderRadius: '0.375rem' }}>
                                <strong style={{ color: '#059669' }}>Observaciones de aprobación:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#065f46', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                  {pedidoSeleccionado.observacionesAprobacion}
                                </p>
                              </div>
                            )}
                            
                            {/* Mostrar motivo si fue rechazado */}
                            {pedidoSeleccionado.estado === 'Rechazado' && pedidoSeleccionado.motivoRechazo && (
                              <div className="info-row" style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', borderLeft: '3px solid #ef4444', borderRadius: '0.375rem' }}>
                                <strong style={{ color: '#dc2626' }}>Motivo del rechazo:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#991b1b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                  {pedidoSeleccionado.motivoRechazo}
                                </p>
                              </div>
                            )}
                          </div>

                          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600', color: '#2c2f88' }}>
                            Productos Solicitados
                          </h3>
                          <table className="detail-table">
                            <thead>
                              <tr>
                                <th>Suministro</th>
                                <th>Cantidad</th>
                                <th>P. Unitario</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedidoSeleccionado.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.suministro}</td>
                                  <td className="text-center">{item.cantidad}</td>
                                  <td className="text-right">${item.precioUnitario.toFixed(2)}</td>
                                  <td className="text-right">${item.subtotal.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="modal-footer">
                          <button
                            onClick={() => setShowDetailModal(false)}
                            style={{ padding: '0.5rem 1rem', border: 'none', background: '#e5e7eb', color: '#374151', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}