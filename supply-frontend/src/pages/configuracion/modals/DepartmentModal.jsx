export default function DepartmentModal({
  isOpen,
  mode,
  form,
  providers,
  gruposPresupuesto,
  onClose,
  onSubmit,
  onChange,
  onBudgetChange,
  XIcon,
  CheckIcon,
}) {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={handleBackdropClick}>
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
          {(gruposPresupuesto || []).map((grupo) => (
            <input
              key={grupo.id_grupo_presupuesto}
              type="number"
              placeholder={`Presupuesto ${grupo.descripcion}`}
              value={form.presupuestos?.[grupo.id_grupo_presupuesto] ?? ''}
              onChange={(e) => onBudgetChange(grupo.id_grupo_presupuesto, e.target.value)}
              step="0.01"
              min="0"
            />
          ))}
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
