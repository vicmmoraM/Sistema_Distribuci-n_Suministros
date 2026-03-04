import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { usePermissions } from '../hooks/usePermissions'
import api from '../api/axios'
import Layout from '../components/Layout'
import '../style/Home.css'

export default function Home() {
  const { user, loading } = useAuth()
  const { isCollapsed } = useSidebar()
  const { esComercial } = usePermissions()
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
    if (!tipoSeleccionado) { setSuministros([]); setSuministroId(''); return }
    const pdvQuery = pdvSeleccionado?.id_pdv ? `&pdv=${pdvSeleccionado.id_pdv}` : ''
    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}${pdvQuery}`)
      .then(r => { setSuministros(r.data); setSuministroId('') })
      .catch(() => {})
  }, [tipoSeleccionado, pdvSeleccionado?.id_pdv])

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
    setCantidad(1)
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

  return (
    <div className="home-container">
      <Layout />

      <main className="home-main" style={{ marginLeft: isCollapsed ? 70 : 250 }}>

        {/* Departamento / Punto de venta */}
        <section className="section-card">
          <h2 className="section-header">{esComercial ? 'Punto de venta' : 'Departamento'}</h2>
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

            <select value={suministroId} onChange={e => setSuministroId(e.target.value)}
              disabled={!tipoSeleccionado}
              className="form-select">
              <option value="">Suministro...</option>
              {suministros.map(s => (
                <option key={s.id_suministro} value={s.id_suministro}>
                  {s.descripcion} — ${Number(s.precio).toFixed(2)} - {s.proveedor} 
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
            disabled={enviando || carrito.length === 0 || (esComercial && !pdvSeleccionado) || cupoExcedido}
            className="submit-button">
            {enviando ? 'Enviando pedido...' : 'Realizar Pedido'}
          </button>
        </div>

      </main>
    </div>
  )
}