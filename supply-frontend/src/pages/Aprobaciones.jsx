// src/pages/Aprobaciones.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import axios from '../api/axios'
import '../style/Aprobaciones.css'

/**
 * Panel de aprobaciones (solo para Financiero y Tecnología)
 * Gestiona dos flujos: Aprobación de Pedidos y Aprobación de Adquisiciones
 */
export default function Aprobaciones() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const { pathname } = useLocation()
  
  // Estados para la gestión de pedidos
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [approvalObservations, setApprovalObservations] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isEditingItems, setIsEditingItems] = useState(false)
  const [savingItems, setSavingItems] = useState(false)
  const [toast, setToast] = useState(null)
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    departamento: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  })
  
  // Estados para paginación
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Estados para catálogos
  const [departamentos, setDepartamentos] = useState([])
  const [estados, setEstados] = useState([])

  // Determinar qué sección mostrar según la ruta
  const isPedidos = pathname === '/aprobaciones/pedidos'
  const isAdquisiciones = pathname === '/aprobaciones/adquisiciones'
  const isDefault = pathname === '/aprobaciones'
  const shouldShowPedidos = isPedidos || isDefault

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [deptRes, estadoRes] = await Promise.all([
          axios.get('/catalogos/departamentos'),
          axios.get('/catalogos/estados-pedido')
        ])
        setDepartamentos(deptRes.data || [])
        setEstados(estadoRes.data || [])
      } catch (error) {
        console.error('Error cargando catálogos:', error)
      }
    }
    loadCatalogos()
  }, [])

  // Cargar pedidos cuando cambian los filtros o la página
  useEffect(() => {
    console.log('useEffect ejecutado - shouldShowPedidos:', shouldShowPedidos, 'pathname:', pathname)
    if (shouldShowPedidos) {
      console.log('Llamando a loadPedidos()...')
      loadPedidos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, shouldShowPedidos])

  // Función para cargar pedidos con filtros
  const loadPedidos = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 10,
      }
      
      // Agregar filtros solo si tienen valor
      if (filters.search) params.search = filters.search
      if (filters.departamento) params.departamento = filters.departamento
      if (filters.estado) params.estado = filters.estado
      if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde
      if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta
      
      console.log('Cargando pedidos con params:', params)
      const response = await axios.get('/pedidos/aprobaciones', { params })
      console.log('Respuesta del servidor:', response.data)
      setPedidos(response.data.data || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
    } catch (error) {
      console.error('Error cargando pedidos:', error)
      console.error('Detalle del error:', error.response?.data)
      showToast('Error al cargar pedidos', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar notificación toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Manejar cambio de filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      departamento: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
    })
    setPage(1)
  }

  // Ver detalle del pedido
  const handleViewDetail = async (pedidoId) => {
    try {
      const response = await axios.get(`/pedidos/${pedidoId}`)
      setSelectedPedido(response.data)
      setIsEditingItems(false)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error cargando detalle:', error)
      showToast('Error al cargar el detalle del pedido', 'error')
    }
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setIsEditingItems(false)
  }

  const saveEditedItems = async () => {
    if (!selectedPedido?.id_pedido) return false
    if (!Array.isArray(selectedPedido.items) || selectedPedido.items.length === 0) {
      showToast('El pedido debe tener al menos un producto', 'error')
      return false
    }

    setSavingItems(true)
    try {
      const payload = {
        items: selectedPedido.items.map((item) => ({
          suministroId: Number(item.id_suministro),
          cantidad: Number(item.cantidad),
        })),
      }

      const { data } = await axios.put(`/pedidos/${selectedPedido.id_pedido}/items`, payload)
      const updatedPedido = data?.pedido

      if (updatedPedido) {
        setSelectedPedido(updatedPedido)
        setPedidos((prev) => prev.map((p) => (
          p.id_pedido === updatedPedido.id_pedido
            ? { ...p, total: updatedPedido.total }
            : p
        )))
      }

      showToast('Cambios guardados correctamente', 'success')
      return true
    } catch (error) {
      console.error('Error guardando edicion del pedido:', error)
      showToast(error.response?.data?.error || 'No se pudieron guardar los cambios', 'error')
      return false
    } finally {
      setSavingItems(false)
    }
  }

  const recalculateTotal = (items = []) => {
    return items.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0)
  }

  const handleItemCantidadChange = (index, value) => {
    const cantidad = Number(value)
    if (!Number.isInteger(cantidad) || cantidad <= 0) return

    setSelectedPedido(prev => {
      if (!prev?.items) return prev

      const updatedItems = prev.items.map((item, idx) => {
        if (idx !== index) return item
        const precioUnitario = parseFloat(item.precio_unitario || 0)
        return {
          ...item,
          cantidad,
          subtotal: cantidad * precioUnitario,
        }
      })

      return {
        ...prev,
        items: updatedItems,
        total: recalculateTotal(updatedItems),
      }
    })
  }

  const handleRemoveItem = (index) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este producto del pedido?')
    if (!confirmed) return

    setSelectedPedido(prev => {
      if (!prev?.items) return prev

      const updatedItems = prev.items.filter((_, idx) => idx !== index)
      return {
        ...prev,
        items: updatedItems,
        total: recalculateTotal(updatedItems),
      }
    })
  }

  // Iniciar aprobación
  const handleApproveClick = (pedido) => {
    setSelectedPedido(pedido)
    setApprovalObservations('')
    setShowApproveModal(true)
  }

  // Confirmar aprobación
  const confirmApprove = async () => {
    try {
      const payload = {
        observaciones: approvalObservations?.trim() || '',
      }

      if (Array.isArray(selectedPedido.items) && selectedPedido.items.length > 0) {
        payload.items = selectedPedido.items.map(item => ({
          suministroId: Number(item.id_suministro),
          cantidad: Number(item.cantidad),
        }))
      }

      await axios.post(`/pedidos/${selectedPedido.id_pedido}/aprobar`, payload)
      showToast(`Pedido #${selectedPedido.id_pedido} aprobado correctamente`, 'success')
      setShowApproveModal(false)
      setApprovalObservations('')
      setSelectedPedido(null)
      loadPedidos()
    } catch (error) {
      console.error('Error aprobando pedido:', error)
      showToast(error.response?.data?.error || 'Error al aprobar el pedido', 'error')
    }
  }

  // Iniciar rechazo
  const handleRejectClick = (pedido) => {
    setSelectedPedido(pedido)
    setRejectReason('')
    setShowRejectModal(true)
  }

  // Confirmar rechazo
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      showToast('Debes ingresar un motivo de rechazo', 'error')
      return
    }
    try {
      await axios.post(`/pedidos/${selectedPedido.id_pedido}/rechazar`, {
        motivo: rejectReason
      })
      showToast(`Pedido #${selectedPedido.id_pedido} rechazado correctamente`, 'success')
      setShowRejectModal(false)
      setSelectedPedido(null)
      setRejectReason('')
      loadPedidos()
    } catch (error) {
      console.error('Error rechazando pedido:', error)
      showToast(error.response?.data?.error || 'Error al rechazar el pedido', 'error')
    }
  }

  const normalizeEstado = (estado) => String(estado || '').trim().toLowerCase()

  const canTakeDecision = (estado) => {
    const value = normalizeEstado(estado)
    return value.includes('pend') || value.includes('espera')
  }

  // Obtener clase de badge según estado
  const getEstadoBadge = (estado) => {
    const value = normalizeEstado(estado)
    if (value.includes('pend') || value.includes('espera')) return 'badge-warning'
    if (value.includes('aprob')) return 'badge-success'
    if (value.includes('rechaz')) return 'badge-danger'
    if (value.includes('proceso')) return 'badge-info'
    return 'badge-default'
  }

  // Función para renderizar contenido según la sección
  const renderContent = () => {
    if (shouldShowPedidos) {
      return (
        <div className="aprobaciones-content">
          <div className="header-section">
            <div className="header-with-logo">
              <div>
                <h1>Aprobación de Suministros</h1>
                <p className="subtitle">Validación y aprobación de solicitudes de suministros por departamento</p>
              </div>
              <img 
                src="/images/LOGO OFICIAL FC COMPLETO FONDO TRANSPARENTE.png" 
                alt="Logo Fundación Crisfe" 
                className="aprobaciones-logo"
              />
            </div>
          </div>

          {/* Barra de filtros */}
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-group filter-group-search">
                <input
                  type="text"
                  placeholder="Buscar por ID o Solicitante..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="filter-input search-input"
                />
              </div>
              
              <div className="filter-group">
                <select
                  value={filters.departamento}
                  onChange={(e) => handleFilterChange('departamento', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos los Departamentos</option>
                  {departamentos.map(d => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos los Estados</option>
                  {estados.map(e => (
                    <option key={e.id_estado_pedido} value={e.id_estado_pedido}>
                      {e.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  className="filter-input"
                  placeholder="Desde"
                />
              </div>

              <div className="filter-group">
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  className="filter-input"
                  placeholder="Hasta"
                />
              </div>

              <button
                onClick={() => loadPedidos()}
                className="btn-refresh-filters"
                disabled={loading}
                type="button"
                title="Actualizar pedidos"
                aria-label="Actualizar pedidos"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  className={loading ? 'refresh-spin' : ''}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 4V10H7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M23 20V14H17" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 005.64 5.64L1 10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.51 15A9 9 0 0018.36 18.36L23 14" />
                </svg>
              </button>

              <button onClick={clearFilters} className="btn-clear-filters filter-action-btn">
                Limpiar
              </button>
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="table-container">
            {loading ? (
              <div className="loading-skeleton">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-row">
                    <div className="skeleton-cell"></div>
                    <div className="skeleton-cell"></div>
                    <div className="skeleton-cell"></div>
                    <div className="skeleton-cell"></div>
                    <div className="skeleton-cell"></div>
                  </div>
                ))}
              </div>
            ) : pedidos.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No se encontraron pedidos pendientes de aprobación</p>
              </div>
            ) : (
              <>
                <table className="pedidos-table">
                  <thead>
                    <tr>
                      <th>ID Pedido</th>
                      <th>Fecha</th>
                      <th>Departamento</th>
                      <th>Solicitante</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(pedido => (
                      <tr key={pedido.id_pedido}>
                        <td className="td-id">#{pedido.id_pedido}</td>
                        <td>{new Date(pedido.fecha_registro).toLocaleDateString('es-EC')}</td>
                        <td>{pedido.departamento || 'N/A'}</td>
                        <td>{pedido.usuario_nombre}</td>
                        <td>
                          <span className={`badge ${getEstadoBadge(pedido.estado)}`}>
                            {pedido.estado}
                          </span>
                        </td>
                        <td className="td-total">${parseFloat(pedido.total || 0).toFixed(2)}</td>
                        <td className="td-actions">
                          <button
                            onClick={() => handleViewDetail(pedido.id_pedido)}
                            className="btn-icon btn-view"
                            title="Ver detalle"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                              stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {canTakeDecision(pedido.estado) && (
                            <>
                              <button
                                onClick={() => handleApproveClick(pedido)}
                                className="btn-icon btn-approve"
                                title="Aprobar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                                  stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRejectClick(pedido)}
                                className="btn-icon btn-reject"
                                title="Rechazar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                                  stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Paginación */}
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-pagination"
                  >
                    Anterior
                  </button>
                  <span className="pagination-info">
                    Página {page} de {totalPages} ({total} registros)
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-pagination"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Modal de detalle */}
          {showDetailModal && selectedPedido && (
            <div className="modal-overlay" onClick={closeDetailModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Detalle del Pedido #{selectedPedido.id_pedido}</h2>
                  <button onClick={closeDetailModal} className="btn-close">×</button>
                </div>
                <div className="modal-body">
                  <div className="pedido-info">
                    <div className="info-row">
                      <strong>Solicitante:</strong> {selectedPedido.usuario_nombre}
                    </div>
                    <div className="info-row">
                      <strong>Departamento:</strong> {selectedPedido.departamento}
                    </div>
                    <div className="info-row">
                      <strong>Fecha:</strong> {new Date(selectedPedido.fecha_registro).toLocaleDateString('es-EC')}
                    </div>
                    <div className="info-row">
                      <strong>Estado:</strong> 
                      <span className={`badge ${getEstadoBadge(selectedPedido.estado)}`}>
                        {selectedPedido.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-table-header">
                    <h3>Productos Solicitados</h3>
                    {canTakeDecision(selectedPedido.estado) && (
                      <button
                        type="button"
                        className="btn-inline-edit"
                        disabled={savingItems}
                        onClick={async () => {
                          if (!isEditingItems) {
                            setIsEditingItems(true)
                            return
                          }

                          const saved = await saveEditedItems()
                          if (saved) setIsEditingItems(false)
                        }}
                        title="Editar productos"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2.5 2.5 0 113.536 3.536L12.536 14.536a2 2 0 01-.878.513L8 16l.951-3.658A2 2 0 019.464 11.464z" />
                        </svg>
                        <span>{savingItems ? 'Guardando...' : (isEditingItems ? 'Listo' : 'Editar')}</span>
                      </button>
                    )}
                  </div>
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                        {isEditingItems && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.suministro}</td>
                          <td>
                            {isEditingItems ? (
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.cantidad}
                                className="item-qty-input"
                                onChange={(e) => handleItemCantidadChange(idx, e.target.value)}
                              />
                            ) : item.cantidad}
                          </td>
                          <td>${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                          <td>${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                          {isEditingItems && (
                            <td>
                              <button
                                type="button"
                                className="btn-inline-delete"
                                onClick={() => handleRemoveItem(idx)}
                                title="Eliminar producto"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
                                  stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M6 7h12M9 7V5h6v2m-8 0l1 12h6l1-12" />
                                </svg>
                                <span>Eliminar</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={isEditingItems ? '4' : '3'} className="text-right"><strong>Total:</strong></td>
                        <td><strong>${parseFloat(selectedPedido.total || 0).toFixed(2)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {/* Botones de acción si el pedido permite decisiones */}
                {canTakeDecision(selectedPedido.estado) && (
                  <div className="modal-footer">
                    <button 
                      onClick={() => {
                        closeDetailModal()
                        handleRejectClick(selectedPedido)
                      }} 
                      className="btn-danger"
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => {
                        closeDetailModal()
                        handleApproveClick(selectedPedido)
                      }} 
                      className="btn-success"
                    >
                      Aprobar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal de aprobación */}
          {showApproveModal && selectedPedido && (
            <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
              <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Confirmar Aprobación</h2>
                  <button onClick={() => setShowApproveModal(false)} className="btn-close">×</button>
                </div>
                <div className="modal-body">
                  <p>¿Estás seguro de aprobar el pedido #{selectedPedido.id_pedido}?</p>
                  <label htmlFor="approveObservations" className="form-label">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    id="approveObservations"
                    value={approvalObservations}
                    onChange={(e) => setApprovalObservations(e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Puedes agregar una observación si lo deseas..."
                  />
                  <p className="text-muted">Esta acción no se puede deshacer.</p>
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowApproveModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={confirmApprove} className="btn-success">
                    Sí, Aprobar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de rechazo */}
          {showRejectModal && selectedPedido && (
            <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
              <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Rechazar Pedido</h2>
                  <button onClick={() => setShowRejectModal(false)} className="btn-close">×</button>
                </div>
                <div className="modal-body">
                  <p>Pedido #{selectedPedido.id_pedido}</p>
                  <label htmlFor="rejectReason" className="form-label">
                    Motivo del rechazo <span className="required">*</span>
                  </label>
                  <textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Ingresa el motivo del rechazo..."
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowRejectModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={confirmReject} className="btn-danger">
                    Rechazar Pedido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (isAdquisiciones) {
      return (
        <div className="aprobaciones-content">
          <h1>Aprobación de Adquisiciones</h1>
          <p className="subtitle">Gestión y validación del flujo de compras y proveedores</p>
          
          <div className="aprobaciones-placeholder">
            <div className="placeholder-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-2.5-9h.01m-7.01 0h.01M9 21h6M16 6l2 2 4-4" />
              </svg>
            </div>
            <h2>Aprobación de Adquisiciones</h2>
            <p>
              En esta sección podrás gestionar el proceso de compras, revisar cotizaciones, 
              validar proveedores y aprobar órdenes de adquisición. Incluye seguimiento del 
              flujo completo desde la solicitud hasta la autorización final.
            </p>
            {user && (
              <div className="user-info">
                <p><strong>Usuario actual:</strong> {user.nombre || user.login}</p>
                <p><strong>Departamento:</strong> {user.departmentName || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="aprobaciones-container">
      <Layout />
      <main 
        className="aprobaciones-main"
        style={{
          marginLeft: isCollapsed ? '70px' : '250px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {renderContent()}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .aprobaciones-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
