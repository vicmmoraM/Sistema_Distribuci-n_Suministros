export default function PdvModal({
  isOpen,
  mode,
  form,
  zones,
  states,
  groups,
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
      <div className="admin-modal admin-modal-pdv">
        <div className="admin-modal-header">
          <h3>{mode === 'create' ? 'Crear Nuevo PDV' : 'Editar PDV'}</h3>
          <p>{mode === 'create' ? 'Registra un nuevo punto de venta' : 'Actualiza el proveedor y presupuesto del PDV'}</p>
        </div>

        <form onSubmit={onSubmit} className="admin-form-grid">
          {mode === 'create' && (
            <>
              <div className="admin-modal-field">
                <label className="admin-modal-label">Nombre del PDV</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => onChange('descripcion', e.target.value)}
                  className="admin-modal-select"
                  placeholder="Ej: FC999"
                  required
                />
              </div>

              <div className="admin-modal-field">
                <label className="admin-modal-label">Direccion</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => onChange('direccion', e.target.value)}
                  className="admin-modal-select"
                  placeholder="Direccion completa"
                />
              </div>

              <div className="admin-modal-field">
                <label className="admin-modal-label">Zona Comercial</label>
                <select
                  value={form.id_zona_comercial}
                  onChange={(e) => onChange('id_zona_comercial', e.target.value)}
                  className="admin-modal-select"
                  required
                >
                  <option value="">Selecciona una zona</option>
                  {zones.map((zone) => (
                    <option key={zone.id_zona_comercial} value={zone.id_zona_comercial}>
                      {zone.zona}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-field">
                <label className="admin-modal-label">Estado</label>
                <select
                  value={form.id_estado_pdv}
                  onChange={(e) => onChange('id_estado_pdv', e.target.value)}
                  className="admin-modal-select"
                  required
                >
                  <option value="">Selecciona un estado</option>
                  {states.map((state) => (
                    <option key={state.id_estado_pdv} value={state.id_estado_pdv}>
                      {state.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="admin-modal-field">
            <label className="admin-modal-label">Grupo PDV (Monto Autorizado)</label>
            <select
              value={form.id_grupo_pdv}
              onChange={(e) => onChange('id_grupo_pdv', e.target.value)}
              className="admin-modal-select"
              required
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((group) => (
                <option key={group.id_grupo_pdv} value={group.id_grupo_pdv}>
                  {group.descripcion} - ${Number(group.monto_autorizado).toFixed(2)}
                </option>
              ))}
            </select>
            <p className="admin-modal-hint">El monto autorizado determina el limite de pedidos</p>
          </div>

          <div className="admin-modal-field">
            <label className="admin-modal-label">Proveedor Principal</label>
            <select
              value={form.id_proveedor_principal}
              onChange={(e) => onChange('id_proveedor_principal', e.target.value)}
              className="admin-modal-select"
            >
              <option value="">Sin proveedor asignado</option>
              {providers.map((provider) => (
                <option key={provider.id_proveedor} value={provider.id_proveedor}>
                  {provider.nombre_proveedor}
                </option>
              ))}
            </select>
            <p className="admin-modal-hint">El proveedor principal sera el preferido para este PDV</p>
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary icon-btn-with-text" onClick={onClose}>
              <XIcon /> <span>Cancelar</span>
            </button>
            <button type="submit" className="admin-primary icon-btn-with-text">
              <CheckIcon /> <span>{mode === 'create' ? 'Crear PDV' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
