import { useEffect, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clientesDB, Cliente } from '@/lib/firebase/database'
import {
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
  openModal,
  closeModal,
  closeAllModals,
} from '@/store/slices/clientesSlice'
import { useUI } from './useUI'

export function useClientesRedux() {
  const dispatch = useAppDispatch()
  const clientesState = useAppSelector((state) => state.clientes)
  const { showNotification } = useUI()

  // Suscripción a Firebase
  useEffect(() => {
    console.log('🔄 Iniciando suscripción a clientes en useClientesRedux')
    dispatch(setLoading(true))
    
    // Timeout de seguridad para desbloquear la UI si Firebase no responde
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Timeout de clientes - desbloqueando UI con datos vacíos')
      dispatch(setClientes([]))
      dispatch(setError('Conexión lenta con Firebase. Los datos pueden cargar gradualmente.'))
    }, 10000) // 10 segundos

    const unsubscribe = clientesDB.suscribir((clientes) => {
      console.log('📄 Hook recibió clientes:', clientes.length)
      clearTimeout(timeoutId) // Cancelar timeout si los datos llegan
      dispatch(setClientes(clientes))
      dispatch(setError(null))
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [dispatch])

  // Clientes filtrados y ordenados (memoizado para performance)
  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientesState.clientes]

    // Filtrar por búsqueda
    if (clientesState.filters.busqueda.trim()) {
      const termino = clientesState.filters.busqueda.toLowerCase()
      resultado = resultado.filter((cliente) =>
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.telefono.includes(termino) ||
        (cliente.direccion && cliente.direccion.toLowerCase().includes(termino)) ||
        (cliente.cedula && cliente.cedula.includes(termino)) ||
        cliente.numeroControl.toString().includes(termino)
      )
    }

    // Ordenar
    resultado.sort((a, b) => {
      let comparison = 0
      
      switch (clientesState.filters.ordenarPor) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case 'fecha':
          comparison = a.createdAt - b.createdAt
          break
        case 'numeroControl':
          comparison = a.numeroControl - b.numeroControl
          break
      }

      return clientesState.filters.direccionOrden === 'desc' ? -comparison : comparison
    })

    return resultado
  }, [clientesState.clientes, clientesState.filters])

  // Funciones CRUD con notificaciones
  const crearCliente = useCallback(async (clienteData: Omit<Cliente, 'id' | 'numeroControl'>) => {
    try {
      dispatch(setLoading(true))
      const nuevoCliente = await clientesDB.crear(clienteData)
      
      // El cliente se agregará automáticamente via suscripción de Firebase
      showNotification({
        type: 'success',
        message: `Cliente "${nuevoCliente.nombre}" creado exitosamente`
      })
      
      return nuevoCliente
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear cliente'
      dispatch(setError(mensaje))
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [dispatch, showNotification])

  const actualizarCliente = useCallback(async (id: string, datos: Partial<Cliente>) => {
    try {
      dispatch(setLoading(true))
      await clientesDB.actualizar(id, datos)
      
      showNotification({
        type: 'success',
        message: 'Cliente actualizado exitosamente'
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar cliente'
      dispatch(setError(mensaje))
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [dispatch, showNotification])

  const eliminarCliente = useCallback(async (id: string) => {
    try {
      const cliente = clientesState.clientes.find(c => c.id === id)
      if (!cliente) throw new Error('Cliente no encontrado')

      dispatch(setLoading(true))
      await clientesDB.eliminar(id)
      
      showNotification({
        type: 'success',
        message: `Cliente "${cliente.nombre}" eliminado exitosamente`
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar cliente'
      dispatch(setError(mensaje))
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [dispatch, showNotification, clientesState.clientes])

  // Funciones de utilidad (memoizadas)
  const getClienteById = useCallback((id: string): Cliente | null => {
    return clientesState.clientes.find(c => c.id === id) || null
  }, [clientesState.clientes])

  const getClienteNombre = useCallback((id: string): string => {
    const cliente = getClienteById(id)
    return cliente ? cliente.nombre : '-'
  }, [getClienteById])

  const formatearTelefonoWhatsApp = useCallback((telefono: string): string => {
    const numeroLimpio = telefono.replace(/\D/g, '')
    return numeroLimpio.startsWith('58') ? numeroLimpio : `58${numeroLimpio}`
  }, [])

  const getIniciales = useCallback((nombre: string): string => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }, [])

  // Acciones de Redux simplificadas
  const actions = {
    // Filtros
    setBusqueda: (busqueda: string) => dispatch(setBusqueda(busqueda)),
    setOrdenarPor: (orden: 'nombre' | 'fecha' | 'numeroControl') => dispatch(setOrdenarPor(orden)),
    setDireccionOrden: (direccion: 'asc' | 'desc') => dispatch(setDireccionOrden(direccion)),
    toggleDireccionOrden: () => dispatch(toggleDireccionOrden()),
    clearFilters: () => dispatch(clearFilters()),
    
    // Modales
    openModal: (modal: 'crear' | 'editar' | 'eliminar') => dispatch(openModal(modal)),
    closeModal: (modal: 'crear' | 'editar' | 'eliminar') => dispatch(closeModal(modal)),
    closeAllModals: () => dispatch(closeAllModals()),
    
    // Selección
    setSelectedCliente: (cliente: Cliente | null) => dispatch(setSelectedCliente(cliente)),
  }

  return {
    // Estado
    clientes: clientesState.clientes,
    clientesFiltrados,
    selectedCliente: clientesState.selectedCliente,
    loading: clientesState.loading,
    error: clientesState.error,
    filters: clientesState.filters,
    estadisticas: clientesState.estadisticas,
    modals: clientesState.modals,
    
    // Operaciones CRUD
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    
    // Utilidades
    getClienteById,
    getClienteNombre,
    formatearTelefonoWhatsApp,
    getIniciales,
    
    // Acciones
    ...actions,
  }
} 