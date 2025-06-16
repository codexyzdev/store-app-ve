import React from "react";
import {
  PhoneIcon,
  CurrencyDollarIcon,
  UsersIcon as UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { CobroPendienteDetallado } from "@/store/slices/cobrosDelDiaSlice";

interface ListaCobrosPendientesProps {
  cobros: CobroPendienteDetallado[];
  onLlamar: (telefono: string) => void;
  onCobrar: (financiamientoId: string) => void;
}

export function ListaCobrosPendientes({
  cobros,
  onLlamar,
  onCobrar,
}: ListaCobrosPendientesProps) {
  if (cobros.length === 0) {
    return (
      <div className='text-center py-12 bg-white rounded-lg shadow'>
        <div className='text-gray-400 mb-4'>🎉</div>
        <h3 className='text-lg font-semibold text-gray-600 mb-2'>
          ¡Excelente trabajo!
        </h3>
        <p className='text-gray-500'>No hay cobros pendientes ni atrasados</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='divide-y divide-gray-200'>
        {cobros.map((cobro, index) => (
          <div
            key={`${cobro.financiamientoId}-${cobro.cuota}`}
            className='p-4 hover:bg-gray-50 transition-colors'
          >
            <div className='flex items-center justify-between gap-4'>
              {/* Información principal */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='flex-shrink-0'>
                    <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                      <UserIcon className='w-5 h-5 text-orange-600' />
                    </div>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='font-semibold text-gray-900 truncate'>
                      {cobro.nombre}
                    </h4>
                    <p className='text-sm text-gray-500'>
                      {cobro.cedula} • Cuota #{cobro.cuota}
                    </p>
                  </div>
                </div>

                <div className='ml-13 space-y-1'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <PhoneIcon className='w-4 h-4 text-gray-400' />
                    <span>{cobro.telefono}</span>
                  </div>
                  <div className='flex items-start gap-2 text-sm text-gray-600'>
                    <MapPinIcon className='w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0' />
                    <span className='truncate'>{cobro.direccion}</span>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <span className='font-medium'>{cobro.producto}</span>
                    <span className='mx-2'>•</span>
                    <span>
                      {cobro.historialPagos} de {cobro.totalCuotas} pagadas
                    </span>
                  </div>
                </div>
              </div>

              {/* Monto y acciones */}
              <div className='flex items-center gap-3'>
                <div className='text-right'>
                  <div className='text-lg font-bold text-orange-600'>
                    ${cobro.monto.toFixed(2)}
                  </div>
                  <div className='text-xs text-gray-500'>Pendiente</div>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => onLlamar(cobro.telefono)}
                    className='p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    title='Llamar'
                  >
                    <PhoneIcon className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => onCobrar(cobro.financiamientoId)}
                    className='p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                    title='Cobrar'
                  >
                    <CurrencyDollarIcon className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
