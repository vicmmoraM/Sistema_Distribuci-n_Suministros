// src/pages/Reportes.jsx
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import './Reportes.css'

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const ESTADO_BADGE = {
  'Pendiente': 'badge--pendiente',
  'Aprobado':  'badge--aprobado',
  'Rechazado': 'badge--rechazado',
  'Entregado': 'badge--entregado',
}

function buildParams(filtros) {
  const p = {}
  if (filtros.modo === 'mes') {
    if (filtros.mes)  p.mes  = filtros.mes
    if (filtros.anio) p.anio = filtros.anio
  } else {
    if (filtros.fechaDesde) p.fechaDesde = filtros.fechaDesde
    if (filtros.fechaHasta) p.fechaHasta = filtros.fechaHasta
  }
  if (filtros.pdv)     p.pdv     = filtros.pdv
  if (filtros.usuario) p.usuario = filtros.usuario
  return p
}

function agruparPorPedido(rows) {
  const map = new Map()
  rows.forEach(row => {
    if (!map.has(row.pedidoId)) {
      map.set(row.pedidoId, {
        pedidoId:      row.pedidoId,
        fecha:         row.fecha,
        usuarioLogin:  row.usuarioLogin,
        usuarioNombre: row.usuarioNombre,
        pdvNombre:     row.pdvNombre,
        estado:        row.estado,
        items:         [],
        totalPedido:   0,
      })
    }
    const pedido = map.get(row.pedidoId)
    pedido.items.push({
      tipoSuministro: row.tipoSuministro,
      suministro:     row.suministro,
      cantidad:       row.cantidad,
      precioUnitario: Number(row.precioUnitario),
      subtotal:       Number(row.subtotal),
    })
    pedido.totalPedido += Number(row.subtotal)
  })
  return Array.from(map.values())
}

export default function Reportes() {
  const { loading: authLoading } = useAuth()

  const anioActual = new Date().getFullYear()
  const mesActual  = new Date().getMonth() + 1

  const [filtros, setFiltros] = useState({
    modo:       'mes',
    mes:        String(mesActual),
    anio:       String(anioActual),
    fechaDesde: '',
    fechaHasta: '',
    pdv:        '',
    usuario:    '',
  })

  const [pedidos,     setPedidos]     = useState([])
  const [paginacion,  setPaginacion]  = useState({ total: 0, page: 1, totalPages: 1 })
  const [cargando,    setCargando]    = useState(false)
  const [error,       setError]       = useState(null)
  const [pdvs,        setPdvs]        = useState([])
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    if (authLoading) return
    api.get('/catalogos/pdvs').then(r => setPdvs(r.data)).catch(() => {})
  }, [authLoading])

  const cargarPedidos = useCallback(async (page = 1) => {
    setCargando(true)
    setError(null)
    try {
      const params = { ...buildParams(filtros), page, limit: 30 }
      const { data } = await api.get('/reportes/pedidos', { params })
      setPedidos(agruparPorPedido(data.data))
      setPaginacion({ total: data.total, page: data.page, totalPages: data.totalPages })
    } catch {
      setError('Error al cargar los reportes.')
    } finally {
      setCargando(false)
    }
  }, [filtros])

  useEffect(() => {
    if (!authLoading) cargarPedidos(1)
  }, [authLoading, cargarPedidos])

  function handleFiltroChange(e) {
    const { name, value } = e.target
    setFiltros(f => ({ ...f, [name]: value }))
  }

  function handleBuscar(e) {
    e.preventDefault()
    cargarPedidos(1)
  }

  function handleLimpiar() {
    setFiltros({
      modo: 'mes', mes: String(mesActual), anio: String(anioActual),
      fechaDesde: '', fechaHasta: '', pdv: '', usuario: '',
    })
  }

  async function handleDescargarExcel() {
    setDescargando(true)
    try {
      const params = new URLSearchParams(buildParams(filtros)).toString()
      const response = await api.get(
        `/reportes/pedidos/excel${params ? '?' + params : ''}`,
        { responseType: 'blob' }
      )
      const url  = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `reporte_pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Error al generar el Excel.')
    } finally {
      setDescargando(false)
    }
  }

  const totalGeneral = pedidos.reduce((s, p) => s + p.totalPedido, 0)
  const anios = Array.from({ length: 5 }, (_, i) => anioActual - i)

  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="rep-wrapper" style={{ marginLeft: 250 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="rep-header">
          <div className="rep-header__left">
            <h1 className="rep-title">Reportes de Pedidos</h1>
            <p className="rep-subtitle">
              {paginacion.total > 0
                ? `${paginacion.total} pedido${paginacion.total !== 1 ? 's' : ''} encontrado${paginacion.total !== 1 ? 's' : ''}`
                : 'Sin resultados'}
            </p>
          </div>
          <button
            className="rep-btn rep-btn--excel"
            onClick={handleDescargarExcel}
            disabled={descargando || pedidos.length === 0}>
            {descargando
              ? <><span className="rep-spinner" /> Generando...</>
              : <><span className="rep-icon"></span> Exportar Excel</>}
          </button>
        </div>

        {/* ── Filtros ────────────────────────────────────────── */}
        <form className="rep-filtros" onSubmit={handleBuscar}>
          <div className="rep-filtros__modo">
            <button type="button"
              className={`rep-modo-btn ${filtros.modo === 'mes' ? 'active' : ''}`}
              onClick={() => setFiltros(f => ({ ...f, modo: 'mes' }))}>
              Por mes
            </button>
            <button type="button"
              className={`rep-modo-btn ${filtros.modo === 'rango' ? 'active' : ''}`}
              onClick={() => setFiltros(f => ({ ...f, modo: 'rango' }))}>
              Rango de fechas
            </button>
          </div>

          <div className="rep-filtros__campos">
            {filtros.modo === 'mes' ? (
              <>
                <div className="rep-campo">
                  <label>Mes</label>
                  <select name="mes" value={filtros.mes} onChange={handleFiltroChange}>
                    {MESES.slice(1).map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="rep-campo">
                  <label>Año</label>
                  <select name="anio" value={filtros.anio} onChange={handleFiltroChange}>
                    {anios.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="rep-campo">
                  <label>Desde</label>
                  <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} />
                </div>
                <div className="rep-campo">
                  <label>Hasta</label>
                  <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} />
                </div>
              </>
            )}

            <div className="rep-campo rep-campo--wide">
              <label>PDV</label>
              <select name="pdv" value={filtros.pdv} onChange={handleFiltroChange}>
                <option value="">Todos los PDV</option>
                {pdvs.map(p => (
                  <option key={p.codigo} value={p.codigo}>{p.descripcion}</option>
                ))}
              </select>
            </div>

            <div className="rep-campo">
              <label>Usuario (login)</label>
              <input type="text" name="usuario" value={filtros.usuario}
                onChange={handleFiltroChange} placeholder="ej. juan.perez" />
            </div>

            <div className="rep-filtros__acciones">
              <button type="submit" className="rep-btn rep-btn--primary">Buscar</button>
              <button type="button" className="rep-btn rep-btn--ghost" onClick={handleLimpiar}>Limpiar</button>
            </div>
          </div>
        </form>

        {error && <div className="rep-alert">{error}</div>}

        {/* ── Tabla ──────────────────────────────────────────── */}
        <div className="rep-table-wrap">
          {cargando ? (
            <div className="rep-loading">
              <div className="rep-loading__dots"><span /><span /><span /></div>
              <p>Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="rep-empty">
              <span className="rep-empty__icon">📋</span>
              <p>No se encontraron pedidos con los filtros aplicados.</p>
            </div>
          ) : (
            <table className="rep-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>PDV Destino</th>
                  <th>Estado</th>
                  <th>Tipo Suministro</th>
                  <th>Suministro</th>
                  <th className="rep-th--center">Cant.</th>
                  <th className="rep-th--right">P. Unit.</th>
                  <th className="rep-th--right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, pi) => (
                  pedido.items.map((item, ii) => (
                    <tr key={`${pedido.pedidoId}-${ii}`}
                      className={`rep-row ${pi % 2 === 0 ? 'rep-row--par' : 'rep-row--impar'} ${ii === 0 ? 'rep-row--first' : ''}`}>

                      {ii === 0 ? (
                        <>
                          <td className="rep-td--id" rowSpan={pedido.items.length}>
                            {pedido.pedidoId}
                          </td>
                          <td className="rep-td--fecha" rowSpan={pedido.items.length}>
                            {pedido.fecha
                              ? new Date(pedido.fecha + 'T00:00:00').toLocaleDateString('es-EC', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })
                              : '—'}
                          </td>
                          <td className="rep-td--usuario" rowSpan={pedido.items.length}>
                            <div className="rep-usuario__wrap">
                              <span className="rep-usuario__nombre">{pedido.usuarioNombre}</span>
                              <span className="rep-usuario__login">{pedido.usuarioLogin}</span>
                            </div>
                          </td>
                          <td className="rep-td--pdv" rowSpan={pedido.items.length}>
                            {pedido.pdvNombre}
                          </td>
                          <td rowSpan={pedido.items.length}>
                            <span className={`rep-badge ${ESTADO_BADGE[pedido.estado] || 'badge--default'}`}>
                              {pedido.estado}
                            </span>
                          </td>
                        </>
                      ) : null}

                      <td className="rep-td--tipo">{item.tipoSuministro}</td>
                      <td className="rep-td--suministro">{item.suministro}</td>
                      <td className="rep-td--center">{item.cantidad}</td>
                      <td className="rep-td--right rep-td--precio">
                        ${item.precioUnitario.toFixed(2)}
                      </td>
                      <td className="rep-td--right rep-td--subtotal">
                        ${item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr className="rep-tfoot-row">
                  <td colSpan={9} className="rep-tfoot__label">
                    Total general ({paginacion.total} pedidos)
                  </td>
                  <td className="rep-tfoot__total">${totalGeneral.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Paginación ─────────────────────────────────────── */}
        {paginacion.totalPages > 1 && (
          <div className="rep-paginacion">
            <button className="rep-btn rep-btn--page"
              disabled={paginacion.page <= 1}
              onClick={() => cargarPedidos(paginacion.page - 1)}>
              ← Anterior
            </button>
            <span className="rep-paginacion__info">
              Página {paginacion.page} de {paginacion.totalPages}
            </span>
            <button className="rep-btn rep-btn--page"
              disabled={paginacion.page >= paginacion.totalPages}
              onClick={() => cargarPedidos(paginacion.page + 1)}>
              Siguiente →
            </button>
          </div>
        )}

      </div>
    </>
  )
}