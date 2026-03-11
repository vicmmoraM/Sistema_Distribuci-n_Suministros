const { pool } = require('../config/db');

class PedidoRepository {
  constructor(dbPool = pool) {
    this.pool = dbPool;
  }

  async isPdvInOrderWindow(idPdv, conn = null) {
    const executor = conn || this.pool;
    const [rows] = await executor.query(
      `SELECT 1
       FROM zona_ventanas_pedido zvp
       INNER JOIN pdvs p ON p.id_zona_comercial = zvp.id_zona_comercial
       WHERE p.id_pdv = ?
         AND DAY(NOW()) BETWEEN zvp.dia_inicio AND zvp.dia_fin
         AND zvp.activo = 1
       LIMIT 1`,
      [idPdv]
    );

    return rows.length > 0;
  }

  async getPdvOrderWindow(idPdv, conn = null) {
    const executor = conn || this.pool;
    const [rows] = await executor.query(
      `SELECT
         zvp.dia_inicio,
         zvp.dia_fin,
         z.zona,
         z.codigo_zona
       FROM zona_ventanas_pedido zvp
       INNER JOIN pdvs p ON p.id_zona_comercial = zvp.id_zona_comercial
       INNER JOIN zonas_comerciales z ON z.id_zona_comercial = p.id_zona_comercial
       WHERE p.id_pdv = ?
         AND zvp.activo = 1
       LIMIT 1`,
      [idPdv]
    );

    return rows[0] || null;
  }

  async getPedidoById(idPedido) {
    const [rows] = await this.pool.query(
      `SELECT id_pedido, id_estado_pedido
       FROM cabecera_pedidos
       WHERE id_pedido = ?
       LIMIT 1`,
      [idPedido]
    );

    return rows[0] || null;
  }

  async callAprobarPedidoSP({ idPedido, idUsuario, observacion }) {
    await this.pool.query('CALL sp_aprobar_pedido(?, ?, ?)', [idPedido, idUsuario, observacion || null]);
  }

  async callActualizarPrecioSP({ idSuministro, idProveedor, precioNuevo, idUsuario }) {
    await this.pool.query('CALL sp_actualizar_precio(?, ?, ?, ?)', [idSuministro, idProveedor, precioNuevo, idUsuario || null]);
  }

  async getPdvById(idPdv) {
    const [rows] = await this.pool.query(
      `SELECT
         p.id_pdv,
         p.codigo_centro_costo,
         p.direccion,
         p.id_proveedor_principal,
         gp.monto_autorizado AS cupo,
         z.zona,
         c.descripcion AS ciudad,
         r.descripcion AS region
       FROM pdvs p
       INNER JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
       INNER JOIN zonas_comerciales z ON z.id_zona_comercial = p.id_zona_comercial
      LEFT JOIN ciudades c ON c.id_ciudad = p.id_ciudad
      LEFT JOIN regiones r ON r.id_region = c.id_region
       WHERE p.id_pdv = ? AND p.id_estado_pdv = 1
       LIMIT 1`,
      [idPdv]
    );

    return rows[0] || null;
  }

  async getCatalogoVigenteByTipo({ idTipoSuministro, idPdv }) {
    const [rows] = await this.pool.query(
      `SELECT
         s.id_suministro,
         s.descripcion,
         cv.id_proveedor,
         cv.nombre_proveedor,
         cv.precio_vigente,
         cv.stock
       FROM v_catalogo_disponible cv
       INNER JOIN suministros s ON s.id_suministro = cv.id_suministro
       LEFT JOIN pdvs p ON p.id_pdv = ?
       WHERE s.id_tipo_suministro = ?
         AND (p.id_proveedor_principal IS NULL OR cv.id_proveedor = p.id_proveedor_principal)
       ORDER BY s.descripcion`,
      [idPdv || null, idTipoSuministro]
    );

    return rows;
  }

  async getDepartmentBudgetByPeriod(idDepartamento, periodoAnio, periodoMes) {
    const [rows] = await this.pool.query(
      `SELECT
         COALESCE(pd.monto_autorizado, 0) AS budget
       FROM presupuesto_departamentos pd
       WHERE pd.id_departamento = ?
         AND pd.periodo_anio = ?
         AND (pd.periodo_mes = ? OR pd.periodo_mes = 0)
       ORDER BY CASE WHEN pd.periodo_mes = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [idDepartamento, periodoAnio, periodoMes, periodoMes]
    );

    return Number(rows[0]?.budget || 0);
  }
}

module.exports = PedidoRepository;
