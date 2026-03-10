import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import { useDataRefresh } from '../context/DataRefreshContext'
import api from '../api/axios'
import Layout from '../components/Layout'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  NAV_ITEMS,
  SUPPLIES_TABS,
  EMPTY_USER_FORM,
  EMPTY_SUPPLY_FORM,
  EMPTY_PDV_FORM,
} from './configuracion/constants'
import {
  EditIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  RefreshIcon,
  PlusIcon,
} from './configuracion/icons'
import DashboardSection from './configuracion/sections/DashboardSection'
import RolesSection from './configuracion/sections/RolesSection'
import UsersSection from './configuracion/sections/UsersSection'
import SuppliesSection from './configuracion/sections/SuppliesSection'
import UserModal from './configuracion/modals/UserModal'
import SupplyModal from './configuracion/modals/SupplyModal'
import PdvModal from './configuracion/modals/PdvModal'
import CategoryModal from './configuracion/modals/CategoryModal'
import '../style/Configuracion.css'

export default function Configuracion() {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const { refreshPdvs, refreshSuministros } = useDataRefresh()
  const location = useLocation()

  // Leer sección activa desde el hash de la URL
  const hash = location.hash.replace('#', '')
  const activeSection = hash || 'dashboard'
  const [navOpen, setNavOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [suppliesActiveTab, setSuppliesActiveTab] = useState('supplies-list')

  const [overview, setOverview] = useState(null)
  const [meta, setMeta] = useState({
    departamentos: [],
    roles: [],
    categorias: [],
    estadosSuministro: [],
    proveedores: [],
    zonasComerciales: [],
    gruposPdvs: [],
    estadosPdvs: [],
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

  const [pdvs, setPdvs] = useState([])
  const [pdvFilters, setPdvFilters] = useState({ search: '', zone: '', provider: '' })
  const [pdvModalOpen, setPdvModalOpen] = useState(false)
  const [pdvModalMode, setPdvModalMode] = useState('create')
  const [pdvForm, setPdvForm] = useState(EMPTY_PDV_FORM)
  const [editingPdvId, setEditingPdvId] = useState(null)

  const [categories, setCategories] = useState([])
  const [categoryFilters, setCategoryFilters] = useState({ search: '' })
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categoryModalMode, setCategoryModalMode] = useState('create')
  const [categoryForm, setCategoryForm] = useState({ descripcion: '' })
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  const [roles, setRoles] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  })

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

  const loadPdvs = async () => {
    const params = {}
    if (pdvFilters.search) params.search = pdvFilters.search
    if (pdvFilters.zone) params.zone = pdvFilters.zone
    if (pdvFilters.provider) params.provider = pdvFilters.provider
    const res = await api.get('/admin/pdvs', { params })
    setPdvs(res.data)
  }

  const loadCategories = async () => {
    const params = {}
    if (categoryFilters.search) params.search = categoryFilters.search
    const res = await api.get('/admin/categories', { params })
    setCategories(res.data)
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      await Promise.all([loadOverview(), loadMeta(), loadUsers(), loadSupplies(), loadRoles(), loadPdvs(), loadCategories()])
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

  useEffect(() => {
    if (!loading) loadPdvs()
  }, [pdvFilters.search, pdvFilters.zone, pdvFilters.provider])

  useEffect(() => {
    if (!loading) loadCategories()
  }, [categoryFilters.search])

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
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar usuario',
      message: `¿Eliminar al usuario ${selectedUser.nombres}?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${selectedUser.id_usuario}`)
          showToast('Usuario eliminado correctamente.')
          await Promise.all([loadUsers(), loadOverview()])
        } catch (err) {
          showToast(err.response?.data?.error || 'No se pudo eliminar el usuario.', 'error')
        }
      },
    })
  }

  const handleUserFilterChange = (key, value) => {
    setUserFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleUserFormChange = (key, value) => {
    setUserForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSupplyFilterChange = (key, value) => {
    setSupplyFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handlePdvFilterChange = (key, value) => {
    setPdvFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleCategoryFilterChange = (key, value) => {
    setCategoryFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSupplyFormChange = (key, value) => {
    setSupplyForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePdvFormChange = (key, value) => {
    setPdvForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCategoryFormChange = (key, value) => {
    setCategoryForm((prev) => ({ ...prev, [key]: value }))
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
      refreshSuministros() // 🔄 Notificar a otras páginas que los suministros cambiaron
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo guardar el suministro.', 'error')
    }
  }

  const deleteSupply = async (selectedSupply) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar suministro',
      message: `¿Eliminar el suministro ${selectedSupply.descripcion}?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/supplies/${selectedSupply.id_suministro}`)
          showToast('Suministro eliminado correctamente.')
          await Promise.all([loadSupplies(), loadOverview()])
        } catch (err) {
          showToast(err.response?.data?.error || 'No se pudo eliminar el suministro.', 'error')
        }
      },
    })
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

  const openCreatePdv = () => {
    setPdvModalMode('create')
    setEditingPdvId(null)
    setPdvForm(EMPTY_PDV_FORM)
    setPdvModalOpen(true)
  }

  const openEditPdv = (pdv) => {
    setPdvModalMode('edit')
    setEditingPdvId(pdv.id_pdv)
    setPdvForm({
      descripcion: pdv.descripcion,
      direccion: pdv.direccion || '',
      id_grupo_pdv: pdv.id_grupo_pdv || '',
      id_estado_pdv: pdv.id_estado_pdv || '',
      id_zona_comercial: pdv.id_zona_comercial || '',
      id_proveedor_principal: pdv.id_proveedor_principal || '',
    })
    setPdvModalOpen(true)
  }

  const cancelPdvModal = () => {
    setEditingPdvId(null)
    setPdvForm(EMPTY_PDV_FORM)
    setPdvModalOpen(false)
  }

  const submitPdv = async (event) => {
    event.preventDefault()
    try {
      if (pdvModalMode === 'create') {
        await api.post('/admin/pdvs', pdvForm)
        showToast('PDV creado correctamente.')
      } else {
        await api.put(`/admin/pdvs/${editingPdvId}`, {
          id_proveedor_principal: pdvForm.id_proveedor_principal,
          id_grupo_pdv: pdvForm.id_grupo_pdv
        })
        showToast('PDV actualizado correctamente.')
      }

      setPdvModalOpen(false)
      setEditingPdvId(null)
      setPdvForm(EMPTY_PDV_FORM)
      await loadPdvs()
      refreshPdvs() // 🔄 Notificar a otras páginas que los PDVs cambiaron
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo guardar el PDV.', 'error')
    }
  }

  const openCreateCategory = () => {
    setCategoryModalMode('create')
    setEditingCategoryId(null)
    setCategoryForm({ descripcion: '' })
    setCategoryModalOpen(true)
  }

  const openEditCategory = (category) => {
    setCategoryModalMode('edit')
    setEditingCategoryId(category.id_tipo_suministro)
    setCategoryForm({ descripcion: category.descripcion })
    setCategoryModalOpen(true)
  }

  const submitCategory = async (event) => {
    event.preventDefault()
    try {
      if (categoryModalMode === 'create') {
        await api.post('/admin/categories', categoryForm)
        showToast('Categoría creada correctamente.')
      } else {
        await api.put(`/admin/categories/${editingCategoryId}`, categoryForm)
        showToast('Categoría actualizada correctamente.')
      }

      setCategoryModalOpen(false)
      await Promise.all([loadCategories(), loadMeta()])
    } catch (err) {
      showToast(err.response?.data?.error || 'No se pudo guardar la categoría.', 'error')
    }
  }

  const deleteCategory = async (category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar categoría',
      message: `¿Eliminar la categoría "${category.descripcion}"?`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/categories/${category.id_tipo_suministro}`)
          showToast('Categoría eliminada correctamente.')
          await Promise.all([loadCategories(), loadMeta()])
        } catch (err) {
          showToast(err.response?.data?.error || 'No se pudo eliminar la categoría.', 'error')
        }
      },
    })
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
                {activeSection === 'dashboard' && <DashboardSection overview={overview} />}

                {activeSection === 'users' && (
                  <UsersSection
                    users={users}
                    userFilters={userFilters}
                    roles={meta.roles}
                    onFilterChange={handleUserFilterChange}
                    onEditUser={openEditUser}
                    onDeleteUser={deleteUser}
                    EditIcon={EditIcon}
                    TrashIcon={TrashIcon}
                  />
                )}

                {activeSection === 'supplies' && (
                  <SuppliesSection
                    suppliesActiveTab={suppliesActiveTab}
                    onTabChange={setSuppliesActiveTab}
                    tabs={SUPPLIES_TABS}
                    onCreateSupply={openCreateSupply}
                    onCreatePdv={openCreatePdv}
                    onCreateCategory={openCreateCategory}
                    supplyFilters={supplyFilters}
                    onSupplyFilterChange={handleSupplyFilterChange}
                    categoriesMeta={meta.categorias}
                    providersMeta={meta.proveedores}
                    lowStockCount={lowStockCount}
                    supplies={supplies}
                    onEditSupply={openEditSupply}
                    onDeleteSupply={deleteSupply}
                    pdvFilters={pdvFilters}
                    onPdvFilterChange={handlePdvFilterChange}
                    zonesMeta={meta.zonasComerciales}
                    pdvs={pdvs}
                    onEditPdv={openEditPdv}
                    categories={categories}
                    categoryFilters={categoryFilters}
                    onCategoryFilterChange={handleCategoryFilterChange}
                    onEditCategory={openEditCategory}
                    onDeleteCategory={deleteCategory}
                    EditIcon={EditIcon}
                    TrashIcon={TrashIcon}
                    PlusIcon={PlusIcon}
                  />
                )}

                {activeSection === 'roles' && (
                  <RolesSection
                    roles={roles}
                    onChangeRolePermission={changeRolePermission}
                    onSaveRolePermissions={saveRolePermissions}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <UserModal
        isOpen={userModalOpen}
        mode={userModalMode}
        form={userForm}
        roles={meta.roles}
        departments={meta.departamentos}
        onClose={() => setUserModalOpen(false)}
        onSubmit={submitUser}
        onChange={handleUserFormChange}
        XIcon={XIcon}
        CheckIcon={CheckIcon}
      />

      <SupplyModal
        isOpen={supplyModalOpen}
        mode={supplyModalMode}
        form={supplyForm}
        categories={meta.categorias}
        providers={meta.proveedores}
        states={meta.estadosSuministro}
        onClose={() => setSupplyModalOpen(false)}
        onSubmit={submitSupply}
        onChange={handleSupplyFormChange}
        XIcon={XIcon}
        CheckIcon={CheckIcon}
      />

      <PdvModal
        isOpen={pdvModalOpen}
        mode={pdvModalMode}
        form={pdvForm}
        zones={meta.zonasComerciales}
        states={meta.estadosPdvs}
        groups={meta.gruposPdvs}
        providers={meta.proveedores}
        onClose={cancelPdvModal}
        onSubmit={submitPdv}
        onChange={handlePdvFormChange}
        XIcon={XIcon}
        CheckIcon={CheckIcon}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        mode={categoryModalMode}
        form={categoryForm}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={submitCategory}
        onChange={handleCategoryFormChange}
        XIcon={XIcon}
        CheckIcon={CheckIcon}
      />

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={async () => {
          const action = confirmDialog.onConfirm
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })
          if (typeof action === 'function') {
            await action()
          }
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  )
}