export const VentaContadoSuccessScreen = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto text-center w-full'>
        <div className='mb-6'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse'>
            <span className='text-2xl sm:text-3xl text-white'>✅</span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-2'>
            ¡Venta Registrada!
          </h2>
          <p className='text-gray-600 text-sm sm:text-base'>
            La venta al contado ha sido registrada exitosamente en el sistema.
          </p>
        </div>

        <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
          <div className='w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
          Redirigiendo a la lista de ventas...
        </div>
      </div>
    </div>
  );
};
