import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'
import DepartmentsSection from './DepartmentsSection'

const SUPPLIES_PAGE_SIZE = 10
const DEFAULT_PDV_PAGE_SIZE = 20

const ExcelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 10l6 8M15 10l-6 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export default function SuppliesSection({
  suppliesActiveTab,
  onTabChange,
  tabs,
  onCreateSupply,
  onCreatePdv,
  onCreateCategory,
  onCreateDepartment,
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
  regionsMeta,
  zonesMeta,
  pdvs,
  onEditPdv,
  categories,
  categoryFilters,
  onCategoryFilterChange,
  onEditCategory,
  onDeleteCategory,
  departments,
  departmentFilters,
  onDepartmentFilterChange,
  onEditDepartment,
  onDeleteDepartment,
  EditIcon,
  TrashIcon,
  PlusIcon,
}) {
  const [suppliesPage, setSuppliesPage] = useState(1)
  const [pdvPage, setPdvPage] = useState(1)
  const [pdvPageSize, setPdvPageSize] = useState(DEFAULT_PDV_PAGE_SIZE)

  const getStatusClassName = (status) => {
    const normalizedStatus = String(status || '').toLowerCase().trim()

    if (normalizedStatus === 'disponible' || normalizedStatus === 'activo') {
      return 'status-badge active'
    }

    if (normalizedStatus === 'no disponible' || normalizedStatus === 'inactivo') {
      return 'status-badge inactive'
    }

    return 'status-badge'
  }

  const handleDownloadPdvExcel = async () => {
    try {
      const response = await api.get('/gestion/pdvs/export/excel', {
        responseType: 'blob',
        params: {
          search: pdvFilters.search || '',
          region: pdvFilters.region || '',
          centroCosto: pdvFilters.centroCosto || '',
          zone: pdvFilters.zone || '',
          city: pdvFilters.city || '',
          provider: pdvFilters.provider || '',
          supervisor: pdvFilters.supervisor || '',
          status: pdvFilters.status || '',
        }
      })

      const blob = new Blob([
        response.data
      ], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PDVs_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error descargando Excel:', err)
    }
  }

  const totalSuppliesPages = Math.max(1, Math.ceil(supplies.length / SUPPLIES_PAGE_SIZE))
  const totalPdvPages = Math.max(1, Math.ceil(pdvs.length / pdvPageSize))

  const paginatedSupplies = useMemo(() => {
    const start = (suppliesPage - 1) * SUPPLIES_PAGE_SIZE
    return supplies.slice(start, start + SUPPLIES_PAGE_SIZE)
  }, [supplies, suppliesPage])

  const paginatedPdvs = useMemo(() => {
    const start = (pdvPage - 1) * pdvPageSize
    return pdvs.slice(start, start + pdvPageSize)
  }, [pdvs, pdvPage, pdvPageSize])

  useEffect(() => {
    setSuppliesPage(1)
  }, [supplyFilters.search, supplyFilters.category, supplyFilters.provider])

  useEffect(() => {
    setPdvPage(1)
  }, [pdvFilters.search, pdvFilters.region, pdvFilters.zone, pdvFilters.provider])

  useEffect(() => {
    setPdvPage(1)
  }, [pdvPageSize])

  useEffect(() => {
    if (suppliesPage > totalSuppliesPages) {
      setSuppliesPage(totalSuppliesPages)
    }
  }, [suppliesPage, totalSuppliesPages])

  useEffect(() => {
    if (pdvPage > totalPdvPages) {
      setPdvPage(totalPdvPages)
    }
  }, [pdvPage, totalPdvPages])

  const renderPageButtons = (currentPage, totalPages, onPageChange) => {
    const maxVisible = 5
    const startPage = Math.max(1, currentPage - 2)
    const pages = []

    for (let page = startPage; page < startPage + maxVisible && page <= totalPages; page += 1) {
      pages.push(page)
    }

    return pages.map((page) => (
      <button
        key={page}
        type="button"
        className={`admin-page-btn ${page === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(page)}
      >
        {page}
      </button>
    ))
  }

  return (
    <div className="admin-panel-card">
      <div className="admin-panel-header">
        <h2>Gestion de Suministros</h2>
        {suppliesActiveTab === 'supplies-list' && (
          <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreateSupply} title="Nuevo Suministro"><PlusIcon /> <span>Nuevo Suministro</span></button>
        )}
        {suppliesActiveTab === 'pdv-providers' && (
          <div className="admin-panel-actions">
            <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreatePdv} title="Nuevo PDV"><PlusIcon /> <span>Nuevo PDV</span></button>
            <button
              type="button"
              className="admin-excel-btn icon-btn-with-text"
              onClick={handleDownloadPdvExcel}
              title="Descargar Excel"
            >
              <ExcelIcon />
              <span>Descargar Excel</span>
            </button>
          </div>
        )}
        {suppliesActiveTab === 'categories' && (
          <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreateCategory} title="Nueva Categoria"><PlusIcon /> <span>Nueva Categoria</span></button>
        )}
        {suppliesActiveTab === 'departamentos' && (
          <button type="button" className="admin-primary icon-btn-with-text" onClick={onCreateDepartment} title="Nuevo Departamento"><PlusIcon /> <span>Nuevo Departamento</span></button>
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
                {paginatedSupplies.map((item) => (
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
                    <td data-label="Estado">
                      <span className={getStatusClassName(item.estado)}>{item.estado}</span>
                    </td>
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

          <div className="admin-pagination">
            <p className="admin-pagination-info">
              Mostrando {(suppliesPage - 1) * SUPPLIES_PAGE_SIZE + 1} a {Math.min(suppliesPage * SUPPLIES_PAGE_SIZE, supplies.length)} de {supplies.length} suministros.
            </p>
            <div className="admin-pagination-controls">
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setSuppliesPage((prev) => Math.max(prev - 1, 1))}
                disabled={suppliesPage === 1}
              >
                Anterior
              </button>
              {renderPageButtons(suppliesPage, totalSuppliesPages, setSuppliesPage)}
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setSuppliesPage((prev) => Math.min(prev + 1, totalSuppliesPages))}
                disabled={suppliesPage === totalSuppliesPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {suppliesActiveTab === 'pdv-providers' && (
        <>
          <div className="admin-filters admin-filters-pdvs">
            <input
              type="text"
              placeholder="Buscar PDV..."
              value={pdvFilters.search}
              onChange={(event) => onPdvFilterChange('search', event.target.value)}
            />
            <select
              value={pdvFilters.region}
              onChange={(event) => onPdvFilterChange('region', event.target.value)}
            >
              <option value="">Todas las regiones</option>
              {(regionsMeta || []).map((region) => (
                <option key={region.id_region} value={region.id_region}>
                  {region.descripcion}
                </option>
              ))}
            </select>
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
                  <th>Región</th>
                  <th>PDV</th>
                  <th>Zona Comercial</th>
                  <th>Ciudad</th>
                  <th>Monto Autorizado</th>
                  <th>Estado</th>
                  <th>Proveedor Principal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPdvs.map((item) => (
                  <tr key={item.id_pdv}>
                    <td data-label="Región">{item.region}</td>
                    <td data-label="PDV">{item.descripcion}</td>
                    <td data-label="Zona">{item.zona_comercial}</td>
                    <td data-label='Ciudad'>{item.ciudad}</td>
                    <td data-label="Monto Autorizado">${Number(item.monto_autorizado || 0).toFixed(2)}</td>
                    <td data-label="Estado">
                      <span className={getStatusClassName(item.estado)}>{item.estado}</span>
                    </td>
                    <td data-label="Proveedor">{item.proveedor}</td>
                    <td data-label="Acciones" className="actions-cell">
                      <button type="button" className="icon-btn" onClick={() => onEditPdv(item)} title="Editar PDV"><EditIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <p className="admin-pagination-info">
              Mostrando {(pdvPage - 1) * pdvPageSize + 1} a {Math.min(pdvPage * pdvPageSize, pdvs.length)} de {pdvs.length} proveedores.
            </p>
            <div className="admin-pagination-controls">
              <select
                value={pdvPageSize}
                onChange={(event) => setPdvPageSize(Number(event.target.value))}
                aria-label="PDVs por pagina"
              >
              </select>
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setPdvPage((prev) => Math.max(prev - 1, 1))}
                disabled={pdvPage === 1}
              >
                Anterior
              </button>
              {renderPageButtons(pdvPage, totalPdvPages, setPdvPage)}
              <button
                type="button"
                className="admin-page-btn"
                onClick={() => setPdvPage((prev) => Math.min(prev + 1, totalPdvPages))}
                disabled={pdvPage === totalPdvPages}
              >
                Siguiente
              </button>
            </div>
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

      {suppliesActiveTab === 'departamentos' && (
        <DepartmentsSection
          departments={departments}
          departmentFilters={departmentFilters}
          onDepartmentFilterChange={onDepartmentFilterChange}
          onEditDepartment={onEditDepartment}
          onDeleteDepartment={onDeleteDepartment}
          providersMeta={providersMeta}
          EditIcon={EditIcon}
          TrashIcon={TrashIcon}
        />
      )}
    </div>
  )
}