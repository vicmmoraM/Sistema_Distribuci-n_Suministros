import axios from 'axios'

let apiErrorHandler = null

export function setApiErrorHandler(handler) {
  apiErrorHandler = handler
}

const api = axios.create({
  baseURL: '/api',
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