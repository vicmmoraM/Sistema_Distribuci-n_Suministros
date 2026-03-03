// src/pages/Configuracion.jsx
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import '../style/Configuracion.css'

/**
 * Panel de configuración (solo para Tecnología)
 * Placeholder para futuras funcionalidades de administración
 */
export default function Configuracion() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()

  return (
    <div className="configuracion-container">
      <Navbar />
      <Sidebar />
      <main 
        className="configuracion-main"
        style={{
          marginLeft: isCollapsed ? '70px' : '250px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <div className="configuracion-content">
          <h1>Configuración del Sistema</h1>
          <p className="subtitle">Panel de administración (solo para Tecnología)</p>
          
          <div className="config-placeholder">
            <div className="placeholder-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2>Sección en desarrollo</h2>
            <p>
              Esta sección estará disponible próximamente para gestionar usuarios, roles, 
              permisos y otras configuraciones del sistema.
            </p>
            {user && (
              <div className="user-info">
                <p><strong>Usuario actual:</strong> {user.nombre || user.login}</p>
                <p><strong>Departamento:</strong> {user.departmentName || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .configuracion-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}