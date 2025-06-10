import {
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo?: number;
  precio: number;
  descripcion?: string;
  imagenes?: string[];
}

interface InventarioCardProps {
  producto: Producto;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
}

export function InventarioCard({
  producto,
  viewMode,
  onEdit,
  onDelete,
}: InventarioCardProps) {
  const getStockStatus = () => {
    if (producto.stock === 0) {
      return {
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: XCircleIcon,
        label: "Sin stock",
      };
    } else if (producto.stock <= (producto.stockMinimo || 5)) {
      return {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: ExclamationTriangleIcon,
        label: "Stock bajo",
      };
    } else {
      return {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircleIcon,
        label: "Stock normal",
      };
    }
  };

  const stockStatus = getStockStatus();

  if (viewMode === "list") {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4 flex-1'>
            <div className='flex-shrink-0'>
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <div className='w-12 h-12 rounded-lg overflow-hidden border border-gray-200'>
                  <img
                    src={producto.imagenes[0]}
                    alt={producto.nombre}
                    className='w-full h-full object-cover'
                  />
                </div>
              ) : (
                <div className='w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center'>
                  <CubeIcon className='w-6 h-6 text-indigo-600' />
                </div>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-3'>
                <h3 className='text-lg font-semibold text-gray-900 truncate'>
                  {producto.nombre}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor} border`}
                >
                  <stockStatus.icon className='w-3 h-3' />
                  {stockStatus.label}
                </span>
              </div>
              <div className='mt-1 flex items-center gap-4 text-sm text-gray-500'>
                <span className='bg-gray-100 px-2 py-1 rounded-md'>
                  {producto.categoria}
                </span>
                {producto.descripcion && (
                  <span className='truncate max-w-xs'>
                    {producto.descripcion}
                  </span>
                )}
              </div>
            </div>

            <div className='flex items-center gap-6 text-right'>
              <div>
                <p className='text-sm text-gray-500'>Stock</p>
                <p className={`text-lg font-semibold ${stockStatus.color}`}>
                  {producto.stock}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Precio</p>
                <p className='text-lg font-semibold text-gray-900'>
                  ${producto.precio.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Valor Total</p>
                <p className='text-lg font-semibold text-indigo-600'>
                  ${(producto.stock * producto.precio).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 ml-4'>
            <button
              onClick={onEdit}
              className='p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
              title='Editar producto'
            >
              <PencilIcon className='w-5 h-5' />
            </button>
            <button
              onClick={onDelete}
              className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
              title='Eliminar producto'
            >
              <TrashIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group'>
      <div className='p-6'>
        {/* Header with image and status */}
        <div className='flex justify-between items-start mb-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <div className='w-10 h-10 rounded-lg overflow-hidden border border-gray-200'>
                  <img
                    src={producto.imagenes[0]}
                    alt={producto.nombre}
                    className='w-full h-full object-cover'
                  />
                </div>
              ) : (
                <div className='w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center'>
                  <CubeIcon className='w-5 h-5 text-indigo-600' />
                </div>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor} border`}
              >
                <stockStatus.icon className='w-3 h-3' />
                {stockStatus.label}
              </span>
            </div>

            <h3 className='text-lg font-semibold text-gray-900 mb-1 line-clamp-2'>
              {producto.nombre}
            </h3>

            <span className='inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium'>
              {producto.categoria}
            </span>
          </div>
        </div>

        {/* Galería de imágenes (vista grid) */}
        {producto.imagenes && producto.imagenes.length > 0 && (
          <div className='mb-4'>
            {producto.imagenes.length === 1 ? (
              <div className='aspect-square rounded-lg overflow-hidden border border-gray-200'>
                <img
                  src={producto.imagenes[0]}
                  alt={producto.nombre}
                  className='w-full h-full object-cover'
                />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-2'>
                <div className='aspect-square rounded-lg overflow-hidden border border-gray-200'>
                  <img
                    src={producto.imagenes[0]}
                    alt={`${producto.nombre} - Principal`}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='grid gap-2'>
                  {producto.imagenes.slice(1, 3).map((imagen, index) => (
                    <div
                      key={index}
                      className='aspect-square rounded-lg overflow-hidden border border-gray-200'
                    >
                      <img
                        src={imagen}
                        alt={`${producto.nombre} - ${index + 2}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ))}
                  {producto.imagenes.length > 3 && (
                    <div className='aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center relative'>
                      <img
                        src={producto.imagenes[3]}
                        alt={`${producto.nombre} - 4`}
                        className='w-full h-full object-cover'
                      />
                      {producto.imagenes.length > 4 && (
                        <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                          <span className='text-white font-bold text-sm'>
                            +{producto.imagenes.length - 3} más
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {producto.descripcion && (
          <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
            {producto.descripcion}
          </p>
        )}

        {/* Stats */}
        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-500 mb-1'>Stock</p>
            <p className={`text-xl font-bold ${stockStatus.color}`}>
              {producto.stock}
            </p>
          </div>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-500 mb-1'>Precio</p>
            <p className='text-xl font-bold text-gray-900'>
              ${producto.precio.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Value */}
        <div className='mb-6'>
          <div className='flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100'>
            <span className='text-sm font-medium text-indigo-700'>
              Valor Total
            </span>
            <span className='text-lg font-bold text-indigo-600'>
              ${(producto.stock * producto.precio).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-2'>
          <button
            onClick={onEdit}
            className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors'
          >
            <PencilIcon className='w-4 h-4' />
            Editar
          </button>
          <button
            onClick={onDelete}
            className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors'
          >
            <TrashIcon className='w-4 h-4' />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
