export const EMPTY_PERMISSIONS = {
  pedidos: false,
  reportes: false,
  aprobacion: false,
  configuracion: false,
};

export const EMPTY_USER = {
  id: 0,
  login: '',
  nombre: '',
  departamento: 0,
  departmentName: null,
  departmentBudget: 0,
  roleId: null,
  roleName: null,
  permissions: EMPTY_PERMISSIONS,
};
