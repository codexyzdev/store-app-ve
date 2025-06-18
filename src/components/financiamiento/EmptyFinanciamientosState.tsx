import { memo } from "react";
import Link from "next/link";

interface EmptyFinanciamientosStateProps {
  clienteNombre?: string;
}

export const EmptyFinanciamientosState = memo(
  ({ clienteNombre }: EmptyFinanciamientosStateProps) => {
    return (
      <div className='text-center py-12'>
        {/* Icono animado */}
        <div className='relative mb-8'>
          <div className='w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto animate-pulse'>
            <span className='text-4xl text-gray-400'>📭</span>
          </div>
          {/* Partículas flotantes */}
          <div
            className='absolute -top-2 -right-2 w-3 h-3 bg-blue-200 rounded-full animate-bounce'
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className='absolute -bottom-1 -left-3 w-2 h-2 bg-purple-200 rounded-full animate-bounce'
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className='absolute top-1/2 -right-4 w-1.5 h-1.5 bg-green-200 rounded-full animate-bounce'
            style={{ animationDelay: "0.2s" }}
          />
        </div>

        {/* Título y descripción */}
        <div className='max-w-md mx-auto mb-8'>
          <h3 className='text-2xl font-bold text-gray-900 mb-3'>
            No hay financiamientos activos
          </h3>
          <p className='text-gray-500 text-lg leading-relaxed'>
            {clienteNombre
              ? `${clienteNombre} no tiene financiamientos registrados en el sistema.`
              : "Este cliente no tiene financiamientos registrados en el sistema."}
          </p>
        </div>

        {/* Acciones sugeridas */}
        <div className='space-y-4'>
          <Link
            href='/financiamiento-cuota/nuevo'
            className='group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105'
          >
            <div className='w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform'>
              <span className='text-lg'>💰</span>
            </div>
            <span>Crear Nuevo Financiamiento</span>
            <div className='w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform'>
              <span className='text-sm'>→</span>
            </div>
          </Link>

          <div className='flex items-center gap-4 justify-center text-sm text-gray-500'>
            <span>o también puedes</span>
          </div>

          <div className='flex gap-3 justify-center'>
            <Link
              href='/clientes'
              className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors'
            >
              <span>👥</span>
              Ver otros clientes
            </Link>

            <Link
              href='/financiamiento-cuota'
              className='inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors'
            >
              <span>📋</span>
              Ver todos los financiamientos
            </Link>
          </div>
        </div>

        {/* Información adicional */}
        <div className='mt-12 max-w-2xl mx-auto'>
          <div className='bg-blue-50 rounded-2xl p-6 border border-blue-100'>
            <h4 className='text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2'>
              <span>💡</span>
              ¿Sabías que...?
            </h4>
            <p className='text-blue-700 text-sm leading-relaxed'>
              Puedes crear financiamientos flexibles con diferentes planes de
              pago, gestionar cobros automáticos y llevar un control detallado
              de todos los pagos.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

EmptyFinanciamientosState.displayName = "EmptyFinanciamientosState";
