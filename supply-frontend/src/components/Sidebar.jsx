import { useNavigate, useLocation } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import { usePermissions } from '../hooks/usePermissions'

/**
 * Sidebar de navegación responsive con filtrado por permisos
 */
export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen, close, isCollapsed, toggleCollapse } = useSidebar()
  const { rutasPermitidas } = usePermissions()

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

  // Filtrar links basándose en los permisos del usuario
  const links = allLinks.filter(link => rutasPermitidas.includes(link.ruta))

  return (
    <>
      {/* Overlay en mobile cuando está abierto */}
      {isOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 19,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside style={{
        position: 'fixed',
        left: 0,
        top: 80, // Altura del navbar
        width: isCollapsed ? '70px' : '250px',
        height: 'calc(100vh - 80px)',
        background: '#f8f9fa',
        borderRight: '1px solid #e5e7eb',
        padding: '1.5rem 0',
        overflowY: 'auto',
        zIndex: 20,
        transition: 'all 0.3s ease',
        transform: 'translateX(0)',
      }}
        className="sidebar-aside"
      >
        {/* Botón para colapsar/expandir */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className="sidebar-collapse-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            margin: isCollapsed ? '0 auto 1.5rem' : '0 0.75rem 1.5rem auto',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            background: 'white',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.color = '#1b3a6b'
            e.currentTarget.style.borderColor = '#1b3a6b'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = '#6b7280'
            e.currentTarget.style.borderColor = '#e5e7eb'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
            stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
            style={{
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 19l-7-7 7-7M4 12h16" />
          </svg>
        </button>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingX: '0.75rem' }}>
          {links.map(link => {
            const activo = pathname === link.ruta
            return (
              <button
                key={link.ruta}
                onClick={() => {
                  navigate(link.ruta)
                  close() // Cierra el sidebar en mobile al navegar
                }}
                title={isCollapsed ? link.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '0.75rem',
                  padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                  marginX: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: activo ? '#e8edf5' : 'transparent',
                  color: activo ? '#1b3a6b' : '#4b5563',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: activo ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: activo && !isCollapsed ? '3px solid #1b3a6b' : '3px solid transparent',
                  paddingLeft: activo && !isCollapsed ? 'calc(1rem - 3px)' : isCollapsed ? '0.75rem' : '1rem',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!activo) {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.color = '#1f2937'
                  }
                }}
                onMouseLeave={e => {
                  if (!activo) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#4b5563'
                  }
                }}
              >
                {link.icon}
                {!isCollapsed && <span>{link.label}</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex !important;
          }

          .sidebar-aside {
            top: 60px !important;
            height: calc(100vh - 60px) !important;
            width: 250px !important;
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }

          .sidebar-overlay {
            display: block !important;
            top: 60px !important;
            height: calc(100vh - 60px) !important;
          }

          .sidebar-collapse-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
