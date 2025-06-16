import React, { useState, useRef, useEffect } from "react";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import { subirImagenCliente } from "@/lib/firebase/storage";
import { useAppDispatch } from "@/store/hooks";
import { updateCliente } from "@/store/slices/clientesSlice";

interface EditarClienteFormProps {
  cliente: Cliente;
  onClienteActualizado: (cliente: Cliente) => void;
  onCancel: () => void;
}

const EditarClienteForm: React.FC<EditarClienteFormProps> = ({
  cliente,
  onClienteActualizado,
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: cliente.nombre || "",
    cedula: cliente.cedula || "",
    telefono: cliente.telefono || "",
    direccion: cliente.direccion || "",
  });
  const [fotoCedula, setFotoCedula] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    cliente.fotoCedulaUrl || null
  );
  const [mantenerFotoExistente, setMantenerFotoExistente] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Actualizar form data si el cliente cambia
    setFormData({
      nombre: cliente.nombre || "",
      cedula: cliente.cedula || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
    });
    setPreviewUrl(cliente.fotoCedulaUrl || null);
    setMantenerFotoExistente(true);
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let fotoCedulaUrl = cliente.fotoCedulaUrl;

      // Si hay una nueva foto, subirla
      if (fotoCedula) {
        fotoCedulaUrl = await subirImagenCliente(cliente.id, fotoCedula);
      }

      const datosActualizados = {
        ...formData,
        fotoCedulaUrl,
      };

      await clientesDB.actualizar(cliente.id, datosActualizados);

      const clienteActualizado = {
        ...cliente,
        ...datosActualizados,
      };

      // Actualizar Redux inmediatamente
      dispatch(updateCliente(clienteActualizado));

      onClienteActualizado(clienteActualizado);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar el cliente";

      // Manejar específicamente el error de cédula duplicada
      if (errorMessage.includes("Ya existe un cliente con la cédula")) {
        setError(
          `⚠️ ${errorMessage}. Por favor, verifica el número de cédula e intenta nuevamente.`
        );
        // Focalizar el campo de cédula para facilitar la corrección
        const cedulaInput = document.querySelector(
          'input[title="Solo números, mínimo 6 dígitos"]'
        ) as HTMLInputElement;
        if (cedulaInput) {
          cedulaInput.focus();
          cedulaInput.select();
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFotoCedula(file);
    setMantenerFotoExistente(false);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(cliente.fotoCedulaUrl || null);
      setMantenerFotoExistente(true);
    }
  };

  const acortarNombreArchivo = (
    nombreArchivo: string,
    maxLength: number = 25
  ) => {
    if (nombreArchivo.length <= maxLength) return nombreArchivo;
    const extension = nombreArchivo.split(".").pop();
    const nombreSinExtension = nombreArchivo.substring(
      0,
      nombreArchivo.lastIndexOf(".")
    );
    const longitudPermitida =
      maxLength - (extension ? extension.length + 4 : 3); // 4 = "..." + "."
    return `${nombreSinExtension.substring(0, longitudPermitida)}...${
      extension ? `.${extension}` : ""
    }`;
  };

  const removerImagen = () => {
    setFotoCedula(null);
    setPreviewUrl(null);
    setMantenerFotoExistente(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const restaurarImagenOriginal = () => {
    setFotoCedula(null);
    setPreviewUrl(cliente.fotoCedulaUrl || null);
    setMantenerFotoExistente(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-red-500'>{error}</span>
            </div>
          </div>
        )}

        {/* Campos del formulario */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='sm:col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Nombre Completo <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              required
              value={formData.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
              placeholder='Ingresa el nombre completo'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Cédula de Identidad <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              required
              pattern='[0-9]{6,10}'
              title='Solo números, mínimo 6 dígitos'
              value={formData.cedula}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, cedula: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
              placeholder='Ej: 12345678'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Teléfono <span className='text-red-500'>*</span>
            </label>
            <input
              type='tel'
              required
              value={formData.telefono}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
              placeholder='Ej: 04241234567'
            />
          </div>

          <div className='sm:col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Dirección <span className='text-red-500'>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.direccion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none'
              placeholder='Ingresa la dirección completa o enlace de Google Maps'
            />
          </div>
        </div>

        {/* Sección de imagen mejorada */}
        <div className='space-y-4'>
          <label className='block text-sm font-semibold text-gray-700'>
            Foto de la Cédula
          </label>

          {!previewUrl ? (
            // Estado sin imagen
            <div
              onClick={() => fileInputRef.current?.click()}
              className='w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group'
            >
              <div className='flex flex-col items-center gap-3'>
                <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors'>
                  <span className='text-2xl'>📷</span>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-700 group-hover:text-indigo-700'>
                    Seleccionar imagen de la cédula
                  </p>
                  <p className='text-xs text-gray-500'>PNG, JPG hasta 10MB</p>
                </div>
              </div>
            </div>
          ) : (
            // Estado con imagen
            <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
              <div className='flex items-center gap-4'>
                {/* Preview de la imagen */}
                <div className='flex-shrink-0'>
                  <img
                    src={previewUrl}
                    alt='Preview de cédula'
                    className='w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm'
                  />
                </div>

                {/* Información del archivo */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-green-500 text-lg'>✅</span>
                    <span className='text-sm font-medium text-gray-900'>
                      {fotoCedula
                        ? "Nueva imagen seleccionada"
                        : "Imagen actual"}
                    </span>
                  </div>
                  {fotoCedula && (
                    <>
                      <p
                        className='text-xs text-gray-600 truncate'
                        title={fotoCedula.name}
                      >
                        {acortarNombreArchivo(fotoCedula.name)}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {(fotoCedula.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  )}
                </div>

                {/* Botones de acción */}
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='px-3 py-2 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors'
                  >
                    Cambiar
                  </button>
                  {fotoCedula && mantenerFotoExistente === false && (
                    <button
                      type='button'
                      onClick={restaurarImagenOriginal}
                      className='px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors'
                    >
                      Restaurar
                    </button>
                  )}
                  <button
                    type='button'
                    onClick={removerImagen}
                    className='px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors'
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          )}

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />
        </div>

        {/* Botones de acción */}
        <div className='flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200'>
          <button
            type='button'
            onClick={onCancel}
            disabled={loading}
            className='flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading}
            className='flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Actualizando...
              </>
            ) : (
              <>
                <span>💾</span>
                Actualizar Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarClienteForm;
