import { ChangeEvent } from "react";

interface FormData {
  fecha: string;
  descripcion: string;
}

interface VentaContadoDetallesProps {
  formData: FormData;
  montoTotal: number;
  productosCarrito: any[];
  getProductoNombre: (id: string) => string;
  onFormDataChange: (data: Partial<FormData>) => void;
}

export const VentaContadoDetalles = ({
  formData,
  montoTotal,
  productosCarrito,
  getProductoNombre,
  onFormDataChange,
}: VentaContadoDetallesProps) => {
  if (productosCarrito.length === 0) {
    return null;
  }

  return (
    <div className='border-t border-gray-200 pt-6 sm:pt-8'>
      <div className='flex items-center gap-2 mb-4 sm:mb-6'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 bg-sky-100 rounded-lg flex items-center justify-center'>
          <span className='text-sky-600 font-bold text-sm sm:text-base'>3</span>
        </div>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
          Detalles de la Venta
        </h3>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
        {/* Fecha de venta */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            Fecha de Venta
          </label>
          <input
            type='date'
            value={formData.fecha}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onFormDataChange({ fecha: e.target.value })
            }
            className='w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base'
            required
          />
        </div>

        {/* Monto total (solo lectura) */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            Monto Total
          </label>
          <div className='relative'>
            <span className='absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500'>
              $
            </span>
            <input
              type='text'
              value={montoTotal.toFixed(0)}
              className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600'
              readOnly
            />
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            Calculado automáticamente
          </p>
        </div>
      </div>

      {/* Descripción */}
      <div className='mt-6'>
        <label className='block text-sm font-semibold text-gray-700 mb-2'>
          Descripción (Opcional)
        </label>
        <textarea
          rows={3}
          value={formData.descripcion}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onFormDataChange({ descripcion: e.target.value })
          }
          className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none'
          placeholder={`Venta al contado de ${
            productosCarrito.length
          } producto${
            productosCarrito.length > 1 ? "s" : ""
          }: ${productosCarrito
            .map((p) => getProductoNombre(p.productoId))
            .join(", ")}`}
        />
      </div>
    </div>
  );
};
