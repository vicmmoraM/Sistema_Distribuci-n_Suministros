import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import '../style/Configuracion.css'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Vista General' },
  { key: 'users', label: 'Usuarios' },
  { key: 'supplies', label: 'Suministros' },
  { key: 'roles', label: 'Roles y Permisos' },
]

const EMPTY_USER_FORM = {
  nombres: '',
  login: '',
  email: '',
  id_rol: '',
  id_departamento: '',
  password: '',
  activo: true,
}

const EMPTY_SUPPLY_FORM = {
  descripcion: '',
  id_tipo_suministro: '',
  stock: 0,
  id_estado_suministro: 1,
  id_suministro_precio: '',
  id_proveedor: '',
  precio_compra: '',
}

// Iconos SVG
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)


const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const ToggleOnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3"/>
  </svg>
)

const ToggleOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="8" cy="12" r="3"/>
  </svg>
)

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)

export default function Configuracion() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const location = useLocation()

  // Leer sección activa desde el hash de la URL
  const hash = location.hash.replace('#', '')
  const activeSection = hash || 'dashboard'
  const [navOpen, setNavOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [overview, setOverview] = useState(null)
  const [meta, setMeta] = useState({
    departamentos: [],
    roles: [],
    categorias: [],
    estadosSuministro: [],
    proveedores: [],
  })

  const [users, setUsers] = useState([])
  const [userFilters, setUserFilters] = useState({ search: '', role: '', status: '' })
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [userModalMode, setUserModalMode] = useState('create')
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [editingUserId, setEditingUserId] = useState(null)

  const [supplies, setSupplies] = useState([])
  const [supplyFilters, setSupplyFilters] = useState({ search: '', category: '', provider: '' })
  const [supplyModalOpen, setSupplyModalOpen] = useState(false)
  const [supplyModalMode, setSupplyModalMode] = useState('create')
  const [supplyForm, setSupplyForm] = useState(EMPTY_SUPPLY_FORM)
  const [editingSupplyId, setEditingSupplyId] = useState(null)

  const [roles, setRoles] = useState([])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadOverview = async () => {
    const res = await api.get('/admin/overview')
    setOverview(res.data)
  }

  const loadMeta = async () => {
    const res = await api.get('/admin/meta')
    setMeta(res.data)
  }

  const loadUsers = async () => {
    const params = {}
    if (userFilters.search) params.search = userFilters.search
    if (userFilters.role) params.role = userFilters.role
    if (userFilters.status) params.status = userFilters.status
    const res = await api.get('/admin/users', { params })
    setUsers(res.data)
  }

  const loadSupplies = async () => {
    const params = {}
    if (supplyFilters.search) params.search = supplyFilters.search
    if (supplyFilters.category) params.category = supplyFilters.category
    if (supplyFilters.provider) params.provider = supplyFilters.provider
    const res = await api.get('/admin/supplies', { params })
    setSupplies(res.data)
  }

  const loadRoles = async () => {
    const res = await api.get('/admin/roles')
    setRoles(res.data)
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([loadOverview(), loadMeta(), loadUsers(), loadSupplies(), loadRoles()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo cargar el panel de configuración.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!loading) loadUsers()
  }, [userFilters.search, userFilters.role, userFilters.status])

  useEffect(() => {
    if (!loading) loadSupplies()
  }, [supplyFilters.search, supplyFilters.category, supplyFilters.provider])

  const lowStockCount = useMemo(() => supplies.filter(s => Number(s.stock) <= 10).length, [supplies])

  const openCreateUser = () => {
    setUserModalMode('create')
    setEditingUserId(null)
    setUserForm(EMPTY_USER_FORM)
    setUserModalOpen(true)
  }

  const openEditUser = (selectedUser) => {
    setUserModalMode('edit')
    setEditingUserId(selectedUser.id_usuario)
    setUserForm({
      nombres: selectedUser.nombres,
      login: selectedUser.login,
      email: selectedUser.email,
      id_rol: selectedUser.id_rol,
      id_departamento: selectedUser.id_departamento || '',
      password: '',
      activo: Boolean(selectedUser.activo),
    })
    setUserModalOpen(true)
  }

  const submitUser = async (event) => {
    event.preventDefault()
    try {
      if (userModalMode === 'create') {
        await api.post('/admin/users', userForm)
        showToast('Usuario creado correctamente.')
      } else {
        await api.put(`/admin/users/${editingUserId}`, userForm)
        showToast('Usuario actualizado correctamente.')
      }

      setUserModalOpen(false)
      await Promise.all([loadUsers(), loadOverview()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo guardar el usuario.', 'error')
    }
  }

  const toggleUserStatus = async (selectedUser) => {
    try {
      await api.patch(`/admin/users/${selectedUser.id_usuario}/status`, { activo: !selectedUser.activo })
      showToast(selectedUser.activo ? 'Usuario desactivado.' : 'Usuario activado.')
      await Promise.all([loadUsers(), loadOverview()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo cambiar el estado del usuario.', 'error')
    }
  }

  const deleteUser = async (selectedUser) => {
    const confirmed = window.confirm(`¿Eliminar al usuario ${selectedUser.nombres}?`)
    if (!confirmed) return

    try {
      await api.delete(`/admin/users/${selectedUser.id_usuario}`)
      showToast('Usuario eliminado correctamente.')
      await Promise.all([loadUsers(), loadOverview()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo eliminar el usuario.', 'error')
    }
  }

  const openCreateSupply = () => {
    setSupplyModalMode('create')
    setEditingSupplyId(null)
    setSupplyForm(EMPTY_SUPPLY_FORM)
    setSupplyModalOpen(true)
  }

  const openEditSupply = (selectedSupply) => {
    setSupplyModalMode('edit')
    setEditingSupplyId(selectedSupply.id_suministro)
    setSupplyForm({
      descripcion: selectedSupply.descripcion,
      id_tipo_suministro: selectedSupply.id_tipo_suministro,
      stock: selectedSupply.stock,
      id_estado_suministro: selectedSupply.id_estado_suministro,
      id_suministro_precio: selectedSupply.id_suministro_precio || '',
      id_proveedor: selectedSupply.id_proveedor || '',
      precio_compra: selectedSupply.precio_compra ?? '',
    })
    setSupplyModalOpen(true)
  }

  const submitSupply = async (event) => {
    event.preventDefault()
    try {
      if (supplyModalMode === 'create') {
        await api.post('/admin/supplies', supplyForm)
        showToast('Suministro creado correctamente.')
      } else {
        await api.put(`/admin/supplies/${editingSupplyId}`, supplyForm)
        showToast('Suministro actualizado correctamente.')
      }

      setSupplyModalOpen(false)
      await Promise.all([loadSupplies(), loadOverview()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo guardar el suministro.', 'error')
    }
  }

  const deleteSupply = async (selectedSupply) => {
    const confirmed = window.confirm(`¿Eliminar el suministro ${selectedSupply.descripcion}?`)
    if (!confirmed) return

    try {
      await api.delete(`/admin/supplies/${selectedSupply.id_suministro}`)
      showToast('Suministro eliminado correctamente.')
      await Promise.all([loadSupplies(), loadOverview()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo eliminar el suministro.', 'error')
    }
  }

  const changeRolePermission = (roleId, permissionKey, value) => {
    setRoles((prevRoles) => prevRoles.map((role) =>
      role.id_rol === roleId ? { ...role, [permissionKey]: value ? 1 : 0 } : role
    ))
  }

  const saveRolePermissions = async (role) => {
    try {
      await api.put(`/admin/roles/${role.id_rol}/permissions`, {
        puede_pedidos: Boolean(role.puede_pedidos),
        puede_reportes: Boolean(role.puede_reportes),
        puede_aprobacion: Boolean(role.puede_aprobacion),
        puede_configuracion: Boolean(role.puede_configuracion),
      })
      showToast(`Permisos del rol ${role.descripcion} actualizados.`)
      await loadRoles()
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudieron actualizar permisos.', 'error')
    }
  }

  return (
    <div className="configuracion-container">
      <Layout />

      <main
        className="configuracion-main"
        style={{
          marginLeft: isCollapsed ? '70px' : '250px',
          maxWidth: isCollapsed ? 'calc(100vw - 70px)' : 'calc(100vw - 250px)',
          transition: 'margin-left 0.3s ease, max-width 0.3s ease',
        }}
      >
        <div className="admin-layout-full">
          <section className="admin-content">
            <header className="admin-topbar">
              <div>
                <h1>Configuración del Sistema</h1>
                <p>Gestión centralizada de usuarios, suministros y permisos.</p>
              </div>
              <button type="button" className="admin-refresh icon-btn" onClick={loadAll} title="Actualizar"><RefreshIcon /></button>
            </header>

            {loading ? (
              <div className="admin-loading">Cargando panel administrativo...</div>
            ) : (
              <>
                {activeSection === 'dashboard' && (
                  <div className="admin-dashboard-grid">
                    <article className="admin-stat-card">
                      <h3>Usuarios Totales</h3>
                      <p>{overview?.totalUsers || 0}</p>
                    </article>
                    <article className="admin-stat-card">
                      <h3>Usuarios Activos</h3>
                      <p>{overview?.activeUsers || 0}</p>
                    </article>
                    <article className="admin-stat-card">
                      <h3>Suministros</h3>
                      <p>{overview?.totalSupplies || 0}</p>
                    </article>
                    <article className="admin-stat-card warning">
                      <h3>Stock Bajo</h3>
                      <p>{overview?.lowStockSupplies || 0}</p>
                    </article>
                  </div>
                )}

                {activeSection === 'users' && (
                  <div className="admin-panel-card">
                    <div className="admin-panel-header">
                      <h2>Gestión de Usuarios</h2>
                    </div>

                    <div className="admin-filters">
                      <input
                        type="text"
                        placeholder="Buscar por nombre, login o email..."
                        value={userFilters.search}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, search: event.target.value }))}
                      />
                      <select
                        value={userFilters.role}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, role: event.target.value }))}
                      >
                        <option value="">Todos los roles</option>
                        {meta.roles.map((role) => (
                          <option key={role.id_rol} value={role.id_rol}>{role.descripcion}</option>
                        ))}
                      </select>
                      <select
                        value={userFilters.status}
                        onChange={(event) => setUserFilters((prev) => ({ ...prev, status: event.target.value }))}
                      >
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Fecha de registro</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((item) => (
                            <tr key={item.id_usuario}>
                              <td data-label="Nombre">{item.nombres}</td>
                              <td data-label="Email">{item.email}</td>
                              <td data-label="Rol">{item.rol}</td>
                              <td data-label="Estado">
                                <span className={`status-badge ${item.activo ? 'active' : 'inactive'}`}>
                                  {item.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td data-label="Fecha">{item.fecha_registro}</td>
                              <td data-label="Acciones" className="actions-cell">
                                <button type="button" className="icon-btn" onClick={() => openEditUser(item)} title="Editar"><EditIcon /></button>
                                <button type="button" className="danger icon-btn" onClick={() => deleteUser(item)} title="Eliminar"><TrashIcon /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'supplies' && (
                  <div className="admin-panel-card">
                    <div className="admin-panel-header">
                      <h2>Gestión de Suministros</h2>
                      <button type="button" className="admin-primary icon-btn-with-text" onClick={openCreateSupply} title="Nuevo Suministro"><PlusIcon /> <span>Nuevo Suministro</span></button>
                    </div>

                    <div className="admin-filters admin-filters-supplies">
                      <input
                        type="text"
                        placeholder="Buscar suministro..."
                        value={supplyFilters.search}
                        onChange={(event) => setSupplyFilters((prev) => ({ ...prev, search: event.target.value }))}
                      />
                      <select
                        value={supplyFilters.category}
                        onChange={(event) => setSupplyFilters((prev) => ({ ...prev, category: event.target.value }))}
                      >
                        <option value="">Todas las categorías</option>
                        {meta.categorias.map((category) => (
                          <option key={category.id_tipo_suministro} value={category.id_tipo_suministro}>
                            {category.descripcion}
                          </option>
                        ))}
                      </select>
                      <select
                        value={supplyFilters.provider}
                        onChange={(event) => setSupplyFilters((prev) => ({ ...prev, provider: event.target.value }))}
                      >
                        <option value="">Todos los proveedores</option>
                        {meta.proveedores.map((provider) => (
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
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Fecha de actualización</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplies.map((item) => (
                            <tr key={`${item.id_suministro}-${item.id_suministro_precio || item.id_proveedor || 'sin-proveedor'}`}>
                              <td data-label="Nombre">{item.descripcion}</td>
                              <td data-label="Categoría">{item.categoria}</td>
                              <td data-label="Proveedor">{item.proveedor || 'Sin proveedor'}</td>
                              <td data-label="Precio">{item.precio_compra !== null && item.precio_compra !== undefined ? Number(item.precio_compra).toFixed(2) : '-'}</td>
                              <td data-label="Stock">
                                <span className={Number(item.stock) <= 10 ? 'low-stock' : ''}>
                                  {item.stock}
                                </span>
                              </td>
                              <td data-label="Estado">{item.estado}</td>
                              <td data-label="Actualización">{item.fecha_actualizacion}</td>
                              <td data-label="Acciones" className="actions-cell">
                                <button type="button" className="icon-btn" onClick={() => openEditSupply(item)} title="Editar"><EditIcon /></button>
                                <button type="button" className="danger icon-btn" onClick={() => deleteSupply(item)} title="Eliminar"><TrashIcon /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === 'roles' && (
                  <div className="admin-panel-card">
                    <div className="admin-panel-header">
                      <h2>Roles y Permisos</h2>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Rol</th>
                            <th>Usuarios</th>
                            <th>Pedidos</th>
                            <th>Reportes</th>
                            <th>Aprobación</th>
                            <th>Configuración</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roles.map((role) => (
                            <tr key={role.id_rol}>
                              <td data-label="Rol">{role.descripcion}</td>
                              <td data-label="Usuarios">{role.total_usuarios}</td>
                              <td data-label="Pedidos"><input type="checkbox" checked={Boolean(role.puede_pedidos)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_pedidos', e.target.checked)} /></td>
                              <td data-label="Reportes"><input type="checkbox" checked={Boolean(role.puede_reportes)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_reportes', e.target.checked)} /></td>
                              <td data-label="Aprobación"><input type="checkbox" checked={Boolean(role.puede_aprobacion)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_aprobacion', e.target.checked)} /></td>
                              <td data-label="Configuración"><input type="checkbox" checked={Boolean(role.puede_configuracion)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_configuracion', e.target.checked)} /></td>
                              <td data-label="Acciones" className="actions-cell">
                                <button type="button" className="icon-btn" onClick={() => saveRolePermissions(role)} title="Guardar"><SaveIcon /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {userModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{userModalMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</h3>
            <form onSubmit={submitUser} className="admin-form-grid">
              {userModalMode === 'create' && (
                <>
                  <input type="text" placeholder="Nombre completo" value={userForm.nombres} onChange={(e) => setUserForm((prev) => ({ ...prev, nombres: e.target.value }))} required />
                  <input type="text" placeholder="Login" value={userForm.login} onChange={(e) => setUserForm((prev) => ({ ...prev, login: e.target.value }))} required />
                  <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} required />
                  <input type="password" placeholder="Contraseña" value={userForm.password} onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))} required />
                </>
              )}
              <select value={userForm.id_rol} onChange={(e) => setUserForm((prev) => ({ ...prev, id_rol: e.target.value }))} required>
                <option value="">Rol...</option>
                {meta.roles.map((role) => <option key={role.id_rol} value={role.id_rol}>{role.descripcion}</option>)}
              </select>
              <select value={userForm.id_departamento} onChange={(e) => setUserForm((prev) => ({ ...prev, id_departamento: e.target.value }))} required>
                <option value="">Departamento...</option>
                {meta.departamentos.map((department) => <option key={department.id_departamento} value={department.id_departamento}>{department.descripcion}</option>)}
              </select>
              {userModalMode === 'edit' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' }}>
                  <input type="checkbox" checked={userForm.activo} onChange={(e) => setUserForm((prev) => ({ ...prev, activo: e.target.checked }))} />
                  <span>Usuario activo</span>
                </label>
              )}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary icon-btn-with-text" onClick={() => setUserModalOpen(false)}><XIcon /> <span>Cancelar</span></button>
                <button type="submit" className="admin-primary icon-btn-with-text"><CheckIcon /> <span>Guardar</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {supplyModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{supplyModalMode === 'create' ? 'Crear Suministro' : 'Editar Suministro'}</h3>
            <form onSubmit={submitSupply} className="admin-form-grid">
              <input type="text" placeholder="Descripción" value={supplyForm.descripcion} onChange={(e) => setSupplyForm((prev) => ({ ...prev, descripcion: e.target.value }))} required />
              <select value={supplyForm.id_tipo_suministro} onChange={(e) => setSupplyForm((prev) => ({ ...prev, id_tipo_suministro: e.target.value }))} required>
                <option value="">Categoría...</option>
                {meta.categorias.map((category) => <option key={category.id_tipo_suministro} value={category.id_tipo_suministro}>{category.descripcion}</option>)}
              </select>
              <select value={supplyForm.id_proveedor} onChange={(e) => setSupplyForm((prev) => ({ ...prev, id_proveedor: e.target.value }))} required>
                <option value="">Proveedor...</option>
                {meta.proveedores.map((provider) => <option key={provider.id_proveedor} value={provider.id_proveedor}>{provider.nombre_proveedor}</option>)}
              </select>
              <input type="number" min="0" step="0.01" placeholder="Precio" value={supplyForm.precio_compra} onChange={(e) => setSupplyForm((prev) => ({ ...prev, precio_compra: e.target.value }))} required />
              <input type="number" min="0" placeholder="Stock" value={supplyForm.stock} onChange={(e) => setSupplyForm((prev) => ({ ...prev, stock: e.target.value }))} required />
              <select value={supplyForm.id_estado_suministro} onChange={(e) => setSupplyForm((prev) => ({ ...prev, id_estado_suministro: e.target.value }))} required>
                {meta.estadosSuministro.map((state) => <option key={state.id_estado_suministro} value={state.id_estado_suministro}>{state.descripcion}</option>)}
              </select>
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary icon-btn-with-text" onClick={() => setSupplyModalOpen(false)}><XIcon /> <span>Cancelar</span></button>
                <button type="submit" className="admin-primary icon-btn-with-text"><CheckIcon /> <span>Guardar</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}