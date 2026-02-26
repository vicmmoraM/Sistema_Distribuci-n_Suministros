import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import './Home.css'

export default function Home() {
  const { user, loading } = useAuth()
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

  // Cargar PDVs y tipos al montar
  useEffect(() => {
    if (loading) return
    api.get('/catalogos/pdvs').then(r => setPdvs(r.data)).catch(() => {})
    api.get('/catalogos/tipo-suministros').then(r => setTipos(r.data)).catch(() => {})
  }, [loading])

  // Cargar suministros cuando cambia el tipo
  useEffect(() => {
    if (!tipoSeleccionado) { setSuministros([]); setSuministroId(''); return }
    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}`)
      .then(r => { setSuministros(r.data); setSuministroId('') })
      .catch(() => {})
  }, [tipoSeleccionado])

  // Totales
  const subtotalOficina  = carrito.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
  const subtotalLimpieza = carrito.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)
  const totalPedido      = carrito.reduce((s, i) => s + i.total, 0)
  const cupoExcedido     = pdvSeleccionado && totalPedido > pdvSeleccionado.cupo

  const handleAgregar = () => {
    if (!suministroId || !tipoSeleccionado || !cantidad) return
    const sum  = suministros.find(s => s.codigo === Number(suministroId))
    const tipo = tiposSuministro.find(t => t.codigo === Number(tipoSeleccionado))
    if (!sum) return

    setCarrito(prev => [...prev, {
      id: Date.now(),
      suministroId:     sum.codigo,
      suministroNombre: sum.descripcion,
      tipoId:           tipo.codigo,
      tipoNombre:       tipo.descripcion,
      cantidad:         Number(cantidad),
      precioUnitario:   Number(sum.precio),
      total:            Number(cantidad) * Number(sum.precio),
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

  return (
    <div className="home-container">
      <Navbar />
      <Sidebar />

      <main className="home-main" style={{ marginLeft: 250 }}>

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
              {pdvs.map(p => (
                <option key={p.codigo} value={p.codigo}>{p.descripcion} — {p.ciudad}</option>
              ))}
            </select>

            {pdvSeleccionado && (
              <div className="pdv-info-tags">
                <span className="pdv-tag cupo">
                  Cupo: ${Number(pdvSeleccionado.cupo).toFixed(2)}
                </span>
                <span className="pdv-tag info">{pdvSeleccionado.ciudad}</span>
                <span className="pdv-tag info">{pdvSeleccionado.direccion}</span>
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
              {tiposSuministro.map(t => (
                <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>
              ))}
            </select>

            <select value={suministroId} onChange={e => setSuministroId(e.target.value)}
              disabled={!tipoSeleccionado}
              className="form-select">
              <option value="">Suministro...</option>
              {suministros.map(s => (
                <option key={s.codigo} value={s.codigo}>
                  {s.descripcion} — ${Number(s.precio).toFixed(2)}
                </option>
              ))}
            </select>

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
            disabled={enviando || carrito.length === 0 || !pdvSeleccionado || cupoExcedido}
            className="submit-button">
            {enviando ? 'Enviando pedido...' : 'Realizar Pedido'}
          </button>
        </div>

      </main>
    </div>
  )
}