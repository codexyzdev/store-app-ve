import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useInfiniteScroll';
import { FinanciamientoCuota, Cliente, Producto, Cobro } from '@/lib/firebase/database';
import {
  getClienteInfo,
  getProductoNombre,
  calcularFinanciamiento,
  FinanciamientoCalculado,
  ClienteInfo,
} from '@/utils/financiamientoHelpers';

interface FinanciamientoConDatos {
  financiamiento: FinanciamientoCuota;
  clienteInfo: ClienteInfo;
  productoNombre: string;
  calculado: FinanciamientoCalculado;
}

interface GrupoFinanciamientosPorCliente {
  clienteId: string;
  clienteInfo: ClienteInfo;
  financiamientos: Array<{
    financiamiento: FinanciamientoCuota;
    productoNombre: string;
    calculado: FinanciamientoCalculado;
  }>;
  financiamientoPrincipal: {
    financiamiento: FinanciamientoCuota;
    productoNombre: string;
    calculado: FinanciamientoCalculado;
  };
}

interface UseFinanciamientosInfiniteScrollOptions {
  pageSize?: number;
  busqueda?: string;
  estado?: string;
  tipoVenta?: string;
  agruparPorCliente?: boolean;
}

interface UseFinanciamientosInfiniteScrollReturn {
  items: FinanciamientoConDatos[] | GrupoFinanciamientosPorCliente[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  totalCount: number;
  currentPage: number;
  estadisticas: {
    todos: number;
    activos: number;
    atrasados: number;
    completados: number;
  };
}

export const useFinanciamientosInfiniteScroll = (
  allFinanciamientos: FinanciamientoCuota[],
  clientes: Cliente[],
  productos: Producto[],
  cobros: Cobro[],
  options: UseFinanciamientosInfiniteScrollOptions = {}
): UseFinanciamientosInfiniteScrollReturn => {
  const {
    pageSize = 25,
    busqueda = '',
    estado = 'todos',
    tipoVenta = 'cuotas', // Por defecto solo financiamientos a cuotas
    agruparPorCliente = false
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  // Debounce del término de búsqueda
  const debouncedBusqueda = useDebounce(busqueda, 300);

  // Función para construir datos de financiamientos
  const construirFinanciamientosConDatos = useCallback((financiamientos: FinanciamientoCuota[]): FinanciamientoConDatos[] => {
    return financiamientos.map((financiamiento) => {
      const clienteInfo = getClienteInfo(financiamiento.clienteId, clientes);
      const productoNombre = getProductoNombre(financiamiento.productoId, productos);
      const calculado = calcularFinanciamiento(financiamiento, cobros);

      return {
        financiamiento,
        clienteInfo,
        productoNombre,
        calculado,
      };
    });
  }, [clientes, productos, cobros]);

  // Función para agrupar financiamientos por cliente
  const agruparFinanciamientosPorCliente = useCallback((
    financiamientosData: FinanciamientoConDatos[]
  ): GrupoFinanciamientosPorCliente[] => {
    const grupos = new Map<string, FinanciamientoConDatos[]>();

    // Agrupar por clienteId
    financiamientosData.forEach((item) => {
      const clienteId = item.financiamiento.clienteId;
      if (!grupos.has(clienteId)) {
        grupos.set(clienteId, []);
      }
      grupos.get(clienteId)!.push(item);
    });

    // Convertir a array de grupos
    return Array.from(grupos.entries()).map(([clienteId, items]) => {
      // Ordenar por fecha de inicio (más reciente primero) para seleccionar el principal
      const itemsOrdenados = items.sort(
        (a, b) =>
          new Date(b.financiamiento.fechaInicio).getTime() -
          new Date(a.financiamiento.fechaInicio).getTime()
      );

      const principal = itemsOrdenados[0];

      return {
        clienteId,
        clienteInfo: principal.clienteInfo,
        financiamientos: itemsOrdenados.map((item) => ({
          financiamiento: item.financiamiento,
          productoNombre: item.productoNombre,
          calculado: item.calculado,
        })),
        financiamientoPrincipal: {
          financiamiento: principal.financiamiento,
          productoNombre: principal.productoNombre,
          calculado: principal.calculado,
        },
      };
    });
  }, []);

  // Función para filtrar y ordenar
  const getFilteredAndSortedData = useCallback(() => {
    let filtered = [...allFinanciamientos];

    // Aplicar filtros
    if (debouncedBusqueda.trim()) {
      const term = debouncedBusqueda.toLowerCase();
      filtered = filtered.filter((financiamiento) => {
        const cliente = clientes.find(c => c.id === financiamiento.clienteId);
        const producto = productos.find(p => p.id === financiamiento.productoId);
        
        return (
          cliente?.nombre.toLowerCase().includes(term) ||
          cliente?.telefono?.includes(term) ||
          producto?.nombre.toLowerCase().includes(term) ||
          financiamiento.numeroControl.toString().includes(term)
        );
      });
    }

    // Filtrar por estado
    if (estado !== 'todos') {
      if (estado === 'atrasado') {
        filtered = filtered.filter((f) => {
          const calculado = calcularFinanciamiento(f, cobros);
          return calculado.cuotasAtrasadas > 0;
        });
      } else {
        filtered = filtered.filter((f) => f.estado === estado);
      }
    }

    // Filtrar por tipo de venta
    if (tipoVenta !== 'todos') {
      filtered = filtered.filter((f) => f.tipoVenta === tipoVenta);
    }

    // Construir datos
    const financiamientosConDatos = construirFinanciamientosConDatos(filtered);

    // Agrupar si es necesario
    if (agruparPorCliente) {
      return agruparFinanciamientosPorCliente(financiamientosConDatos);
    }

    // Ordenar por fecha de inicio (más reciente primero)
    return financiamientosConDatos.sort(
      (a, b) =>
        new Date(b.financiamiento.fechaInicio).getTime() -
        new Date(a.financiamiento.fechaInicio).getTime()
    );
  }, [
    allFinanciamientos,
    debouncedBusqueda,
    estado,
    tipoVenta,
    clientes,
    productos,
    cobros,
    construirFinanciamientosConDatos,
    agruparPorCliente,
    agruparFinanciamientosPorCliente
  ]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const financiamientosConDatos = construirFinanciamientosConDatos(allFinanciamientos);
    
    const todos = financiamientosConDatos.length;
    const activos = financiamientosConDatos.filter(f => f.financiamiento.estado === 'activo').length;
    const completados = financiamientosConDatos.filter(f => f.financiamiento.estado === 'completado').length;
    const atrasados = financiamientosConDatos.filter(f => f.calculado.cuotasAtrasadas > 0).length;

    return {
      todos,
      activos,
      atrasados,
      completados,
    };
  }, [allFinanciamientos, construirFinanciamientosConDatos]);

  // Función para cargar más elementos
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    // Simular delay de red
    setTimeout(() => {
      try {
        const filteredData = getFilteredAndSortedData();
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newItems = filteredData.slice(startIndex, endIndex);
        
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setItems(prev => currentPage === 1 ? newItems : [...prev, ...newItems]);
          setCurrentPage(prev => prev + 1);
          setHasMore(endIndex < filteredData.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar financiamientos');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  }, [isLoading, hasMore, currentPage, pageSize, getFilteredAndSortedData]);

  // Función para resetear el estado
  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, []);

  // Resetear cuando cambien los filtros
  useEffect(() => {
    reset();
  }, [debouncedBusqueda, estado, tipoVenta, agruparPorCliente, reset]);

  // Cargar primera página automáticamente
  useEffect(() => {
    if (items.length === 0 && !isLoading && hasMore && clientes.length > 0 && productos.length > 0) {
      loadMore();
    }
  }, [items.length, isLoading, hasMore, clientes.length, productos.length, loadMore]);

  const totalCount = getFilteredAndSortedData().length;

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    totalCount,
    currentPage: currentPage - 1,
    estadisticas,
  };
}; 