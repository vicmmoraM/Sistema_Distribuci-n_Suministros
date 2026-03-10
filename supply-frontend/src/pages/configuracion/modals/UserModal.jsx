export default function UserModal({
  isOpen,
  mode,
  form,
  roles,
  departments,
  onClose,
  onSubmit,
  onChange,
  XIcon,
  CheckIcon,
}) {
  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h3>{mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</h3>
        <form onSubmit={onSubmit} className="admin-form-grid">
          {mode === 'create' && (
            <>
              <input type="text" placeholder="Nombre completo" value={form.nombres} onChange={(e) => onChange('nombres', e.target.value)} required />
              <input type="text" placeholder="Login" value={form.login} onChange={(e) => onChange('login', e.target.value)} required />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => onChange('email', e.target.value)} required />
              <input type="password" placeholder="Contrasena" value={form.password} onChange={(e) => onChange('password', e.target.value)} required />
            </>
          )}
          <select value={form.id_rol} onChange={(e) => onChange('id_rol', e.target.value)} required>
            <option value="">Rol...</option>
            {roles.map((role) => <option key={role.id_rol} value={role.id_rol}>{role.descripcion}</option>)}
          </select>
          <select value={form.id_departamento} onChange={(e) => onChange('id_departamento', e.target.value)} required>
            <option value="">Departamento...</option>
            {departments.map((department) => <option key={department.id_departamento} value={department.id_departamento}>{department.descripcion}</option>)}
          </select>
          {mode === 'edit' && (
            <label className="admin-simple-check-field">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => onChange('activo', e.target.checked)}
                className="admin-simple-check-input"
              />
              <span className="admin-simple-check-label">Usuario activo</span>
            </label>
          )}
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary icon-btn-with-text" onClick={onClose}><XIcon /> <span>Cancelar</span></button>
            <button type="submit" className="admin-primary icon-btn-with-text"><CheckIcon /> <span>Guardar</span></button>
          </div>
        </form>
      </div>
    </div>
  )
}
