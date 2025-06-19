interface VentaContadoActionButtonsProps {
  loading: boolean;
  clienteSeleccionado: any;
  productosCarrito: any[];
  onCancelar: () => void;
  onSubmit: () => void;
}

export const VentaContadoActionButtons = ({
  loading,
  clienteSeleccionado,
  productosCarrito,
  onCancelar,
  onSubmit,
}: VentaContadoActionButtonsProps) => {
  return (
    <div className='flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200'>
      <button
        type='button'
        onClick={onCancelar}
        disabled={loading}
        className='flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
      >
        Cancelar
      </button>
      <button
        type='button'
        onClick={onSubmit}
        disabled={
          loading || !clienteSeleccionado || productosCarrito.length === 0
        }
        className='flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium rounded-xl hover:shadow-lg focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base'
      >
        {loading ? (
          <>
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            <span className='hidden sm:inline'>Procesando...</span>
            <span className='sm:hidden'>Procesando</span>
          </>
        ) : (
          <>
            <span>💾</span>
            <span className='hidden sm:inline'>
              {`Registrar Venta (${productosCarrito.length} producto${
                productosCarrito.length > 1 ? "s" : ""
              })`}
            </span>
            <span className='sm:hidden'>Registrar</span>
          </>
        )}
      </button>
    </div>
  );
};
