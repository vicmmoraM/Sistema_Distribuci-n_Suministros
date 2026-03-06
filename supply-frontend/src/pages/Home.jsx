import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { usePermissions } from '../hooks/usePermissions'
import api from '../api/axios'
import Layout from '../components/Layout'
import '../style/Home.css'

const ESTADO_BADGE = {
  'Pendiente': 'badge--pendiente',
  'Aprobado':  'badge--aprobado',
  'Rechazado': 'badge--rechazado',
  'Entregado': 'badge--entregado',
  'En espera': 'badge--pendiente',
}

export default function Home() {
  const { user, loading } = useAuth()
  const { isCollapsed } = useSidebar()
  const { esComercial } = usePermissions()
  const navigate = useNavigate()
  const { hash } = useLocation()

  // Determinar vista según el hash
  const vistaActual = hash === '#mis-pedidos' ? 'mis-pedidos' : 'nuevo-pedido'

  // Estados para "Mis Pedidos"
  const [vistaPedidos, setVistaPedidos] = useState('todos') // todos, pendientes, aprobados, rechazados
  const [pedidos, setPedidos] = useState([])
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
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

  // Carrito
  const [carrito, setCarrito] = useState([])

  // UI
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  

  const tiposSuministroUnicos = Array.from(
    new Map(tiposSuministro.map(t => [t.descripcion, t])).values()
  )

  // Cargar PDVs y tipos al montar
  useEffect(() => {
    if (loading) return
    if (esComercial) {
      api.get('/catalogos/pdvs').then(r => {
        setPdvs(r.data)
        if (user?.login) {
          const pdvDelUsuario = r.data.find(p =>
            p.descripcion.toLowerCase() === user.login.toLowerCase()
          )
          if (pdvDelUsuario) {
            setPdv(pdvDelUsuario)
          }
        }
      }).catch(() => {})
    } else {
      setPdvs([])
      setPdv(null)
    }
    api.get('/catalogos/tipo-suministros').then(r => setTipos(r.data)).catch(() => {})
  }, [loading, user?.login, esComercial])

  // Cargar suministros cuando cambia el tipo
  useEffect(() => {
    if (!tipoSeleccionado) {
      setSuministros([])
      setSuministroId('')
      setSuministroSearch('')
      setShowSuministroDropdown(false)
      return
    }
    const pdvQuery = pdvSeleccionado?.id_pdv ? `&pdv=${pdvSeleccionado.id_pdv}` : ''
    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}${pdvQuery}`)
      .then(r => {
        setSuministros(r.data)
        setSuministroId('')
        setSuministroSearch('')
          setShowSuministroDropdown(false)
      })
      .catch(() => {})
  }, [tipoSeleccionado, pdvSeleccionado?.id_pdv])

        const getSuministroLabel = (s) => `${s.descripcion} - $${Number(s.precio).toFixed(2)} `

  const suministroSearchTerm = suministroSearch.trim().toLowerCase()
  const suministrosFiltrados = suministroSearchTerm
    ? suministros.filter((s) => {
      const text = `${s.descripcion} ${s.proveedor}`.toLowerCase()
      return text.includes(suministroSearchTerm)
    })
    : suministros

  // Totales
  const subtotalOficina  = carrito.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
  const subtotalLimpieza = carrito.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)
  const totalPedido      = carrito.reduce((s, i) => s + i.total, 0)
  const limiteDisponible = esComercial
    ? Number(pdvSeleccionado?.cupo || 0)
    : Number(user?.departmentBudget || 0)
  const cupoExcedido = totalPedido > limiteDisponible

  const handleAgregar = () => {
    if (!suministroId || !tipoSeleccionado || !cantidad) return
    const sum  = suministros.find(s => s.id_suministro === Number(suministroId))
    const tipo = tiposSuministro.find(t => t.id_tipo_suministro === Number(tipoSeleccionado))
    if (!sum) return

    setCarrito(prev => [...prev, {
      id: Date.now(),
      suministroId:     sum.id_suministro,
      suministroNombre: sum.descripcion,
      tipoId:           tipo.id_tipo_suministro,
      tipoNombre:       tipo.descripcion,
      cantidad:         Number(cantidad),
      precioUnitario:   Number(sum.precio),
      total:            Number(cantidad) * Number(sum.precio),
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
  }

  const handleEliminar = (id) => setCarrito(prev => prev.filter(i => i.id !== id))

  const handlePedido = async () => {
    if (carrito.length === 0) return
    if (esComercial && !pdvSeleccionado) return
    if (cupoExcedido) {
      setError(esComercial
        ? 'El total supera el cupo asignado al PDV.'
        : 'El total supera el presupuesto asignado al departamento.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const payload = { items: carrito }
      if (esComercial && pdvSeleccionado) {
        payload.pdvId = pdvSeleccionado.id_pdv
      }
      const res = await api.post('/pedidos', payload)
      navigate('/notificacion', { state: { mensaje: res.data.mensaje, emailEnviado: res.data.emailEnviado } })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido.')
    } finally {
      setEnviando(false)
    }
  }

  // Función para cargar pedidos (vista "Mis Pedidos")
  const cargarPedidos = async () => {
    setCargandoPedidos(true)
    try {
      const params = { usuario: user?.login }
      if (vistaPedidos === 'pendientes') params.estado = 1
      if (vistaPedidos === 'aprobados') params.estado = 2
      if (vistaPedidos === 'rechazados') params.estado = 3
      
      const { data } = await api.get('/reportes/pedidos', { params })
      
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
      
      setPedidos(Array.from(pedidosMap.values()))
    } catch (err) {
      console.error('Error cargando pedidos:', err)
    } finally {
      setCargandoPedidos(false)
    }
  }

  // Cargar pedidos cuando cambia la vista a "Mis Pedidos"
  useEffect(() => {
    if (vistaActual === 'mis-pedidos' && !loading) {
      cargarPedidos()
    }
  }, [vistaActual, vistaPedidos, loading])

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
                  alt="Logo Fundación Crisfe" 
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
                      Cupo: ${Number(pdvSeleccionado.cupo).toFixed(2)}
                    </span>
                    <span className="pdv-tag info">PDV: {pdvSeleccionado.descripcion}</span>
                    <span className="pdv-tag info">{pdvSeleccionado.ciudad}</span>
                  </div>
                )}

                {!esComercial && (
                  <div className="pdv-info-tags">
                    <span className="pdv-tag cupo">
                      Presupuesto: ${Number(user?.departmentBudget || 0).toFixed(2)}
                    </span>
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
                  className="form-select">
                  <option value="">Tipo de suministro...</option>
                  {tiposSuministroUnicos.map(t => (
                    <option key={t.id_tipo_suministro} value={t.id_tipo_suministro}>{t.descripcion}</option>
                  ))}
                </select>

                <div className="supply-picker-group">
                  <input
                    type="text"
                    value={suministroSearch}
                    onChange={e => {
                      setSuministroSearch(e.target.value)
                      setSuministroId('')
                      setShowSuministroDropdown(true)
                    }}
                    onFocus={() => setShowSuministroDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSuministroDropdown(false), 120)}
                    disabled={!tipoSeleccionado}
                    placeholder={tipoSeleccionado ? 'Buscar suministro por nombre o proveedor...' : 'Selecciona primero el tipo'}
                    className="form-input"
                  />
                  {showSuministroDropdown && tipoSeleccionado && (
                    <div className="supply-dropdown" role="listbox" aria-label="Suministros sugeridos">
                      {suministrosFiltrados.length === 0 ? (
                        <div className="supply-dropdown-item supply-dropdown-item--empty">
                          Sin coincidencias
                        </div>
                      ) : (
                        suministrosFiltrados.slice(0, 12).map((s) => (
                          <button
                            key={s.id_suministro}
                            type="button"
                            className="supply-dropdown-item"
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
                  type="number" min={1} max={10} value={cantidad}
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
                              <span className={`type-badge ${item.tipoId === 1 ? 'oficina' : 'limpieza'}`}>
                                {item.tipoNombre}
                              </span>
                            </td>
                            <td>{item.cantidad}</td>
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
                disabled={enviando || carrito.length === 0 || (esComercial && !pdvSeleccionado) || cupoExcedido}
                className="submit-button">
                {enviando ? 'Enviando pedido...' : 'Realizar Pedido'}
              </button>
            </div>
          </>
        )}

        {vistaActual === 'mis-pedidos' && (
          <div className="mispedidos-wrapper-home">
            <div className="mispedidos-topbar">
              <div className="mispedidos-topbar__title">
                <h2>Mis Pedidos</h2>
              </div>

              <div className="mispedidos-filters-inline">
                <input
                  type="text"
                  className="mispedidos-filter-input"
                  placeholder="Buscar por pedido o suministro"
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                />

                <select
                  className="mispedidos-filter-input"
                  value={vistaPedidos}
                  onChange={e => { setVistaPedidos(e.target.value); setPedidoSeleccionado(null) }}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendientes">Pendientes</option>
                  <option value="aprobados">Aprobados</option>
                  <option value="rechazados">Rechazados</option>
                </select>

                <button className="mispedidos-filter-clear" onClick={limpiarFiltrosPedidos}>
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Contenido Principal - Grid de pedidos */}
            <div className="mispedidos-content-home">
              {cargandoPedidos ? (
                <div className="mispedidos-loading">
                  <div className="mispedidos-loading__spinner"></div>
                  <p>Cargando pedidos...</p>
                </div>
              ) : pedidosFiltrados.length === 0 ? (
                <div className="mispedidos-empty">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>No hay pedidos</h3>
                  <p>No tienes pedidos registrados.</p>
                </div>
              ) : (
                <div className="mispedidos-grid">
                  {pedidosFiltrados.map(pedido => (
                    <div 
                      key={pedido.pedidoId} 
                      className={`pedido-card ${pedidoSeleccionado?.pedidoId === pedido.pedidoId ? 'active' : ''}`}>
                      
                      <div className="pedido-card__header">
                        <div className="pedido-card__info">
                          <span className="pedido-card__numero">Pedido #{pedido.pedidoId}</span>
                          <span className="pedido-card__fecha">{pedido.fecha}</span>
                        </div>
                        <span className={`mispedidos-badge ${ESTADO_BADGE[pedido.estado] || ''}`}>
                          {pedido.estado}
                        </span>
                      </div>

                      <div className="pedido-card__body">
                        <div className="pedido-card__detalle">
                          <span className="label">Total:</span>
                          <span className="value">${pedido.total.toFixed(2)}</span>
                        </div>
                        <div className="pedido-card__detalle">
                          <span className="label">Artículos:</span>
                          <span className="value">{pedido.items.length}</span>
                        </div>
                      </div>

                      <button 
                        className="pedido-card__toggle"
                        onClick={() => setPedidoSeleccionado(
                          pedidoSeleccionado?.pedidoId === pedido.pedidoId ? null : pedido
                        )}>
                        {pedidoSeleccionado?.pedidoId === pedido.pedidoId ? 'Ocultar detalles' : 'Ver detalles'}
                      </button>

                      {pedidoSeleccionado?.pedidoId === pedido.pedidoId && (
                        <div className="pedido-card__items">
                          <h4>Detalle del Pedido</h4>
                          <table className="mispedidos-items-table">
                            <thead>
                              <tr>
                                <th>Suministro</th>
                                <th>Cantidad</th>
                                <th>P. Unit.</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedido.items.map((item, idx) => (
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}