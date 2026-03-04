import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
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
}

const EMPTY_SUPPLY_FORM = {
  descripcion: '',
  id_tipo_suministro: '',
  stock: 0,
  id_estado_suministro: 1,
}

export default function Configuracion() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()

  const [activeSection, setActiveSection] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [overview, setOverview] = useState(null)
  const [meta, setMeta] = useState({ departamentos: [], roles: [], categorias: [], estadosSuministro: [] })

  const [users, setUsers] = useState([])
  const [userFilters, setUserFilters] = useState({ search: '', role: '', status: '' })
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [userModalMode, setUserModalMode] = useState('create')
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [editingUserId, setEditingUserId] = useState(null)

  const [supplies, setSupplies] = useState([])
  const [supplyFilters, setSupplyFilters] = useState({ search: '', category: '' })
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
  }, [supplyFilters.search, supplyFilters.category])

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

  const updateStock = async (selectedSupply) => {
    const newStock = window.prompt(`Nuevo stock para ${selectedSupply.descripcion}:`, String(selectedSupply.stock))
    if (newStock === null) return

    try {
      await api.patch(`/admin/supplies/${selectedSupply.id_suministro}/stock`, { stock: Number(newStock) })
      showToast('Stock actualizado correctamente.')
      await Promise.all([loadSupplies(), loadOverview()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo actualizar el stock.', 'error')
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
      <Navbar />
      <Sidebar />

      <main
        className="configuracion-main"
        style={{
          marginLeft: isCollapsed ? '70px' : '250px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <div className="admin-layout">
          <aside className="admin-side-menu">
            <div className="admin-side-header" onClick={() => setNavOpen((prev) => !prev)}>
              <h2>Panel Administrativo</h2>
              <span>{navOpen ? '▾' : '▸'}</span>
            </div>

            {navOpen && (
              <div className="admin-nav-list">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`admin-nav-item ${activeSection === item.key ? 'active' : ''}`}
                    onClick={() => setActiveSection(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <div className="admin-side-footer">
              <p><strong>Administrador:</strong> {user?.nombre || user?.login}</p>
              <p><strong>Área:</strong> {user?.departmentName}</p>
            </div>
          </aside>

          <section className="admin-content">
            <header className="admin-topbar">
              <div>
                <h1>Configuración del Sistema</h1>
                <p>Gestión centralizada de usuarios, suministros y permisos.</p>
              </div>
              <button type="button" className="admin-refresh" onClick={loadAll}>Actualizar</button>
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
                      <button type="button" className="admin-primary" onClick={openCreateUser}>+ Nuevo Usuario</button>
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
                              <td>{item.nombres}</td>
                              <td>{item.email}</td>
                              <td>{item.rol}</td>
                              <td>
                                <span className={`status-badge ${item.activo ? 'active' : 'inactive'}`}>
                                  {item.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td>{item.fecha_registro}</td>
                              <td className="actions-cell">
                                <button type="button" onClick={() => openEditUser(item)}>Editar</button>
                                <button type="button" onClick={() => toggleUserStatus(item)}>
                                  {item.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                <button type="button" className="danger" onClick={() => deleteUser(item)}>Eliminar</button>
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
                      <button type="button" className="admin-primary" onClick={openCreateSupply}>+ Nuevo Suministro</button>
                    </div>

                    <div className="admin-filters">
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
                      <div className="stock-pill">Stock bajo: {lowStockCount}</div>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Fecha de actualización</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplies.map((item) => (
                            <tr key={item.id_suministro}>
                              <td>{item.descripcion}</td>
                              <td>{item.categoria}</td>
                              <td>
                                <span className={Number(item.stock) <= 10 ? 'low-stock' : ''}>
                                  {item.stock}
                                </span>
                              </td>
                              <td>{item.estado}</td>
                              <td>{item.fecha_actualizacion}</td>
                              <td className="actions-cell">
                                <button type="button" onClick={() => openEditSupply(item)}>Editar</button>
                                <button type="button" onClick={() => updateStock(item)}>Actualizar Stock</button>
                                <button type="button" className="danger" onClick={() => deleteSupply(item)}>Eliminar</button>
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
                              <td>{role.descripcion}</td>
                              <td>{role.total_usuarios}</td>
                              <td><input type="checkbox" checked={Boolean(role.puede_pedidos)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_pedidos', e.target.checked)} /></td>
                              <td><input type="checkbox" checked={Boolean(role.puede_reportes)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_reportes', e.target.checked)} /></td>
                              <td><input type="checkbox" checked={Boolean(role.puede_aprobacion)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_aprobacion', e.target.checked)} /></td>
                              <td><input type="checkbox" checked={Boolean(role.puede_configuracion)} onChange={(e) => changeRolePermission(role.id_rol, 'puede_configuracion', e.target.checked)} /></td>
                              <td className="actions-cell">
                                <button type="button" onClick={() => saveRolePermissions(role)}>Guardar</button>
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
              <input type="text" placeholder="Nombre completo" value={userForm.nombres} onChange={(e) => setUserForm((prev) => ({ ...prev, nombres: e.target.value }))} required />
              <input type="text" placeholder="Login" value={userForm.login} onChange={(e) => setUserForm((prev) => ({ ...prev, login: e.target.value }))} required disabled={userModalMode === 'edit'} />
              <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} required />
              <select value={userForm.id_rol} onChange={(e) => setUserForm((prev) => ({ ...prev, id_rol: e.target.value }))} required>
                <option value="">Rol...</option>
                {meta.roles.map((role) => <option key={role.id_rol} value={role.id_rol}>{role.descripcion}</option>)}
              </select>
              <select value={userForm.id_departamento} onChange={(e) => setUserForm((prev) => ({ ...prev, id_departamento: e.target.value }))} required>
                <option value="">Departamento...</option>
                {meta.departamentos.map((department) => <option key={department.id_departamento} value={department.id_departamento}>{department.descripcion}</option>)}
              </select>
              <input type="password" placeholder={userModalMode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'} value={userForm.password} onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))} required={userModalMode === 'create'} />
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary" onClick={() => setUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-primary">Guardar</button>
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
              <input type="number" min="0" placeholder="Stock" value={supplyForm.stock} onChange={(e) => setSupplyForm((prev) => ({ ...prev, stock: e.target.value }))} required />
              <select value={supplyForm.id_estado_suministro} onChange={(e) => setSupplyForm((prev) => ({ ...prev, id_estado_suministro: e.target.value }))} required>
                {meta.estadosSuministro.map((state) => <option key={state.id_estado_suministro} value={state.id_estado_suministro}>{state.descripcion}</option>)}
              </select>
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary" onClick={() => setSupplyModalOpen(false)}>Cancelar</button>
                <button type="submit" className="admin-primary">Guardar</button>
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