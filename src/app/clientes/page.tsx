"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { Cliente } from "@/lib/firebase/database";

import { FiltrosAvanzados } from "@/components/clientes/FiltrosAvanzados";

export default function ClientesPage() {
  const [vistaCards, setVistaCards] = useState(true);
  const router = useRouter();

  // Hook Redux como única fuente de verdad
  const { clientesFiltrados, loading, error, clientes, getIniciales } =
    useClientesRedux();

  const formatFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Usar datos filtrados si existen filtros activos, sino usar todos los clientes
  const clientesParaMostrar =
    clientesFiltrados.length > 0 ? clientesFiltrados : clientes;

  // Loading state
  if (loading && clientes.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>Cargando clientes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                  👥 Gestión de Clientes
                </h1>
              </div>
              <p className='text-gray-600 text-lg'>
                Sistema completo de gestión de clientes y financiamientos
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3'>
              <Link
                href='/clientes/nuevo'
                className='inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
              >
                <span className='text-xl'>👤</span>
                Nuevo Cliente
              </Link>
            </div>
          </div>
        </div>

        {/* Errores */}
        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700'>
            <div className='flex items-center gap-2'>
              <span className='text-red-500'>⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Filtros Avanzados */}
        <FiltrosAvanzados />

        {/* Controles de vista */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Resultados: {clientesParaMostrar.length} clientes
          </h2>

          <div className='flex gap-2'>
            <button
              onClick={() => setVistaCards(true)}
              className={`p-3 rounded-lg transition-colors ${
                vistaCards
                  ? "bg-sky-100 text-sky-600 border border-sky-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title='Vista de tarjetas'
            >
              <span className='text-lg'>📋</span>
            </button>
            <button
              onClick={() => setVistaCards(false)}
              className={`p-3 rounded-lg transition-colors ${
                !vistaCards
                  ? "bg-sky-100 text-sky-600 border border-sky-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title='Vista de lista'
            >
              <span className='text-lg'>📝</span>
            </button>
          </div>
        </div>

        {/* Lista de clientes */}
        {clientesParaMostrar.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-6xl mb-4 block'>😔</span>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                No se encontraron clientes
              </h3>
              <p className='text-gray-600 mb-6'>
                Intenta ajustar los filtros o agregar nuevos clientes
              </p>
              <Link
                href='/clientes/nuevo'
                className='inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-600 transition-colors'
              >
                <span>👤</span>
                Crear Primer Cliente
              </Link>
            </div>
          </div>
        ) : vistaCards ? (
          /* Vista de tarjetas */
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {clientesParaMostrar.map((cliente: Cliente) => (
              <div
                key={cliente.id}
                onClick={() =>
                  router.push(`/financiamiento-cuota/${cliente.id}`)
                }
                className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 group cursor-pointer'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white font-bold'>
                      {getIniciales(cliente.nombre)}
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 text-lg'>
                        {cliente.nombre}
                      </h3>
                      <p className='text-gray-500 text-sm'>
                        #{cliente.numeroControl}
                      </p>
                    </div>
                  </div>
                  <div className='text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity'>
                    💰
                  </div>
                </div>

                <div className='space-y-2 mb-4'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <span>📞</span>
                    <span>{cliente.telefono || "No especificado"}</span>
                  </div>
                  {cliente.cedula && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <span>🆔</span>
                      <span>{cliente.cedula}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <span>📍</span>
                      <span className='truncate'>{cliente.direccion}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <span>📅</span>
                    <span>{formatFecha(cliente.createdAt)}</span>
                  </div>
                </div>

                <div className='pt-4 border-t border-gray-100'>
                  <div className='flex items-center justify-center text-sm text-gray-500 group-hover:text-sky-600 transition-colors'>
                    <span>👆 Click para ver financiamientos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista de lista */
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='text-left py-4 px-6 font-semibold text-gray-900'>
                      Cliente
                    </th>
                    <th className='text-left py-4 px-6 font-semibold text-gray-900'>
                      Contacto
                    </th>
                    <th className='text-left py-4 px-6 font-semibold text-gray-900'>
                      Información
                    </th>
                    <th className='text-left py-4 px-6 font-semibold text-gray-900'>
                      Registro
                    </th>
                    <th className='text-center py-4 px-6 font-semibold text-gray-900'>
                      Financiamientos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientesParaMostrar.map(
                    (cliente: Cliente, index: number) => (
                      <tr
                        key={cliente.id}
                        onClick={() =>
                          router.push(`/financiamiento-cuota/${cliente.id}`)
                        }
                        className={`border-b border-gray-100 hover:bg-sky-50 transition-colors cursor-pointer ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        }`}
                      >
                        <td className='py-4 px-6'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm'>
                              {getIniciales(cliente.nombre)}
                            </div>
                            <div>
                              <div className='font-semibold text-gray-900'>
                                {cliente.nombre}
                              </div>
                              <div className='text-sm text-gray-500'>
                                #{cliente.numeroControl}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          <div className='space-y-1'>
                            <div className='text-sm text-gray-900'>
                              📞 {cliente.telefono}
                            </div>
                            {cliente.cedula && (
                              <div className='text-sm text-gray-600'>
                                🆔 {cliente.cedula}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          {cliente.direccion ? (
                            <div className='text-sm text-gray-900 max-w-xs truncate'>
                              📍 {cliente.direccion}
                            </div>
                          ) : (
                            <span className='text-sm text-gray-400'>
                              Sin dirección
                            </span>
                          )}
                        </td>
                        <td className='py-4 px-6'>
                          <div className='text-sm text-gray-600'>
                            {formatFecha(cliente.createdAt)}
                          </div>
                        </td>
                        <td className='py-4 px-6'>
                          <div className='flex justify-center'>
                            <div className='text-sky-600 text-sm font-medium'>
                              💰 Ver financiamientos
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
