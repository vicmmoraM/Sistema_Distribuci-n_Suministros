export default function SuppliesSection({
  suppliesActiveTab,
  onTabChange,
  tabs,
  onCreateSupply,
  onCreatePdv,
  onCreateCategory,
  supplyFilters,
  onSupplyFilterChange,
  categoriesMeta,
  providersMeta,
  lowStockCount,
  supplies,
  onEditSupply,
  onDeleteSupply,
  pdvFilters,
  onPdvFilterChange,
  zonesMeta,
  pdvs,
  onEditPdv,
  categories,
  categoryFilters,
  onCategoryFilterChange,
  onEditCategory,
  onDeleteCategory,
  EditIcon,
  TrashIcon,
  PlusIcon,
}) {
  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <h2>Gestion de Suministros</h2>
        {suppliesActiveTab === 'supplies-list' && (
          <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreateSupply} title="Nuevo Suministro"><PlusIcon /> <span>Nuevo Suministro</span></button>
        )}
        {suppliesActiveTab === 'pdv-providers' && (
          <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreatePdv} title="Nuevo PDV"><PlusIcon /> <span>Nuevo PDV</span></button>
        )}
        {suppliesActiveTab === 'categories' && (
          <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreateCategory} title="Nueva Categoria"><PlusIcon /> <span>Nueva Categoria</span></button>
        )}
      </div>

      <div className="admin-subtabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-subtab ${suppliesActiveTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {suppliesActiveTab === 'supplies-list' && (
        <>
          <div className="admin-filters admin-filters-supplies">
            <input
              type="text"
              placeholder="Buscar suministro..."
              value={supplyFilters.search}
              onChange={(event) => onSupplyFilterChange('search', event.target.value)}
            />
            <select
              value={supplyFilters.category}
              onChange={(event) => onSupplyFilterChange('category', event.target.value)}
            >
              <option value="">Todas las categorias</option>
              {categoriesMeta.map((category) => (
                <option key={category.id_tipo_suministro} value={category.id_tipo_suministro}>
                  {category.descripcion}
                </option>
              ))}
            </select>
            <select
              value={supplyFilters.provider}
              onChange={(event) => onSupplyFilterChange('provider', event.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {providersMeta.map((provider) => (
                <option key={provider.id_proveedor} value={provider.id_proveedor}>
                  {provider.nombre_proveedor}
                </option>
              ))}
            </select>
            <div className="stock-pill">Stock bajo: {lowStockCount}</div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Proveedor</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Fecha de actualizacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((item) => (
                  <tr key={`${item.id_suministro}-${item.id_suministro_precio || item.id_proveedor || 'sin-proveedor'}`}>
                    <td data-label="Nombre">{item.descripcion}</td>
                    <td data-label="Categoria">{item.categoria}</td>
                    <td data-label="Proveedor">{item.proveedor || 'Sin proveedor'}</td>
                    <td data-label="Precio">{item.precio_compra !== null && item.precio_compra !== undefined ? Number(item.precio_compra).toFixed(2) : '-'}</td>
                    <td data-label="Stock">
                      <span className={Number(item.stock) <= 10 ? 'low-stock' : ''}>
                        {item.stock}
                      </span>
                    </td>
                    <td data-label="Estado">{item.estado}</td>
                    <td data-label="Actualizacion">{item.fecha_actualizacion}</td>
                    <td data-label="Acciones" className="actions-cell">
                      <button type="button" className="icon-btn" onClick={() => onEditSupply(item)} title="Editar"><EditIcon /></button>
                      <button type="button" className="danger icon-btn" onClick={() => onDeleteSupply(item)} title="Eliminar"><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {suppliesActiveTab === 'pdv-providers' && (
        <>
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Buscar PDV..."
              value={pdvFilters.search}
              onChange={(event) => onPdvFilterChange('search', event.target.value)}
            />
            <select
              value={pdvFilters.zone}
              onChange={(event) => onPdvFilterChange('zone', event.target.value)}
            >
              <option value="">Todas las zonas</option>
              {zonesMeta.map((zone) => (
                <option key={zone.id_zona_comercial} value={zone.id_zona_comercial}>
                  {zone.zona}
                </option>
              ))}
            </select>
            <select
              value={pdvFilters.provider}
              onChange={(event) => onPdvFilterChange('provider', event.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {providersMeta.map((provider) => (
                <option key={provider.id_proveedor} value={provider.id_proveedor}>
                  {provider.nombre_proveedor}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PDV</th>
                  <th>Zona Comercial</th>
                  <th>Monto Autorizado</th>
                  <th>Estado</th>
                  <th>Proveedor Principal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pdvs.map((item) => (
                  <tr key={item.id_pdv}>
                    <td data-label="PDV">{item.descripcion}</td>
                    <td data-label="Zona">{item.zona_comercial}</td>
                    <td data-label="Monto Autorizado">${Number(item.monto_autorizado || 0).toFixed(2)}</td>
                    <td data-label="Estado">{item.estado}</td>
                    <td data-label="Proveedor">{item.proveedor}</td>
                    <td data-label="Acciones" className="actions-cell">
                      <button type="button" className="icon-btn" onClick={() => onEditPdv(item)} title="Editar PDV"><EditIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {suppliesActiveTab === 'categories' && (
        <>
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={categoryFilters.search}
              onChange={(event) => onCategoryFilterChange('search', event.target.value)}
            />
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Total de Suministros</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id_tipo_suministro}>
                    <td data-label="Nombre">{item.descripcion}</td>
                    <td data-label="Suministros">{item.total_suministros}</td>
                    <td data-label="Acciones" className="actions-cell">
                      <button type="button" className="icon-btn" onClick={() => onEditCategory(item)} title="Editar"><EditIcon /></button>
                      <button type="button" className="danger icon-btn" onClick={() => onDeleteCategory(item)} title="Eliminar"><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
