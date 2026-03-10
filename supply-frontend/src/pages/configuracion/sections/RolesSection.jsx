import { SaveIcon } from '../icons';

export default function RolesSection({
  roles,
  onChangeRolePermission,
  onSaveRolePermissions,
}) {
  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <h2>Roles y Permisos</h2>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Usuarios</th>
              <th>Pedidos</th>
              <th>Reportes</th>
              <th>Aprobación</th>
              <th>Configuración</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id_rol}>
                <td data-label="Rol">{role.descripcion}</td>
                <td data-label="Usuarios">{role.total_usuarios}</td>
                <td data-label="Pedidos"><input type="checkbox" checked={Boolean(role.puede_pedidos)} onChange={(e) => onChangeRolePermission(role.id_rol, 'puede_pedidos', e.target.checked)} /></td>
                <td data-label="Reportes"><input type="checkbox" checked={Boolean(role.puede_reportes)} onChange={(e) => onChangeRolePermission(role.id_rol, 'puede_reportes', e.target.checked)} /></td>
                <td data-label="Aprobación"><input type="checkbox" checked={Boolean(role.puede_aprobacion)} onChange={(e) => onChangeRolePermission(role.id_rol, 'puede_aprobacion', e.target.checked)} /></td>
                <td data-label="Configuración"><input type="checkbox" checked={Boolean(role.puede_configuracion)} onChange={(e) => onChangeRolePermission(role.id_rol, 'puede_configuracion', e.target.checked)} /></td>
                <td data-label="Acciones" className="actions-cell">
                  <button type="button" className="icon-btn" onClick={() => onSaveRolePermissions(role)} title="Guardar"><SaveIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
