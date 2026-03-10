export default function DepartmentModal({
  isOpen,
  mode,
  form,
  providers,
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
        <h3>{mode === 'create' ? 'Nuevo Departamento' : 'Editar Departamento'}</h3>
        <form onSubmit={onSubmit} className="admin-form-grid">
          <input
            type="text"
            placeholder="Nombre del departamento"
            value={form.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
            required
          />
          <select
            value={form.id_proveedor}
            onChange={(e) => onChange('id_proveedor', e.target.value)}
          >
            <option value="">Seleccionar proveedor...</option>
            {providers.map((provider) => (
              <option key={provider.id_proveedor} value={provider.id_proveedor}>
                {provider.nombre_proveedor}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Presupuesto autorizado"
            value={form.presupuesto_autorizado}
            onChange={(e) => onChange('presupuesto_autorizado', e.target.value)}
            step="0.01"
            min="0"
          />
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary icon-btn-with-text" onClick={onClose}>
              <XIcon /> <span>Cancelar</span>
            </button>
            <button type="submit" className="admin-primary icon-btn-with-text">
              <CheckIcon /> <span>{mode === 'create' ? 'Crear' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
