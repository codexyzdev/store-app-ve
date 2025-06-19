import { ChangeEvent } from "react";
import { Producto } from "@/lib/firebase/database";

interface ProductoSelectorProps {
  busquedaProducto: string;
  productoSeleccionado: Producto | null;
  productosFiltrados: Producto[];
  cantidadProducto: number;
  onBusquedaChange: (value: string) => void;
  onProductoSeleccionado: (producto: Producto) => void;
  onCantidadChange: (cantidad: number) => void;
  onAgregarCarrito: () => void;
}

export const ProductoSelector = ({
  busquedaProducto,
  productoSeleccionado,
  productosFiltrados,
  cantidadProducto,
  onBusquedaChange,
  onProductoSeleccionado,
  onCantidadChange,
  onAgregarCarrito,
}: ProductoSelectorProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 bg-sky-100 rounded-lg flex items-center justify-center'>
          <span className='text-sky-600 font-bold text-sm sm:text-base'>2</span>
        </div>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
          Agregar Productos
        </h3>
      </div>

      {/* Búsqueda de productos */}
      <div className='relative'>
        <input
          type='text'
          placeholder='Buscar producto del inventario...'
          value={busquedaProducto}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onBusquedaChange(e.target.value)
          }
          className='w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base'
          autoComplete='off'
        />

        {/* Lista de productos filtrados */}
        {busquedaProducto &&
          !productoSeleccionado &&
          productosFiltrados.length > 0 && (
            <div className='absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
              {productosFiltrados.slice(0, 5).map((producto) => (
                <button
                  key={producto.id}
                  type='button'
                  className='w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors border-b border-gray-100 last:border-b-0'
                  onClick={() => onProductoSeleccionado(producto)}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        {producto.nombre}
                      </div>
                      <div className='text-sm text-gray-600'>
                        ${producto.precio.toFixed(0)} • Stock: {producto.stock}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        producto.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {producto.stock > 0 ? "Disponible" : "Sin stock"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Producto seleccionado */}
      {productoSeleccionado && (
        <div className='p-4 border border-sky-200 rounded-xl bg-sky-50'>
          <div className='space-y-3'>
            <div className='font-semibold text-sky-900'>
              {productoSeleccionado.nombre}
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-sky-700'>
                Precio: ${productoSeleccionado.precio.toFixed(0)}
              </span>
              <span className='text-sky-700'>
                Stock: {productoSeleccionado.stock}
              </span>
            </div>

            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
              <label className='text-sm font-medium text-sky-700'>
                Cantidad:
              </label>
              <div className='flex items-center gap-3 w-full sm:w-auto'>
                <input
                  type='number'
                  min='1'
                  max={productoSeleccionado.stock}
                  value={cantidadProducto}
                  onChange={(e) =>
                    onCantidadChange(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className='w-20 px-2 py-1 border border-sky-300 rounded text-center text-sm focus:ring-2 focus:ring-sky-500'
                />
                <button
                  type='button'
                  onClick={onAgregarCarrito}
                  disabled={productoSeleccionado.stock < cantidadProducto}
                  className='flex-1 sm:flex-none px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
