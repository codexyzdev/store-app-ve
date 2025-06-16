import React from "react";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { EstadisticasCobrosDelDia } from "@/store/slices/cobrosDelDiaSlice";

interface EstadisticasCobrosDelDiaProps {
  estadisticas: EstadisticasCobrosDelDia;
}

export function EstadisticasCobrosDelDia({
  estadisticas,
}: EstadisticasCobrosDelDiaProps) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      <div className='bg-green-50 p-6 rounded-xl text-center shadow-sm border border-green-200'>
        <CurrencyDollarIcon className='w-8 h-8 text-green-600 mx-auto mb-2' />
        <span className='text-sm text-green-800 font-medium block mb-1'>
          Total Cobrado
        </span>
        <span className='text-2xl font-bold text-green-600'>
          ${estadisticas.totalCobrado.toFixed(2)}
        </span>
      </div>

      <div className='bg-blue-50 p-6 rounded-xl text-center shadow-sm border border-blue-200'>
        <CalendarDaysIcon className='w-8 h-8 text-blue-600 mx-auto mb-2' />
        <span className='text-sm text-blue-800 font-medium block mb-1'>
          Cobros Realizados
        </span>
        <span className='text-2xl font-bold text-blue-600'>
          {estadisticas.cantidadCobros}
        </span>
      </div>

      <div className='bg-yellow-50 p-6 rounded-xl text-center shadow-sm border border-yellow-200'>
        <ExclamationCircleIcon className='w-8 h-8 text-yellow-600 mx-auto mb-2' />
        <span className='text-sm text-yellow-800 font-medium block mb-1'>
          Monto Pendiente
        </span>
        <span className='text-2xl font-bold text-yellow-600'>
          ${estadisticas.montoPendiente.toFixed(2)}
        </span>
      </div>

      <div className='bg-purple-50 p-6 rounded-xl text-center shadow-sm border border-purple-200'>
        <UsersIcon className='w-8 h-8 text-purple-600 mx-auto mb-2' />
        <span className='text-sm text-purple-800 font-medium block mb-1'>
          Clientes del Día
        </span>
        <span className='text-2xl font-bold text-purple-600'>
          {estadisticas.clientesUnicos}
        </span>
      </div>
    </div>
  );
}
