export const VentaContadoSteps = () => {
  return (
    <div className='max-w-6xl mx-auto mb-8'>
      <div className='flex items-center justify-center gap-4 mb-8'>
        <div className='flex items-center gap-2 bg-sky-100 text-sky-600 px-4 py-2 rounded-full text-sm font-medium'>
          <span className='w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
            1
          </span>
          Cliente
        </div>
        <div className='w-8 h-px bg-gray-300'></div>
        <div className='flex items-center gap-2 bg-sky-100 text-sky-600 px-4 py-2 rounded-full text-sm font-medium'>
          <span className='w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
            2
          </span>
          Productos
        </div>
        <div className='w-8 h-px bg-gray-300'></div>
        <div className='flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium'>
          <span className='w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold'>
            3
          </span>
          Confirmación
        </div>
      </div>
    </div>
  );
};
