/**
 * Middleware requireAuth
 * Verifica que el usuario tenga sesión activa antes de continuar.
 * Comprueba tanto loggedin como userlogin para mayor seguridad.
 * Si no hay sesión válida, responde 401 y corta la cadena.
 */
const requireAuth = (req, res, next) => {
  try {
    if (!req.session || !req.session.loggedin || !req.session.userlogin) {
      return res.status(401).json({ error: 'Sesión no válida o expirada.' })
    }
    next()
  } catch (err) {
    console.error('Error en middleware de autenticación:', err.message)
    return res.status(500).json({ error: 'Error interno de autenticación.' })
  }
}

module.exports = { requireAuth }