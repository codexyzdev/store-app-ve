import React from "react";

export const VentasContadoSkeleton = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse'
        >
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
            <div className='h-6 bg-gray-200 rounded-lg w-16'></div>
          </div>

          {/* Cliente y productos */}
          <div className='space-y-3 mb-4'>
            <div className='h-5 bg-gray-200 rounded w-3/4'></div>
            <div className='h-4 bg-gray-200 rounded w-full'></div>
          </div>

          {/* Monto */}
          <div className='flex justify-between items-center mb-3'>
            <div className='h-4 bg-gray-200 rounded w-12'></div>
            <div className='h-6 bg-gray-200 rounded w-20'></div>
          </div>

          {/* Fecha */}
          <div className='flex justify-between items-center mb-4'>
            <div className='h-4 bg-gray-200 rounded w-12'></div>
            <div className='h-4 bg-gray-200 rounded w-24'></div>
          </div>

          {/* Footer */}
          <div className='pt-2 border-t border-gray-100'>
            <div className='h-4 bg-gray-200 rounded w-32 mx-auto'></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CargandoMasVentasSkeleton = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse'
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
            <div className='h-6 bg-gray-200 rounded-lg w-16'></div>
          </div>
          <div className='space-y-3 mb-4'>
            <div className='h-5 bg-gray-200 rounded w-3/4'></div>
            <div className='h-4 bg-gray-200 rounded w-full'></div>
          </div>
          <div className='flex justify-between items-center'>
            <div className='h-4 bg-gray-200 rounded w-12'></div>
            <div className='h-6 bg-gray-200 rounded w-20'></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const EstadoVacioVentas = ({
  busqueda,
  hasFilters,
}: {
  busqueda?: string;
  hasFilters?: boolean;
}) => {
  return (
    <div className='text-center py-12'>
      <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6'>
        <span className='text-4xl text-gray-400'>💵</span>
      </div>

      {busqueda ? (
        <>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No se encontraron ventas
          </h3>
          <p className='text-gray-600 mb-4'>
            No hay ventas que coincidan con "{busqueda}"
          </p>
          <p className='text-sm text-gray-500'>
            Intenta con otros términos de búsqueda o ajusta los filtros
          </p>
        </>
      ) : hasFilters ? (
        <>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No hay ventas con estos filtros
          </h3>
          <p className='text-gray-600 mb-4'>
            Ajusta los filtros para ver más resultados
          </p>
          <p className='text-sm text-gray-500'>
            Intenta cambiar el rango de fechas o los criterios de filtrado
          </p>
        </>
      ) : (
        <>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No hay ventas registradas
          </h3>
          <p className='text-gray-600 mb-6'>
            Comienza registrando tu primera venta al contado
          </p>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 rounded-lg text-sm'>
            <span>💡</span>
            <span>Usa el botón "Nueva Venta" para agregar una venta</span>
          </div>
        </>
      )}
    </div>
  );
};

export const EstadisticasSkeleton = () => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse'>
      <div className='flex items-center gap-4 mb-6'>
        <div className='w-10 h-10 bg-gray-200 rounded-xl'></div>
        <div>
          <div className='h-6 bg-gray-200 rounded w-48 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-64'></div>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='bg-gray-50 rounded-xl p-4 border border-gray-200'
          >
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-4 h-4 bg-gray-200 rounded'></div>
              <div className='h-3 bg-gray-200 rounded w-16'></div>
            </div>
            <div className='h-8 bg-gray-200 rounded w-12 mb-1'></div>
            <div className='h-3 bg-gray-200 rounded w-20'></div>
          </div>
        ))}
      </div>

      <div className='mt-6 pt-4 border-t border-gray-100'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
              <div className='h-4 bg-gray-200 rounded w-12'></div>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'></div>
          </div>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
              <div className='h-4 bg-gray-200 rounded w-12'></div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-gray-200 rounded'></div>
              <div className='h-3 bg-gray-200 rounded flex-1'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
