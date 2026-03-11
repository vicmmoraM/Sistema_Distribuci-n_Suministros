export default function SupplyModal({
  isOpen,
  mode,
  form,
  categories,
  providers,
  states,
  onClose,
  onSubmit,
  onChange,
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
        <h3>{mode === 'create' ? 'Crear Suministro' : 'Editar Suministro'}</h3>
        <form onSubmit={onSubmit} className="admin-form-grid">
          <input type="text" placeholder="Descripcion" value={form.descripcion} onChange={(e) => onChange('descripcion', e.target.value)} required />
          <select value={form.id_tipo_suministro} onChange={(e) => onChange('id_tipo_suministro', e.target.value)} required>
            <option value="">Categoria...</option>
            {categories.map((category) => <option key={category.id_tipo_suministro} value={category.id_tipo_suministro}>{category.descripcion}</option>)}
          </select>
          <select value={form.id_proveedor} onChange={(e) => onChange('id_proveedor', e.target.value)} required>
            <option value="">Proveedor...</option>
            {providers.map((provider) => <option key={provider.id_proveedor} value={provider.id_proveedor}>{provider.nombre_proveedor}</option>)}
          </select>
          <input type="number" min="0" step="0.01" placeholder="Precio" value={form.precio_compra} onChange={(e) => onChange('precio_compra', e.target.value)} required />
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => {
              const newStock = e.target.value
              onChange('stock', newStock)
              onChange('id_estado_suministro', Number(newStock) <= 0 ? 2 : 1)
            }}
            required
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: '#6b7280' }}>Estado:</span>
            <span style={{
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.8rem',
              background: Number(form.stock) <= 0 ? '#fee2e2' : '#dcfce7',
              color: Number(form.stock) <= 0 ? '#dc2626' : '#16a34a',
            }}>
              {Number(form.stock) <= 0 ? 'No Disponible' : 'Disponible'}
            </span>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary icon-btn-with-text" onClick={onClose}><XIcon /> <span>Cancelar</span></button>
            <button type="submit" className="admin-primary icon-btn-with-text"><CheckIcon /> <span>Guardar</span></button>
          </div>
        </form>
      </div>
    </div>
  )
}
