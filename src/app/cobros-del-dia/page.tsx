"use client";

import { useCobrosDelDiaRedux } from "@/hooks/useCobrosDelDiaRedux";
import {
  EstadisticasCobrosDelDia,
  CobrosRealizados,
} from "@/components/cobros-del-dia";

export default function CobrosDelDiaPage() {
  const { estadisticas, cobrosAgrupadosFiltrados, loading, error } =
    useCobrosDelDiaRedux();

  // Estados de carga y error con mejor UX
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <div className='animate-spin rounded-full h-32 w-32 border-4 border-blue-500 border-t-transparent mb-4'></div>
        <p className='text-gray-600 text-lg'>Cargando cobros del día...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
            <div className='flex items-center mb-4'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h2 className='text-lg font-semibold text-red-600'>
                  Error al cargar datos
                </h2>
                <p className='text-red-700 mt-1'>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors'
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            📅 Cobros del Día
          </h1>
          <p className='text-gray-600'>
            Gestiona todos los cobros programados para hoy
          </p>
        </div>

        {/* Estadísticas */}
        <div className='mb-8'>
          <EstadisticasCobrosDelDia estadisticas={estadisticas} />
        </div>

        {/* Contenido principal */}
        <div className='max-w-4xl mx-auto'>
          {/* Cobros Realizados */}
          <div>
            <div className='flex items-center gap-2 mb-6'>
              <h2 className='text-xl font-semibold text-gray-800'>
                ✅ Cobros Realizados
              </h2>
              <span className='bg-emerald-100 text-emerald-700 text-sm font-medium px-2.5 py-0.5 rounded-full'>
                {cobrosAgrupadosFiltrados.length}
              </span>
            </div>

            <CobrosRealizados cobrosAgrupados={cobrosAgrupadosFiltrados} />
          </div>
        </div>
      </div>
    </div>
  );
}
