import type { Producto as ProductoType } from "@/lib/firebase/database";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

interface ProductoProps {
  producto: ProductoType;
  setProductoSeleccionado: (producto: ProductoType) => void;
  setModalOpen: (open: boolean) => void;
  handleEliminarProducto: (id: string) => void;
}

export default function Producto({
  producto,
  setProductoSeleccionado,
  setModalOpen,
  handleEliminarProducto,
}: ProductoProps) {
  return (
    <tr className='hover:bg-indigo-50 transition-colors duration-150'>
      <td className='px-6 py-4 whitespace-nowrap'>
        <div className='flex items-center gap-3'>
          {/* <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg'>
            {producto.nombre[0]?.toUpperCase()}
          </div> */}
          <div>
            <div className='text-base font-bold capitalize text-gray-900'>
              {producto.nombre}
            </div>
            <div className='text-sm text-gray-500'>{producto.descripcion}</div>
          </div>
        </div>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <span className='px-2 inline-flex capitalize text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
          {producto.categoria}
        </span>
      </td>
      <td className='px-6 py-4 whitespace-nowrap'>
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            producto.stock > 10
              ? "bg-green-100 text-green-800"
              : producto.stock > 0
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {producto.stock}
        </span>
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
        ${producto.precio.toFixed(0)}
      </td>
      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
        <div className='flex justify-end space-x-3'>
          <button
            title='Editar'
            onClick={() => {
              setProductoSeleccionado(producto);
              setModalOpen(true);
            }}
            className='rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <PencilSquareIcon className='w-5 h-5' />
          </button>
          <button
            title='Eliminar'
            onClick={() => handleEliminarProducto(producto.id)}
            className='rounded-full bg-red-100 text-red-600 hover:bg-red-200 p-2 focus:outline-none focus:ring-2 focus:ring-red-500'
          >
            <TrashIcon className='w-5 h-5' />
          </button>
        </div>
      </td>
    </tr>
  );
}
