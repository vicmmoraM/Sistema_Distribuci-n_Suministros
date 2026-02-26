// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Home from './pages/Home'
import Notificacion from './pages/Notificacion'
import Reportes from './pages/Reportes'
// Importa estas páginas cuando las tengas creadas:
// import Aprobaciones from './pages/Aprobaciones'
// import Catalogos from './pages/Catalogos'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Todos los usuarios autenticados */}
          <Route path="/home" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/notificacion" element={
            <ProtectedRoute><Notificacion /></ProtectedRoute>
          } />

          {/* Solo Contabilidad, Financiero, Auditoría, Tecnología */}
          <Route path="/reportes" element={
            <ProtectedRoute requiredPerm="reportes"><Reportes /></ProtectedRoute>
          } />

          {/* Solo Financiero, Tecnología */}
          <Route path="/aprobaciones" element={
            <ProtectedRoute requiredPerm="aprobacion">
              <>
                <Navbar />
                <Sidebar />
                <div style={{ marginLeft: 250, padding: '2rem' }}>No disponible :( </div>
              </>
            </ProtectedRoute>
          } />

          {/* Solo Tecnología */}
          <Route path="/configuracion" element={
            <ProtectedRoute requiredPerm="configuracion">
              <>
                <Navbar />
                <Sidebar />
                <div style={{ marginLeft: 250, padding: '2rem' }}>No disponible :(</div>
              </>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
