import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'

/**
 * Navbar superior con logo, título, usuario y botón de logout
 * Los links de navegación están en el Sidebar
 */
export default function Navbar({ showLogout = true }) {
  const { user, logout } = useAuth()
  const { toggle } = useSidebar()
  const navigate = useNavigate()

  const fecha = new Date().toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="main-navbar">
      {/* ── Botón Hamburguesa (solo mobile) ─── */}
      <button onClick={toggle} className="hamburger-btn" aria-label="Menú">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
          stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Marca ─────────────────────────────── */}
      <div className="navbar-brand">
        <div className="navbar-logo">
          <img src="images/LOGO FC SINTETIZADO FONDO BLANCO.jpg" alt="FarmCorp Logo" />
        </div>
        <div className="navbar-title">
          <h1>Solicitud de Suministros</h1>
          <p>Sistema de Distribución de Suministros</p>
        </div>
      </div>

      {/* ── Espaciador ────────────────────────── */}
      <div style={{ flex: 1 }}></div>

      {/* ── Usuario + Logout ──────────────────── */}
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

      <style jsx>{`
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
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: #1f2937;
          flex-shrink: 0;
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

        @media (max-width: 768px) {
          .main-navbar {
            padding: 0.5rem 1rem;
            min-height: 60px;
          }

          .hamburger-btn {
            display: flex;
          }

          .navbar-logo {
            height: 32px;
          }

          .navbar-logo img {
            height: 32px;
          }

          .navbar-title h1 {
            font-size: 0.85rem;
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
        }
      `}</style>
    </header>
  )
}
