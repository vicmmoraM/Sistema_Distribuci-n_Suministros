// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Catálogos
  const [pdvs, setPdvs]                   = useState([])
  const [tiposSuministro, setTipos]       = useState([])
  const [suministros, setSuministros]     = useState([])

  // Selección
  const [pdvSeleccionado, setPdv]         = useState(null)
  const [tipoSeleccionado, setTipo]       = useState('')
  const [suministroId, setSuministroId]   = useState('')
  const [cantidad, setCantidad]           = useState(1)

  // Carrito
  const [carrito, setCarrito]             = useState([])

  // UI
  const [enviando, setEnviando]           = useState(false)
  const [error, setError]                 = useState('')

  const fecha = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })

  // Cargar PDVs y tipos al montar
  useEffect(() => {
    api.get('/catalogos/pdvs').then(r => setPdvs(r.data)).catch(() => {})
    api.get('/catalogos/tipo-suministros').then(r => setTipos(r.data)).catch(() => {})
  }, [])

  // Cargar suministros cuando cambia el tipo
  useEffect(() => {
    if (!tipoSeleccionado) { setSuministros([]); setSuministroId(''); return }
    api.get(`/catalogos/suministros?tipo=${tipoSeleccionado}`)
      .then(r => { setSuministros(r.data); setSuministroId('') })
      .catch(() => {})
  }, [tipoSeleccionado])

  const pdvInfo = pdvs.find(p => p.codigo === Number(pdvSeleccionado?.codigo))

  // Totales
  const subtotalOficina  = carrito.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
  const subtotalLimpieza = carrito.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)
  const totalPedido      = carrito.reduce((s, i) => s + i.total, 0)
  const cupoExcedido     = pdvSeleccionado && totalPedido > pdvSeleccionado.cupo

  const handleAgregar = () => {
    if (!suministroId || !tipoSeleccionado || !cantidad) return
    const sum = suministros.find(s => s.codigo === Number(suministroId))
    const tipo = tiposSuministro.find(t => t.codigo === Number(tipoSeleccionado))
    if (!sum) return

    setCarrito(prev => [...prev, {
      id:               Date.now(),
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

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="min-h-screen" style={{ background: 'var(--fc-gray-50)' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--fc-green-dark)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--fc-accent)' }}>
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne' }}>FC</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Syne' }}>FarmCorp</p>
            <p className="text-white/50 text-xs">Solicitud de Suministros</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{user?.nombre}</p>
            <p className="text-white/50 text-xs">{fecha}</p>
          </div>
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Selección de PDV ── */}
        <section className="bg-white rounded-2xl p-6 anim-fade-up"
          style={{ border: '1px solid var(--fc-gray-200)' }}>
          <h2 className="text-base font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--fc-gray-900)' }}>
            Punto de Venta
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={pdvSeleccionado?.codigo || ''}
              onChange={e => {
                const p = pdvs.find(p => p.codigo === Number(e.target.value))
                setPdv(p || null)
              }}
              className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid var(--fc-gray-200)', background: 'var(--fc-gray-50)' }}>
              <option value="">Seleccionar PDV...</option>
              {pdvs.map(p => <option key={p.codigo} value={p.codigo}>{p.descripcion} — {p.ciudad}</option>)}
            </select>

            {pdvSeleccionado && (
              <div className="flex gap-3 anim-fade-in flex-wrap">
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--fc-green-light)', color: 'var(--fc-green-dark)' }}>
                  Cupo: ${Number(pdvSeleccionado.cupo).toFixed(2)}
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--fc-gray-100)', color: 'var(--fc-gray-700)' }}>
                  {pdvSeleccionado.ciudad}
                </span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--fc-gray-100)', color: 'var(--fc-gray-700)' }}>
                  {pdvSeleccionado.direccion}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Agregar ítem ── */}
        <section className="bg-white rounded-2xl p-6 anim-fade-up delay-1"
          style={{ border: '1px solid var(--fc-gray-200)' }}>
          <h2 className="text-base font-bold mb-4" style={{ fontFamily: 'Syne', color: 'var(--fc-gray-900)' }}>
            Agregar Suministro
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={tipoSeleccionado} onChange={e => setTipo(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid var(--fc-gray-200)', background: 'var(--fc-gray-50)' }}>
              <option value="">Tipo de suministro...</option>
              {tiposSuministro.map(t => <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>)}
            </select>

            <select value={suministroId} onChange={e => setSuministroId(e.target.value)}
              disabled={!tipoSeleccionado}
              className="px-4 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50"
              style={{ border: '1.5px solid var(--fc-gray-200)', background: 'var(--fc-gray-50)' }}>
              <option value="">Suministro...</option>
              {suministros.map(s => (
                <option key={s.codigo} value={s.codigo}>{s.descripcion} — ${Number(s.precio).toFixed(2)}</option>
              ))}
            </select>

            <input type="number" min={1} max={10} value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="Cantidad"
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1.5px solid var(--fc-gray-200)', background: 'var(--fc-gray-50)' }}
            />

            <button onClick={handleAgregar}
              disabled={!suministroId || !tipoSeleccionado}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'var(--fc-green)' }}>
              + Agregar
            </button>
          </div>
        </section>

        {/* ── Carrito ── */}
        <section className="bg-white rounded-2xl overflow-hidden anim-fade-up delay-2"
          style={{ border: '1px solid var(--fc-gray-200)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--fc-gray-200)' }}>
            <h2 className="text-base font-bold" style={{ fontFamily: 'Syne', color: 'var(--fc-gray-900)' }}>
              Detalle del Pedido
            </h2>
          </div>

          {carrito.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm" style={{ color: 'var(--fc-gray-500)' }}>
                Aún no has agregado suministros al pedido.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--fc-gray-50)', borderBottom: '1px solid var(--fc-gray-200)' }}>
                    {['Descripción', 'Tipo', 'Cantidad', 'P. Unitario', 'Total', ''].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--fc-gray-500)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, idx) => (
                    <tr key={item.id} className="anim-fade-in"
                      style={{ borderBottom: '1px solid var(--fc-gray-100)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--fc-gray-900)' }}>
                        {item.suministroNombre}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: item.tipoId === 1 ? 'var(--fc-green-light)' : '#eff6ff',
                            color: item.tipoId === 1 ? 'var(--fc-green-dark)' : '#1d4ed8',
                          }}>
                          {item.tipoNombre}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--fc-gray-700)' }}>{item.cantidad}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--fc-gray-700)' }}>
                        ${item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--fc-gray-900)' }}>
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleEliminar(item.id)}
                          className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all"
                          style={{ background: '#fff0f0', color: 'var(--fc-danger)' }}>
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totales */}
          {carrito.length > 0 && (
            <div className="px-6 py-4 space-y-2" style={{ borderTop: '1px solid var(--fc-gray-200)' }}>
              <div className="flex justify-end gap-8 text-sm">
                <span style={{ color: 'var(--fc-gray-500)' }}>Total Oficina</span>
                <span className="font-medium w-24 text-right">${subtotalOficina.toFixed(2)}</span>
              </div>
              <div className="flex justify-end gap-8 text-sm">
                <span style={{ color: 'var(--fc-gray-500)' }}>Total Limpieza</span>
                <span className="font-medium w-24 text-right">${subtotalLimpieza.toFixed(2)}</span>
              </div>
              <div className="flex justify-end gap-8 text-base pt-2"
                style={{ borderTop: '1px solid var(--fc-gray-200)' }}>
                <span className="font-bold flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
                  Total
                  {cupoExcedido && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold anim-blink"
                      style={{ background: '#fff0f0', color: 'var(--fc-danger)' }}>
                      EXCEDIDO
                    </span>
                  )}
                </span>
                <span className="font-bold w-24 text-right text-lg"
                  style={{ color: cupoExcedido ? 'var(--fc-danger)' : 'var(--fc-green-dark)' }}>
                  ${totalPedido.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ── Error y botón ── */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm anim-fade-in"
            style={{ background: '#fff5f5', color: 'var(--fc-danger)', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <div className="flex justify-end anim-fade-up delay-3">
          <button
            onClick={handlePedido}
            disabled={enviando || carrito.length === 0 || !pdvSeleccionado || cupoExcedido}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'var(--fc-green)', fontFamily: 'Syne' }}>
            {enviando ? 'Enviando pedido...' : 'Realizar Pedido →'}
          </button>
        </div>
      </main>
    </div>
  )
}