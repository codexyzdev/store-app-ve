import { ProductoFinanciamiento } from "@/lib/firebase/database";

interface ProductoCarritoProps {
  productosCarrito: ProductoFinanciamiento[];
  getProductoNombre: (id: string) => string;
  onActualizarCantidad: (productoId: string, nuevaCantidad: number) => void;
  onRemoverProducto: (productoId: string) => void;
}

export const ProductoCarrito = ({
  productosCarrito,
  getProductoNombre,
  onActualizarCantidad,
  onRemoverProducto,
}: ProductoCarritoProps) => {
  const montoTotal = productosCarrito.reduce((acc, p) => acc + p.subtotal, 0);

  if (productosCarrito.length === 0) {
    return null;
  }

  return (
    <div className='p-4 border border-green-200 rounded-xl bg-green-50'>
      <h4 className='font-semibold text-green-800 mb-3 flex items-center gap-2'>
        🛒 Productos Agregados ({productosCarrito.length})
      </h4>
      <div className='space-y-2'>
        {productosCarrito.map((item) => (
          <div
            key={item.productoId}
            className='flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border gap-3'
          >
            <div className='flex-1 min-w-0'>
              <div className='font-medium text-gray-900 truncate'>
                {getProductoNombre(item.productoId)}
              </div>
              <div className='text-sm text-gray-600'>
                ${item.precioUnitario.toFixed(0)} c/u
              </div>
            </div>
            <div className='flex items-center justify-between sm:justify-end gap-3'>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    onActualizarCantidad(item.productoId, item.cantidad - 1)
                  }
                  className='w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold'
                >
                  -
                </button>
                <span className='w-8 text-center text-sm font-medium'>
                  {item.cantidad}
                </span>
                <button
                  type='button'
                  onClick={() =>
                    onActualizarCantidad(item.productoId, item.cantidad + 1)
                  }
                  className='w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold'
                >
                  +
                </button>
              </div>
              <div className='text-right'>
                <div className='font-semibold text-gray-900'>
                  ${item.subtotal.toFixed(0)}
                </div>
              </div>
              <button
                type='button'
                onClick={() => onRemoverProducto(item.productoId)}
                className='text-red-600 hover:text-red-800 p-1 text-lg'
                title='Remover producto'
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 pt-3 border-t border-green-200'>
        <div className='flex justify-between items-center text-lg font-bold text-green-800'>
          <span>Total a Cobrar:</span>
          <span>${montoTotal.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};
