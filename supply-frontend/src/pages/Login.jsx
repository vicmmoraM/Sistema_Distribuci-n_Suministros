// src/pages/Login.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './Login.css'

// Iconos SVG inline
const BuildingIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const UserIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LockIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [departamentos, setDepartamentos] = useState([])
  const [form, setForm] = useState({ username: '', password: '', departmentId: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/home', { replace: true })
  }, [user])

  useEffect(() => {
    api.get('/catalogos/departamentos')
      .then(res => setDepartamentos(res.data))
      .catch(() => setError('No se pudo cargar la lista de departamentos.'))
  }, [])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.departmentId) { setError('Selecciona tu departamento.'); return }
    setLoading(true)
    try {
      await login(form.username, form.password, form.departmentId)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Error de autenticación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">

        {/* Logo Superior */}
        <div className="login-header flex flex-col items-center mb-6">
          <div className="login-logo-container mb-4">
            <img
              src="images/LOGO_OFICIAL_FC_COMPLETO.png" // Asegúrate de que la imagen esté en la carpeta public
              alt="FarmCorp Logo"
              className="h-16 w-auto object-contain transition-transform hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/100x100?text=FC'; // Imagen de respaldo si falla
              }}
            />
          </div>
          <div className="login-brand text-center">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sistema de Suministros</h1>
          </div>
        </div>

        {/* Card Principal */}
        <div className="login-card">

          {/* Título */}
          <div className="login-title">
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales corporativas para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            {/* Usuario */}
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <UserIcon />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="nombre.apellido"
                  required
                  autoComplete="username"
                  className="form-input"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="form-input"
                />
              </div>
            </div>

            {/* Departamento */}
            <div className="form-group">
              <label htmlFor="departmentId">Departamento</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <BuildingIcon />
                </div>
                <select
                  id="departmentId"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  required
                  className="form-select">
                  <option value="">Seleccionar departamento...</option>
                  {departamentos.map(d => (
                    <option key={d.codigo} value={d.codigo}>{d.descripcion}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-alert">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={loading}
              className="login-button">
              {loading ? (
                <>
                  <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
          </div>
        </div>
      </div>
    </div>
  )
}