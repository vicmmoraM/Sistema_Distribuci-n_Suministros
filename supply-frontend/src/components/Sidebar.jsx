import { useNavigate, useLocation } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'

/**
 * Sidebar de navegación responsive
 */
export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen, close } = useSidebar()

  // ── Definición de links ────────────────────────────────────
  const links = [
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
        width: '250px',
        height: 'calc(100vh - 80px)',
        background: '#f8f9fa',
        borderRight: '1px solid #e5e7eb',
        padding: '1.5rem 0',
        overflowY: 'auto',
        zIndex: 20,
        transition: 'transform 0.3s ease',
        transform: 'translateX(0)',
      }}
        className="sidebar-aside"
      >
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
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
                  borderLeft: activo ? '3px solid #1b3a6b' : '3px solid transparent',
                  paddingLeft: activo ? 'calc(1rem - 3px)' : '1rem',
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
                <span>{link.label}</span>
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
            transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }

          .sidebar-overlay {
            display: block !important;
            top: 60px !important;
            height: calc(100vh - 60px) !important;
          }
        }
      `}</style>
    </>
  )
}
