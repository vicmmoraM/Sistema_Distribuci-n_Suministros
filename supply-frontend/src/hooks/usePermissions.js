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

/**
 * Mapeo de permisos por departamento (sin tildes para match flexible)
 *
 * Secciones:
 *  - pedidos      → crear pedidos (Home)
 *  - reportes     → ver reportes
 *  - aprobacion   → panel de aprobación
 *  - configuracion    → configuración / admin
 */
const PERMISOS_POR_DEPARTAMENTO = {
  'administracion':  { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'auditoria':       { pedidos: true,  reportes: true,  aprobacion: false, configuracion: false },
  'comercial':       { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'contabilidad':    { pedidos: true,  reportes: true,  aprobacion: false, configuracion: false },
  'directorio':      { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'financiero':      { pedidos: true,  reportes: true,  aprobacion: true,  configuracion: false },
  'mantenimiento':   { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'procesos bi':     { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'supply chain':    { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'talento humano':  { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'tecnologia':      { pedidos: true,  reportes: true,  aprobacion: true,  configuracion: true  },
  'tesoreria':       { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
  'trade marketing': { pedidos: true,  reportes: false, aprobacion: false, configuracion: false },
}

const PERMISOS_VACIOS = {
  pedidos: false,
  reportes: false,
  aprobacion: false,
  configuracion: false,
}

/**
 * Devuelve los permisos del usuario autenticado.
 *
 * Uso:
 *   const { puede } = usePermissions()
 *   puede.reportes   // true/false
 *   puede.configuracion  // true/false
 */
export function usePermissions() {
  const { user } = useAuth()

  if (!user) return { puede: PERMISOS_VACIOS }

  // El departamento puede venir como nombre (departmentName) o como objeto
  // Normaliza para match flexible (sin tildes)
  const nombreDepto = normalizarString(
    user.departmentName ||
    user.departamento   ||
    user.department     ||
    ''
  )

  console.log('DEBUG - User object:', user)
  console.log('DEBUG - nombreDepto (normalizado):', nombreDepto)
  console.log('DEBUG - Permisos disponibles:', Object.keys(PERMISOS_POR_DEPARTAMENTO))

  const puede = PERMISOS_POR_DEPARTAMENTO[nombreDepto] ?? PERMISOS_VACIOS

  console.log('DEBUG - Permisos asignados:', puede)

  return { puede, nombreDepto }
}
