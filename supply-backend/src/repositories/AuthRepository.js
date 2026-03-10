const { pool } = require('../config/db');

class AuthRepository {
  constructor(dbPool = pool) {
    this.pool = dbPool;
  }

  async findUserByLogin(login) {
    const [rows] = await this.pool.query(
      `SELECT
         u.id_usuario,
         u.id_departamento,
         u.id_rol,
         u.login,
         u.password,
         u.nombres,
         u.email,
         u.activo
       FROM usuarios u
       WHERE LOWER(TRIM(u.login)) = LOWER(TRIM(?))
       LIMIT 1`,
      [login]
    );

    return rows[0] || null;
  }

  async createUser({ idDepartamento, idRol, login, passwordHash, nombres, email }) {
    const [result] = await this.pool.query(
      `INSERT INTO usuarios (id_departamento, id_rol, login, password, nombres, email, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [idDepartamento, idRol, login, passwordHash, nombres, email]
    );

    return result.insertId;
  }

  async updateUserPassword(userId, passwordHash) {
    await this.pool.query(
      `UPDATE usuarios
       SET password = ?
       WHERE id_usuario = ?`,
      [passwordHash, userId]
    );
  }

  async getDepartmentBudgetByPeriod(idDepartamento, periodoAnio, periodoMes) {
    const [rows] = await this.pool.query(
      `SELECT
         d.id_departamento,
         d.descripcion AS departmentName,
         COALESCE(pd.monto_autorizado, 0) AS departmentBudget,
         pd.periodo_anio,
         pd.periodo_mes
       FROM departamentos d
       LEFT JOIN presupuesto_departamentos pd
         ON pd.id_departamento = d.id_departamento
        AND pd.periodo_anio = ?
        AND (pd.periodo_mes = ? OR pd.periodo_mes = 0)
       WHERE d.id_departamento = ?
       ORDER BY CASE WHEN pd.periodo_mes = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [periodoAnio, periodoMes, idDepartamento, periodoMes]
    );

    return rows[0] || null;
  }

  async getPermissionsByRole(idRol) {
    const [rows] = await this.pool.query(
      `SELECT permiso
       FROM v_rol_permisos
       WHERE id_rol = ?`,
      [idRol]
    );

    return rows.map((row) => row.permiso);
  }
}

module.exports = AuthRepository;
