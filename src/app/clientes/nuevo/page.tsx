"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clientesDB } from "@/lib/firebase/database";
import { subirImagenCliente } from "@/lib/firebase/storage";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    direccion: "",
  });
  const [fotoCedula, setFotoCedula] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fotoCedula) {
      setError("La foto de la cédula es obligatoria");
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.focus();
      return;
    }

    try {
      // 1. Crear cliente sin fotoCedulaUrl para obtener el ID
      const nuevoCliente = await clientesDB.crear({
        ...formData,
        createdAt: Date.now(),
      });
      // 2. Subir imagen a Storage
      const url = await subirImagenCliente(nuevoCliente.id, fotoCedula);
      // 3. Actualizar cliente con la URL de la foto
      await clientesDB.actualizar(nuevoCliente.id, { fotoCedulaUrl: url });
      router.push("/clientes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el cliente"
      );
    } finally {
      setLoading(false);
    }
  };

  // Mostrar preview al seleccionar archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFotoCedula(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6'>Nuevo Cliente</h1>

      {error && (
        <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-md'>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className='space-y-6'
        encType='multipart/form-data'
      >
        <div>
          <label
            htmlFor='nombre'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Nombre Completo
          </label>
          <input
            type='text'
            id='nombre'
            required
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className='mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm bg-white'
          />
        </div>

        <div>
          <label
            htmlFor='cedula'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Cédula de Identidad <span className='text-red-600'>*</span>
          </label>
          <input
            type='text'
            id='cedula'
            required
            pattern='[0-9]{6,10}'
            title='Solo números, mínimo 6 dígitos'
            value={formData.cedula}
            onChange={(e) =>
              setFormData({ ...formData, cedula: e.target.value })
            }
            className='mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm bg-white'
          />
        </div>

        <div>
          <label
            htmlFor='telefono'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Teléfono
          </label>
          <input
            type='tel'
            id='telefono'
            required
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            className='mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm bg-white'
          />
        </div>

        <div>
          <label
            htmlFor='direccion'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Dirección
          </label>
          <textarea
            id='direccion'
            required
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            rows={3}
            className='mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm bg-white'
          />
        </div>

        <div>
          <label
            htmlFor='fotoCedula'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Foto de la cédula de identidad{" "}
            <span className='text-red-600'>*</span>
          </label>
          <div className='flex flex-col sm:flex-row items-start gap-4'>
            <label className='cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition font-medium'>
              Seleccionar imagen
              <input
                type='file'
                id='fotoCedula'
                accept='image/*'
                required
                ref={fileInputRef}
                onChange={handleFileChange}
                className='hidden'
              />
            </label>
            {fotoCedula && (
              <span className='text-sm text-gray-700 mt-2 sm:mt-0'>
                {fotoCedula.name}
              </span>
            )}
          </div>
          {previewUrl && (
            <div className='mt-4'>
              <span className='block text-xs text-gray-500 mb-1'>
                Vista previa:
              </span>
              <img
                src={previewUrl}
                alt='Preview cédula'
                className='border rounded shadow max-w-xs max-h-60 object-contain bg-white'
              />
            </div>
          )}
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            type='button'
            onClick={() => router.back()}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading}
            className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "Guardando..." : "Guardar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
