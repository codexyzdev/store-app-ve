import React from "react";

interface ResumenGlobalProps {
  totalPendiente: number;
  totalCuotasAtrasadas: number;
}

const ResumenGlobal: React.FC<ResumenGlobalProps> = ({
  totalPendiente,
  totalCuotasAtrasadas,
}) => (
  <div className='mb-12'>
    <h2 className='text-xl font-bold mb-4 text-gray-800'>Resumen global</h2>
    <div className='flex flex-col sm:flex-row gap-6'>
      <div className='flex-1 bg-indigo-50 border border-indigo-200 rounded-lg px-6 py-4 flex flex-col items-center shadow'>
        <span className='text-xs text-gray-500 font-semibold uppercase flex items-center mb-1'>
          <span className='mr-1'>💰</span> Monto pendiente total
        </span>
        <span className='text-3xl font-bold text-indigo-700'>
          ${totalPendiente.toFixed(2)}
        </span>
      </div>
      <div className='flex-1 bg-red-50 border border-red-200 rounded-lg px-6 py-4 flex flex-col items-center shadow'>
        <span className='text-xs text-gray-500 font-semibold uppercase flex items-center mb-1'>
          <span className='mr-1'>⏰</span> Cuotas atrasadas totales
        </span>
        <span className='text-3xl font-bold text-red-700'>
          ${totalCuotasAtrasadas.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);

export default ResumenGlobal;
