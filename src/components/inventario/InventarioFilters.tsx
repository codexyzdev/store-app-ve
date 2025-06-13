import { useState } from "react";

interface InventarioFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: string;
  onCategoryChange: (category: string) => void;
  filterStock: string;
  onStockChange: (stock: string) => void;
  categories: string[];
  onClearFilters: () => void;
  // Sorting props
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  // View mode props
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function InventarioFilters({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterStock,
  onStockChange,
  categories,
  onClearFilters,
  sortBy,
  sortOrder,
  onSort,
  viewMode,
  onViewModeChange,
}: InventarioFiltersProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const hasActiveFilters = searchTerm || filterCategory || filterStock;

  const sortOptions = [
    { key: "nombre", label: "Nombre", icon: "🔤" },
    { key: "stock", label: "Stock", icon: "📊" },
    { key: "precio", label: "Precio", icon: "💰" },
    { key: "categoria", label: "Categoría", icon: "🏷️" },
  ];

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden'>
      {/* Header con búsqueda principal */}
      <div className='p-4 sm:p-6 border-b border-gray-100'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Barra de búsqueda principal */}
          <div className='flex-1'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span className='text-gray-400 text-lg'>🔍</span>
              </div>
              <input
                type='text'
                placeholder='Buscar productos por nombre o descripción...'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm sm:text-base'
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  <span className='text-lg'>✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Controles principales */}
          <div className='flex items-center gap-3'>
            {/* Toggle de vista */}
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title='Vista en cuadrícula'
              >
                <span className='text-lg'>📦</span>
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title='Vista en lista'
              >
                <span className='text-lg'>📋</span>
              </button>
            </div>

            {/* Botón de filtros avanzados */}
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                hasActiveFilters || isFiltersExpanded
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className='text-lg'>⚙️</span>
              <span className='hidden sm:inline text-sm font-medium'>
                Filtros
              </span>
              {hasActiveFilters && (
                <span className='bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {
                    [searchTerm, filterCategory, filterStock].filter(Boolean)
                      .length
                  }
                </span>
              )}
              <span
                className={`text-sm transition-transform ${
                  isFiltersExpanded ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros expandibles */}
      {isFiltersExpanded && (
        <div className='p-4 sm:p-6 bg-gray-50 border-b border-gray-100'>
          <div className='space-y-4'>
            {/* Filtros de categoría y stock */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                >
                  <option value=''>Todas las categorías</option>
                  {categories.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Estado del stock
                </label>
                <select
                  value={filterStock}
                  onChange={(e) => onStockChange(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                >
                  <option value=''>Todo el stock</option>
                  <option value='bajo'>Stock bajo ⚠️</option>
                  <option value='normal'>Stock normal ✅</option>
                  <option value='sin-stock'>Sin stock 🚫</option>
                </select>
              </div>
            </div>

            {/* Botón limpiar filtros */}
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
        </div>
      )}

      {/* Ordenamiento */}
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
          <span className='text-sm font-medium text-gray-700 flex-shrink-0'>
            Ordenar por:
          </span>
          <div className='flex flex-wrap gap-2'>
            {sortOptions.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onSort(key)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === key
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {sortBy === key && (
                  <span className='text-indigo-500'>
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
