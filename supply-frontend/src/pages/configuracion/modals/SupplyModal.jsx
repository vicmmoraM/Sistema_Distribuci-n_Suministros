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

  return (
    <div className="admin-modal-overlay">
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
          <input type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => onChange('stock', e.target.value)} required />
          <select value={form.id_estado_suministro} onChange={(e) => onChange('id_estado_suministro', e.target.value)} required>
            {states.map((state) => <option key={state.id_estado_suministro} value={state.id_estado_suministro}>{state.descripcion}</option>)}
          </select>
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary icon-btn-with-text" onClick={onClose}><XIcon /> <span>Cancelar</span></button>
            <button type="submit" className="admin-primary icon-btn-with-text"><CheckIcon /> <span>Guardar</span></button>
          </div>
        </form>
      </div>
    </div>
  )
}
