import { useState, useEffect, useRef } from "react";
import { Producto } from "@/lib/firebase/database";
import { ImageUploader } from "./ImageUploader";

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
    stockMinimo: 5,
    categoria: "",
    imagenes: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const nombreInputRef = useRef<HTMLInputElement | null>(null);

  // Resetear formulario cuando cambia el producto o se abre/cierra
  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        precio: producto.precio,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo || 5,
        categoria: producto.categoria,
        imagenes: producto.imagenes || [],
      });
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio: 0,
        stock: 0,
        stockMinimo: 5,
        categoria: "",
        imagenes: [],
      });
    }
    setError(null);
    setValidationErrors({});
  }, [producto, isOpen]);

  // Foco inicial al abrir
  useEffect(() => {
    if (isOpen && nombreInputRef.current) {
      const timer = setTimeout(() => {
        nombreInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cerrar con Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    }
    if (!formData.categoria.trim()) {
      errors.categoria = "La categoría es requerida";
    }
    if (formData.precio <= 0) {
      errors.precio = "El precio debe ser mayor a 0";
    }
    if (formData.stock < 0) {
      errors.stock = "El stock no puede ser negativo";
    }
    if (formData.stockMinimo < 0) {
      errors.stockMinimo = "El stock mínimo no puede ser negativo";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error de validación al cambiar el campo
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-auto'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 relative animate-in zoom-in-95 duration-200 my-4 max-h-[calc(100vh-2rem)]'>
        {/* Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-4 text-white relative'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors'
            aria-label='Cerrar modal'
            type='button'
          >
            ✕
          </button>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center'>
              <span className='text-2xl'>📦</span>
            </div>
            <div>
              <h2 className='text-2xl font-bold'>
                {producto ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <p className='text-white/80 text-sm'>
                {producto
                  ? "Modifica la información del producto"
                  : "Agrega un nuevo producto al inventario"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-y-auto max-h-[calc(100vh-12rem)]'>
          <form onSubmit={handleSubmit} className='p-6'>
            {/* Error general */}
            {error && (
              <div className='mb-6 rounded-xl bg-red-50 border border-red-200 p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <span className='text-red-600 text-lg'>⚠️</span>
                  </div>
                  <div>
                    <h3 className='text-sm font-medium text-red-800'>
                      Error al guardar
                    </h3>
                    <p className='mt-1 text-sm text-red-700'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 gap-6'>
              {/* Información básica */}
              <div className='bg-gray-50 rounded-xl p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='text-xl'>ℹ️</span>
                  Información básica
                </h3>

                <div className='grid grid-cols-1 gap-4'>
                  {/* Nombre */}
                  <div>
                    <label
                      htmlFor='nombre'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Nombre del producto *
                    </label>
                    <input
                      id='nombre'
                      name='nombre'
                      type='text'
                      required
                      ref={nombreInputRef}
                      value={formData.nombre}
                      onChange={(e) =>
                        handleInputChange("nombre", e.target.value)
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        validationErrors.nombre
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      }`}
                      placeholder='Ej: iPhone 14 Pro Max'
                    />
                    {validationErrors.nombre && (
                      <p className='mt-1 text-xs text-red-600'>
                        {validationErrors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Categoría y Precio en una fila */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='categoria'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Categoría *
                      </label>
                      <input
                        id='categoria'
                        name='categoria'
                        type='text'
                        required
                        value={formData.categoria}
                        onChange={(e) =>
                          handleInputChange("categoria", e.target.value)
                        }
                        className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                          validationErrors.categoria
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        }`}
                        placeholder='Ej: Electrónicos'
                      />
                      {validationErrors.categoria && (
                        <p className='mt-1 text-xs text-red-600'>
                          {validationErrors.categoria}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor='precio'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Precio *
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <span className='text-gray-500 text-sm'>$</span>
                        </div>
                        <input
                          id='precio'
                          name='precio'
                          type='number'
                          min='0'
                          step='1'
                          required
                          value={formData.precio === 0 ? "" : formData.precio}
                          onChange={(e) =>
                            handleInputChange(
                              "precio",
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value)
                            )
                          }
                          className={`w-full rounded-xl border pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                            validationErrors.precio
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                          }`}
                          placeholder='0.00'
                        />
                      </div>
                      {validationErrors.precio && (
                        <p className='mt-1 text-xs text-red-600'>
                          {validationErrors.precio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className='mt-4'>
                  <label
                    htmlFor='descripcion'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Descripción
                  </label>
                  <textarea
                    id='descripcion'
                    name='descripcion'
                    value={formData.descripcion}
                    onChange={(e) =>
                      handleInputChange("descripcion", e.target.value)
                    }
                    className='w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none'
                    rows={2}
                    placeholder='Descripción opcional del producto...'
                  />
                </div>
              </div>

              {/* Imágenes del producto */}
              <div className='bg-purple-50 rounded-xl p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='text-xl'>📸</span>
                  Imágenes del producto
                </h3>

                <ImageUploader
                  imagenes={formData.imagenes}
                  onImagenesChange={(imagenes) =>
                    handleInputChange("imagenes", imagenes)
                  }
                  maxImagenes={5}
                />
              </div>

              {/* Inventario */}
              <div className='bg-blue-50 rounded-xl p-4'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='text-xl'>📊</span>
                  Control de inventario
                </h3>

                <div className='grid grid-cols-2 gap-4'>
                  {/* Stock actual */}
                  <div>
                    <label
                      htmlFor='stock'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Stock actual *
                    </label>
                    <input
                      id='stock'
                      name='stock'
                      type='number'
                      min='0'
                      required
                      value={formData.stock === 0 ? "" : formData.stock}
                      onChange={(e) =>
                        handleInputChange(
                          "stock",
                          e.target.value === "" ? 0 : parseInt(e.target.value)
                        )
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        validationErrors.stock
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      }`}
                      placeholder='0'
                    />
                    {validationErrors.stock && (
                      <p className='mt-1 text-xs text-red-600'>
                        {validationErrors.stock}
                      </p>
                    )}
                  </div>

                  {/* Stock mínimo */}
                  <div>
                    <label
                      htmlFor='stockMinimo'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Stock mínimo
                    </label>
                    <input
                      id='stockMinimo'
                      name='stockMinimo'
                      type='number'
                      min='0'
                      value={
                        formData.stockMinimo === 0 ? "" : formData.stockMinimo
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "stockMinimo",
                          e.target.value === "" ? 0 : parseInt(e.target.value)
                        )
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        validationErrors.stockMinimo
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                      }`}
                      placeholder='5'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      Se alertará cuando el stock baje de este nivel
                    </p>
                    {validationErrors.stockMinimo && (
                      <p className='mt-1 text-xs text-red-600'>
                        {validationErrors.stockMinimo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Indicador de estado del stock */}
                {formData.stock > 0 && (
                  <div className='mt-4 p-4 bg-white rounded-lg border border-blue-200'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-700'>
                        Estado del stock:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          formData.stock === 0
                            ? "bg-red-100 text-red-700"
                            : formData.stock <= formData.stockMinimo
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {formData.stock === 0
                          ? "🔴 Sin stock"
                          : formData.stock <= formData.stockMinimo
                          ? "🟡 Stock bajo"
                          : "🟢 Stock normal"}
                      </span>
                    </div>
                    {formData.precio > 0 && (
                      <div className='mt-2 pt-2 border-t border-blue-200'>
                        <span className='text-sm text-gray-600'>
                          Valor total del inventario:
                          <span className='font-semibold text-indigo-600 ml-1'>
                            $
                            {(
                              formData.stock * formData.precio
                            ).toLocaleString()}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className='flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 sm:flex-initial px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors'
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-6 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    Guardando...
                  </>
                ) : (
                  <>💾 {producto ? "Actualizar" : "Crear"} Producto</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
