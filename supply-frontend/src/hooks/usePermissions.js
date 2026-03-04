// src/hooks/usePermissions.js
import { useAuth } from '../context/AuthContext'

/**
 * Normaliza un string removiendo tildes para comparación
 */
function normalizarString(str) {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes
}

const PERMISOS_VACIOS = {
  pedidos: true,
  reportes: false,
  aprobacion: false,
  configuracion: false,
}

/**
 * Mapeo de permisos a rutas
 */
const RUTAS_POR_PERMISO = {
  pedidos: '/home',
  reportes: '/reportes',
  aprobacion: '/aprobaciones',
  configuracion: '/configuracion',
}

/**
 * Devuelve los permisos del usuario autenticado.
 *
 * Uso:
 *   const { puede, rutasPermitidas } = usePermissions()
 *   puede.reportes   // true/false
 *   rutasPermitidas  // ['/home', '/reportes', ...]
 */
export function usePermissions() {
  const { user } = useAuth()

  if (!user) {
    return { 
      puede: PERMISOS_VACIOS, 
      nombreDepto: '', 
      esComercial: false,
      rutasPermitidas: []
    }
  }

  // El departamento puede venir como nombre (departmentName) o como objeto
  // Normaliza para match flexible (sin tildes)
  const nombreDepto = normalizarString(
    user.departmentName ||
    user.departamento   ||
    user.department     ||
    ''
  )

  const puede = {
    ...PERMISOS_VACIOS,
    ...(user.permissions || {}),
  }
  const esComercial = nombreDepto === 'comercial'

  // Generar lista de rutas permitidas basándose en los permisos
  const rutasPermitidas = Object.keys(puede)
    .filter(permiso => puede[permiso] === true)
    .map(permiso => RUTAS_POR_PERMISO[permiso])
    .filter(Boolean)

  return { puede, nombreDepto, esComercial, rutasPermitidas }
}
