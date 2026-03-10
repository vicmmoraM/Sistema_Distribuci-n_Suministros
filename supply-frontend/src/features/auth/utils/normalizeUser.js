import { EMPTY_PERMISSIONS, EMPTY_USER } from '../../../app/types/user';

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function normalizeUser(input) {
  if (!input || typeof input !== 'object') return null;

  const rawPermissions = input.permissions || {};

  return {
    ...EMPTY_USER,
    id: toNumber(input.id ?? input.userId, 0),
    login: String(input.login || ''),
    nombre: String(input.nombre ?? input.nombres ?? ''),
    departamento: toNumber(input.departamento ?? input.department, 0),
    departmentName: input.departmentName ?? null,
    departmentBudget: toNumber(input.departmentBudget, 0),
    roleId: input.roleId ?? null,
    roleName: input.roleName ?? null,
    permissions: {
      ...EMPTY_PERMISSIONS,
      pedidos: Boolean(rawPermissions.pedidos),
      reportes: Boolean(rawPermissions.reportes),
      aprobacion: Boolean(rawPermissions.aprobacion),
      configuracion: Boolean(rawPermissions.configuracion),
    },
  };
}
