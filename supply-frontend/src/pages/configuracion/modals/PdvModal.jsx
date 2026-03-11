export default function PdvModal({
  isOpen,
  mode,
  form,
  cities,
  zones,
  states,
  groups,
  providers,
  supervisores,
  regiones,
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

  // Helper function to get region name from id
  const getRegionName = (regionId) => {
    if (!regionId) return 'No especificada'
    const region = (regiones || []).find(r => r.id_region === Number(regionId))
    return region ? region.descripcion : 'No especificada'
  }

  const getRegionIdFromCity = (cityId) => {
    if (!cityId) return ''
    const city = (cities || []).find((item) => Number(item.id_ciudad) === Number(cityId))
    return city ? String(city.id_region || '') : ''
  }

  return (
    <div className="admin-modal-overlay" onClick={handleBackdropClick}>
      <div className="admin-modal admin-modal-pdv">
        <div className="admin-modal-header">
          <h3>{mode === 'create' ? 'Crear Nuevo PDV' : 'Editar PDV'}</h3>
          <p>{mode === 'create' ? 'Registra un nuevo punto de venta' : `Editando: ${form.descripcion}`}</p>
        </div>

        <form onSubmit={onSubmit} className="admin-form-grid">
          {mode === 'create' && (
            <>
              <div className="admin-modal-field admin-modal-field-half">
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

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Direccion</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => onChange('direccion', e.target.value)}
                  className="admin-modal-select"
                  placeholder="Direccion completa"
                />
              </div>

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Zona Comercial</label>
                <select
                  value={String(form.id_zona_comercial || '')}
                  onChange={(e) => {
                    onChange('id_zona_comercial', e.target.value)
                  }}
                  className="admin-modal-select"
                  required
                >
                  <option value="">Selecciona una zona</option>
                  {zones.map((zone) => (
                    <option key={zone.id_zona_comercial} value={String(zone.id_zona_comercial)}>
                      {zone.zona}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Ciudad</label>
                <select
                  value={String(form.id_ciudad || '')}
                  onChange={(e) => {
                    const selectedCityId = e.target.value
                    onChange('id_ciudad', selectedCityId)
                    onChange('id_region', getRegionIdFromCity(selectedCityId))
                  }}
                  className="admin-modal-select"
                  required
                >
                  <option value="">Selecciona una ciudad</option>
                  {(cities || []).map((city) => (
                    <option key={city.id_ciudad} value={String(city.id_ciudad)}>
                      {city.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Estado</label>
                <select
                  value={String(form.id_estado_pdv || '')}
                  onChange={(e) => onChange('id_estado_pdv', e.target.value)}
                  className="admin-modal-select"
                  required
                >
                  <option value="">Selecciona un estado</option>
                  {states.map((state) => (
                    <option key={state.id_estado_pdv} value={String(state.id_estado_pdv)}>
                      {state.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {mode === 'edit' && (
            <>
              <div className="admin-modal-field admin-modal-field-full">
                <label className="admin-modal-label">Direccion</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => onChange('direccion', e.target.value)}
                  className="admin-modal-select"
                  placeholder="Direccion completa"
                />
              </div>

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Zona Comercial</label>
                <select
                  value={String(form.id_zona_comercial || '')}
                  onChange={(e) => {
                    onChange('id_zona_comercial', e.target.value)
                  }}
                  className="admin-modal-select"
                >
                  <option value="">Selecciona una zona</option>
                  {zones.map((zone) => (
                    <option key={zone.id_zona_comercial} value={String(zone.id_zona_comercial)}>
                      {zone.zona}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Ciudad</label>
                <select
                  value={String(form.id_ciudad || '')}
                  onChange={(e) => {
                    const selectedCityId = e.target.value
                    onChange('id_ciudad', selectedCityId)
                    onChange('id_region', getRegionIdFromCity(selectedCityId))
                  }}
                  className="admin-modal-select"
                >
                  <option value="">Selecciona una ciudad</option>
                  {(cities || []).map((city) => (
                    <option key={city.id_ciudad} value={String(city.id_ciudad)}>
                      {city.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-field admin-modal-field-full">
                <label className="admin-modal-label">Region</label>
                <input
                  type="text"
                  value={getRegionName(getRegionIdFromCity(form.id_ciudad) || form.id_region)}
                  disabled
                  className="admin-modal-select"
                />
              </div>

              <div className="admin-modal-field admin-modal-field-half">
                <label className="admin-modal-label">Supervisor</label>
                <select
                  value={String(form.id_supervisor || '')}
                  onChange={(e) => onChange('id_supervisor', e.target.value)}
                  className="admin-modal-select"
                >
                  <option value="">Sin supervisor</option>
                  {(supervisores || []).map((supervisor) => (
                    <option key={supervisor.id_supervisor} value={String(supervisor.id_supervisor)}>
                      {supervisor.nombres}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="admin-modal-field admin-modal-field-full">
            <label className="admin-modal-label">Grupo PDV (Monto Autorizado)</label>
            <select
              value={String(form.id_grupo_pdv || '')}
              onChange={(e) => onChange('id_grupo_pdv', e.target.value)}
              className="admin-modal-select"
              required
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((group) => (
                <option key={group.id_grupo_pdv} value={String(group.id_grupo_pdv)}>
                  {group.descripcion} - ${Number(group.monto_autorizado).toFixed(2)}
                </option>
              ))}
            </select>
            <p className="admin-modal-hint">El monto autorizado determina el limite de pedidos</p>
          </div>

          <div className="admin-modal-field admin-modal-field-full">
            <label className="admin-modal-label">Proveedor Principal</label>
            <select
              value={String(form.id_proveedor_principal || '')}
              onChange={(e) => onChange('id_proveedor_principal', e.target.value)}
              className="admin-modal-select"
            >
              <option value="">Sin proveedor asignado</option>
              {providers.map((provider) => (
                <option key={provider.id_proveedor} value={String(provider.id_proveedor)}>
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
