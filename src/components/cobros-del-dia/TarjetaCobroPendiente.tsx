import React from "react";
import {
  PhoneIcon,
  CurrencyDollarIcon,
  UsersIcon as UserIcon,
  MapPinIcon,
  CalendarDaysIcon as CalendarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { CobroPendienteDetallado } from "@/store/slices/cobrosDelDiaSlice";

interface TarjetaCobroPendienteProps {
  cobro: CobroPendienteDetallado;
  onLlamar: (telefono: string) => void;
  onCobrar: (financiamientoId: string) => void;
}

export function TarjetaCobroPendiente({
  cobro,
  onLlamar,
  onCobrar,
}: TarjetaCobroPendienteProps) {
  return (
    <div className='bg-white rounded-xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-200 overflow-hidden'>
      {/* Header con gradiente */}
      <div className='bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='font-bold text-lg'>{cobro.nombre}</h3>
            <p className='text-orange-100 text-sm'>Cuota #{cobro.cuota}</p>
          </div>
          <div className='text-right'>
            <span className='text-2xl font-bold'>
              ${cobro.monto.toFixed(2)}
            </span>
            <p className='text-orange-100 text-sm'>Pendiente</p>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className='p-4 space-y-3'>
        <div className='flex items-center gap-3 text-gray-600'>
          <UserIcon className='w-5 h-5 text-gray-400' />
          <span className='text-sm font-medium'>{cobro.cedula}</span>
        </div>

        <div className='flex items-center gap-3 text-gray-600'>
          <PhoneIcon className='w-5 h-5 text-gray-400' />
          <span className='text-sm'>{cobro.telefono}</span>
        </div>

        <div className='flex items-start gap-3 text-gray-600'>
          <MapPinIcon className='w-5 h-5 text-gray-400 mt-0.5' />
          <span className='text-sm'>{cobro.direccion}</span>
        </div>

        <div className='flex items-center gap-3 text-gray-600'>
          <CalendarIcon className='w-5 h-5 text-gray-400' />
          <span className='text-sm'>
            Historial: {cobro.historialPagos} de {cobro.totalCuotas} cuotas
          </span>
        </div>

        <div className='flex items-start gap-3 text-gray-600'>
          <ClipboardDocumentListIcon className='w-5 h-5 text-gray-400 mt-0.5' />
          <span className='text-sm font-medium'>{cobro.producto}</span>
        </div>

        {cobro.notas && (
          <div className='bg-gray-50 p-3 rounded-lg'>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Notas:</span> {cobro.notas}
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className='p-4 bg-gray-50 flex gap-2'>
        <button
          onClick={() => onLlamar(cobro.telefono)}
          className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
        >
          <PhoneIcon className='w-4 h-4' />
          Llamar
        </button>
        <button
          onClick={() => onCobrar(cobro.financiamientoId)}
          className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2'
        >
          <CurrencyDollarIcon className='w-4 h-4' />
          Cobrar
        </button>
      </div>
    </div>
  );
}
