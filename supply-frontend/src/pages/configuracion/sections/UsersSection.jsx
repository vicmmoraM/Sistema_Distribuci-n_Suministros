export default function UsersSection({
  users,
  userFilters,
  roles,
  onFilterChange,
  onEditUser,
  onDeleteUser,
  EditIcon,
  TrashIcon,
}) {
  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <h2>Gestion de Usuarios</h2>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Buscar por nombre, login o email..."
          value={userFilters.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
        />
        <select
          value={userFilters.role}
          onChange={(event) => onFilterChange('role', event.target.value)}
        >
          <option value="">Todos los roles</option>
          {roles.map((role) => (
            <option key={role.id_rol} value={role.id_rol}>{role.descripcion}</option>
          ))}
        </select>
        <select
          value={userFilters.status}
          onChange={(event) => onFilterChange('status', event.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id_usuario}>
                <td data-label="Nombre">{item.nombres}</td>
                <td data-label="Email">{item.email}</td>
                <td data-label="Rol">{item.rol}</td>
                <td data-label="Estado">
                  <span className={`status-badge ${item.activo ? 'active' : 'inactive'}`}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td data-label="Fecha">{item.fecha_registro}</td>
                <td data-label="Acciones" className="actions-cell">
                  <button type="button" className="icon-btn" onClick={() => onEditUser(item)} title="Editar"><EditIcon /></button>
                  <button type="button" className="danger icon-btn" onClick={() => onDeleteUser(item)} title="Eliminar"><TrashIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
