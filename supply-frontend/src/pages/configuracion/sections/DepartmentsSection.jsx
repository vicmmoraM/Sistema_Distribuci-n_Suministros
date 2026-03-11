import { useEffect, useMemo, useState } from 'react'

const DEPARTMENTS_PAGE_SIZE = 10

export default function DepartmentsSection({
  departmentFilters,
  onDepartmentFilterChange,
  departments,
  onEditDepartment,
  onDeleteDepartment,
  EditIcon,
  TrashIcon,
}) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(departments.length / DEPARTMENTS_PAGE_SIZE))

  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * DEPARTMENTS_PAGE_SIZE
    return departments.slice(start, start + DEPARTMENTS_PAGE_SIZE)
  }, [departments, page])

  useEffect(() => {
    setPage(1)
  }, [departmentFilters.search])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const renderPageButtons = (currentPage, totalPageCount, onPageChange) => {
    const maxVisible = 5
    const startPage = Math.max(1, currentPage - 2)
    const pages = []

    for (let p = startPage; p < startPage + maxVisible && p <= totalPageCount; p += 1) {
      pages.push(p)
    }

    return pages.map((p) => (
      <button
        key={p}
        type="button"
        className={`admin-page-btn ${p === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(p)}
      >
        {p}
      </button>
    ))
  }

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filter-group">
          <label>Buscar departamento</label>
          <input
            type="text"
            placeholder="Nombre..."
            value={departmentFilters.search}
            onChange={(event) => onDepartmentFilterChange('search', event.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Departamento</th>
              <th>Proveedor</th>
              <th>Presupuesto Autorizado</th>
              <th>Presupuesto Ejecutado</th>
              <th>Usuarios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDepartments.map((item) => (
              <tr key={item.id_departamento}>
                <td data-label="Departamento">{item.descripcion}</td>
                <td data-label="Proveedor">{item.proveedor || 'Sin proveedor'}</td>
                <td data-label="Presupuesto Autorizado">${Number(item.presupuesto_autorizado || 0).toFixed(2)}</td>
                <td data-label="Presupuesto Ejecutado">${Number(item.presupuesto_ejecutado || 0).toFixed(2)}</td>
                <td data-label="Usuarios">{item.total_usuarios}</td>
                <td data-label="Acciones" className="actions-cell">
                  <button type="button" className="icon-btn" onClick={() => onEditDepartment(item)} title="Editar"><EditIcon /></button>
                  <button type="button" className="danger icon-btn" onClick={() => onDeleteDepartment(item)} title="Eliminar"><TrashIcon /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <p className="admin-pagination-info">
          Mostrando {(page - 1) * DEPARTMENTS_PAGE_SIZE + 1} a {Math.min(page * DEPARTMENTS_PAGE_SIZE, departments.length)} de {departments.length} departamentos.
        </p>
        <div className="admin-pagination-controls">
          <button
            type="button"
            className="admin-page-btn"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          {renderPageButtons(page, totalPages, setPage)}
          <button
            type="button"
            className="admin-page-btn"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  )
}
