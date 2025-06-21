import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useInfiniteScroll';
import { VentaContado, Cliente, Producto } from '@/lib/firebase/database';
import {
  getClienteInfo,
  getProductoNombre,
} from '@/utils/financiamientoHelpers';

interface VentaContadoConDatos {
  venta: VentaContado;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    cedula: string;
  } | null;
  productos: string; // Texto descriptivo de productos
  tieneDescuento: boolean;
}

interface UseVentasContadoInfiniteScrollOptions {
  pageSize?: number;
  busqueda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  soloConDescuento?: boolean;
  montoMinimo?: number;
  montoMaximo?: number;
}

interface UseVentasContadoInfiniteScrollReturn {
  items: VentaContadoConDatos[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  totalCount: number;
  currentPage: number;
  estadisticas: {
    totalVentas: number;
    montoTotal: number;
    ventasConDescuento: number;
    montoDescuentos: number;
    promedioVenta: number;
    ventasHoy: number;
  };
}

export const useVentasContadoInfiniteScroll = (
  allVentas: VentaContado[],
  clientes: Cliente[],
  productos: Producto[],
  options: UseVentasContadoInfiniteScrollOptions = {}
): UseVentasContadoInfiniteScrollReturn => {
  const {
    pageSize = 25,
    busqueda = '',
    fechaInicio = '',
    fechaFin = '',
    soloConDescuento = false,
    montoMinimo,
    montoMaximo,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<VentaContadoConDatos[]>([]);

  // Debounce del término de búsqueda
  const debouncedBusqueda = useDebounce(busqueda, 300);

  // Función para construir datos de ventas
  const construirVentasConDatos = useCallback((ventas: VentaContado[]): VentaContadoConDatos[] => {
    return ventas.map((venta) => {
      const cliente = getClienteInfo(venta.clienteId, clientes);
      
      // Manejar múltiples productos correctamente
      let productosTexto = "";
      if (venta.productos && venta.productos.length > 0) {
        // Si tiene array de productos (ventas múltiples)
        productosTexto = venta.productos
          .map((p) => {
            const nombreProducto = getProductoNombre(p.productoId, productos);
            return `${nombreProducto} (x${p.cantidad})`;
          })
          .join(", ");
      } else {
        // Fallback para ventas antiguas con un solo producto
        productosTexto = getProductoNombre(venta.productoId, productos);
      }

      return {
        venta,
        cliente,
        productos: productosTexto,
        tieneDescuento: !!(venta.montoDescuento && venta.montoDescuento > 0),
      };
    });
  }, [clientes, productos]);

  // Función para filtrar y ordenar
  const getFilteredAndSortedData = useCallback(() => {
    let filtered = [...allVentas];

    // Aplicar filtros
    if (debouncedBusqueda.trim()) {
      const term = debouncedBusqueda.toLowerCase();
      filtered = filtered.filter((venta) => {
        const cliente = clientes.find(c => c.id === venta.clienteId);
        
        // Buscar en múltiples productos
        let productosCoinciden = false;
        if (venta.productos && venta.productos.length > 0) {
          productosCoinciden = venta.productos.some((p) => {
            const nombreProducto = productos.find(prod => prod.id === p.productoId)?.nombre || '';
            return nombreProducto.toLowerCase().includes(term);
          });
        } else {
          // Fallback para ventas con un solo producto
          const producto = productos.find(p => p.id === venta.productoId)?.nombre || '';
          productosCoinciden = producto.toLowerCase().includes(term);
        }

        return (
          cliente?.nombre.toLowerCase().includes(term) ||
          cliente?.telefono?.includes(term) ||
          cliente?.cedula?.includes(term) ||
          productosCoinciden ||
          venta.numeroControl.toString().includes(term)
        );
      });
    }

    // Filtrar por fecha
    if (fechaInicio) {
      const inicio = new Date(fechaInicio).getTime();
      filtered = filtered.filter(venta => venta.fecha >= inicio);
    }

    if (fechaFin) {
      const fin = new Date(fechaFin).getTime() + 24 * 60 * 60 * 1000 - 1; // Final del día
      filtered = filtered.filter(venta => venta.fecha <= fin);
    }

    // Filtrar solo ventas con descuento
    if (soloConDescuento) {
      filtered = filtered.filter(venta => venta.montoDescuento && venta.montoDescuento > 0);
    }

    // Filtrar por rango de monto
    if (montoMinimo !== undefined) {
      filtered = filtered.filter(venta => venta.monto >= montoMinimo);
    }

    if (montoMaximo !== undefined) {
      filtered = filtered.filter(venta => venta.monto <= montoMaximo);
    }

    // Construir datos y ordenar por fecha más reciente
    const ventasConDatos = construirVentasConDatos(filtered);
    return ventasConDatos.sort(
      (a, b) => new Date(b.venta.fecha).getTime() - new Date(a.venta.fecha).getTime()
    );
  }, [
    allVentas,
    debouncedBusqueda,
    fechaInicio,
    fechaFin,
    soloConDescuento,
    montoMinimo,
    montoMaximo,
    clientes,
    productos,
    construirVentasConDatos
  ]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const ventasConDatos = construirVentasConDatos(allVentas);
    
    const totalVentas = ventasConDatos.length;
    const montoTotal = ventasConDatos.reduce((sum, item) => sum + item.venta.monto, 0);
    const ventasConDescuento = ventasConDatos.filter(item => item.tieneDescuento).length;
    const montoDescuentos = ventasConDatos.reduce((sum, item) => sum + (item.venta.montoDescuento || 0), 0);
    const promedioVenta = totalVentas > 0 ? montoTotal / totalVentas : 0;
    
    // Ventas de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioHoy = hoy.getTime();
    const finHoy = inicioHoy + 24 * 60 * 60 * 1000 - 1;
    
    const ventasHoy = ventasConDatos.filter(item => 
      item.venta.fecha >= inicioHoy && item.venta.fecha <= finHoy
    ).length;

    return {
      totalVentas,
      montoTotal,
      ventasConDescuento,
      montoDescuentos,
      promedioVenta,
      ventasHoy,
    };
  }, [allVentas, construirVentasConDatos]);

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
        setError(err instanceof Error ? err.message : 'Error al cargar ventas');
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
  }, [debouncedBusqueda, fechaInicio, fechaFin, soloConDescuento, montoMinimo, montoMaximo, reset]);

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