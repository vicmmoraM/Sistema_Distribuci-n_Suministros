import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // necesario para enviar cookies de sesión
  headers: { 'Content-Type': 'application/json' },
})

export default api