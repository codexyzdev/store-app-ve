"use client";

import { useState, useEffect } from "react";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [vistaCards, setVistaCards] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = clientesDB.suscribir((clientes) => {
      setClientes(clientes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono.includes(busqueda) ||
      cliente.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (cliente.cedula && cliente.cedula === busqueda)
  );

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
    try {
      await clientesDB.eliminar(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el cliente"
      );
    }
  };

  const formatFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
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
        {/* Header mejorado */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent mb-2'>
                Gestión de Clientes
              </h1>
              <p className='text-gray-600 text-lg'>
                Administra tu cartera de clientes de forma eficiente
              </p>
            </div>

            <Link
              href='/clientes/nuevo'
              className='inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
            >
              <span className='text-xl'>👤</span>
              Nuevo Cliente
            </Link>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-sky-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-slate-700 to-sky-500 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>👥</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-sky-600'>
                    {clientes.length}
                  </p>
                  <p className='text-sm text-gray-600'>Total Clientes</p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-sm border border-green-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>✅</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-green-600'>
                    {clientesFiltrados.length}
                  </p>
                  <p className='text-sm text-gray-600'>Resultados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700'>
            <div className='flex items-center gap-2'>
              <span className='text-red-500'>⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Filtros y controles */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
            <div className='flex-1 w-full lg:max-w-md'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <span className='text-gray-400 text-lg'>🔍</span>
                </div>
                <input
                  type='text'
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder='Buscar por nombre, teléfono, dirección o cédula...'
                  className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors'
                />
              </div>
            </div>

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
        </div>

        {/* Lista de clientes */}
        {clientesFiltrados.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-6xl mb-4 block'>😔</span>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                {busqueda
                  ? "No se encontraron clientes"
                  : "No hay clientes registrados"}
              </h3>
              <p className='text-gray-600 mb-6'>
                {busqueda
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando tu primer cliente al sistema"}
              </p>
              {!busqueda && (
                <Link
                  href='/clientes/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-200'
                >
                  <span className='text-lg'>👤</span>
                  Crear Primer Cliente
                </Link>
              )}
            </div>
          </div>
        ) : vistaCards ? (
          <div
            className={
              vistaCards
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {clientesFiltrados.map((cliente, index) =>
              vistaCards ? (
                // Vista de tarjetas
                <div
                  key={cliente.id}
                  className='bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden group hover:-translate-y-1 transition-all duration-300'
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationName: "fadeInUp",
                    animationDuration: "0.6s",
                    animationTimingFunction: "ease-out",
                    animationFillMode: "forwards",
                  }}
                >
                  <div className='p-6'>
                    {/* Header del cliente */}
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='w-14 h-14 bg-gradient-to-br from-slate-700 to-sky-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                        {getInitials(cliente.nombre)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-lg text-gray-900 truncate'>
                          {cliente.nombre}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {cliente.telefono}
                        </p>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className='space-y-3 mb-6'>
                      <div className='flex items-start gap-2'>
                        <span className='text-gray-400 mt-1'>📍</span>
                        <p className='text-sm text-gray-600 leading-relaxed line-clamp-2'>
                          {cliente.direccion}
                        </p>
                      </div>
                      {cliente.cedula && (
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-400'>🆔</span>
                          <p className='text-sm text-gray-600'>
                            {cliente.cedula}
                          </p>
                        </div>
                      )}
                      {cliente.createdAt && (
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-400'>📅</span>
                          <p className='text-sm text-gray-600'>
                            Cliente desde {formatFecha(cliente.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className='flex gap-2'>
                      <Link
                        href={`/prestamos/${cliente.id}`}
                        className='flex-1 bg-gradient-to-r from-slate-700 to-sky-500 text-white text-center py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 text-sm'
                      >
                        Ver Préstamos
                      </Link>
                      <button
                        onClick={() => router.push(`/clientes/${cliente.id}`)}
                        className='p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
                        title='Editar'
                      >
                        <span className='text-lg'>✏️</span>
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente.id)}
                        className='p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors'
                        title='Eliminar'
                      >
                        <span className='text-lg'>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Vista de lista
                <div
                  key={cliente.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-4 group transition-all duration-200'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-slate-700 to-sky-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg'>
                      {getInitials(cliente.nombre)}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-semibold text-gray-900 truncate'>
                          {cliente.nombre}
                        </h3>
                        {cliente.cedula && (
                          <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                            {cliente.cedula}
                          </span>
                        )}
                      </div>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600'>
                        <span>📞 {cliente.telefono}</span>
                        <span className='hidden sm:inline'>•</span>
                        <span className='truncate'>📍 {cliente.direccion}</span>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Link
                        href={`/prestamos/${cliente.id}`}
                        className='px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors text-sm font-medium'
                      >
                        Préstamos
                      </Link>
                      <button
                        onClick={() => router.push(`/clientes/${cliente.id}`)}
                        className='p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                        title='Editar'
                      >
                        <span>✏️</span>
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente.id)}
                        className='p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors'
                        title='Eliminar'
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-6xl mb-4 block'>😔</span>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                {busqueda
                  ? "No se encontraron clientes"
                  : "No hay clientes registrados"}
              </h3>
              <p className='text-gray-600 mb-6'>
                {busqueda
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando tu primer cliente al sistema"}
              </p>
              {!busqueda && (
                <Link
                  href='/clientes/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  <span>👤</span>
                  Agregar Primer Cliente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
        }}
      />
    </div>
  );
}
