import axios from 'axios'

let apiErrorHandler = null

export function setApiErrorHandler(handler) {
  apiErrorHandler = handler
}

// Configurar si tomamos la IP quemada en el build de Docker o la ruta local '/api'
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // necesario para enviar cookies de sesión
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof apiErrorHandler === 'function') {
      apiErrorHandler(error)
    }
    return Promise.reject(error)
  }
)

export default api