import React from "react";

interface ProductosSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

export const ProductosSkeleton: React.FC<ProductosSkeletonProps> = ({
  count = 8,
  viewMode = "grid",
}) => {
  if (viewMode === "list") {
    return (
      <div className='space-y-4'>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-xl border border-gray-200 p-4 animate-pulse'
          >
            <div className='flex items-center space-x-4'>
              {/* Imagen skeleton */}
              <div className='flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg' />

              {/* Contenido */}
              <div className='flex-1 space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='h-4 bg-gray-200 rounded w-1/3' />
                  <div className='h-4 bg-gray-200 rounded w-16' />
                </div>
                <div className='h-3 bg-gray-200 rounded w-2/3' />
                <div className='flex items-center justify-between'>
                  <div className='h-3 bg-gray-200 rounded w-20' />
                  <div className='h-3 bg-gray-200 rounded w-24' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse'
        >
          {/* Imagen skeleton */}
          <div className='h-48 bg-gray-200' />

          {/* Contenido */}
          <div className='p-4 space-y-3'>
            {/* Título */}
            <div className='h-5 bg-gray-200 rounded w-3/4' />

            {/* Descripción */}
            <div className='space-y-2'>
              <div className='h-3 bg-gray-200 rounded w-full' />
              <div className='h-3 bg-gray-200 rounded w-2/3' />
            </div>

            {/* Precio y stock */}
            <div className='flex items-center justify-between pt-2'>
              <div className='h-4 bg-gray-200 rounded w-20' />
              <div className='h-4 bg-gray-200 rounded w-16' />
            </div>

            {/* Botones */}
            <div className='flex gap-2 pt-2'>
              <div className='h-8 bg-gray-200 rounded flex-1' />
              <div className='h-8 bg-gray-200 rounded w-8' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton para el estado vacío pero con filtros activos
export const EstadoVacioSkeleton: React.FC = () => {
  return (
    <div className='text-center py-12 px-4'>
      <div className='max-w-sm mx-auto'>
        <div className='animate-bounce'>
          <div className='w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse' />
        </div>
        <div className='mt-4 space-y-2'>
          <div className='h-5 bg-gray-200 rounded w-3/4 mx-auto animate-pulse' />
          <div className='h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse' />
        </div>
        <div className='mt-6'>
          <div className='h-10 bg-gray-200 rounded-lg w-40 mx-auto animate-pulse' />
        </div>
      </div>
    </div>
  );
};

// Skeleton compacto para cuando se está buscando
export const BusquedaSkeleton: React.FC = () => {
  return (
    <div className='flex items-center justify-center py-8'>
      <div className='flex items-center space-x-3 text-gray-500'>
        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
        <div className='space-y-1'>
          <div className='h-4 bg-gray-200 rounded w-24 animate-pulse' />
          <div className='h-3 bg-gray-200 rounded w-16 animate-pulse' />
        </div>
      </div>
    </div>
  );
};

// Skeleton para el indicador de "cargando más"
export const CargandoMasSkeleton: React.FC = () => {
  return (
    <div className='flex items-center justify-center py-8'>
      <div className='flex items-center space-x-3 text-gray-500'>
        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500' />
        <span className='text-sm font-medium'>Cargando más productos...</span>
      </div>
    </div>
  );
};

// Skeleton para estadísticas
export const EstadisticasSkeleton: React.FC = () => {
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 animate-pulse'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className='text-center'>
            <div className='h-8 bg-gray-200 rounded w-16 mx-auto mb-2' />
            <div className='h-4 bg-gray-200 rounded w-20 mx-auto' />
          </div>
        ))}
      </div>
    </div>
  );
};
