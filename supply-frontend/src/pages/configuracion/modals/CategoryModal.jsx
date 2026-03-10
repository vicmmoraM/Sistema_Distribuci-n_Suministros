export default function CategoryModal({
  isOpen,
  mode,
  form,
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
        <h3>{mode === 'create' ? 'Crear Categoria' : 'Editar Categoria'}</h3>
        <form onSubmit={onSubmit} className="admin-form-grid">
          <input
            type="text"
            placeholder="Nombre de la categoria"
            value={form.descripcion}
            onChange={(e) => onChange('descripcion', e.target.value)}
            required
            style={{ gridColumn: '1 / -1' }}
          />
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary icon-btn-with-text" onClick={onClose}><XIcon /> <span>Cancelar</span></button>
            <button type="submit" className="admin-primary icon-btn-with-text"><CheckIcon /> <span>Guardar</span></button>
          </div>
        </form>
      </div>
    </div>
  )
}
