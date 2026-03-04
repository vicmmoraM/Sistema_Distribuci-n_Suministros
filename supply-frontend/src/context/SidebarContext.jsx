import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggle = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)
  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open, isCollapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar debe ser usado dentro de SidebarProvider')
  }
  return context
}
