import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { usePermissions } from '../hooks/usePermissions'

/**
 * Layout unificado: Navbar + Sidebar
 * Maneja todo en un mismo componente para evitar desincronizaciones
 */
export default function Layout({ showLogout = true }) {
  const { user, logout } = useAuth()
  const { isOpen, toggle, close, isCollapsed, toggleCollapse } = useSidebar()
  const { pathname, hash } = useLocation()
  const { rutasPermitidas } = usePermissions()
  const navigate = useNavigate()
  const [adminPanelOpen, setAdminPanelOpen] = useState(true)
  const [pedidosPanelOpen, setPedidosPanelOpen] = useState(true)

  const isConfiguracion = pathname === '/configuracion'
  const isHome = pathname === '/home'

  const fecha = new Date().toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Función para manejar el hamburger según el tamaño de pantalla
  const handleHamburgerClick = () => {
    if (window.innerWidth < 900) {
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
      label: 'Suministros',
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
      label: 'Mis Pedidos',
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
      label: 'Nuevo Pedido',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 4v16m8-8H4"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* ════════════════════ NAVBAR ════════════════════ */}
      <header className="main-navbar">
        {/* ── Botón Hamburguesa ─── */}
        <button onClick={handleHamburgerClick} className="hamburger-btn" aria-label="Menú">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
            stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* ── Marca ─── */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <img src="images/LOGO FC SINTETIZADO FONDO BLANCO.jpg" alt="FarmCorp Logo" />
          </div>
          <div className="navbar-title">
            <h1>Solicitud de Suministros</h1>
            <p>Sistema de Distribución de Suministros</p>
          </div>
        </div>

        {/* ── Espaciador ─── */}
        <div style={{ flex: 1 }}></div>

        {/* ── Usuario + Logout ─── */}
        <div className="navbar-actions">
          <div className="navbar-user">
            <p className="user-name">Bienvenido, {user?.nombre}</p>
            <p className="user-date">{fecha}</p>
          </div>

          {showLogout && (
            <button onClick={handleLogout} className="logout-btn">
              Cerrar Sesión
            </button>
          )}
        </div>
      </header>

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
            const activo = pathname === link.ruta
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
      </aside>
      

      
      <style>{`
        /* ════════ NAVBAR STYLES ════════ */
        .main-navbar {
          position: sticky;
          top: 0;
          z-index: 30;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          border-bottom: 2px solid #e5e7eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          gap: 1rem;
          min-height: 80px;
        }

        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f6f8;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #2c2f88;
          flex-shrink: 0;
          transition: all 0.2s ease;
          border-radius: 0.5rem;
        }

        .hamburger-btn:hover {
          color: #2c2f88;
          background: #eff0ff;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .navbar-logo {
          height: 40px;
          display: flex;
          align-items: center;
        }

        .navbar-logo img {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .navbar-title h1 {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.3;
        }

        .navbar-title p {
          font-size: 0.7rem;
          color: #6b7280;
          margin: 0;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .navbar-user {
          text-align: right;
        }

        .user-name {
          font-size: 0.813rem;
          font-weight: 500;
          color: #1f2937;
          margin: 0;
        }

        .user-date {
          font-size: 0.7rem;
          color: #6b7280;
          margin: 0;
        }

        .logout-btn {
          padding: 0.4rem 0.9rem;
          border-radius: 0.375rem;
          font-size: 0.813rem;
          font-weight: 500;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .logout-btn:hover {
          background: #ff2c2ca1;
          border-color: #FF2C2C;
          color: white;
        }

        /* ════════ SIDEBAR STYLES ════════ */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 19;
          display: none;
          top: 80px;
          height: calc(100vh - 80px);
        }

        .sidebar-aside {
          position: fixed;
          left: 0;
          top: 80px;
          width: 250px;
          height: calc(100vh - 80px);
          background: #ffffff;
          border-right: 1px solid #e0e2e6;
          padding: 1.5rem 0.5rem;
          overflow-y: auto;
          z-index: 20;
          transition: width 0.3s ease, transform 0.3s ease;
        }

        .sidebar-collapsed {
          width: 75px;
          padding: 1.5rem 0.25rem;
        }

        /* ════════ RESPONSIVE ════════ */
        @media (max-width: 1024px) {
          .main-navbar {
            padding: 0.65rem 1.25rem;
            min-height: 70px;
            gap: 0.75rem;
          }

          .navbar-logo {
            height: 36px;
          }

          .navbar-logo img {
            height: 36px;
          }

          .navbar-title h1 {
            font-size: 0.9rem;
          }

          .navbar-title p {
            font-size: 0.68rem;
          }

          .user-name {
            font-size: 0.75rem;
          }

          .user-date {
            font-size: 0.65rem;
          }

          .logout-btn {
            padding: 0.35rem 0.8rem;
            font-size: 0.75rem;
          }

          .sidebar-aside {
            top: 70px;
            height: calc(100vh - 70px);
          }

          .sidebar-overlay {
            top: 70px;
            height: calc(100vh - 70px);
          }
        }

        @media (max-width: 900px) {
          .navbar-title p {
            display: none;
          }

          .user-date {
            display: none;
          }

          .navbar-actions {
            gap: 0.75rem;
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar-aside {
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }

          .sidebar-closed {
            transform: translateX(-100%);
          }

          .sidebar-open {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .main-navbar {
            padding: 0.5rem 1rem;
            min-height: 60px;
            gap: 0.5rem;
          }

          .navbar-brand {
            gap: 0.5rem;
          }

          .navbar-logo {
            height: 32px;
          }

          .navbar-logo img {
            height: 32px;
          }

          .navbar-title h1 {
            font-size: 0.8rem;
          }

          .navbar-title p {
            display: none;
          }

          .navbar-user {
            display: none;
          }

          .logout-btn {
            padding: 0.35rem 0.7rem;
            font-size: 0.75rem;
          }

          .sidebar-aside {
            top: 60px;
            height: calc(100vh - 60px);
            padding: 1rem 0;
          }

          .sidebar-overlay {
            display: block;
            top: 60px;
            height: calc(100vh - 60px);
          }
        }

        @media (max-width: 480px) {
          .main-navbar {
            padding: 0.4rem 0.75rem;
            min-height: 56px;
            gap: 0.4rem;
          }

          .navbar-brand {
            gap: 0.4rem;
          }

          .navbar-logo {
            height: 28px;
          }

          .navbar-logo img {
            height: 28px;
          }

          .navbar-title h1 {
            font-size: 0.72rem;
          }

          .logout-btn {
            padding: 0.3rem 0.6rem;
            font-size: 0.7rem;
          }

          .hamburger-btn {
            padding: 0.35rem;
          }

          .hamburger-btn svg {
            width: 20px;
            height: 20px;
          }

          .sidebar-aside {
            top: 56px;
            height: calc(100vh - 56px);
            width: 220px;
            padding: 0.75rem 0;
          }

          .sidebar-overlay {
            top: 56px;
            height: calc(100vh - 56px);
          }
        }

        @media (max-width: 360px) {
          .main-navbar {
            padding: 0.4rem 0.5rem;
          }

          .navbar-title h1 {
            font-size: 0.65rem;
          }

          .logout-btn {
            padding: 0.25rem 0.5rem;
            font-size: 0.65rem;
          }

          .sidebar-aside {
            width: 200px;
          }
        }
      `}</style>
    </>
  )
}
