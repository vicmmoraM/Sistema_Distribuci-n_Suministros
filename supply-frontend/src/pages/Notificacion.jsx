// src/pages/Notificacion.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
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

      <Navbar />
      <Sidebar />

      <main className="notif-body" style={{ marginLeft: 250 }}>
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