import { useState, useEffect } from 'react'
import api from '../../../api/axios'
import '../../../style/GestionConfiguracion.css'

export default function GestionConfiguracionSection({
  onNotify,
}) {
  const [activeTab, setActiveTab] = useState('departamentos')
  const [loading, setLoading] = useState(true)

  // Departamentos - Ventana de Pedidos
  const [departamentos, setDepartamentos] = useState([])
  const [ventanaGlobal, setVentanaGlobal] = useState({ dias_inicio: 1, dias_fin: 3 })
  const [updatingVentana, setUpdatingVentana] = useState(false)

  // PDVs por Región
  const [pdvsPorRegion, setPdvsPorRegion] = useState([])
  const [updatingRegionId, setUpdatingRegionId] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [deptRes, pdvRes] = await Promise.all([
        api.get('/gestion/departamentos/ventana-pedidos'),
        api.get('/gestion/pdvs/configuracion-por-region'),
      ])

      const departamentosData = deptRes.data || []
      const regionesData = (pdvRes.data || []).map((region) => ({
        ...region,
        dia_inicio: region.dia_inicio ?? '',
        dia_fin: region.dia_fin ?? '',
      }))

      setDepartamentos(departamentosData)
      setPdvsPorRegion(regionesData)

      if (departamentosData.length > 0) {
        setVentanaGlobal({
          dias_inicio: Number(departamentosData[0].dias_inicio_ventana || 1),
          dias_fin: Number(departamentosData[0].dias_fin_ventana || 3),
        })
      }
    } catch (err) {
      console.error('Error cargando datos:', err)
      if (typeof onNotify === 'function') {
        onNotify(err.response?.data?.error || 'No se pudo cargar la configuración operativa.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // DEPARTAMENTOS - Ventana de Pedidos
  // ============================================================

  const handleVentanaChange = (field, value) => {
    setVentanaGlobal(prev => ({
      ...prev,
      [field]: parseInt(value) || 1
    }))
  }

  const handleActualizarVentana = async () => {
    if (ventanaGlobal.dias_inicio > ventanaGlobal.dias_fin) {
      if (typeof onNotify === 'function') {
        onNotify('La fecha de inicio debe ser menor o igual a la fecha final.', 'error')
      }
      return
    }

    setUpdatingVentana(true)
    try {
      await api.put('/gestion/departamentos/ventana-pedidos/actualizar-todos', {
        dias_inicio_ventana: ventanaGlobal.dias_inicio,
        dias_fin_ventana: ventanaGlobal.dias_fin,
      })

      if (typeof onNotify === 'function') {
        onNotify('Ventana de pedidos actualizada para todos los departamentos.')
      }
      await loadAllData()
    } catch (err) {
      if (typeof onNotify === 'function') {
        onNotify(err.response?.data?.error || 'No se pudo actualizar la ventana de pedidos.', 'error')
      }
    } finally {
      setUpdatingVentana(false)
    }
  }

  // ============================================================
  // PDVs - Configuración por Región
  // ============================================================

  const handleRegionWindowChange = (idRegion, field) => {
    return (e) => {
      const valor = e.target.value === '' ? '' : Number(e.target.value)
      setPdvsPorRegion(prev =>
        prev.map(region => ({
          ...region,
          [field]: region.id_region === idRegion ? valor : region[field],
        }))
      )
    }
  }

  const handleGuardarRegion = async (region) => {
    const diaInicio = Number(region.dia_inicio)
    const diaFin = Number(region.dia_fin)

    if (!diaInicio || !diaFin || diaInicio < 1 || diaFin > 31 || diaInicio > diaFin) {
      if (typeof onNotify === 'function') {
        onNotify('El rango de fechas para la región es inválido.', 'error')
      }
      return
    }

    setUpdatingRegionId(region.id_region)
    try {
	  await api.put(`/gestion/pdvs/ventana-pedidos/region/${region.id_region}`, {
		dia_inicio: diaInicio,
		dia_fin: diaFin,
	  })

      if (typeof onNotify === 'function') {
		onNotify(`Ventana de pedidos actualizada para la región ${region.region}.`)
      }
      await loadAllData()
    } catch (err) {
      if (typeof onNotify === 'function') {
		onNotify(err.response?.data?.error || 'No se pudo guardar la configuración de la región.', 'error')
      }
    } finally {
	  setUpdatingRegionId(null)
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="gestion-configuracion-section">
      <h2>Gestión de Configuración</h2>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'departamentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('departamentos')}
        >
          Departamentos - Ventana de Pedidos
        </button>
        <button
          className={`tab ${activeTab === 'pdvs' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdvs')}
        >
          PDVs - Fechas por Región
        </button>
      </div>

      {/* TAB: Departamentos */}
      {activeTab === 'departamentos' && (
        <div className="tab-content departamentos-tab">
          <div className="departamentos-config">
            <h3>Configurar Ventana de Pedidos Para Todos Los Departamentos</h3>
            <p className="help-text">
              Define el rango de días (1-31) en los que los departamentos pueden hacer pedidos cada mes.
            </p>

            <div className="config-form">
              <div className="form-group">
                <label htmlFor="dias_inicio">Día de Inicio (1-31):</label>
                <input
                  id="dias_inicio"
                  type="number"
                  min="1"
                  max="31"
                  value={ventanaGlobal.dias_inicio}
                  onChange={(e) => handleVentanaChange('dias_inicio', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dias_fin">Día de Fin (1-31):</label>
                <input
                  id="dias_fin"
                  type="number"
                  min="1"
                  max="31"
                  value={ventanaGlobal.dias_fin}
                  onChange={(e) => handleVentanaChange('dias_fin', e.target.value)}
                />
              </div>

              <button
                onClick={handleActualizarVentana}
                disabled={updatingVentana}
                className="save-button"
              >
                {updatingVentana ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="departamentos-list">
              <h4>Vista Previa - Departamentos</h4>
              <table>
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Ventana de Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {departamentos.map(dept => (
                    <tr key={dept.id_departamento}>
                      <td>{dept.descripcion}</td>
                      <td className="ventana-preview">
                        Días {dept.dias_inicio_ventana} al {dept.dias_fin_ventana}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PDVs */}
      {activeTab === 'pdvs' && (
        <div className="tab-content pdvs-tab">
          <div className="pdvs-config">
            <h3>Ventana de Pedidos de PDVs por Región</h3>
            <p className="help-text">
        Define en qué días del mes pueden realizar pedidos los PDVs de cada región.
            </p>

      <div className="regiones-list">
        {pdvsPorRegion.map(region => (
        <div key={region.id_region} className="region-card">
          <div className="region-header static">
          <div>
            <div className="region-title">{region.region}</div>
            <div className="region-meta">{region.cantidad_pdvs} PDVs en {region.cantidad_zonas} zonas</div>
          </div>
          <div className={`window-status ${Number(region.ventana_uniforme) ? 'uniform' : 'mixed'}`}>
            {Number(region.ventana_uniforme) ? 'Ventana unificada' : 'Ventanas distintas entre zonas'}
          </div>
          </div>

          <div className="region-content always-open">
          <div className="region-form-grid">
            <div className="form-group">
            <label htmlFor={`region-${region.id_region}-inicio`}>Día de inicio</label>
            <input
              id={`region-${region.id_region}-inicio`}
              type="number"
              min="1"
              max="31"
              value={region.dia_inicio}
              onChange={handleRegionWindowChange(region.id_region, 'dia_inicio')}
              placeholder={Number(region.ventana_uniforme) ? '' : 'Definir'}
            />
            </div>

            <div className="form-group">
            <label htmlFor={`region-${region.id_region}-fin`}>Día de fin</label>
            <input
              id={`region-${region.id_region}-fin`}
              type="number"
              min="1"
              max="31"
              value={region.dia_fin}
              onChange={handleRegionWindowChange(region.id_region, 'dia_fin')}
              placeholder={Number(region.ventana_uniforme) ? '' : 'Definir'}
            />
            </div>

            <button
            className="save-button"
            onClick={() => handleGuardarRegion(region)}
            disabled={updatingRegionId === region.id_region}
            >
            {updatingRegionId === region.id_region ? 'Guardando...' : 'Guardar Región'}
            </button>
          </div>

          <div className="region-zones">
            <strong>Zonas:</strong> {region.zonas || 'Sin zonas registradas'}
          </div>
          </div>
        </div>
        ))}

        {pdvsPorRegion.length === 0 && (
        <p className="empty-message">No hay PDVs agrupados por región para configurar.</p>
        )}
      </div>
          </div>
        </div>
      )}
    </div>
  )
}
