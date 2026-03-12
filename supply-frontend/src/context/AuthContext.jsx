import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { normalizeUser } from '../features/auth/utils/normalizeUser'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async (signal) => {
    const res = await api.get('/auth/me', signal ? { signal } : undefined)
    const rawUser = res.data?.user ?? res.data
    const normalizedUser = normalizeUser(rawUser)
    setUser(normalizedUser)
    return normalizedUser
  }, [])

  // Al montar, verificar si hay sesión activa en el backend
  useEffect(() => {
    const controller = new AbortController()

    refreshUser(controller.signal)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [refreshUser])

  const login = async (username, password, departmentId) => {
    const res = await api.post('/auth/login', { username, password, departmentId })
    setUser(normalizeUser(res.data?.user))
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)