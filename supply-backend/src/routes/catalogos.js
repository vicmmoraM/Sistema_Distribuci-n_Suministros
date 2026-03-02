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
    const [rows] = await pool.query('SELECT id_departamento, descripcion FROM departamentos ORDER BY descripcion');
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
        p.id_pdv,
        p.descripcion,
        p.direccion,
        z.zona AS ciudad,
        gp.monto_autorizado AS cupo
      FROM pdvs p
      INNER JOIN zonas_comerciales z ON p.id_zona_comercial = z.id_zona_comercial
      INNER JOIN grupo_pdvs gp       ON p.id_grupo_pdv = gp.id_grupo_pdv
      WHERE p.id_estado_pdv = 1
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
    const [rows] = await pool.query(`
      SELECT
        MIN(ts.id_tipo_suministro) AS id_tipo_suministro,
        ts.descripcion
      FROM tipo_suministros ts
      INNER JOIN suministros s ON s.id_tipo_suministro = ts.id_tipo_suministro
      GROUP BY ts.descripcion
      ORDER BY ts.descripcion
    `);
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
      `SELECT
        s.id_suministro,
        s.descripcion,
        COALESCE(MIN(sp.precio_compra), 0) AS precio
      FROM suministros s
      INNER JOIN tipo_suministros ts ON ts.id_tipo_suministro = s.id_tipo_suministro
      LEFT JOIN suministros_precios sp ON sp.id_suministro = s.id_suministro
      WHERE ts.descripcion = (
        SELECT descripcion
        FROM tipo_suministros
        WHERE id_tipo_suministro = ?
        LIMIT 1
      )
      GROUP BY s.id_suministro, s.descripcion
      ORDER BY s.descripcion`,
      [tipo]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener suministros.' });
  }
});

module.exports = router;