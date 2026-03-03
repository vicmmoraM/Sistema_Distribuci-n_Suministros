// src/pages/Aprobaciones.jsx
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import '../style/Aprobaciones.css'

/**
 * Panel de aprobaciones (solo para Financiero y Tecnología)
 * Placeholder para futuras funcionalidades de aprobación de pedidos
 */
export default function Aprobaciones() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()

  return (
    <div className="aprobaciones-container">
      <Navbar />
      <Sidebar />
      <main 
        className="aprobaciones-main"
        style={{
          marginLeft: isCollapsed ? '70px' : '250px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <div className="aprobaciones-content">
          <h1>Aprobaciones de Pedidos</h1>
          <p className="subtitle">Panel de aprobación y revisión (Financiero y Tecnología)</p>
          
          <div className="aprobaciones-placeholder">
            <div className="placeholder-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none"
                stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2>Sección en desarrollo</h2>
            <p>
              Esta sección estará disponible próximamente para aprobar o rechazar pedidos 
              pendientes, revisar solicitudes y gestionar el flujo de aprobación.
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
          .aprobaciones-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
