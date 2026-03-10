import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { normalizeUser } from '../features/auth/utils/normalizeUser'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Al montar, verificar si hay sesión activa en el backend
  useEffect(() => {
    const controller = new AbortController()

    api.get('/auth/me', { signal: controller.signal })
      .then(res => {
        const rawUser = res.data?.user ?? res.data
        setUser(normalizeUser(rawUser))
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)