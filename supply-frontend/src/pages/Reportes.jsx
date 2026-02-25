import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Reportes.css'

const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const ESTADO_BADGE = {
  'Pendiente':  'badge--pendiente',
  'Aprobado':   'badge--aprobado',
  'Rechazado':  'badge--rechazado',
  'Entregado':  'badge--entregado',
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

export default function Reportes() {
  const { loading: authLoading } = useAuth()

  const anioActual = new Date().getFullYear()
  const mesActual  = new Date().getMonth() + 1

  const [filtros, setFiltros] = useState({
    modo:       'mes',          // 'mes' | 'rango'
    mes:        String(mesActual),
    anio:       String(anioActual),
    fechaDesde: '',
    fechaHasta: '',
    pdv:        '',
    usuario:    '',
  })

  const [pedidos,    setPedidos]    = useState([])
  const [paginacion, setPaginacion] = useState({ total: 0, page: 1, totalPages: 1 })
  const [cargando,   setCargando]   = useState(false)
  const [error,      setError]      = useState(null)
  const [pdvs,       setPdvs]       = useState([])
  const [descargando, setDescargando] = useState(false)

  // Cargar PDVs para el filtro
  useEffect(() => {
    if (authLoading) return
    api.get('/catalogos/pdvs')
      .then(r => setPdvs(r.data))
      .catch(() => {})
  }, [authLoading])

  const cargarPedidos = useCallback(async (page = 1) => {
    setCargando(true)
    setError(null)
    try {
      const params = { ...buildParams(filtros), page, limit: 50 }
      const { data } = await api.get('/reportes/pedidos', { params })
      setPedidos(data.data)
      setPaginacion({ total: data.total, page: data.page, totalPages: data.totalPages })
    } catch (err) {
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
      const fecha = new Date().toISOString().slice(0, 10)
      link.setAttribute('download', `reporte_pedidos_${fecha}.xlsx`)
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

  const totalGeneral = pedidos.reduce((s, p) => s + Number(p.total), 0)

  const anios = Array.from({ length: 5 }, (_, i) => anioActual - i)

  return (
    <div className="rep-wrapper">
      {/* ── Header ─────────────────────────────────────────────── */}
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
          disabled={descargando || pedidos.length === 0}
        >
          {descargando
            ? <><span className="rep-spinner" /> Generando...</>
            : <><span className="rep-icon"></span> Exportar Excel</>}
        </button>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────── */}
      <form className="rep-filtros" onSubmit={handleBuscar}>

        {/* Selector modo */}
        <div className="rep-filtros__modo">
          <button
            type="button"
            className={`rep-modo-btn ${filtros.modo === 'mes' ? 'active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, modo: 'mes' }))}
          >
            Por mes
          </button>
          <button
            type="button"
            className={`rep-modo-btn ${filtros.modo === 'rango' ? 'active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, modo: 'rango' }))}
          >
            Rango de fechas
          </button>
        </div>

        <div className="rep-filtros__campos">
          {/* Filtros de período */}
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

          {/* PDV */}
          <div className="rep-campo rep-campo--wide">
            <label>PDV</label>
            <select name="pdv" value={filtros.pdv} onChange={handleFiltroChange}>
              <option value="">Todos los PDV</option>
              {pdvs.map(p => (
                <option key={p.codigo} value={p.codigo}>{p.descripcion}</option>
              ))}
            </select>
          </div>

          {/* Usuario */}
          <div className="rep-campo">
            <label>Usuario (login)</label>
            <input
              type="text"
              name="usuario"
              value={filtros.usuario}
              onChange={handleFiltroChange}
              placeholder="ej. juan.perez"
            />
          </div>

          {/* Botones */}
          <div className="rep-filtros__acciones">
            <button type="submit" className="rep-btn rep-btn--primary">
              Buscar
            </button>
            <button type="button" className="rep-btn rep-btn--ghost" onClick={handleLimpiar}>
              Limpiar
            </button>
          </div>
        </div>
      </form>

      {/* ── Tabla ───────────────────────────────────────────────── */}
      {error && <div className="rep-alert">{error}</div>}

      <div className="rep-table-wrap">
        {cargando ? (
          <div className="rep-loading">
            <div className="rep-loading__dots">
              <span /><span /><span />
            </div>
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
                <th className="rep-th--right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id} className="rep-row">
                  <td className="rep-td--id">{p.id}</td>
                  <td className="rep-td--fecha">
                    {p.fecha
                      ? new Date(p.fecha + 'T00:00:00').toLocaleDateString('es-EC', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </td>
                  <td className="rep-td--usuario">
                    <span className="rep-usuario__nombre">{p.usuarioNombre}</span>
                    <span className="rep-usuario__login">{p.usuarioLogin}</span>
                  </td>
                  <td className="rep-td--pdv">{p.pdvNombre}</td>
                  <td>
                    <span className={`rep-badge ${ESTADO_BADGE[p.estado] || 'badge--default'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="rep-td--total">
                    ${Number(p.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="rep-tfoot-row">
                <td colSpan={5} className="rep-tfoot__label">
                  Total ({paginacion.total} pedidos)
                </td>
                <td className="rep-tfoot__total">
                  ${totalGeneral.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* ── Paginación ──────────────────────────────────────────── */}
      {paginacion.totalPages > 1 && (
        <div className="rep-paginacion">
          <button
            className="rep-btn rep-btn--page"
            disabled={paginacion.page <= 1}
            onClick={() => cargarPedidos(paginacion.page - 1)}
          >
            ← Anterior
          </button>
          <span className="rep-paginacion__info">
            Página {paginacion.page} de {paginacion.totalPages}
          </span>
          <button
            className="rep-btn rep-btn--page"
            disabled={paginacion.page >= paginacion.totalPages}
            onClick={() => cargarPedidos(paginacion.page + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}