"use client";

import { useClientesRedux } from "@/hooks/useClientesRedux";

export function EstadisticasClientes() {
  const { estadisticas, clientesFiltrados, filters, loading } =
    useClientesRedux();

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='bg-white rounded-2xl p-6 shadow-sm border animate-pulse'
          >
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gray-200 rounded-xl'></div>
              <div>
                <div className='h-6 bg-gray-200 rounded w-16 mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-20'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatFecha = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const porcentaje = (valor: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {/* Total de Clientes */}
      <div className='bg-white rounded-2xl p-6 shadow-sm border border-sky-100'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-gradient-to-br from-slate-700 to-sky-500 rounded-xl flex items-center justify-center'>
            <span className='text-xl text-white'>👥</span>
          </div>
          <div>
            <p className='text-2xl font-bold text-sky-600'>
              {filters.busqueda ? clientesFiltrados.length : estadisticas.total}
            </p>
            <p className='text-sm text-gray-600'>
              {filters.busqueda ? "Filtrados" : "Total Clientes"}
            </p>
            {filters.busqueda && (
              <p className='text-xs text-gray-500'>
                de {estadisticas.total} total
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clientes con Teléfono */}
      <div className='bg-white rounded-2xl p-6 shadow-sm border border-green-100'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
            <span className='text-xl text-white'>📞</span>
          </div>
          <div>
            <div className='flex items-baseline gap-1'>
              <p className='text-2xl font-bold text-green-600'>
                {estadisticas.conTelefono}
              </p>
              <p className='text-sm text-green-500'>
                ({porcentaje(estadisticas.conTelefono, estadisticas.total)}%)
              </p>
            </div>
            <p className='text-sm text-gray-600'>Con Teléfono</p>
          </div>
        </div>
      </div>

      {/* Clientes con Cédula */}
      <div className='bg-white rounded-2xl p-6 shadow-sm border border-purple-100'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
            <span className='text-xl text-white'>🆔</span>
          </div>
          <div>
            <div className='flex items-baseline gap-1'>
              <p className='text-2xl font-bold text-purple-600'>
                {estadisticas.conCedula}
              </p>
              <p className='text-sm text-purple-500'>
                ({porcentaje(estadisticas.conCedula, estadisticas.total)}%)
              </p>
            </div>
            <p className='text-sm text-gray-600'>Con Cédula</p>
          </div>
        </div>
      </div>

      {/* Último Registro */}
      <div className='bg-white rounded-2xl p-6 shadow-sm border border-orange-100'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center'>
            <span className='text-xl text-white'>📅</span>
          </div>
          <div>
            <p className='text-lg font-bold text-orange-600'>
              {formatFecha(estadisticas.ultimoRegistro)}
            </p>
            <p className='text-sm text-gray-600'>Último Registro</p>
          </div>
        </div>
      </div>
    </div>
  );
}
