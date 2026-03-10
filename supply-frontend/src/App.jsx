// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import { DataRefreshProvider } from './context/DataRefreshContext'
import { UIFeedbackProvider } from './context/UIFeedbackContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Notificacion from './pages/Notificacion'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'
import Aprobaciones from './pages/Aprobaciones'
// Importa estas páginas cuando las tengas creadas:
// import Catalogos from './pages/Catalogos'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIFeedbackProvider>
          <DataRefreshProvider>
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
              <Aprobaciones />
            </ProtectedRoute>
          } />
          <Route path="/aprobaciones/pedidos" element={
            <ProtectedRoute requiredPerm="aprobacion">
              <Aprobaciones />
            </ProtectedRoute>
          } />
          <Route path="/aprobaciones/adquisiciones" element={
            <ProtectedRoute requiredPerm="aprobacion">
              <Aprobaciones />
            </ProtectedRoute>
          } />

          {/* Solo Tecnología */}
          <Route path="/configuracion" element={
            <ProtectedRoute requiredPerm="configuracion">
              <Configuracion />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </SidebarProvider>
          </DataRefreshProvider>
        </UIFeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
