import React, { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn {
  sentinelRef: React.RefObject<HTMLDivElement>;
  isIntersecting: boolean;
}

export const useInfiniteScroll = (
  callback: () => void,
  options?: UseInfiniteScrollOptions
): UseInfiniteScrollReturn => {
  // Backward compatibility: si no se pasan opciones, usar valores por defecto
  const { hasMore = true, isLoading = false, threshold = 0.1, rootMargin = "200px 0px" } = options || {};
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
    
    if (entry.isIntersecting && hasMore && !isLoading) {
      callback();
    }
  }, [callback, hasMore, isLoading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, threshold, rootMargin]);

  return {
    sentinelRef,
    isIntersecting,
  };
};

// Función legacy para backward compatibility (retorna solo el ref)
export const useInfiniteScrollLegacy = (callback: () => void): React.RefObject<HTMLDivElement> => {
  const { sentinelRef } = useInfiniteScroll(callback);
  return sentinelRef;
};

// Hook para debounce - utilidad general
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook especializado para productos con scroll infinito
interface UseProductosInfiniteScrollOptions {
  pageSize?: number;
  searchTerm?: string;
  filterCategory?: string;
  filterStock?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UseProductosInfiniteScrollReturn {
  productos: any[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  totalCount: number;
  currentPage: number;
}

export const useProductosInfiniteScroll = (
  allProductos: any[],
  options: UseProductosInfiniteScrollOptions = {}
): UseProductosInfiniteScrollReturn => {
  const {
    pageSize = 20,
    searchTerm = '',
    filterCategory = '',
    filterStock = '',
    sortBy = 'nombre',
    sortOrder = 'asc'
  } = options;

  const [productos, setProductos] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Función para filtrar y ordenar productos
  const getFilteredAndSortedProducts = useCallback(() => {
    let filtered = [...allProductos];

    // Aplicar filtros
    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((producto) =>
        producto.nombre.toLowerCase().includes(term) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(term)) ||
        (producto.categoria && producto.categoria.toLowerCase().includes(term))
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((producto) => producto.categoria === filterCategory);
    }

    if (filterStock) {
      switch (filterStock) {
        case 'bajo':
          filtered = filtered.filter((producto) => producto.stock <= (producto.stockMinimo || 5));
          break;
        case 'normal':
          filtered = filtered.filter((producto) => producto.stock > (producto.stockMinimo || 5));
          break;
        case 'sin-stock':
          filtered = filtered.filter((producto) => producto.stock === 0);
          break;
      }
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case 'nombre':
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'precio':
          aValue = a.precio;
          bValue = b.precio;
          break;
        case 'categoria':
          aValue = a.categoria.toLowerCase();
          bValue = b.categoria.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allProductos, debouncedSearchTerm, filterCategory, filterStock, sortBy, sortOrder]);

  // Función para cargar más productos
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    // Simular delay de red para mejor UX
    setTimeout(() => {
      try {
        const filteredProducts = getFilteredAndSortedProducts();
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newProducts = filteredProducts.slice(startIndex, endIndex);
        
        if (newProducts.length === 0) {
          setHasMore(false);
        } else {
          setProductos(prev => currentPage === 1 ? newProducts : [...prev, ...newProducts]);
          setCurrentPage(prev => prev + 1);
          setHasMore(endIndex < filteredProducts.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    }, 150); // Pequeño delay para simular carga
  }, [isLoading, hasMore, currentPage, pageSize, getFilteredAndSortedProducts]);

  // Función para resetear el estado
  const reset = useCallback(() => {
    setProductos([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, []);

  // Resetear cuando cambien los filtros
  useEffect(() => {
    reset();
  }, [debouncedSearchTerm, filterCategory, filterStock, sortBy, sortOrder, reset]);

  // Cargar primera página automáticamente
  useEffect(() => {
    if (productos.length === 0 && !isLoading && hasMore) {
      loadMore();
    }
  }, [productos.length, isLoading, hasMore, loadMore]);

  const totalCount = getFilteredAndSortedProducts().length;

  return {
    productos,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    totalCount,
    currentPage: currentPage - 1, // Página actual de datos cargados
  };
}; 