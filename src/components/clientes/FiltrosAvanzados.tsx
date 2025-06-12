"use client";

import { useClientesRedux } from "@/hooks/useClientesRedux";

export function FiltrosAvanzados() {
  const {
    filters,
    setBusqueda,
    setOrdenarPor,
    setDireccionOrden,
    toggleDireccionOrden,
    clearFilters,
    estadisticas,
    loading,
  } = useClientesRedux();

  // No mostrar filtros mientras está cargando
  if (loading) {
    return (
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='h-10 bg-gray-200 rounded mb-4'></div>
          <div className='flex gap-4'>
            <div className='h-8 bg-gray-200 rounded w-32'></div>
            <div className='h-8 bg-gray-200 rounded w-20'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
      {/* Búsqueda */}
      <div className='mb-6'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <span className='text-gray-400 text-lg'>🔍</span>
          </div>
          <input
            type='text'
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder='Buscar por nombre, teléfono, dirección, cédula o número de control...'
            className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors'
          />
          {filters.busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className='absolute inset-y-0 right-0 pr-4 flex items-center'
            >
              <span className='text-gray-400 hover:text-gray-600 text-lg'>
                ✕
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros Avanzados */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        {/* Ordenamiento */}
        <div className='flex flex-wrap gap-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Ordenar por:
            </span>
            <select
              value={filters.ordenarPor}
              onChange={(e) =>
                setOrdenarPor(
                  e.target.value as "nombre" | "fecha" | "numeroControl"
                )
              }
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
            >
              <option value='nombre'>Nombre</option>
              <option value='numeroControl'>Número de Control</option>
              <option value='fecha'>Fecha de Registro</option>
            </select>
          </div>

          <button
            onClick={toggleDireccionOrden}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
              filters.direccionOrden === "asc"
                ? "bg-sky-50 border-sky-200 text-sky-700"
                : "bg-orange-50 border-orange-200 text-orange-700"
            }`}
            title={`Orden ${
              filters.direccionOrden === "asc" ? "ascendente" : "descendente"
            }`}
          >
            {filters.direccionOrden === "asc" ? "↑ A-Z" : "↓ Z-A"}
          </button>
        </div>

        {/* Limpiar filtros */}
        {(filters.busqueda ||
          filters.ordenarPor !== "nombre" ||
          filters.direccionOrden !== "asc") && (
          <button
            onClick={clearFilters}
            className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
