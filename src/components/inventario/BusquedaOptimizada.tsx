import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/useInfiniteScroll";

interface BusquedaOptimizadaProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  delay?: number;
  initialValue?: string;
  className?: string;
  showResultsCount?: boolean;
  resultsCount?: number;
  isLoading?: boolean;
}

export const BusquedaOptimizada: React.FC<BusquedaOptimizadaProps> = ({
  onSearch,
  placeholder = "Buscar productos por nombre, descripción o categoría...",
  delay = 300,
  initialValue = "",
  className = "",
  showResultsCount = false,
  resultsCount = 0,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // Efecto para llamar a onSearch cuando cambie el término debounced
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          {isLoading ? (
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500' />
          ) : (
            <span className='text-gray-400 text-lg'>🔍</span>
          )}
        </div>

        <input
          type='text'
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full pl-10 pr-12 py-3 
            border-2 rounded-xl 
            transition-all duration-200 ease-in-out
            text-sm sm:text-base
            ${
              isFocused
                ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg"
                : "border-gray-300 hover:border-gray-400"
            }
            ${searchTerm ? "bg-blue-50/50" : "bg-white"}
            focus:outline-none
            placeholder-gray-500
          `}
        />

        {searchTerm && (
          <button
            onClick={handleClear}
            className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
            aria-label='Limpiar búsqueda'
          >
            <span className='text-lg'>✕</span>
          </button>
        )}
      </div>

      {/* Indicador de resultados */}
      {showResultsCount && searchTerm && (
        <div className='absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-xs text-gray-600 z-10'>
          {isLoading ? (
            <span className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500' />
              Buscando...
            </span>
          ) : (
            <span className='flex items-center gap-2'>
              <span className='text-blue-600 font-medium'>{resultsCount}</span>
              producto{resultsCount !== 1 ? "s" : ""} encontrado
              {resultsCount !== 1 ? "s" : ""}
              {searchTerm && (
                <>
                  {" "}
                  para "
                  <span className='font-medium text-gray-900'>
                    {searchTerm}
                  </span>
                  "
                </>
              )}
            </span>
          )}
        </div>
      )}

      {/* Indicador visual de que está escribiendo */}
      {searchTerm !== debouncedSearchTerm && (
        <div className='absolute top-full left-0 right-0 mt-1 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 z-10'>
          <span className='flex items-center gap-2'>
            <div className='animate-pulse w-2 h-2 bg-yellow-500 rounded-full' />
            Escribiendo...
          </span>
        </div>
      )}
    </div>
  );
};

// Componente de filtros avanzados para acompañar la búsqueda
interface FiltrosAvanzadosProps {
  filterCategory: string;
  onCategoryChange: (category: string) => void;
  filterStock: string;
  onStockChange: (stock: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  categories: string[];
  onClearFilters: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const FiltrosAvanzados: React.FC<FiltrosAvanzadosProps> = ({
  filterCategory,
  onCategoryChange,
  filterStock,
  onStockChange,
  sortBy,
  sortOrder,
  onSort,
  categories,
  onClearFilters,
  isExpanded,
  onToggleExpanded,
}) => {
  const hasActiveFilters = filterCategory || filterStock;

  const sortOptions = [
    { key: "nombre", label: "Nombre", icon: "🔤" },
    { key: "stock", label: "Stock", icon: "📊" },
    { key: "precio", label: "Precio", icon: "💰" },
    { key: "categoria", label: "Categoría", icon: "🏷️" },
  ];

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Header de filtros */}
      <div className='px-4 py-3 border-b border-gray-100 bg-gray-50'>
        <button
          onClick={onToggleExpanded}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
            hasActiveFilters || isExpanded
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className='flex items-center gap-2'>
            <span className='text-lg'>⚙️</span>
            <span className='font-medium'>Filtros Avanzados</span>
            {hasActiveFilters && (
              <span className='bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {[filterCategory, filterStock].filter(Boolean).length}
              </span>
            )}
          </div>
          <span
            className={`text-sm transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className='p-4 space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Filtro de categoría */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value=''>Todas las categorías</option>
                {categories.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de stock */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Estado del stock
              </label>
              <select
                value={filterStock}
                onChange={(e) => onStockChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
              >
                <option value=''>Todo el stock</option>
                <option value='bajo'>Stock bajo ⚠️</option>
                <option value='normal'>Stock normal ✅</option>
                <option value='sin-stock'>Sin stock 🚫</option>
              </select>
            </div>
          </div>

          {/* Ordenamiento */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Ordenar por
            </label>
            <div className='flex flex-wrap gap-2'>
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onSort(option.key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                    sortBy === option.key
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span>{option.icon}</span>
                  {option.label}
                  {sortBy === option.key && (
                    <span
                      className={`text-xs ${sortOrder === "asc" ? "↑" : "↓"}`}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <div className='flex justify-center pt-2'>
              <button
                onClick={onClearFilters}
                className='inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
              >
                <span>🗑️</span>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
