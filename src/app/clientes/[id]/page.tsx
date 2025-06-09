"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import { use } from "react";
import Link from "next/link";

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
  const [success, setSuccess] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, "id" | "createdAt">>({
    nombre: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const clienteData = await clientesDB.obtener(id);
        if (clienteData) {
          setCliente(clienteData);
          setFormData({
            nombre: clienteData.nombre,
            telefono: clienteData.telefono,
            direccion: clienteData.direccion,
            cedula: clienteData.cedula,
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
      setSuccess(true);
      setTimeout(() => {
        router.push("/clientes");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el cliente"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>
                Cargando información del cliente...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center'>
        <div className='bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center'>
          <div className='mb-6'>
            <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse'>
              <span className='text-3xl text-white'>✅</span>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              ¡Cliente Actualizado!
            </h2>
            <p className='text-gray-600'>
              Los cambios han sido guardados exitosamente.
            </p>
          </div>

          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
            <div className='w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
            Regresando a la lista de clientes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <Link
              href='/clientes'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors'
            >
              <span className='text-xl'>←</span>
              <span className='font-medium'>Volver a Clientes</span>
            </Link>
          </div>

          {cliente && (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
              <div className='flex items-center gap-6'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg'>
                  {getInitials(cliente.nombre)}
                </div>
                <div className='flex-1'>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {cliente.nombre}
                  </h1>
                  <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
                    <span className='flex items-center gap-1'>
                      <span>📞</span> {cliente.telefono}
                    </span>
                    {cliente.cedula && (
                      <span className='flex items-center gap-1'>
                        <span>🆔</span> {cliente.cedula}
                      </span>
                    )}
                    {cliente.createdAt && (
                      <span className='flex items-center gap-1'>
                        <span>📅</span> Cliente desde{" "}
                        {formatFecha(cliente.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Formulario de edición */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
              {/* Header del formulario */}
              <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center'>
                    <span className='text-2xl text-white'>✏️</span>
                  </div>
                  <div className='text-white'>
                    <h2 className='text-xl font-bold mb-1'>Editar Cliente</h2>
                    <p className='text-blue-100'>
                      Actualiza la información del cliente
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido del formulario */}
              <div className='p-8'>
                {error && (
                  <div className='mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700'>
                    <div className='flex items-center gap-2'>
                      <span className='text-red-500'>⚠️</span>
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Nombre Completo <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      required
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                      placeholder='Ingresa el nombre completo'
                    />
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Cédula de Identidad
                      </label>
                      <input
                        type='text'
                        pattern='[0-9]{6,10}'
                        title='Solo números, mínimo 6 dígitos'
                        value={formData.cedula || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, cedula: e.target.value })
                        }
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
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
                        onChange={(e) =>
                          setFormData({ ...formData, telefono: e.target.value })
                        }
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                        placeholder='Ej: 04241234567'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Dirección <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none'
                      placeholder='Ingresa la dirección completa'
                    />
                  </div>

                  <div className='flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={() => router.push("/clientes")}
                      disabled={saving}
                      className='flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Cancelar
                    </button>
                    <button
                      type='submit'
                      disabled={saving}
                      className='flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                      {saving ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Panel lateral con información adicional */}
          <div className='space-y-6'>
            {/* Estadísticas del cliente */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <span>📊</span>
                Resumen Financiero
              </h3>

              <div className='space-y-4'>
                <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-green-700'>
                      Monto Total Prestado
                    </span>
                    <span className='text-green-600'>💰</span>
                  </div>
                  <p className='text-2xl font-bold text-green-700'>$2,500.00</p>
                  <p className='text-xs text-green-600 mt-1'>
                    En toda la historia
                  </p>
                </div>

                <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-blue-700'>
                      Monto Pendiente
                    </span>
                    <span className='text-blue-600'>⏳</span>
                  </div>
                  <p className='text-2xl font-bold text-blue-700'>$1,200.00</p>
                  <p className='text-xs text-blue-600 mt-1'>
                    Por cobrar actualmente
                  </p>
                </div>

                <div className='bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-amber-700'>
                      Cuotas Atrasadas
                    </span>
                    <span className='text-amber-600'>⚠️</span>
                  </div>
                  <p className='text-2xl font-bold text-amber-700'>$80.00</p>
                  <p className='text-xs text-amber-600 mt-1'>
                    Requiere seguimiento
                  </p>
                </div>
              </div>
            </div>

            {/* Historial de actividad */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <span>📋</span>
                Actividad Reciente
              </h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                    <span className='text-sm'>💰</span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      Pago realizado
                    </p>
                    <p className='text-xs text-gray-500'>Hace 2 días</p>
                  </div>
                  <span className='text-sm font-semibold text-green-600'>
                    +$150
                  </span>
                </div>

                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-sm'>📄</span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      Préstamo otorgado
                    </p>
                    <p className='text-xs text-gray-500'>Hace 1 semana</p>
                  </div>
                  <span className='text-sm font-semibold text-blue-600'>
                    $800
                  </span>
                </div>

                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                  <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                    <span className='text-sm'>👤</span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      Cliente registrado
                    </p>
                    <p className='text-xs text-gray-500'>
                      {cliente?.createdAt && formatFecha(cliente.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <span>⚡</span>
                Acciones Rápidas
              </h3>

              <div className='space-y-3'>
                <Link
                  href={`/prestamos/${id}`}
                  className='w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200'
                >
                  <span>💳</span>
                  Ver Préstamos
                </Link>

                <button className='w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200'>
                  <span>💰</span>
                  Nuevo Préstamo
                </button>

                <button className='w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200'>
                  <span>📊</span>
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
