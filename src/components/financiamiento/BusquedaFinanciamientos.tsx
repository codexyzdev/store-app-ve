import React, { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useInfiniteScroll";

interface BusquedaFinanciamientosProps {
  onBusquedaChange: (termino: string) => void;
  busqueda: string;
  totalResultados?: number;
  isLoading?: boolean;
}

export const BusquedaFinanciamientos: React.FC<
  BusquedaFinanciamientosProps
> = ({
  onBusquedaChange,
  busqueda,
  totalResultados = 0,
  isLoading = false,
}) => {
  const [localBusqueda, setLocalBusqueda] = useState(busqueda);

  // Debounce para la búsqueda
  const debouncedBusqueda = useDebounce(localBusqueda, 300);

  // Efecto para sincronizar búsqueda debounced
  React.useEffect(() => {
    onBusquedaChange(debouncedBusqueda);
  }, [debouncedBusqueda, onBusquedaChange]);

  const handleBusquedaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalBusqueda(e.target.value);
    },
    []
  );

  const handleClearBusqueda = useCallback(() => {
    setLocalBusqueda("");
  }, []);

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-6'>
      {/* Búsqueda principal */}
      <div className='p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Barra de búsqueda */}
          <div className='flex-1 relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              {isLoading ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500' />
              ) : (
                <span className='text-gray-400 text-lg'>🔍</span>
              )}
            </div>
            <input
              type='text'
              placeholder='Buscar por cliente, producto o número de control...'
              value={localBusqueda}
              onChange={handleBusquedaChange}
              className='w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base'
            />
            {localBusqueda && (
              <button
                onClick={handleClearBusqueda}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
              >
                <span className='text-lg'>✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Contador de resultados */}
        {localBusqueda && (
          <div className='mt-3 flex items-center justify-between text-sm text-gray-600'>
            <span>
              {isLoading ? (
                "Buscando..."
              ) : (
                <>
                  <span className='font-medium text-blue-600'>
                    {totalResultados}
                  </span>{" "}
                  financiamiento{totalResultados !== 1 ? "s" : ""} encontrado
                  {totalResultados !== 1 ? "s" : ""}
                  {localBusqueda && (
                    <>
                      {" "}
                      para "<span className='font-medium'>{localBusqueda}</span>
                      "
                    </>
                  )}
                </>
              )}
            </span>
            {localBusqueda !== debouncedBusqueda && (
              <span className='flex items-center gap-1 text-yellow-600'>
                <div className='animate-pulse w-2 h-2 bg-yellow-500 rounded-full' />
                Escribiendo...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de filtros rápidos para casos específicos
interface FiltrosRapidosProps {
  onEstadoChange: (estado: string) => void;
  estadoActivo: string;
  contadores: {
    todos: number;
    activos: number;
    atrasados: number;
    completados: number;
  };
}

export const FiltrosRapidos: React.FC<FiltrosRapidosProps> = ({
  onEstadoChange,
  estadoActivo,
  contadores,
}) => {
  const filtros = [
    { key: "todos", label: "Todos", icon: "📊", count: contadores.todos },
    { key: "activo", label: "Activos", icon: "✅", count: contadores.activos },
    {
      key: "atrasado",
      label: "Atrasados",
      icon: "⚠️",
      count: contadores.atrasados,
    },
    {
      key: "completado",
      label: "Completados",
      icon: "🎉",
      count: contadores.completados,
    },
  ];

  return (
    <div className='flex flex-wrap gap-2 mb-6'>
      {filtros.map((filtro) => (
        <button
          key={filtro.key}
          onClick={() => onEstadoChange(filtro.key)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            estadoActivo === filtro.key
              ? "bg-blue-500 text-white border-blue-500 shadow-lg"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }`}
        >
          <span>{filtro.icon}</span>
          <span className='font-medium'>{filtro.label}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              estadoActivo === filtro.key
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {filtro.count}
          </span>
        </button>
      ))}
    </div>
  );
};
