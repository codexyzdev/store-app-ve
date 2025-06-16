import React from "react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { EstadisticasCobranza as EstadisticasType } from "@/hooks/useCuotasAtrasadasRedux";

interface EstadisticasCobranzaProps {
  estadisticas: EstadisticasType;
}

export function EstadisticasCobranza({
  estadisticas,
}: EstadisticasCobranzaProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6'>
      <div className='bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-red-100 text-sm font-medium'>Total Atrasado</p>
            <p className='text-3xl font-bold'>
              ${estadisticas.totalMontoAtrasado.toFixed(2)}
            </p>
          </div>
          <div className='bg-red-400 bg-opacity-30 rounded-full p-3'>
            <span className='text-2xl'>💰</span>
          </div>
        </div>
      </div>

      <div className='bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-orange-100 text-sm font-medium'>
              Cuotas Pendientes
            </p>
            <p className='text-3xl font-bold'>
              {estadisticas.totalCuotasAtrasadas}
            </p>
          </div>
          <div className='bg-orange-400 bg-opacity-30 rounded-full p-3'>
            <span className='text-2xl'>⏰</span>
          </div>
        </div>
      </div>

      <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-blue-100 text-sm font-medium'>
              Clientes Afectados
            </p>
            <p className='text-3xl font-bold'>
              {estadisticas.clientesAfectados}
            </p>
          </div>
          <div className='bg-blue-400 bg-opacity-30 rounded-full p-3'>
            <UsersIcon className='w-8 h-8' />
          </div>
        </div>
      </div>
    </div>
  );
}
