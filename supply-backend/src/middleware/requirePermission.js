const { pool } = require('../config/db');

function requirePermission(permissionCode) {
  return async (req, res, next) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: 'Sesion no valida o expirada.' });
      }

      const [rows] = await pool.query(
        `SELECT 1
         FROM v_rol_permisos vrp
         INNER JOIN usuarios u ON u.id_rol = vrp.id_rol
         WHERE u.id_usuario = ?
           AND vrp.permiso = ?
         LIMIT 1`,
        [req.session.userId, permissionCode]
      );

      if (!rows.length) {
        return res.status(403).json({
          error: `No tienes el permiso requerido: ${permissionCode}`,
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ error: 'Error validando permisos dinamicos.' });
    }
  };
}

module.exports = { requirePermission };
