// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Home.css'

export default function Home() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  // Catálogos
  const [pdvs, setPdvs] = useState([])
  const [tiposSuministro, setTipos] = useState([])
  const [suministros, setSuministros] = useState([])

  // Selección
  const [pdvSeleccionado, setPdv] = useState(null)
  const [tipoSeleccionado, setTipo] = useState('')
  const [suministroId, setSuministroId] = useState('')
  const [cantidad, setCantidad] = useState(1)

  // Carrito
  const [carrito, setCarrito] = useState([])

  // UI
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const fecha = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })

  // Cargar PDVs y tipos al montar
  useEffect(() => {
    if (loading) return  // esperar que AuthContext confirme la sesión
    api.get('/catalogos/pdvs').then(r => setPdvs(r.data)).catch(() => { })
    api.get('/catalogos/tipo-suministros').then(r => setTipos(r.data)).catch(() => { })
  }, [loading])  // ← se dispara cuando loading cambia a false


  // Cargar suministros cuando cambia el tipo
  useEffect(() => {
    if (!tipoSeleccionado) { setSuministros([]); setSuministroId(''); return }
    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}`)
      .then(r => { setSuministros(r.data); setSuministroId('') })
      .catch(() => { })
  }, [tipoSeleccionado]);

  const pdvInfo = pdvs.find(p => p.codigo === Number(pdvSeleccionado?.codigo))

  // Totales
  const subtotalOficina = carrito.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
  const subtotalLimpieza = carrito.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)
  const totalPedido = carrito.reduce((s, i) => s + i.total, 0)
  const cupoExcedido = pdvSeleccionado && totalPedido > pdvSeleccionado.cupo

  const handleAgregar = () => {
    if (!suministroId || !tipoSeleccionado || !cantidad) return
    const sum = suministros.find(s => s.codigo === Number(suministroId))
    const tipo = tiposSuministro.find(t => t.codigo === Number(tipoSeleccionado))
    if (!sum) return

    setCarrito(prev => [...prev, {
      id: Date.now(),
      suministroId: sum.codigo,
      suministroNombre: sum.descripcion,
      tipoId: tipo.codigo,
      tipoNombre: tipo.descripcion,
      cantidad: Number(cantidad),
      precioUnitario: Number(sum.precio),
      total: Number(cantidad) * Number(sum.precio),
    }])
    setSuministroId('')
    setCantidad(1)
  }

  const handleEliminar = (id) => setCarrito(prev => prev.filter(i => i.id !== id))

  const handlePedido = async () => {
    if (!pdvSeleccionado || carrito.length === 0) return
    if (cupoExcedido) { setError('El total supera el cupo asignado al PDV.'); return }
    setEnviando(true)
    setError('')
    try {
      const res = await api.post('/pedidos', { pdvId: pdvSeleccionado.codigo, items: carrito })
      navigate('/notificacion', { state: { mensaje: res.data.mensaje, emailEnviado: res.data.emailEnviado } })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido.')
    } finally {
      setEnviando(false)
    }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  // SVG Icons
  const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  )

  return (
    <div className="home-container">

      {/* Header */}
      <header className="home-header">
        <div className="header-brand">
          <div className="header-logo">
            <img
              src="images/LOGO FC SINTETIZADO FONDO BLANCO.jpg"
              alt="FarmCorp Logo"
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <div className="header-brand-text">
            <h1>Solicitud de Suministros</h1>
            <p>Sistema de Distribución de Suministros</p>
          </div>
        </div>
        <div className="header-user-section">
          <div className="header-user-info">
            <p className="user-name"> Bienvenido, {user?.nombre}</p>
            <p className="user-date">{fecha}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>
      <main className="home-main">

        {/* PDV Selection */}
        <section className="section-card">
          <h2 className="section-header">Punto de Venta</h2>
          <div className="pdv-selector-wrapper">
            <select
              value={pdvSeleccionado?.codigo || ''}
              onChange={e => {
                const p = pdvs.find(p => p.codigo === Number(e.target.value))
                setPdv(p || null)
              }}
              className="pdv-select">
              <option value="">Seleccionar PDV...</option>
              {pdvs.map(p => <option key={p.codigo} value={p.codigo}>{p.descripcion} — {p.ciudad}</option>)}
            </select>

            {pdvSeleccionado && (
              <div className="pdv-info-tags">
                <span className="pdv-tag cupo">
                  Cupo: ${Number(pdvSeleccionado.cupo).toFixed(2)}
                </span>
                <span className="pdv-tag info">
                  {pdvSeleccionado.ciudad}
                </span>
                <span className="pdv-tag info">
                  {pdvSeleccionado.direccion}
                </span>
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
              {tiposSuministro.map(t => <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>)}
            </select>

            <select value={suministroId} onChange={e => setSuministroId(e.target.value)}
              disabled={!tipoSeleccionado}
              className="form-select">
              <option value="">Suministro...</option>
              {suministros.map(s => (
                <option key={s.codigo} value={s.codigo}>{s.descripcion} — ${Number(s.precio).toFixed(2)}</option>
              ))}
            </select>

            <input type="number" min={1} max={10} value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="Cantidad"
              className="form-input"
            />

            <button onClick={handleAgregar}
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
                    {carrito.map((item) => (
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
                          <button onClick={() => handleEliminar(item.id)}
                            className="remove-button">
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
                <div className={`total-row grand-total`}>
                  <span className="label">
                    Total
                    {cupoExcedido && (
                      <span className="exceeded-badge">EXCEDIDO</span>
                    )}
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
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="submit-section">
          <button
            onClick={handlePedido}
            disabled={enviando || carrito.length === 0 || !pdvSeleccionado || cupoExcedido}
            className="submit-button">
            {enviando ? 'Enviando pedido...' : 'Realizar Pedido'}
          </button>
        </div>
      </main>
    </div>
  )
}