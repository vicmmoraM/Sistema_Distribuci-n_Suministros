// src/pages/Notificacion.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Notificacion() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { logout } = useAuth()

  const mensaje      = state?.mensaje      || 'Su requerimiento ha sido procesado.'
  const emailEnviado = state?.emailEnviado ?? true

  const handleLogout = async () => { await logout(); navigate('/login') }
  const handleNuevo  = () => navigate('/home')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--fc-gray-50)' }}>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--fc-green-dark)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--fc-accent)' }}>
            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne' }}>FC</span>
          </div>
          <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Syne' }}>FarmCorp</span>
        </div>
        <button onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
          Cerrar Sesión
        </button>
      </header>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center anim-fade-up"
          style={{ border: '1px solid var(--fc-gray-200)' }}>

          {/* Icono */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: emailEnviado ? 'var(--fc-green-light)' : '#fff7ed' }}>
            <span className="text-3xl">{emailEnviado ? '✓' : '⚠'}</span>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne', color: 'var(--fc-gray-900)' }}>
            {emailEnviado ? '¡Pedido enviado!' : 'Pedido registrado'}
          </h2>

          <p className="text-sm mb-8" style={{ color: 'var(--fc-gray-500)' }}>
            {mensaje}
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleNuevo}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--fc-green)' }}>
              Nuevo pedido
            </button>
            <button onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--fc-gray-100)', color: 'var(--fc-gray-700)' }}>
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}