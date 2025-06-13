import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cobro, Cliente, FinanciamientoCuota, Producto } from '@/lib/firebase/database';

// Interfaces específicas para cobros del día
export interface CobroPendienteDetallado {
  clienteId: string;
  financiamientoId: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  monto: number;
  cuota: number;
  producto: string;
  historialPagos: number;
  totalCuotas: number;
  notas?: string;
  fechaInicio: number; // Timestamp en lugar de Date para ser serializable
}

export interface GrupoCobros {
  clienteId: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  cobros: Cobro[];
  totalCobrado: number;
}

export interface EstadisticasCobrosDelDia {
  totalCobrado: number;
  cantidadCobros: number;
  montoPendiente: number;
  cantidadPendientes: number;
  clientesUnicos: number;
}

export interface FiltrosCobrosDelDia {
  busqueda: string;
  tipoVista: 'tarjetas' | 'lista';
}

export interface CobrosDelDiaState {
  cobrosHoy: Cobro[];
  cobrosPendientes: CobroPendienteDetallado[];
  cobrosAgrupados: GrupoCobros[];
  estadisticas: EstadisticasCobrosDelDia;
  loading: boolean;
  error: string | null;
  filters: FiltrosCobrosDelDia;
  cobrosPendientesFiltrados: CobroPendienteDetallado[];
  cobrosAgrupadosFiltrados: GrupoCobros[];
}

const initialFilters: FiltrosCobrosDelDia = {
  busqueda: '',
  tipoVista: 'tarjetas',
};

const initialEstadisticas: EstadisticasCobrosDelDia = {
  totalCobrado: 0,
  cantidadCobros: 0,
  montoPendiente: 0,
  cantidadPendientes: 0,
  clientesUnicos: 0,
};

const initialState: CobrosDelDiaState = {
  cobrosHoy: [],
  cobrosPendientes: [],
  cobrosAgrupados: [],
  estadisticas: initialEstadisticas,
  loading: true,
  error: null,
  filters: initialFilters,
  cobrosPendientesFiltrados: [],
  cobrosAgrupadosFiltrados: [],
};

// Función para filtrar cobros por búsqueda
function filtrarCobros(
  cobrosPendientes: CobroPendienteDetallado[],
  cobrosAgrupados: GrupoCobros[],
  busqueda: string
) {
  const busquedaLower = busqueda.toLowerCase();
  
  const cobrosPendientesFiltrados = cobrosPendientes.filter((cobro) => {
    return (
      cobro.nombre.toLowerCase().includes(busquedaLower) ||
      cobro.cedula.toLowerCase().includes(busquedaLower) ||
      cobro.telefono.toLowerCase().includes(busquedaLower)
    );
  });

  const cobrosAgrupadosFiltrados = cobrosAgrupados.filter((grupo) => {
    return (
      grupo.nombre.toLowerCase().includes(busquedaLower) ||
      grupo.cedula.toLowerCase().includes(busquedaLower) ||
      grupo.telefono.toLowerCase().includes(busquedaLower)
    );
  });

  return { cobrosPendientesFiltrados, cobrosAgrupadosFiltrados };
}

// Función para calcular estadísticas
function calcularEstadisticas(
  cobrosHoy: Cobro[],
  cobrosPendientes: CobroPendienteDetallado[],
  cobrosAgrupados: GrupoCobros[]
): EstadisticasCobrosDelDia {
  const totalCobrado = cobrosHoy.reduce((sum, cobro) => sum + cobro.monto, 0);
  const cantidadCobros = cobrosHoy.length;
  const montoPendiente = cobrosPendientes.reduce((sum, cobro) => sum + cobro.monto, 0);
  const cantidadPendientes = cobrosPendientes.length;
  
  const clientesUnicosSet = new Set([
    ...cobrosAgrupados.map(c => c.clienteId),
    ...cobrosPendientes.map(c => c.clienteId)
  ]);
  const clientesUnicos = clientesUnicosSet.size;

  return {
    totalCobrado,
    cantidadCobros,
    montoPendiente,
    cantidadPendientes,
    clientesUnicos,
  };
}

export const cobrosDelDiaSlice = createSlice({
  name: 'cobrosDelDia',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCobrosDelDia: (state, action: PayloadAction<{
      cobrosHoy: Cobro[];
      cobrosPendientes: CobroPendienteDetallado[];
      cobrosAgrupados: GrupoCobros[];
    }>) => {
      const { cobrosHoy, cobrosPendientes, cobrosAgrupados } = action.payload;
      
      state.cobrosHoy = cobrosHoy;
      state.cobrosPendientes = cobrosPendientes.sort((a, b) => b.monto - a.monto); // Ordenar por monto descendente
      state.cobrosAgrupados = cobrosAgrupados;
      state.estadisticas = calcularEstadisticas(cobrosHoy, cobrosPendientes, cobrosAgrupados);
      
      // Aplicar filtros
      const filtered = filtrarCobros(state.cobrosPendientes, state.cobrosAgrupados, state.filters.busqueda);
      state.cobrosPendientesFiltrados = filtered.cobrosPendientesFiltrados;
      state.cobrosAgrupadosFiltrados = filtered.cobrosAgrupadosFiltrados;
      
      state.loading = false;
      state.error = null;
    },
    setBusqueda: (state, action: PayloadAction<string>) => {
      state.filters.busqueda = action.payload;
      const filtered = filtrarCobros(state.cobrosPendientes, state.cobrosAgrupados, action.payload);
      state.cobrosPendientesFiltrados = filtered.cobrosPendientesFiltrados;
      state.cobrosAgrupadosFiltrados = filtered.cobrosAgrupadosFiltrados;
    },
    setTipoVista: (state, action: PayloadAction<'tarjetas' | 'lista'>) => {
      state.filters.tipoVista = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setCobrosDelDia,
  setBusqueda,
  setTipoVista,
} = cobrosDelDiaSlice.actions;

export default cobrosDelDiaSlice.reducer; 