import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FinanciamientoCuota, Cobro } from '@/lib/firebase/database';
import { normalizarNumeroControl, esFormatoNumeroControl } from '@/utils/format';

export interface FinanciamientosFilters {
  busqueda: string;
  estado: 'todos' | 'activo' | 'atrasado' | 'completado';
  tipoVenta: 'todos' | 'contado' | 'cuotas';
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMinimo?: number;
  montoMaximo?: number;
  ordenarPor: 'fecha' | 'monto' | 'cliente' | 'estado';
  direccionOrden: 'asc' | 'desc';
}

export interface FinanciamientosEstadisticas {
  total: number;
  activos: number;
  atrasados: number;
  completados: number;
  montoTotal: number;
  montoPendiente: number;
  montoRecaudado: number;
  cuotasVencidas: number;
}

interface FinanciamientosState {
  financiamientos: FinanciamientoCuota[];
  cobros: Cobro[];
  financiamientosFiltrados: FinanciamientoCuota[];
  filters: FinanciamientosFilters;
  estadisticas: FinanciamientosEstadisticas;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialFilters: FinanciamientosFilters = {
  busqueda: '',
  estado: 'todos',
  tipoVenta: 'todos',
  ordenarPor: 'fecha',
  direccionOrden: 'desc',
};

const initialEstadisticas: FinanciamientosEstadisticas = {
  total: 0,
  activos: 0,
  atrasados: 0,
  completados: 0,
  montoTotal: 0,
  montoPendiente: 0,
  montoRecaudado: 0,
  cuotasVencidas: 0,
};

const initialState: FinanciamientosState = {
  financiamientos: [],
  cobros: [],
  financiamientosFiltrados: [],
  filters: initialFilters,
  estadisticas: initialEstadisticas,
  loading: false,
  error: null,
  initialized: false,
};

// Función para calcular estado del financiamiento
const calcularEstadoFinanciamiento = (
  financiamiento: FinanciamientoCuota,
  cobros: Cobro[]
): 'activo' | 'atrasado' | 'completado' => {
  if (financiamiento.tipoVenta === 'contado') {
    return 'completado';
  }

  const cobrosFinanciamiento = cobros.filter(
    c => c.financiamientoId === financiamiento.id && 
         (c.tipo === 'cuota' || c.tipo === 'inicial') &&
         c.id && c.id !== 'temp'
  );

  const cuotasPagadas = cobrosFinanciamiento.length;
  const totalCuotas = financiamiento.cuotas;

  if (cuotasPagadas >= totalCuotas) {
    return 'completado';
  }

  // Calcular si hay atrasos (restaurando lógica original)
  const fechaActual = new Date();
  const fechaInicio = new Date(financiamiento.fechaInicio);
  const semanasTranscurridas = Math.floor(
    (fechaActual.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  const cuotasEsperadas = Math.max(0, Math.min(semanasTranscurridas + 1, totalCuotas));
  
  return cuotasPagadas < cuotasEsperadas ? 'atrasado' : 'activo';
};

// Función para filtrar financiamientos
const filtrarFinanciamientos = (
  financiamientos: FinanciamientoCuota[],
  cobros: Cobro[],
  filters: FinanciamientosFilters,
  clientes: any[] = [],
  productos: any[] = []
): FinanciamientoCuota[] => {
  let filtrados = [...financiamientos];

  // Filtro por búsqueda
  if (filters.busqueda.trim()) {
    const busquedaOriginal = filters.busqueda.trim();
    const busqueda = busquedaOriginal.toLowerCase();
             
    filtrados = filtrados.filter(financiamiento => {
      // Buscar en cliente
      const cliente = clientes.find(c => c.id === financiamiento.clienteId);
      const nombreCliente = cliente?.nombre?.toLowerCase() || '';
      const telefonoCliente = cliente?.telefono?.toLowerCase() || '';
      const cedulaCliente = cliente?.cedula || '';
      
      // Buscar en producto
      const producto = productos.find(p => p.id === financiamiento.productoId);
      const nombreProducto = producto?.nombre?.toLowerCase() || '';
      
      // Buscar en monto y descripción
      const monto = financiamiento.monto.toString();
      const descripcion = financiamiento.descripcion?.toLowerCase() || '';
      
      // Búsqueda exacta por número de control de financiamiento
      if (esFormatoNumeroControl(busquedaOriginal)) {
        const numeroNormalizado = normalizarNumeroControl(busquedaOriginal);
        return numeroNormalizado !== null && financiamiento.numeroControl === numeroNormalizado;
      }
      
      // Búsqueda general (texto libre)
      return (
        nombreCliente.includes(busqueda) ||
        telefonoCliente.includes(busqueda) ||
        cedulaCliente.includes(busqueda) ||
        nombreProducto.includes(busqueda) ||
        monto.includes(busqueda) ||
        descripcion.includes(busqueda)
      );
    });
  }

  // Filtro por estado
  if (filters.estado !== 'todos') {
    filtrados = filtrados.filter(financiamiento => {
      const estado = calcularEstadoFinanciamiento(financiamiento, cobros);
      return estado === filters.estado;
    });
  }

  // Filtro por tipo de venta
  if (filters.tipoVenta !== 'todos') {
    filtrados = filtrados.filter(financiamiento => 
      financiamiento.tipoVenta === filters.tipoVenta
    );
  }

  // Filtro por cliente específico
  if (filters.clienteId) {
    filtrados = filtrados.filter(financiamiento => 
      financiamiento.clienteId === filters.clienteId
    );
  }

  // Filtro por rango de fechas
  if (filters.fechaDesde) {
    const fechaDesde = new Date(filters.fechaDesde).getTime();
    filtrados = filtrados.filter(financiamiento => 
      financiamiento.fechaInicio >= fechaDesde
    );
  }

  if (filters.fechaHasta) {
    const fechaHasta = new Date(filters.fechaHasta).getTime();
    filtrados = filtrados.filter(financiamiento => 
      financiamiento.fechaInicio <= fechaHasta
    );
  }

  // Filtro por rango de montos
  if (filters.montoMinimo !== undefined) {
    filtrados = filtrados.filter(financiamiento => 
      financiamiento.monto >= filters.montoMinimo!
    );
  }

  if (filters.montoMaximo !== undefined) {
    filtrados = filtrados.filter(financiamiento => 
      financiamiento.monto <= filters.montoMaximo!
    );
  }

  // Ordenamiento
  filtrados.sort((a, b) => {
    let comparacion = 0;
    
    switch (filters.ordenarPor) {
      case 'fecha':
        comparacion = a.fechaInicio - b.fechaInicio;
        break;
      case 'monto':
        comparacion = a.monto - b.monto;
        break;
      case 'cliente':
        const clienteA = clientes.find(c => c.id === a.clienteId)?.nombre || '';
        const clienteB = clientes.find(c => c.id === b.clienteId)?.nombre || '';
        comparacion = clienteA.localeCompare(clienteB);
        break;
      case 'estado':
        const estadoA = calcularEstadoFinanciamiento(a, cobros);
        const estadoB = calcularEstadoFinanciamiento(b, cobros);
        comparacion = estadoA.localeCompare(estadoB);
        break;
    }
    
    return filters.direccionOrden === 'desc' ? -comparacion : comparacion;
  });

  return filtrados;
};

// Función para calcular estadísticas
const calcularEstadisticas = (
  financiamientos: FinanciamientoCuota[],
  cobros: Cobro[]
): FinanciamientosEstadisticas => {
  const total = financiamientos.length;
  let activos = 0;
  let atrasados = 0;
  let completados = 0;
  let montoTotal = 0;
  let montoPendiente = 0;
  let montoRecaudado = 0;
  let cuotasVencidas = 0;

  financiamientos.forEach(financiamiento => {
    const estado = calcularEstadoFinanciamiento(financiamiento, cobros);
    montoTotal += financiamiento.monto;

    // Calcular cobros del financiamiento
    const cobrosFinanciamiento = cobros.filter(
      c => c.financiamientoId === financiamiento.id && 
           (c.tipo === 'cuota' || c.tipo === 'inicial') &&
           c.id && c.id !== 'temp'
    );

    const montoFinanciamientoRecaudado = cobrosFinanciamiento.reduce(
      (sum, cobro) => sum + cobro.monto, 0
    );
    
    montoRecaudado += montoFinanciamientoRecaudado;
    montoPendiente += (financiamiento.monto - montoFinanciamientoRecaudado);

    // Contar estados
    switch (estado) {
      case 'activo':
        activos++;
        break;
      case 'atrasado':
        atrasados++;
        // Calcular cuotas vencidas (restaurando lógica original)
        if (financiamiento.tipoVenta === 'cuotas') {
          const fechaActual = new Date();
          const fechaInicio = new Date(financiamiento.fechaInicio);
          const semanasTranscurridas = Math.floor(
            (fechaActual.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
          );
          const cuotasEsperadas = Math.max(0, Math.min(semanasTranscurridas + 1, financiamiento.cuotas));
          const cuotasPagadas = cobrosFinanciamiento.length;
          cuotasVencidas += Math.max(0, cuotasEsperadas - cuotasPagadas);
        }
        break;
      case 'completado':
        completados++;
        break;
    }
  });

  return {
    total,
    activos,
    atrasados,
    completados,
    montoTotal,
    montoPendiente,
    montoRecaudado,
    cuotasVencidas,
  };
};

const financiamientosSlice = createSlice({
  name: 'financiamientos',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setFinanciamientos: (state, action: PayloadAction<FinanciamientoCuota[]>) => {
      state.financiamientos = action.payload;
      state.initialized = true;
      // Recalcular filtrados y estadísticas
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
      state.estadisticas = calcularEstadisticas(state.financiamientos, state.cobros);
    },
    
    setCobros: (state, action: PayloadAction<Cobro[]>) => {
      state.cobros = action.payload;
      // Recalcular filtrados y estadísticas
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
      state.estadisticas = calcularEstadisticas(state.financiamientos, state.cobros);
    },
    
    agregarFinanciamiento: (state, action: PayloadAction<FinanciamientoCuota>) => {
      state.financiamientos.unshift(action.payload);
      // Recalcular filtrados y estadísticas
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
      state.estadisticas = calcularEstadisticas(state.financiamientos, state.cobros);
    },
    
    actualizarFinanciamiento: (state, action: PayloadAction<FinanciamientoCuota>) => {
      const index = state.financiamientos.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.financiamientos[index] = action.payload;
        // Recalcular filtrados y estadísticas
        state.financiamientosFiltrados = filtrarFinanciamientos(
          state.financiamientos,
          state.cobros,
          state.filters
        );
        state.estadisticas = calcularEstadisticas(state.financiamientos, state.cobros);
      }
    },
    
    eliminarFinanciamiento: (state, action: PayloadAction<string>) => {
      state.financiamientos = state.financiamientos.filter(f => f.id !== action.payload);
      // Recalcular filtrados y estadísticas
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
      state.estadisticas = calcularEstadisticas(state.financiamientos, state.cobros);
    },
    
    agregarCobro: (state, action: PayloadAction<Cobro>) => {
      state.cobros.unshift(action.payload);
      // Recalcular estadísticas
      state.estadisticas = calcularEstadisticas(state.financiamientos, state.cobros);
    },
    
    // Acciones de filtros
    setBusqueda: (state, action: PayloadAction<string>) => {
      state.filters.busqueda = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setEstado: (state, action: PayloadAction<typeof initialFilters.estado>) => {
      state.filters.estado = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setTipoVenta: (state, action: PayloadAction<typeof initialFilters.tipoVenta>) => {
      state.filters.tipoVenta = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setClienteId: (state, action: PayloadAction<string | undefined>) => {
      state.filters.clienteId = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setFechaDesde: (state, action: PayloadAction<string | undefined>) => {
      state.filters.fechaDesde = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setFechaHasta: (state, action: PayloadAction<string | undefined>) => {
      state.filters.fechaHasta = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setMontoMinimo: (state, action: PayloadAction<number | undefined>) => {
      state.filters.montoMinimo = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setMontoMaximo: (state, action: PayloadAction<number | undefined>) => {
      state.filters.montoMaximo = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setOrdenarPor: (state, action: PayloadAction<typeof initialFilters.ordenarPor>) => {
      state.filters.ordenarPor = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    setDireccionOrden: (state, action: PayloadAction<typeof initialFilters.direccionOrden>) => {
      state.filters.direccionOrden = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    toggleDireccionOrden: (state) => {
      state.filters.direccionOrden = state.filters.direccionOrden === 'asc' ? 'desc' : 'asc';
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    clearFilters: (state) => {
      state.filters = { ...initialFilters };
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters
      );
    },
    
    updateFilteredFinanciamientos: (state, action: PayloadAction<{
      clientes?: any[];
      productos?: any[];
    }>) => {
      const { clientes = [], productos = [] } = action.payload;
      state.financiamientosFiltrados = filtrarFinanciamientos(
        state.financiamientos,
        state.cobros,
        state.filters,
        clientes,
        productos
      );
    },
  },
});

export const {
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
} = financiamientosSlice.actions;

export default financiamientosSlice.reducer; 