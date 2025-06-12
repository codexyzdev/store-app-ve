import React, { ChangeEvent } from "react";

interface FiltrosYBusquedaProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
  filtroSeveridad: "todos" | "baja" | "media" | "alta" | "critica";
  setFiltroSeveridad: (
    value: "todos" | "baja" | "media" | "alta" | "critica"
  ) => void;
  vistaCompacta: boolean;
  setVistaCompacta: (value: boolean) => void;
}

export function FiltrosYBusqueda({
  busqueda,
  setBusqueda,
  filtroSeveridad,
  setFiltroSeveridad,
  vistaCompacta,
  setVistaCompacta,
}: FiltrosYBusquedaProps) {
  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
      <div className='flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between'>
        {/* Búsqueda */}
        <div className='relative flex-1 max-w-md'>
          <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
            🔍
          </span>
          <input
            type='text'
            placeholder='Buscar por cliente, cédula, teléfono o producto...'
            value={busqueda}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBusqueda(e.target.value)
            }
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        {/* Filtros */}
        <div className='flex flex-wrap gap-3'>
          <select
            value={filtroSeveridad}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFiltroSeveridad(e.target.value as any)
            }
            className='px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
          >
            <option value='todos'>Todas las severidades</option>
            <option value='critica'>🚨 Crítico</option>
            <option value='alta'>⚠️ Alto</option>
            <option value='media'>⚡ Medio</option>
            <option value='baja'>📋 Bajo</option>
          </select>

          <button
            onClick={() => setVistaCompacta(!vistaCompacta)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              vistaCompacta
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {vistaCompacta ? "📋 Vista Normal" : "📊 Vista Compacta"}
          </button>
        </div>
      </div>
    </div>
  );
}
