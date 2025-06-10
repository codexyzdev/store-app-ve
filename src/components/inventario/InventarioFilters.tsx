import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface InventarioFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: string;
  onCategoryChange: (category: string) => void;
  filterStock: string;
  onStockChange: (stock: string) => void;
  categories: string[];
  onClearFilters: () => void;
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
}: InventarioFiltersProps) {
  const hasActiveFilters = searchTerm || filterCategory || filterStock;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-400 text-lg'>🔍</span>
          <h3 className='text-lg font-medium text-gray-900'>Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className='inline-flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors'
          >
            <span className='text-red-500'>✕</span>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Search */}
        <div>
          <label
            htmlFor='search'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Buscar productos
          </label>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg'>
              🔍
            </span>
            <input
              id='search'
              type='text'
              placeholder='Nombre o descripción...'
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label
            htmlFor='category'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Categoría
          </label>
          <select
            id='category'
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
          >
            <option value=''>Todas las categorías</option>
            {categories.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div>
          <label
            htmlFor='stock'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Estado del stock
          </label>
          <select
            id='stock'
            value={filterStock}
            onChange={(e) => onStockChange(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
          >
            <option value=''>Todo el stock</option>
            <option value='bajo'>Stock bajo</option>
            <option value='normal'>Stock normal</option>
            <option value='sin-stock'>Sin stock</option>
          </select>
        </div>
      </div>
    </div>
  );
}
