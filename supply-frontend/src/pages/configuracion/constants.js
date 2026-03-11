export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Vista General' },
  { key: 'users', label: 'Usuarios' },
  { key: 'supplies', label: 'Suministros' },
  { key: 'roles', label: 'Roles y Permisos' },
];

export const SUPPLIES_TABS = [
  { key: 'supplies-list', label: 'Suministros' },
  { key: 'pdv-providers', label: 'PDVs - Proveedores' },
  { key: 'supply-access', label: 'Permisos de Suministros' },
  { key: 'categories', label: 'Categorias' },
  { key: 'departamentos', label: 'Departamentos' },
];

export const EMPTY_USER_FORM = {
  nombres: '',
  login: '',
  email: '',
  id_rol: '',
  id_departamento: '',
  password: '',
  activo: true,
};

export const EMPTY_SUPPLY_FORM = {
  descripcion: '',
  id_tipo_suministro: '',
  stock: 0,
  id_estado_suministro: 1,
  id_suministro_precio: '',
  id_proveedor: '',
  precio_compra: '',
};

export const EMPTY_PDV_FORM = {
  descripcion: '',
  direccion: '',
  id_ciudad: '',
  id_grupo_pdv: '',
  id_estado_pdv: '',
  id_zona_comercial: '',
  id_proveedor_principal: '',
  id_region: '',
  id_supervisor: '',
};

export const EMPTY_DEPARTMENT_FORM = {
  descripcion: '',
  id_proveedor: '',
  presupuesto_autorizado: '',
};
