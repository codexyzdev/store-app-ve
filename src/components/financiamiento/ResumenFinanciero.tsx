interface ResumenFinancieroProps {
  totalPendiente: number;
  totalCuotasAtrasadas: number;
  actualizando?: boolean;
}

export default function ResumenFinanciero({
  totalPendiente,
  totalCuotasAtrasadas,
  actualizando = false,
}: ResumenFinancieroProps) {
  return (
    <div className='mb-6 sm:mb-8'>
      {actualizando && (
        <div className='bg-white rounded-2xl shadow-sm border border-sky-200 p-4 mb-6'>
          <div className='flex items-center justify-center gap-3'>
            <div className='w-6 h-6 sm:w-8 sm:h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
            <span className='text-sky-600 font-semibold text-sm sm:text-base'>
              Actualizando datos del financiamiento...
            </span>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
        <div className='bg-white rounded-2xl shadow-sm border border-red-100 p-4 sm:p-6'>
          <div className='flex items-center gap-3 sm:gap-4'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0'>
              <span className='text-xl sm:text-2xl text-white'>💰</span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-2xl sm:text-3xl font-bold text-red-600 truncate'>
                ${totalPendiente.toLocaleString()}
              </p>
              <p className='text-xs sm:text-sm text-gray-600 font-medium'>
                Total Pendiente de Cobro
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow-sm border border-amber-100 p-4 sm:p-6'>
          <div className='flex items-center gap-3 sm:gap-4'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0'>
              <span className='text-xl sm:text-2xl text-white'>⏰</span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-2xl sm:text-3xl font-bold text-amber-600 truncate'>
                ${totalCuotasAtrasadas.toLocaleString()}
              </p>
              <p className='text-xs sm:text-sm text-gray-600 font-medium'>
                Valor de Cuotas Atrasadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
