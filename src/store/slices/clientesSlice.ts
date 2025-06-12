import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cliente } from '@/lib/firebase/database'

interface ClientesState {
  // Estado de datos
  clientes: Cliente[]
  selectedCliente: Cliente | null
  
  // Estados de carga
  loading: boolean
  error: string | null
  
  // Estados de UI específicos para clientes
  filters: {
    busqueda: string
    ordenarPor: 'nombre' | 'fecha' | 'numeroControl' | 'totalFinanciado' | 'balancePendiente' | 'riesgo'
    direccionOrden: 'asc' | 'desc'
    estadoFinanciero: 'todos' | 'excelente' | 'bueno' | 'regular' | 'malo' | 'critico' | 'nuevo'
    nivelRiesgo: 'todos' | 'bajo' | 'medio' | 'alto' | 'critico'
    soloConAtrasos: boolean
    soloActivos: boolean
  }
  
  // Estadísticas calculadas
  estadisticas: {
    total: number
    conTelefono: number
    conDireccion: number
    conCedula: number
    ultimoRegistro: number | null
  }
  
  // Estados de modales específicos
  modals: {
    crear: boolean
    editar: boolean
    eliminar: boolean
  }
}

const initialState: ClientesState = {
  clientes: [],
  selectedCliente: null,
  loading: true,
  error: null,
  filters: {
    busqueda: '',
    ordenarPor: 'nombre',
    direccionOrden: 'asc',
    estadoFinanciero: 'todos',
    nivelRiesgo: 'todos',
    soloConAtrasos: false,
    soloActivos: false,
  },
  estadisticas: {
    total: 0,
    conTelefono: 0,
    conDireccion: 0,
    conCedula: 0,
    ultimoRegistro: null,
  },
  modals: {
    crear: false,
    editar: false,
    eliminar: false,
  },
}

export const clientesSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {
    // Acciones para datos
    setClientes: (state, action: PayloadAction<Cliente[]>) => {
      state.clientes = action.payload
      state.loading = false
      state.error = null
      
      // Calcular estadísticas automáticamente
      state.estadisticas = {
        total: action.payload.length,
        conTelefono: action.payload.filter(c => c.telefono).length,
        conDireccion: action.payload.filter(c => c.direccion).length,
        conCedula: action.payload.filter(c => c.cedula).length,
        ultimoRegistro: action.payload.length > 0 
          ? Math.max(...action.payload.map(c => c.createdAt))
          : null,
      }
    },
    
    addCliente: (state, action: PayloadAction<Cliente>) => {
      state.clientes.push(action.payload)
      // Recalcular estadísticas
      state.estadisticas.total = state.clientes.length
      state.estadisticas.conTelefono = state.clientes.filter(c => c.telefono).length
      state.estadisticas.conDireccion = state.clientes.filter(c => c.direccion).length
      state.estadisticas.conCedula = state.clientes.filter(c => c.cedula).length
      state.estadisticas.ultimoRegistro = action.payload.createdAt
    },
    
    updateCliente: (state, action: PayloadAction<Cliente>) => {
      const index = state.clientes.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.clientes[index] = action.payload
        
        // Si es el cliente seleccionado, actualizarlo también
        if (state.selectedCliente?.id === action.payload.id) {
          state.selectedCliente = action.payload
        }
        
        // Recalcular estadísticas
        state.estadisticas.conTelefono = state.clientes.filter(c => c.telefono).length
        state.estadisticas.conDireccion = state.clientes.filter(c => c.direccion).length
        state.estadisticas.conCedula = state.clientes.filter(c => c.cedula).length
      }
    },
    
    removeCliente: (state, action: PayloadAction<string>) => {
      state.clientes = state.clientes.filter(c => c.id !== action.payload)
      
      // Si es el cliente seleccionado, limpiarlo
      if (state.selectedCliente?.id === action.payload) {
        state.selectedCliente = null
      }
      
      // Recalcular estadísticas
      state.estadisticas.total = state.clientes.length
      state.estadisticas.conTelefono = state.clientes.filter(c => c.telefono).length
      state.estadisticas.conDireccion = state.clientes.filter(c => c.direccion).length
      state.estadisticas.conCedula = state.clientes.filter(c => c.cedula).length
    },
    
    // Acciones para cliente seleccionado
    setSelectedCliente: (state, action: PayloadAction<Cliente | null>) => {
      state.selectedCliente = action.payload
    },
    
    // Acciones para estados de carga
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    
    // Acciones para filtros
    setBusqueda: (state, action: PayloadAction<string>) => {
      state.filters.busqueda = action.payload
    },
    
    setOrdenarPor: (state, action: PayloadAction<ClientesState['filters']['ordenarPor']>) => {
      state.filters.ordenarPor = action.payload
    },
    
    setDireccionOrden: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.direccionOrden = action.payload
    },
    
    toggleDireccionOrden: (state) => {
      state.filters.direccionOrden = state.filters.direccionOrden === 'asc' ? 'desc' : 'asc'
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters
    },

    // Acciones para filtros financieros
    setEstadoFinanciero: (state, action: PayloadAction<ClientesState['filters']['estadoFinanciero']>) => {
      state.filters.estadoFinanciero = action.payload
    },

    setNivelRiesgo: (state, action: PayloadAction<ClientesState['filters']['nivelRiesgo']>) => {
      state.filters.nivelRiesgo = action.payload
    },

    setSoloConAtrasos: (state, action: PayloadAction<boolean>) => {
      state.filters.soloConAtrasos = action.payload
    },

    setSoloActivos: (state, action: PayloadAction<boolean>) => {
      state.filters.soloActivos = action.payload
    },
    
    // Acciones para modales
    openModal: (state, action: PayloadAction<keyof ClientesState['modals']>) => {
      state.modals[action.payload] = true
    },
    
    closeModal: (state, action: PayloadAction<keyof ClientesState['modals']>) => {
      state.modals[action.payload] = false
    },
    
    closeAllModals: (state) => {
      state.modals = initialState.modals
    },
  },
})

export const {
  setClientes,
  addCliente,
  updateCliente,
  removeCliente,
  setSelectedCliente,
  setLoading,
  setError,
  setBusqueda,
  setOrdenarPor,
  setDireccionOrden,
  toggleDireccionOrden,
  clearFilters,
  setEstadoFinanciero,
  setNivelRiesgo,
  setSoloConAtrasos,
  setSoloActivos,
  openModal,
  closeModal,
  closeAllModals,
} = clientesSlice.actions

export default clientesSlice.reducer 