import { Cliente, ProductoFinanciamiento } from "@/lib/firebase/database";

interface DescuentoData {
  tipo: "porcentaje" | "monto";
  valor: number;
  montoDescuento: number;
}

interface VentaContadoSummaryProps {
  clienteSeleccionado: Cliente | null;
  productosCarrito: ProductoFinanciamiento[];
  formData: { fecha: string };
  montoOriginal: number;
  montoTotal: number;
  descuentoData: DescuentoData;
}

export const VentaContadoSummary = ({
  clienteSeleccionado,
  productosCarrito,
  formData,
  montoOriginal,
  montoTotal,
  descuentoData,
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
          {descuentoData.montoDescuento > 0 && (
            <>
              <div className='flex justify-between'>
                <span className='text-gray-700'>Subtotal:</span>
                <span className='font-semibold'>
                  ${montoOriginal.toFixed(0)}
                </span>
              </div>
              <div className='flex justify-between text-amber-600'>
                <span>Descuento:</span>
                <span className='font-semibold'>
                  -${descuentoData.montoDescuento.toFixed(0)}
                  {descuentoData.tipo === "porcentaje" &&
                    ` (${descuentoData.valor}%)`}
                </span>
              </div>
            </>
          )}
          <div className='flex justify-between border-t pt-2'>
            <span className='text-gray-700 font-semibold'>Total a Pagar:</span>
            <span className='font-bold text-lg text-sky-700'>
              ${montoTotal.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
