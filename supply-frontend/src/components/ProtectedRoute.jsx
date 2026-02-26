// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../hooks/usePermissions'

/**
 * Protege una ruta verificando:
 *  1. Que el usuario esté autenticado
 *  2. (Opcional) Que tenga el permiso requerido
 *
 * Props:
 *   children      {ReactNode}
 *   requiredPerm  {string}   clave de permiso: 'pedidos' | 'reportes' | 'aprobacion' | 'catalogos'
 *
 * Ejemplos:
 *   <ProtectedRoute><Home /></ProtectedRoute>
 *   <ProtectedRoute requiredPerm="reportes"><Reportes /></ProtectedRoute>
 *   <ProtectedRoute requiredPerm="aprobacion"><Aprobaciones /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, requiredPerm }) {
  const { user, loading } = useAuth()
  const { puede } = usePermissions()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 rounded-full animate-spin"
          style={{
            borderColor: 'var(--fc-green-light)',
            borderTopColor: 'var(--fc-green)',
          }}
        />
      </div>
    )
  }

  // No autenticado → login
  if (!user) return <Navigate to="/login" replace />

  // Sin permiso → home (o podrías redirigir a una página de "acceso denegado")
  if (requiredPerm && !puede[requiredPerm]) {
    return <Navigate to="/home" replace />
  }

  return children
}
