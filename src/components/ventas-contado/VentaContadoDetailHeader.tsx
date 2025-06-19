import Link from "next/link";

export const VentaContadoDetailHeader = () => {
  return (
    <div className='mb-4 sm:mb-6'>
      <div className='text-center mb-4 sm:mb-6'>
        <div className='inline-flex items-center gap-2 sm:gap-3 bg-white rounded-2xl px-4 sm:px-6 py-3 shadow-sm border border-sky-100 w-full'>
          <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0'>
            <span className='text-lg sm:text-xl text-white'>💵</span>
          </div>
          <div className='text-left min-w-0'>
            <h1 className='text-lg sm:text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent truncate'>
              Nueva Venta
            </h1>
            <p className='text-xs sm:text-sm text-gray-600'>
              Registra una venta al contado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
