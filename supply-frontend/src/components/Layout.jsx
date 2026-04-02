import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { usePermissions } from '../hooks/usePermissions'
import { useWindowSize } from '../hooks/useWindowSize'
import Topbar from './layout/Topbar'
import '../style/Layout.css'

/**
 * Layout unificado: Navbar + Sidebar
 * Maneja todo en un mismo componente para evitar desincronizaciones
 */
export default function Layout({ showLogout = true }) {
  const { user, logout } = useAuth()
  const { isOpen, toggle, close, isCollapsed, toggleCollapse } = useSidebar()
  const { pathname, hash } = useLocation()
  const { rutasPermitidas } = usePermissions()
  const { width } = useWindowSize()
  const navigate = useNavigate()
  const [adminPanelOpen, setAdminPanelOpen] = useState(true)
  const [pedidosPanelOpen, setPedidosPanelOpen] = useState(true)
  const [aprobacionesPanelOpen, setAprobacionesPanelOpen] = useState(true)

  const isConfiguracion = pathname === '/configuracion'
  const isHome = pathname === '/home'
  const isAprobaciones = pathname === '/aprobaciones' || pathname.startsWith('/aprobaciones/')
  const isAprobacionesDefault = pathname === '/aprobaciones'

  const fecha = new Date().toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Función para manejar el hamburger según el tamaño de pantalla
  const handleHamburgerClick = () => {
    if (width < 900) {
      // En mobile, toggle muestra/oculta la sidebar
      toggle()
    } else {
      // En desktop, toggleCollapse expande/colapsa la sidebar
      toggleCollapse()
    }
  }

  // ── Definición de links ────────────────────────────────────
  const allLinks = [
    {
      label: 'Pedidos',
      ruta: '/home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
        </svg>
      ),
    },
    {
      label: 'Reportes',
      ruta: '/reportes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Aprobaciones',
      ruta: '/aprobaciones',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      label: 'Configuración',
      ruta: '/configuracion',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  const links = allLinks.filter(link => rutasPermitidas.includes(link.ruta))

  // Items del Panel Administrativo
  const adminItems = [
    { 
      key: 'dashboard', 
      label: 'Vista General',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    { 
      key: 'users', 
      label: 'Usuarios',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    { 
      key: 'supplies', 
      label: 'Gestión',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline strokeLinecap="round" strokeLinejoin="round" points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line strokeLinecap="round" strokeLinejoin="round" x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
    },
    { 
      key: 'roles', 
      label: 'Roles y Permisos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      ),
    },
  ]

  // Items del Panel de Pedidos
  const pedidosItems = [
    { 
      key: 'mis-pedidos', 
      label: 'Mis Suministros',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
        </svg>
      ),
    },
    { 
      key: 'nuevo-pedido', 
      label: 'Nuevo Suministro',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 4v16m8-8H4"/>
        </svg>
      ),
    },
  ]

  // Items del Panel de Aprobaciones
  const aprobacionesItems = [
    { 
      key: 'pedidos', 
      label: 'Aprobación de Suministros',
      ruta: '/aprobaciones/pedidos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4"/>
        </svg>
      ),
    },
    { 
      key: 'adquisiciones', 
      label: 'Aprobación Adquisiciones',
      ruta: '/aprobaciones/adquisiciones',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-2.5-9h.01m-7.01 0h.01M9 21h6M16 6l2 2 4-4"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      <Topbar
        user={user}
        fecha={fecha}
        showLogout={showLogout}
        onLogout={handleLogout}
        onMenuClick={handleHamburgerClick}
      />

      {/* ════════════════════ SIDEBAR ════════════════════ */}
      {/* Overlay en mobile cuando está abierto */}
      {isOpen && (
        <div
          onClick={toggle}
          className="sidebar-overlay"
        />
      )}

      <aside className={`sidebar-aside ${isOpen ? 'sidebar-open' : 'sidebar-closed'} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingX: '0.75rem', paddingTop: '0.5rem' }}>
          {/* Links normales de navegación */}
          {links.map((link, index) => {
            // Detectar si está activo: ruta exacta o subruta (para Aprobaciones)
            const activo = link.ruta === '/aprobaciones' 
              ? isAprobaciones 
              : pathname === link.ruta
            return (
              <div key={link.ruta}>
                <button
                  onClick={() => {
                    navigate(link.ruta)
                    close()
                  }}
                  title={isCollapsed ? link.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '0.8rem',
                    padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                    marginX: '0.75rem',
                    borderRadius: '0.65rem',
                    border: `1px solid ${activo ? '#d9dbff' : 'transparent'}`,
                    background: activo ? '#eff0ff' : '#ffffff',
                    color: activo ? '#2c2f88' : '#5a5f7b',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.93rem',
                    letterSpacing: '0.3px',
                    fontWeight: activo ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: activo && !isCollapsed ? '3px solid #2c2f88' : '3px solid transparent',
                    paddingLeft: activo && !isCollapsed ? 'calc(1rem - 3px)' : isCollapsed ? '0.75rem' : '1rem',
                    position: 'relative',
                    boxShadow: activo ? '0 4px 10px rgba(44, 47, 136, 0.12)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!activo) {
                      e.currentTarget.style.background = '#f8f9fc'
                      e.currentTarget.style.borderColor = '#e6e8ef'
                      e.currentTarget.style.color = '#2c2f88'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!activo) {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.borderColor = 'transparent'
                      e.currentTarget.style.color = '#5a5f7b'
                    }
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.9rem',
                    height: '1.9rem',
                    borderRadius: '0.55rem',
                    background: activo ? '#2c2f88' : '#edf1f9',
                    color: activo ? '#ffffff' : '#5a5f7b',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}>
                    {link.icon}
                  </span>
                  {!isCollapsed && <span style={{ lineHeight: 1 }}>{link.label}</span>}
                </button>

                {/* Panel de Pedidos - Aparece justo debajo de "Pedidos" */}
                {link.ruta === '/home' && isHome && (
                  <>
                    {!isCollapsed ? (
                      <>
                        <div style={{
                          height: '1px',
                          background: '#e0e2e6',
                          margin: '1.25rem 0.75rem 1rem',
                        }}></div>
                        
                        <div style={{
                          margin: '0 0.75rem',
                          background: '#ffffff',
                          border: '1px solid #e0e2e6',
                          borderRadius: '0.75rem',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                          overflow: 'hidden',
                        }}>
                          <div 
                            onClick={() => setPedidosPanelOpen(!pedidosPanelOpen)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem 0.75rem',
                              cursor: 'pointer',
                              background: '#f5f6f8',
                              borderBottom: pedidosPanelOpen ? '1px solid #e0e2e6' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#eff0ff'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#f5f6f8'
                            }}
                          >
                            <h3 style={{
                              margin: 0,
                              fontSize: '0.82rem',
                              fontFamily: "'Syne', sans-serif",
                              color: '#2c2f88',
                              fontWeight: 700,
                              letterSpacing: '0.2px',
                            }}>Gestión de Pedidos</h3>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              fill="none"
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              strokeWidth={2}
                              style={{
                                color: '#6b7280',
                                transform: pedidosPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>

                          {pedidosPanelOpen && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem',
                              padding: '0.6rem 0.5rem',
                            }}>
                              {pedidosItems.map(item => {
                                const activo = hash === `#${item.key}` || (!hash && item.key === 'nuevo-pedido')
                                return (
                                  <button
                                    key={item.key}
                                    onClick={() => {
                                      navigate(`/home#${item.key}`)
                                      close()
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-start',
                                      gap: '0.6rem',
                                      width: '100%',
                                      padding: '0.6rem 0.75rem',
                                      borderRadius: '0.5rem',
                                      border: 'none',
                                      background: activo ? '#2c2f88' : 'transparent',
                                      color: activo ? '#ffffff' : '#5a5f7b',
                                      fontFamily: "'DM Sans', sans-serif",
                                      fontSize: '0.86rem',
                                      fontWeight: activo ? 600 : 500,
                                      letterSpacing: '0.2px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={e => {
                                      if (!activo) {
                                        e.currentTarget.style.background = '#f5f6f8'
                                        e.currentTarget.style.color = '#2c2f88'
                                      }
                                    }}
                                    onMouseLeave={e => {
                                      if (!activo) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = '#5a5f7b'
                                      }
                                    }}
                                  >
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '1.6rem',
                                      height: '1.6rem',
                                      flexShrink: 0,
                                    }}>
                                      {item.icon}
                                    </span>
                                    <span style={{ lineHeight: 1.3 }}>{item.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                      </>
                    ) : (
                      <>
                        <div style={{
                          height: '1px',
                          background: '#e0e2e6',
                          margin: '1.25rem 0.5rem 1rem',
                        }}></div>
                        
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          padding: '0 0.5rem',
                        }}>
                          {pedidosItems.map(item => {
                            const activo = hash === `#${item.key}` || (!hash && item.key === 'nuevo-pedido')
                            return (
                              <button
                                key={item.key}
                                onClick={() => {
                                  navigate(`/home#${item.key}`)
                                  close()
                                }}
                                title={item.label}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: '40px',
                                  padding: '0.7rem',
                                  borderRadius: '0.6rem',
                                  border: 'none',
                                  background: activo ? '#2c2f88' : 'transparent',
                                  color: activo ? '#ffffff' : '#5a5f7b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                              onMouseEnter={e => {
                                if (!activo) {
                                  e.currentTarget.style.background = '#f5f6f8'
                                  e.currentTarget.style.color = '#2c2f88'
                                }
                              }}
                              onMouseLeave={e => {
                                if (!activo) {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = '#5a5f7b'
                                }
                              }}
                            >
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '1.8rem',
                                height: '1.8rem',
                              }}>
                                {item.icon}
                              </span>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
                {/* Panel de Aprobaciones - Aparece justo debajo de "Aprobaciones" */}
                {link.ruta === '/aprobaciones' && isAprobaciones && (
                  <>
                    {!isCollapsed ? (
                      <>
                        <div style={{
                          height: '1px',
                          background: '#e0e2e6',
                          margin: '1.25rem 0.75rem 1rem',
                        }}></div>
                        
                        <div style={{
                          margin: '0 0.75rem',
                          background: '#ffffff',
                          border: '1px solid #e0e2e6',
                          borderRadius: '0.75rem',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                          overflow: 'hidden',
                        }}>
                          <div 
                            onClick={() => setAprobacionesPanelOpen(!aprobacionesPanelOpen)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem 0.75rem',
                              cursor: 'pointer',
                              background: '#f5f6f8',
                              borderBottom: aprobacionesPanelOpen ? '1px solid #e0e2e6' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#eff0ff'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#f5f6f8'
                            }}
                          >
                            <h3 style={{
                              margin: 0,
                              fontSize: '0.82rem',
                              fontFamily: "'Syne', sans-serif",
                              color: '#2c2f88',
                              fontWeight: 700,
                              letterSpacing: '0.2px',
                            }}>Gestión de Aprobaciones</h3>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              fill="none"
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              strokeWidth={2}
                              style={{
                                color: '#6b7280',
                                transform: aprobacionesPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>

                          {aprobacionesPanelOpen && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem',
                              padding: '0.6rem 0.5rem',
                            }}>
                              {aprobacionesItems.map(item => {
                                const activo = pathname === item.ruta || (isAprobacionesDefault && item.key === 'pedidos')
                                return (
                                  <button
                                    key={item.key}
                                    onClick={() => {
                                      navigate(item.ruta)
                                      close()
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-start',
                                      gap: '0.6rem',
                                      width: '100%',
                                      padding: '0.6rem 0.75rem',
                                      borderRadius: '0.5rem',
                                      border: 'none',
                                      background: activo ? '#2c2f88' : 'transparent',
                                      color: activo ? '#ffffff' : '#5a5f7b',
                                      fontFamily: "'DM Sans', sans-serif",
                                      fontSize: '0.86rem',
                                      fontWeight: activo ? 600 : 500,
                                      letterSpacing: '0.2px',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={e => {
                                      if (!activo) {
                                        e.currentTarget.style.background = '#f5f6f8'
                                        e.currentTarget.style.color = '#2c2f88'
                                      }
                                    }}
                                    onMouseLeave={e => {
                                      if (!activo) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = '#5a5f7b'
                                      }
                                    }}
                                  >
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '1.6rem',
                                      height: '1.6rem',
                                      flexShrink: 0,
                                    }}>
                                      {item.icon}
                                    </span>
                                    <span style={{ lineHeight: 1.3 }}>{item.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                      </>
                    ) : (
                      <>
                        <div style={{
                          height: '1px',
                          background: '#e0e2e6',
                          margin: '1.25rem 0.5rem 1rem',
                        }}></div>
                        
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          padding: '0 0.5rem',
                        }}>
                          {aprobacionesItems.map(item => {
                            const activo = pathname === item.ruta || (isAprobacionesDefault && item.key === 'pedidos')
                            return (
                              <button
                                key={item.key}
                                onClick={() => {
                                  navigate(item.ruta)
                                  close()
                                }}
                                title={item.label}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  minHeight: '40px',
                                  padding: '0.7rem',
                                  borderRadius: '0.6rem',
                                  border: 'none',
                                  background: activo ? '#2c2f88' : 'transparent',
                                  color: activo ? '#ffffff' : '#5a5f7b',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                              onMouseEnter={e => {
                                if (!activo) {
                                  e.currentTarget.style.background = '#f5f6f8'
                                  e.currentTarget.style.color = '#2c2f88'
                                }
                              }}
                              onMouseLeave={e => {
                                if (!activo) {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = '#5a5f7b'
                                }
                              }}
                            >
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '1.8rem',
                                height: '1.8rem',
                              }}>
                                {item.icon}
                              </span>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {/* Panel Administrativo */}
          {isConfiguracion && (
            <>
              {!isCollapsed ? (
                <>
                  <div style={{
                    height: '1px',
                    background: '#e0e2e6',
                    margin: '1.25rem 0.75rem 1rem',
                  }}></div>
                  
                  <div style={{
                    margin: '0 0.75rem',
                    background: '#ffffff',
                    border: '1px solid #e0e2e6',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                  }}>
                    <div 
                      onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0.75rem',
                        cursor: 'pointer',
                        background: '#f5f6f8',
                        borderBottom: adminPanelOpen ? '1px solid #e0e2e6' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#eff0ff'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#f5f6f8'
                      }}
                    >
                      <h3 style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontFamily: "'Syne', sans-serif",
                        color: '#2c2f88',
                        fontWeight: 700,
                        letterSpacing: '0.2px',
                      }}>Panel Admin</h3>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="none"
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2}
                        style={{
                          color: '#6b7280',
                          transform: adminPanelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>

                    {adminPanelOpen && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        padding: '0.6rem 0.5rem',
                      }}>
                        {adminItems.map(item => {
                          const activo = hash === `#${item.key}` || (!hash && item.key === 'dashboard')
                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                navigate(`/configuracion#${item.key}`)
                                close()
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: '0.55rem',
                                width: '100%',
                                padding: '0.6rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: activo ? '#2c2f88' : 'transparent',
                                color: activo ? '#ffffff' : '#5a5f7b',
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '0.86rem',
                                fontWeight: activo ? 600 : 500,
                                letterSpacing: '0.2px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                              }}
                              onMouseEnter={e => {
                                if (!activo) {
                                  e.currentTarget.style.background = '#f5f6f8'
                                  e.currentTarget.style.color = '#2c2f88'
                                }
                              }}
                              onMouseLeave={e => {
                                if (!activo) {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = '#5a5f7b'
                                }
                              }}
                            >
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '1.6rem',
                                height: '1.6rem',
                                flexShrink: 0,
                              }}>
                                {item.icon}
                              </span>
                              <span style={{ lineHeight: 1.3 }}>{item.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    height: '1px',
                    background: '#e0e2e6',
                    margin: '1.25rem 0.5rem 1rem',
                  }}></div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    padding: '0 0.5rem',
                  }}>
                    {adminItems.map(item => {
                      const activo = hash === `#${item.key}` || (!hash && item.key === 'dashboard')
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            navigate(`/configuracion#${item.key}`)
                            close()
                          }}
                          title={item.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            minHeight: '40px',
                            padding: '0.7rem',
                            borderRadius: '0.6rem',
                            border: 'none',
                            background: activo ? '#2c2f88' : 'transparent',
                            color: activo ? '#ffffff' : '#5a5f7b',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        onMouseEnter={e => {
                          if (!activo) {
                            e.currentTarget.style.background = '#f5f6f8'
                            e.currentTarget.style.color = '#2c2f88'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!activo) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = '#5a5f7b'
                          }
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '1.8rem',
                          height: '1.8rem',
                        }}>
                          {item.icon}
                        </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </nav>
        <div className="sidebar-version" title="Versión del sistema">
          {isCollapsed ? 'v1.0.1' : 'Versión v1.0.1'}
        </div>
      </aside>
    </>
  )
}
