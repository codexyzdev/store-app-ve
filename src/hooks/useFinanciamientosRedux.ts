import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  financiamientoDB, 
  cobrosDB, 
  FinanciamientoCuota, 
  Cobro 
} from '@/lib/firebase/database';
import {
  setLoading,
  setError,
  setFinanciamientos,
  setCobros,
  agregarFinanciamiento,
  actualizarFinanciamiento,
  eliminarFinanciamiento,
  agregarCobro,
  setBusqueda,
  setEstado,
  setTipoVenta,
  setClienteId,
  setFechaDesde,
  setFechaHasta,
  setMontoMinimo,
  setMontoMaximo,
  setOrdenarPor,
  setDireccionOrden,
  toggleDireccionOrden,
  clearFilters,
  updateFilteredFinanciamientos,
} from '@/store/slices/financiamientosSlice';
import {
  selectFinanciamientos,
  selectFinanciamientosFiltrados,
  selectFinanciamientosEstadisticas,
} from '@/store/selectors/financiamientosSelectors';

export const useFinanciamientosRedux = () => {
  const dispatch = useDispatch();
  
  // Datos memoizados
  const financiamientos = useSelector(selectFinanciamientos);
  const financiamientosFiltrados = useSelector(selectFinanciamientosFiltrados);
  const estadisticas = useSelector(selectFinanciamientosEstadisticas);

  // Otros valores (no derivan cálculos pesados)
  const { cobros, filters, loading, error, initialized } = useSelector(
    (state: RootState) => state.financiamientos
  );

  // Suscripción a financiamientos
  useEffect(() => {
    if (initialized) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    const unsubscribeFinanciamientos = financiamientoDB.suscribir(
      (nuevosFinanciamientos: FinanciamientoCuota[]) => {
        dispatch(setFinanciamientos(nuevosFinanciamientos));
        dispatch(setLoading(false));
      },
      (error: Error) => {
        console.error('Error al cargar financiamientos:', error);
        dispatch(setError(error.message));
        dispatch(setLoading(false));
      }
    );

    return () => {
      unsubscribeFinanciamientos();
    };
  }, [dispatch, initialized]);

  // Suscripción a cobros
  useEffect(() => {
    const unsubscribeCobros = cobrosDB.suscribir(
      (nuevosCobros: Cobro[]) => {
        dispatch(setCobros(nuevosCobros));
      },
      (error: Error) => {
        console.error('Error al cargar cobros:', error);
        // No mostramos error de cobros para no interferir con la UI principal
      }
    );

    return () => {
      unsubscribeCobros();
    };
  }, [dispatch]);

  // Funciones CRUD
  const crearFinanciamiento = useCallback(async (data: Omit<FinanciamientoCuota, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch(setLoading(true));
      const nuevoFinanciamiento = await financiamientoDB.crear(data);
      dispatch(agregarFinanciamiento(nuevoFinanciamiento));
      return nuevoFinanciamiento;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear financiamiento';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const actualizarFinanciamientoById = useCallback(async (id: string, data: Partial<FinanciamientoCuota>) => {
    try {
      dispatch(setLoading(true));
      const financiamientoActualizado = await financiamientoDB.actualizar(id, data);
      dispatch(actualizarFinanciamiento(financiamientoActualizado));
      return financiamientoActualizado;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar financiamiento';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const eliminarFinanciamientoById = useCallback(async (id: string) => {
    try {
      dispatch(setLoading(true));
      await financiamientoDB.eliminar(id);
      dispatch(eliminarFinanciamiento(id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar financiamiento';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const crearCobro = useCallback(async (data: Omit<Cobro, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const nuevoCobro = await cobrosDB.crear(data);
      dispatch(agregarCobro(nuevoCobro));
      return nuevoCobro;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear cobro';
      dispatch(setError(errorMessage));
      throw error;
    }
  }, [dispatch]);

  // Funciones de filtros
  const setBusquedaFilter = useCallback((busqueda: string) => {
    dispatch(setBusqueda(busqueda));
  }, [dispatch]);

  const setEstadoFilter = useCallback((estado: 'todos' | 'activo' | 'atrasado' | 'completado') => {
    dispatch(setEstado(estado));
  }, [dispatch]);

  const setTipoVentaFilter = useCallback((tipoVenta: 'todos' | 'contado' | 'cuotas') => {
    dispatch(setTipoVenta(tipoVenta));
  }, [dispatch]);

  const setClienteIdFilter = useCallback((clienteId: string | undefined) => {
    dispatch(setClienteId(clienteId));
  }, [dispatch]);

  const setFechaDesdeFilter = useCallback((fecha: string | undefined) => {
    dispatch(setFechaDesde(fecha));
  }, [dispatch]);

  const setFechaHastaFilter = useCallback((fecha: string | undefined) => {
    dispatch(setFechaHasta(fecha));
  }, [dispatch]);

  const setMontoMinimoFilter = useCallback((monto: number | undefined) => {
    dispatch(setMontoMinimo(monto));
  }, [dispatch]);

  const setMontoMaximoFilter = useCallback((monto: number | undefined) => {
    dispatch(setMontoMaximo(monto));
  }, [dispatch]);

  const setOrdenarPorFilter = useCallback((ordenar: 'fecha' | 'monto' | 'cliente' | 'estado') => {
    dispatch(setOrdenarPor(ordenar));
  }, [dispatch]);

  const setDireccionOrdenFilter = useCallback((direccion: 'asc' | 'desc') => {
    dispatch(setDireccionOrden(direccion));
  }, [dispatch]);

  const toggleDireccionOrdenFilter = useCallback(() => {
    dispatch(toggleDireccionOrden());
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const updateFiltersWithData = useCallback((clientes: any[], productos: any[]) => {
    dispatch(updateFilteredFinanciamientos({ clientes, productos }));
  }, [dispatch]);

  // Funciones de utilidad
  const getFinanciamientoPorId = useCallback((id: string) => {
    return financiamientos.find(f => f.id === id) || null;
  }, [financiamientos]);

  const getFinanciamientosPorCliente = useCallback((clienteId: string) => {
    return financiamientos.filter(f => f.clienteId === clienteId);
  }, [financiamientos]);

  const getCobrosFinanciamiento = useCallback((financiamientoId: string) => {
    return cobros.filter(c => c.financiamientoId === financiamientoId);
  }, [cobros]);

  const getCobrosPorTipo = useCallback((tipo: Cobro['tipo']) => {
    return cobros.filter(c => c.tipo === tipo);
  }, [cobros]);

  const getCobrosDelDia = useCallback((fecha?: Date) => {
    const fechaTarget = fecha || new Date();
    const inicioDelDia = new Date(fechaTarget.getFullYear(), fechaTarget.getMonth(), fechaTarget.getDate()).getTime();
    const finDelDia = inicioDelDia + (24 * 60 * 60 * 1000) - 1;

    return cobros.filter(c => {
      const fechaCobro = c.fecha;
      return fechaCobro >= inicioDelDia && fechaCobro <= finDelDia;
    });
  }, [cobros]);

  // Verificar si un comprobante ya existe
  const verificarComprobanteDuplicado = useCallback(async (numeroComprobante: string): Promise<boolean> => {
    try {
      return await cobrosDB.verificarComprobanteDuplicado(numeroComprobante);
    } catch (error) {
      console.error('Error al verificar comprobante duplicado:', error);
      return false;
    }
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  // Calcular información financiera de un financiamiento específico
  const calcularInfoFinanciamiento = useCallback((financiamiento: FinanciamientoCuota) => {
    const cobrosFinanciamiento = getCobrosFinanciamiento(financiamiento.id);
    const cobrosValidos = cobrosFinanciamiento.filter(c => 
      (c.tipo === 'cuota' || c.tipo === 'inicial') && 
      c.id && c.id !== 'temp'
    );

    const valorCuota = financiamiento.tipoVenta === 'cuotas' 
      ? financiamiento.monto / financiamiento.cuotas 
      : financiamiento.monto;

    const totalCobrado = cobrosValidos.reduce((sum, cobro) => sum + cobro.monto, 0);
    const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);
    const progreso = financiamiento.monto > 0 ? (totalCobrado / financiamiento.monto) * 100 : 0;

    // Calcular cuotas atrasadas manteniendo la lógica original
    let cuotasAtrasadas = 0;
    if (financiamiento.tipoVenta === 'cuotas') {
      const fechaActual = new Date();
      const fechaInicio = new Date(financiamiento.fechaInicio);
      const semanasTranscurridas = Math.floor(
        (fechaActual.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      const cuotasEsperadas = Math.max(0, Math.min(semanasTranscurridas + 1, financiamiento.cuotas));
      const cuotasPagadas = cobrosValidos.length;
      cuotasAtrasadas = Math.max(0, cuotasEsperadas - cuotasPagadas);
    }

    return {
      cobrosValidos,
      valorCuota,
      totalCobrado,
      montoPendiente,
      progreso,
      cuotasAtrasadas,
      cuotasPagadas: cobrosValidos.length,
      cuotasPendientes: Math.max(0, financiamiento.cuotas - cobrosValidos.length),
    };
  }, [getCobrosFinanciamiento]);

  return {
    // Datos
    financiamientos,
    cobros,
    financiamientosFiltrados,
    filters,
    estadisticas,
    loading,
    error,
    initialized,

    // CRUD Financiamientos
    crearFinanciamiento,
    actualizarFinanciamiento: actualizarFinanciamientoById,
    eliminarFinanciamiento: eliminarFinanciamientoById,
    getFinanciamientoPorId,
    getFinanciamientosPorCliente,

    // CRUD Cobros
    crearCobro,
    getCobrosFinanciamiento,
    getCobrosPorTipo,
    getCobrosDelDia,
    verificarComprobanteDuplicado,

    // Filtros
    setBusqueda: setBusquedaFilter,
    setEstado: setEstadoFilter,
    setTipoVenta: setTipoVentaFilter,
    setClienteId: setClienteIdFilter,
    setFechaDesde: setFechaDesdeFilter,
    setFechaHasta: setFechaHastaFilter,
    setMontoMinimo: setMontoMinimoFilter,
    setMontoMaximo: setMontoMaximoFilter,
    setOrdenarPor: setOrdenarPorFilter,
    setDireccionOrden: setDireccionOrdenFilter,
    toggleDireccionOrden: toggleDireccionOrdenFilter,
    clearFilters: clearAllFilters,
    updateFiltersWithData,

    // Utilidades
    calcularInfoFinanciamiento,
    clearError,
  };
} 