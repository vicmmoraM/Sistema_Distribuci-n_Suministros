const bcrypt = require('bcrypt');
const AuthRepository = require('../repositories/AuthRepository');

class AuthService {
  constructor(authRepository = new AuthRepository()) {
    this.authRepository = authRepository;
  }

  async loginLocal({ username, password, departmentId }) {
    if (!username || !password || !departmentId) {
      const err = new Error('Usuario, contrasena y departamento son requeridos.');
      err.statusCode = 400;
      throw err;
    }

    const user = await this.authRepository.findUserByLogin(username);
    if (!user) {
      const err = new Error('Usuario no encontrado.');
      err.statusCode = 401;
      throw err;
    }

    if (!user.activo) {
      const err = new Error('Tu usuario esta desactivado. Contacta al administrador.');
      err.statusCode = 403;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      const err = new Error('Contrasena incorrecta.');
      err.statusCode = 401;
      throw err;
    }

    if (Number(user.id_departamento) !== Number(departmentId)) {
      const err = new Error('Departamento incorrecto para este usuario.');
      err.statusCode = 403;
      throw err;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const departmentInfo = await this.authRepository.getDepartmentBudgetByPeriod(
      user.id_departamento,
      year,
      month
    );

    const permissions = await this.authRepository.getPermissionsByRole(user.id_rol);

    return {
      user: {
        id: user.id_usuario,
        login: user.login,
        nombre: user.nombres,
        departamento: user.id_departamento,
        departmentName: departmentInfo?.departmentName || null,
        departmentBudget: Number(departmentInfo?.departmentBudget || 0),
        roleId: user.id_rol,
        permissions,
      },
    };
  }

  async createLocalUser({ idDepartamento, idRol, login, password, nombres, email }) {
    if (!password) {
      const err = new Error('La contrasena es requerida.');
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const idUsuario = await this.authRepository.createUser({
      idDepartamento,
      idRol,
      login,
      passwordHash,
      nombres,
      email,
    });

    return { idUsuario };
  }

  async updatePassword({ userId, newPassword }) {
    if (!newPassword) {
      const err = new Error('La nueva contrasena es requerida.');
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.authRepository.updateUserPassword(userId, passwordHash);

    return { success: true };
  }
}

module.exports = AuthService;
