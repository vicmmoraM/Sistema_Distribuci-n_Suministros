// Endpoints de dolo lectura para poblar dropdowns y catálogos

const express = require('express');
const router  = express.Router();
const { pool } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/catalogos/departamentos
 * Lista todos los departamentos (para el combo de login).
 * No requiere auth — se usa antes de iniciar sesión.
 */
router.get('/departamentos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT codigo, descripcion FROM departamentos ORDER BY descripcion');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener departamentos.' });
  }
});

/**
 * GET /api/catalogos/pdvs
 * Lista los Puntos de Venta activos con su cupo.
 */
router.get('/pdvs', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.codigo,
        p.descripcion,
        p.direccion,
        c.descripcion AS ciudad,
        gp.monto_autorizado AS cupo
      FROM pdvs p
      INNER JOIN ciudades c      ON p.ciudad    = c.codigo
      INNER JOIN grupo_pdvs gp   ON p.grupo_pdv = gp.codigo
      WHERE p.estado_pdv = 1
      ORDER BY p.descripcion
    `);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener PDVs.' });
  }
});

/**
 * GET /api/catalogos/tipo-suministros
 * Lista todos los tipos de suministro.
 */
router.get('/tipo-suministros', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT codigo, descripcion FROM tipo_suministros ORDER BY descripcion');
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener tipos de suministro.' });
  }
});

/**
 * GET /api/catalogos/suministros?tipo=1
 * Lista suministros filtrados por tipo.
 */
router.get('/suministros', requireAuth, async (req, res) => {
  const { tipo } = req.query;

  if (!tipo) {
    return res.status(400).json({ error: 'El parámetro "tipo" es requerido.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT codigo, descripcion, precio FROM suministros WHERE tipo_suministro = ? ORDER BY descripcion',
      [tipo]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener suministros.' });
  }
});

module.exports = router;