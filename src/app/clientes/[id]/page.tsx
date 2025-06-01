"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import { use } from "react";

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, "id" | "createdAt">>({
    nombre: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const cliente = await clientesDB.obtener(id);
        if (cliente) {
          setFormData({
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
          });
        } else {
          setError("Cliente no encontrado");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el cliente"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarCliente();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await clientesDB.actualizar(id, formData);
      router.push("/clientes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el cliente"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-center text-indigo-700 mb-2'>
          Editar Cliente
        </h1>
        <p className='text-center text-gray-600 text-base'>
          Actualiza la información del cliente
        </p>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-md'>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className='space-y-7 bg-white p-8 rounded-2xl shadow-lg border border-gray-100'
      >
        <div>
          <label
            htmlFor='nombre'
            className='block text-base font-semibold text-gray-700 mb-1'
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
            className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-2 border'
          />
        </div>

        <div>
          <label
            htmlFor='telefono'
            className='block text-base font-semibold text-gray-700 mb-1'
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
            className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-2 border'
          />
        </div>

        <div>
          <label
            htmlFor='direccion'
            className='block text-base font-semibold text-gray-700 mb-1'
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
            className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-2 border'
          />
        </div>

        <div className='flex justify-end space-x-4 mt-8'>
          <button
            type='button'
            onClick={() => router.back()}
            className='px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base transition'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={saving}
            className='px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
