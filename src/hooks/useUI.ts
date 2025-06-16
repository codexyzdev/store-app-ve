import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setFilter,
  clearFilter,
  clearAllFilters,
} from '@/store/slices/uiSlice'

export const useUI = () => {
  const dispatch = useAppDispatch()
  const uiState = useAppSelector((state) => state.ui)

  return {
    // Estado actual
    ...uiState,
    
    // Acciones para modales
    openModal: (modal: keyof typeof uiState.modals) => dispatch(openModal(modal)),
    closeModal: (modal: keyof typeof uiState.modals) => dispatch(closeModal(modal)),
    closeAllModals: () => dispatch(closeAllModals()),
    
    // Acciones para sidebar
    toggleSidebar: () => dispatch(toggleSidebar()),
    setSidebarOpen: (isOpen: boolean) => dispatch(setSidebarOpen(isOpen)),
    
    // Acciones para loading
    setGlobalLoading: (loading: boolean) => dispatch(setGlobalLoading(loading)),
    
    // Acciones para notificaciones
    showNotification: (notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) => 
      dispatch(addNotification(notification)),
    hideNotification: (id: string) => dispatch(removeNotification(id)),
    clearAllNotifications: () => dispatch(clearNotifications()),
    
    // Acciones para filtros
    setFilter: (key: keyof typeof uiState.filters, value: string) => 
      dispatch(setFilter({ key, value })),
    clearFilter: (key: keyof typeof uiState.filters) => dispatch(clearFilter(key)),
    clearAllFilters: () => dispatch(clearAllFilters()),
  }
} 