// src/pages/Notificacion.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Notificacion.css'

export default function Notificacion() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { logout } = useAuth()

  const mensaje      = state?.mensaje      || 'Su requerimiento ha sido procesado.'
  const emailEnviado = state?.emailEnviado ?? true

  const handleLogout = async () => { await logout(); navigate('/login') }
  const handleNuevo  = () => navigate('/home')

  return (
    <div className="notif-page">

      {/* ── Header — idéntico al de Home ─────── */}
      <header className="notif-header">
        <div className="notif-header__brand">
          <div className="notif-header__logo">
            <img
              src="images/LOGO FC SINTETIZADO FONDO BLANCO.jpg"
              alt="FarmCorp Logo"
            />
          </div>
          <div className="notif-header__brand-text">
            <h1>Solicitud de Suministros</h1>
            <p>Sistema de Distribución de Suministros</p>
          </div>
        </div>
        <button className="notif-header__logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      {/* ── Contenido central ───────────────── */}
      <main className="notif-body">
        <div className="notif-card anim-fade-up">

          {/* Ícono check */}
          <div className="notif-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="notif-title">¡Pedido registrado!</h2>
          <p className="notif-message">{mensaje}</p>

          {/* Aviso si el email falló */}
          {!emailEnviado && (
            <div className="notif-warning">
              <p className="notif-warning__text">
                El correo de notificación no pudo enviarse, pero el pedido quedó guardado correctamente.
              </p>
            </div>
          )}

          <div className="notif-actions">
            <button className="notif-btn notif-btn--primary" onClick={handleNuevo}>
              Nuevo pedido
            </button>
            <button className="notif-btn notif-btn--secondary" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>

        </div>
      </main>

    </div>
  )
}