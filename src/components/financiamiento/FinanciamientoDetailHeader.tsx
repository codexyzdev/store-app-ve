import { memo } from "react";
import { useRouter } from "next/navigation";

interface FinanciamientoDetailHeaderProps {
  clienteNombre?: string;
  loading?: boolean;
}

export const FinanciamientoDetailHeader = memo(
  ({ clienteNombre, loading = false }: FinanciamientoDetailHeaderProps) => {
    const router = useRouter();

    return (
      <div className='mb-6 sm:mb-8'>
        {/* Navegación de retorno */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            onClick={() => router.back()}
            className='group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-105'
          >
            <div className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors'>
              <span className='text-lg'>←</span>
            </div>
            <span className='font-medium'>Volver</span>
          </button>
        </div>

        {/* Header principal */}
        <div className='text-center'>
          <div className='inline-flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-6 py-4 shadow-sm border border-blue-100 mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-xl text-white'>👤</span>
            </div>
            <div className='text-left'>
              <h1 className='text-2xl font-bold text-gray-800 mb-1'>
                Detalle del Cliente
              </h1>
              {loading ? (
                <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
              ) : (
                <p className='text-sm text-gray-600'>
                  {clienteNombre
                    ? `Información de ${clienteNombre}`
                    : "Información detallada del cliente"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FinanciamientoDetailHeader.displayName = "FinanciamientoDetailHeader";
