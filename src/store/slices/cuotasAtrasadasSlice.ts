import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FinanciamientoConDatos, EstadisticasCobranza } from '@/hooks/useCuotasAtrasadas';
import { normalizarNumeroControl, esFormatoNumeroControl } from '@/utils/format';

// Definición del estado de filtros
export interface FiltrosCuotasState {
  busqueda: string;
  filtroSeveridad: 'todos' | 'baja' | 'media' | 'alta' | 'critica';
  vistaCompacta: boolean;
}

export interface CuotasAtrasadasState {
  financiamientos: FinanciamientoConDatos[];
  estadisticas: EstadisticasCobranza;
  loading: boolean;
  error: string | null;
  filters: FiltrosCuotasState;
  financiamientosOrdenados: FinanciamientoConDatos[];
}

const initialFilters: FiltrosCuotasState = {
  busqueda: '',
  filtroSeveridad: 'todos',
  vistaCompacta: false,
};

const initialEstadisticas: EstadisticasCobranza = {
  totalCuotasAtrasadas: 0,
  totalMontoAtrasado: 0,
  clientesAfectados: 0,
  casosCriticos: 0,
  casosAltoRiesgo: 0,
  promedioPorCuota: 0,
  promedioAtraso: 0,
};

const initialState: CuotasAtrasadasState = {
  financiamientos: [],
  estadisticas: initialEstadisticas,
  loading: true,
  error: null,
  filters: initialFilters,
  financiamientosOrdenados: [],
};

// Función util para filtrar y ordenar
function filtrarYOrdenar(
  financiamientos: FinanciamientoConDatos[],
  filters: FiltrosCuotasState
): FinanciamientoConDatos[] {
  const filtrados = financiamientos.filter((item) => {
    // Filtro severidad
    if (filters.filtroSeveridad !== 'todos' && item.severidad !== filters.filtroSeveridad) {
      return false;
    }

    // Filtro búsqueda
    if (filters.busqueda) {
      const busquedaOriginal = filters.busqueda.trim();
      const texto = busquedaOriginal.toLowerCase();
      
      
      
      // Búsqueda exacta por número de control de financiamiento
      if (esFormatoNumeroControl(busquedaOriginal)) {
        const numeroNormalizado = normalizarNumeroControl(busquedaOriginal);
        return numeroNormalizado !== null && item.numeroControl === numeroNormalizado;
      }
      
      // Búsqueda general (texto libre)
      return (
        item.cliente.nombre.toLowerCase().includes(texto) ||
        item.cliente.cedula.includes(texto) ||
        item.cliente.telefono.includes(texto) ||
        item.producto.nombre.toLowerCase().includes(texto) ||
        item.numeroControl.toString().includes(texto)
      );
    }

    return true;
  });

  // Ordenar por severidad y cuotas atrasadas
  const ordenSeveridad: Record<string, number> = { baja: 1, media: 2, alta: 3, critica: 4 };
  return filtrados.sort((a, b) => {
    if (ordenSeveridad[a.severidad] !== ordenSeveridad[b.severidad]) {
      return ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad];
    }
    return b.cuotasAtrasadas - a.cuotasAtrasadas;
  });
}

// Función util para recalcular estadísticas
function calcularEstadisticas(financiamientos: FinanciamientoConDatos[]): EstadisticasCobranza {
  const totalCuotasAtrasadas = financiamientos.reduce((acc, item) => acc + item.cuotasAtrasadas, 0);
  const totalMontoAtrasado = financiamientos.reduce((acc, item) => acc + item.montoAtrasado, 0);
  const clientesAfectados = new Set(financiamientos.map((i) => i.clienteId)).size;
  const casosCriticos = financiamientos.filter((i) => i.severidad === 'critica').length;
  const casosAltoRiesgo = financiamientos.filter((i) => i.severidad === 'alta').length;
  const promedioPorCuota = financiamientos.length > 0 ? financiamientos.reduce((acc, i) => acc + i.valorCuota, 0) / financiamientos.length : 0;
  const promedioAtraso = financiamientos.length > 0 ? Math.round(financiamientos.reduce((acc, i) => acc + i.cuotasAtrasadas, 0) / financiamientos.length) : 0;

  return {
    totalCuotasAtrasadas,
    totalMontoAtrasado,
    clientesAfectados,
    casosCriticos,
    casosAltoRiesgo,
    promedioPorCuota,
    promedioAtraso,
  };
}

export const cuotasAtrasadasSlice = createSlice({
  name: 'cuotasAtrasadas',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFinanciamientos: (state, action: PayloadAction<FinanciamientoConDatos[]>) => {
      state.financiamientos = action.payload;
      state.estadisticas = calcularEstadisticas(action.payload);
      state.financiamientosOrdenados = filtrarYOrdenar(action.payload, state.filters);
      state.loading = false;
      state.error = null;
    },
    // Acciones filtros
    setBusqueda: (state, action: PayloadAction<string>) => {
      state.filters.busqueda = action.payload;
      state.financiamientosOrdenados = filtrarYOrdenar(state.financiamientos, state.filters);
    },
    setFiltroSeveridad: (state, action: PayloadAction<FiltrosCuotasState['filtroSeveridad']>) => {
      state.filters.filtroSeveridad = action.payload;
      state.financiamientosOrdenados = filtrarYOrdenar(state.financiamientos, state.filters);
    },
    setVistaCompacta: (state, action: PayloadAction<boolean>) => {
      state.filters.vistaCompacta = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setFinanciamientos,
  setBusqueda,
  setFiltroSeveridad,
  setVistaCompacta,
} = cuotasAtrasadasSlice.actions;

export default cuotasAtrasadasSlice.reducer; 