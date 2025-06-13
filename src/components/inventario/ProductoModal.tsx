import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Producto } from "@/lib/firebase/database";
import { ImageUploader } from "./ImageUploader";
import { crearProducto, actualizarProducto } from "@/store/inventarioSlice";
import { subirImagenesProducto } from "@/lib/firebase/storage";
import { AppDispatch, RootState } from "@/store";

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto?: Producto;
}

export function ProductoModal({
  isOpen,
  onClose,
  producto,
}: ProductoModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector(
    (state: RootState) => state.inventario
  );

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    stockMinimo: 5,
    categoria: "",
    imagenes: [] as string[],
  });
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

    try {
      // Si estamos creando un producto nuevo y hay imágenes temporales (base64)
      if (!producto) {
        const imagenesTemporales = formData.imagenes.filter((img) =>
          img.startsWith("data:")
        );
        if (imagenesTemporales.length > 0) {
          // Crear el producto primero para obtener el ID
          const nuevoProducto = await dispatch(
            crearProducto({
              ...formData,
              imagenes: [], // Sin imágenes por ahora
            })
          ).unwrap();

          // Cerrar la modal inmediatamente después de crear el producto
          onClose();

          // Procesar imágenes en segundo plano
          try {
            // Convertir las imágenes base64 a archivos y subirlas
            const archivos: File[] = [];
            for (const base64 of imagenesTemporales) {
              const archivo = await base64ToFile(base64, "imagen.jpg");
              archivos.push(archivo);
            }

            // Subir las imágenes a Firebase Storage
            const urlsImagenes = await subirImagenesProducto(
              nuevoProducto.id,
              archivos
            );

            // Actualizar el producto con las URLs de las imágenes
            await dispatch(
              actualizarProducto({
                id: nuevoProducto.id,
                datos: { ...formData, imagenes: urlsImagenes },
              })
            );
          } catch (imageError) {
            console.error("Error al procesar imágenes:", imageError);
            // Las imágenes fallaron pero el producto ya se creó
            // Podrías mostrar una notificación aquí si tienes un sistema de notificaciones
          }
        } else {
          // No hay imágenes temporales, crear producto normalmente
          await dispatch(crearProducto(formData));
          onClose();
        }
      } else {
        // Estamos editando un producto existente
        await dispatch(
          actualizarProducto({
            id: producto.id,
            datos: formData,
          })
        );
        onClose();
      }
    } catch (err) {
      console.error("Error al guardar producto:", err);
      // No cerrar la modal si hay error en la creación inicial
    }
  };

  // Función helper para convertir base64 a File
  const base64ToFile = (base64: string, filename: string): Promise<File> => {
    return new Promise((resolve) => {
      fetch(base64)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], filename, { type: blob.type });
          resolve(file);
        });
    });
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

            {/* Información básica */}
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Nombre */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nombre del producto *
                  </label>
                  <input
                    ref={nombreInputRef}
                    type='text'
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      validationErrors.nombre
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder='Ej: iPhone 14 Pro Max'
                  />
                  {validationErrors.nombre && (
                    <p className='mt-1 text-sm text-red-600'>
                      {validationErrors.nombre}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      handleInputChange("categoria", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      validationErrors.categoria
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value=''>Seleccionar categoría</option>
                    <option value='Electrónicos'>Electrónicos</option>
                    <option value='Ropa'>Ropa</option>
                    <option value='Hogar'>Hogar</option>
                    <option value='Deportes'>Deportes</option>
                    <option value='Libros'>Libros</option>
                    <option value='Juguetes'>Juguetes</option>
                    <option value='Automóviles'>Automóviles</option>
                    <option value='Salud'>Salud</option>
                    <option value='Belleza'>Belleza</option>
                    <option value='Otros'>Otros</option>
                  </select>
                  {validationErrors.categoria && (
                    <p className='mt-1 text-sm text-red-600'>
                      {validationErrors.categoria}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Precio *
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 sm:text-sm'>$</span>
                    </div>
                    <input
                      type='number'
                      step='1'
                      min='0'
                      value={formData.precio === 0 ? "" : formData.precio}
                      onChange={(e) =>
                        handleInputChange(
                          "precio",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-full pl-7 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        validationErrors.precio
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder='0.00'
                    />
                  </div>
                  {validationErrors.precio && (
                    <p className='mt-1 text-sm text-red-600'>
                      {validationErrors.precio}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Stock actual *
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.stock}
                    onChange={(e) =>
                      handleInputChange("stock", parseInt(e.target.value) || 0)
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      validationErrors.stock
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder='0'
                  />
                  {validationErrors.stock && (
                    <p className='mt-1 text-sm text-red-600'>
                      {validationErrors.stock}
                    </p>
                  )}
                </div>

                {/* Stock mínimo */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Stock mínimo
                  </label>
                  <input
                    type='number'
                    min='0'
                    value={formData.stockMinimo}
                    onChange={(e) =>
                      handleInputChange(
                        "stockMinimo",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      validationErrors.stockMinimo
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder='5'
                  />
                  {validationErrors.stockMinimo && (
                    <p className='mt-1 text-sm text-red-600'>
                      {validationErrors.stockMinimo}
                    </p>
                  )}
                  <p className='mt-1 text-xs text-gray-500'>
                    Alerta cuando el stock esté por debajo de este valor
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    handleInputChange("descripcion", e.target.value)
                  }
                  rows={3}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none'
                  placeholder='Descripción detallada del producto...'
                />
              </div>

              {/* Imágenes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Imágenes del producto
                </label>
                <ImageUploader
                  imagenes={formData.imagenes}
                  onImagenesChange={(imagenes) =>
                    setFormData((prev) => ({ ...prev, imagenes }))
                  }
                  productoId={producto?.id}
                  maxImagenes={5}
                />
              </div>
            </div>

            {/* Botones */}
            <div className='flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={onClose}
                className='px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className='text-lg'>💾</span>
                    {producto ? "Actualizar" : "Crear"} Producto
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
