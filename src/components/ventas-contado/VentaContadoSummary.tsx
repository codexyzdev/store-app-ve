import { Cliente, ProductoFinanciamiento } from "@/lib/firebase/database";

interface VentaContadoSummaryProps {
  clienteSeleccionado: Cliente | null;
  productosCarrito: ProductoFinanciamiento[];
  formData: { fecha: string };
  montoTotal: number;
}

export const VentaContadoSummary = ({
  clienteSeleccionado,
  productosCarrito,
  formData,
  montoTotal,
}: VentaContadoSummaryProps) => {
  if (productosCarrito.length === 0) {
    return null;
  }

  return (
    <div className='bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-sky-200'>
      <h3 className='text-base sm:text-lg font-bold text-sky-900 mb-3 sm:mb-4 flex items-center gap-2'>
        📋 Resumen de la Venta
      </h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm'>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Cliente:</span>
            <span className='font-semibold'>
              {clienteSeleccionado?.nombre || "--"}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Productos:</span>
            <span className='font-semibold'>{productosCarrito.length}</span>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Fecha:</span>
            <span className='font-semibold'>{formData.fecha}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Total:</span>
            <span className='font-bold text-lg text-sky-700'>
              ${montoTotal.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
