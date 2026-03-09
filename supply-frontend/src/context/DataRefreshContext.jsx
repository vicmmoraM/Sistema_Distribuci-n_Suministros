import { createContext, useContext, useState, useCallback } from 'react'

const DataRefreshContext = createContext()

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext)
  if (!context) {
    throw new Error('useDataRefresh debe usarse dentro de DataRefreshProvider')
  }
  return context
}

export function DataRefreshProvider({ children }) {
  const [refreshTriggers, setRefreshTriggers] = useState({
    pdvs: 0,
    suministros: 0,
    usuarios: 0,
    reportes: 0,
  })

  const refreshPdvs = useCallback(() => {
    setRefreshTriggers((prev) => ({
      ...prev,
      pdvs: prev.pdvs + 1,
      reportes: prev.reportes + 1, // Los reportes también dependen de PDVs
    }))
  }, [])

  const refreshSuministros = useCallback(() => {
    setRefreshTriggers((prev) => ({
      ...prev,
      suministros: prev.suministros + 1,
    }))
  }, [])

  const refreshUsuarios = useCallback(() => {
    setRefreshTriggers((prev) => ({
      ...prev,
      usuarios: prev.usuarios + 1,
    }))
  }, [])

  const refreshReportes = useCallback(() => {
    setRefreshTriggers((prev) => ({
      ...prev,
      reportes: prev.reportes + 1,
    }))
  }, [])

  const value = {
    refreshTriggers,
    refreshPdvs,
    refreshSuministros,
    refreshUsuarios,
    refreshReportes,
  }

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  )
}
