import React, { useState, useEffect, useRef } from "react";
import { Producto } from "@/lib/firebase/database";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto?: Producto;
  onSave: (
    producto: Omit<Producto, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
}

export function ProductoModal({
  isOpen,
  onClose,
  producto,
  onSave,
}: ProductoModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
      });
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio: 0,
        stock: 0,
        categoria: "",
      });
    }
  }, [producto, isOpen]);

  // Foco inicial al abrir
  useEffect(() => {
    if (isOpen && nombreInputRef.current) {
      nombreInputRef.current.focus();
    }
  }, [isOpen]);

  // Cerrar con Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el producto"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-200 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition'
          aria-label='Cerrar modal'
          type='button'
        >
          <XMarkIcon className='h-6 w-6' />
        </button>
        <h2 className='text-2xl font-bold text-center text-indigo-700 mb-6'>
          {producto ? "Editar Producto" : "Nuevo Producto"}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-5'>
          {error && (
            <div className='mb-4 rounded-md bg-red-50 p-4'>
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

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='nombre'
                className='block text-sm font-medium text-gray-700'
              >
                Nombre
              </label>
              <input
                id='nombre'
                name='nombre'
                type='text'
                required
                ref={nombreInputRef}
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
                aria-required='true'
              />
            </div>

            <div>
              <label
                htmlFor='descripcion'
                className='block text-sm font-medium text-gray-700'
              >
                Descripción
              </label>
              <textarea
                id='descripcion'
                name='descripcion'
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
                rows={3}
                aria-describedby='modal-desc'
              />
            </div>

            <div>
              <label
                htmlFor='categoria'
                className='block text-sm font-medium text-gray-700'
              >
                Categoría
              </label>
              <input
                id='categoria'
                name='categoria'
                type='text'
                required
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
                aria-required='true'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='precio'
                  className='block text-sm font-medium text-gray-700'
                >
                  Precio
                </label>
                <div className='mt-1 relative rounded-md shadow-sm'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className='text-gray-500 sm:text-sm'>$</span>
                  </div>
                  <input
                    id='precio'
                    name='precio'
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.precio === 0 ? "" : formData.precio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precio:
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value),
                      })
                    }
                    className='pl-7 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
                    aria-required='true'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='stock'
                  className='block text-sm font-medium text-gray-700'
                >
                  Stock
                </label>
                <input
                  id='stock'
                  name='stock'
                  type='number'
                  min='0'
                  required
                  value={formData.stock === 0 ? "" : formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock:
                        e.target.value === "" ? 0 : parseInt(e.target.value),
                    })
                  }
                  className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
                  aria-required='true'
                />
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 mt-6 rounded-xl'>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200'
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
