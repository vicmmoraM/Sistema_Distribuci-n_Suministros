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
        p.codigo_centro_costo AS descripcion,
        p.direccion,
        c.descripcion AS ciudad,
        COALESCE(pr.nombre_proveedor, 'Sin proveedor asignado') AS proveedor,
        gp.monto_autorizado AS cupo
      FROM pdvs p
      INNER JOIN zonas_comerciales z ON p.id_zona_comercial = z.id_zona_comercial
      INNER JOIN ciudades c ON z.id_ciudad = c.id_ciudad
      INNER JOIN grupo_pdvs gp       ON p.id_grupo_pdv = gp.id_grupo_pdv
      LEFT JOIN proveedores pr       ON p.id_proveedor_principal = pr.id_proveedor
      WHERE p.id_estado_pdv = 1
      ORDER BY p.codigo_centro_costo
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
 * GET /api/catalogos/estados-pedido
 * Lista todos los estados de pedidos para filtros de reportes.
 */
router.get('/estados-pedido', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_estado_pedido, descripcion
      FROM estado_pedidos
      ORDER BY descripcion
    `);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener estados de pedido.' });
  }
});

/**
 * GET /api/catalogos/suministros?tipo=1
 * Lista suministros filtrados por tipo.
 */
router.get('/suministros', requireAuth, async (req, res) => {
  const { tipo, pdv } = req.query;

  if (!tipo) {
    return res.status(400).json({ error: 'El parámetro "tipo" es requerido.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
        cv.id_suministro,
        cv.suministro AS descripcion,
        cv.precio_vigente AS precio,
        cv.nombre_proveedor AS proveedor
      FROM v_catalogo_disponible cv
      LEFT JOIN pdvs p ON p.id_pdv = ?
      WHERE cv.id_suministro IN (
        SELECT s.id_suministro
        FROM suministros s
        WHERE s.id_tipo_suministro = ?
      )
        AND (p.id_proveedor_principal IS NULL OR cv.id_proveedor = p.id_proveedor_principal)
      ORDER BY cv.suministro`,
      [pdv || null, tipo]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener suministros.' });
  }
});

module.exports = router;