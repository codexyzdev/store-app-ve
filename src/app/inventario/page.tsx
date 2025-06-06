"use client";

import { useState, useEffect } from "react";
import {
  inventarioDB,
  Producto as ProductoType,
} from "@/lib/firebase/database";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ProductoModal } from "@/components/inventario/ProductoModal";
import Producto from "@/components/inventario/Producto";

export default function InventarioPage() {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    ProductoType | undefined
  >();

  useEffect(() => {
    const unsubscribe = inventarioDB.suscribir((productos) => {
      setProductos(productos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCrearProducto = async (
    datos: Omit<ProductoType, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await inventarioDB.crear(datos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el producto"
      );
      throw err;
    }
  };

  const handleEditarProducto = async (
    datos: Omit<ProductoType, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!productoSeleccionado) return;

    try {
      await inventarioDB.actualizar(productoSeleccionado.id, datos);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el producto"
      );
      throw err;
    }
  };

  const handleEliminarProducto = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await inventarioDB.eliminar(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el producto"
      );
    }
  };

  if (loading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  return (
    <div className=' bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='sm:flex sm:items-center sm:justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Inventario</h1>
            <p className='mt-2 text-sm text-gray-700'>
              Administra tu inventario de productos
            </p>
          </div>
          <div className='mt-4 sm:mt-0'>
            <button
              className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 gap-2'
              onClick={() => {
                setProductoSeleccionado(undefined);
                setModalOpen(true);
              }}
            >
              <PlusIcon className='w-5 h-5' />
              Nuevo Producto
            </button>
          </div>
        </div>

        {error && (
          <div className='mb-6 rounded-md bg-red-50 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>Error</h3>
                <div className='mt-2 text-sm text-red-700'>{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className='bg-white shadow-sm rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Producto
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Categoría
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Stock
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Precio
                  </th>
                  <th scope='col' className='relative px-6 py-3'>
                    <span className='sr-only'>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {productos.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-6 py-12 text-center text-gray-500'
                    >
                      <div className='flex flex-col items-center'>
                        <svg
                          className='h-12 w-12 text-gray-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                          />
                        </svg>
                        <p className='mt-2 text-sm font-medium'>
                          No hay productos en el inventario
                        </p>
                        <p className='mt-1 text-sm text-gray-500'>
                          Comienza agregando un nuevo producto
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <Producto
                      key={producto.id}
                      producto={producto}
                      setProductoSeleccionado={setProductoSeleccionado}
                      setModalOpen={setModalOpen}
                      handleEliminarProducto={handleEliminarProducto}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProductoSeleccionado(undefined);
        }}
        producto={productoSeleccionado}
        onSave={
          productoSeleccionado ? handleEditarProducto : handleCrearProducto
        }
      />
    </div>
  );
}
