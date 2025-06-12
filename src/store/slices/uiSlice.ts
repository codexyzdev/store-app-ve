import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  // Estados de modales
  modals: {
    clienteModal: boolean
    productoModal: boolean
    cobroModal: boolean
    financiamientoModal: boolean
  }
  // Estados de sidebars/navegación
  sidebarOpen: boolean
  // Estados de loading globales
  globalLoading: boolean
  // Estados de notificaciones
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
  // Estados de filtros globales
  filters: {
    clientesBusqueda: string
    financiamientosBusqueda: string
    inventarioBusqueda: string
    cobranzaBusqueda: string
  }
}

const initialState: UiState = {
  modals: {
    clienteModal: false,
    productoModal: false,
    cobroModal: false,
    financiamientoModal: false,
  },
  sidebarOpen: false,
  globalLoading: false,
  notifications: [],
  filters: {
    clientesBusqueda: '',
    financiamientosBusqueda: '',
    inventarioBusqueda: '',
    cobranzaBusqueda: '',
  },
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Acciones para modales
    openModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action: PayloadAction<keyof UiState['modals']>) => {
      state.modals[action.payload] = false
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UiState['modals']] = false
      })
    },
    
    // Acciones para sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    // Acciones para loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
    
    // Acciones para notificaciones
    addNotification: (state, action: PayloadAction<Omit<UiState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Acciones para filtros
    setFilter: (state, action: PayloadAction<{ key: keyof UiState['filters']; value: string }>) => {
      state.filters[action.payload.key] = action.payload.value
    },
    clearFilter: (state, action: PayloadAction<keyof UiState['filters']>) => {
      state.filters[action.payload] = ''
    },
    clearAllFilters: (state) => {
      Object.keys(state.filters).forEach((key) => {
        state.filters[key as keyof UiState['filters']] = ''
      })
    },
  },
})

export const {
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
} = uiSlice.actions

export default uiSlice.reducer 