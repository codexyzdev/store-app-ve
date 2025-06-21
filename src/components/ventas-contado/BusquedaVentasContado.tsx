import React, { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useInfiniteScroll";

interface BusquedaVentasContadoProps {
  onBusquedaChange: (termino: string) => void;
  busqueda: string;
  totalResultados?: number;
  isLoading?: boolean;
}

export const BusquedaVentasContado = ({
  onBusquedaChange,
  busqueda,
  totalResultados = 0,
  isLoading = false,
}: BusquedaVentasContadoProps) => {
  const [inputValue, setInputValue] = useState(busqueda);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onBusquedaChange(value);
    },
    [onBusquedaChange]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onBusquedaChange("");
  }, [onBusquedaChange]);

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center'>
          <span className='text-sky-600 text-lg'>🔍</span>
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Buscar Ventas</h3>
          <p className='text-sm text-gray-600'>
            Busca por cliente, producto o número de venta
          </p>
        </div>
      </div>

      <div className='space-y-4'>
        {/* Campo de búsqueda */}
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            {isLoading ? (
              <div className='animate-spin rounded-full h-5 w-5 border-2 border-sky-500 border-t-transparent'></div>
            ) : (
              <span className='text-gray-400 text-lg'>🔍</span>
            )}
          </div>

          <input
            type='text'
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Buscar por cliente, producto, cédula o N° de venta...'
            className='w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm'
          />

          {inputValue && (
            <button
              onClick={handleClear}
              className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
              aria-label='Limpiar búsqueda'
            >
              <span className='text-lg'>✕</span>
            </button>
          )}
        </div>

        {/* Indicador de resultados */}
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2'>
            {isLoading ? (
              <span className='text-sky-600 animate-pulse'>Buscando...</span>
            ) : inputValue.trim() ? (
              <span className='text-gray-600'>
                {totalResultados} resultado{totalResultados !== 1 ? "s" : ""}{" "}
                encontrado{totalResultados !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className='text-gray-500'>
                Ingresa un término para buscar
              </span>
            )}
          </div>

          {inputValue.trim() && (
            <span className='text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full'>
              Búsqueda: "
              {inputValue.length > 20
                ? inputValue.substring(0, 20) + "..."
                : inputValue}
              "
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface FiltrosVentasContadoProps {
  fechaInicio: string;
  fechaFin: string;
  soloConDescuento: boolean;
  montoMinimo: string;
  montoMaximo: string;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  onSoloConDescuentoChange: (solo: boolean) => void;
  onMontoMinimoChange: (monto: string) => void;
  onMontoMaximoChange: (monto: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  estadisticas?: {
    totalVentas: number;
    ventasConDescuento: number;
    montoTotal: number;
    montoDescuentos: number;
  };
}

export const FiltrosVentasContado = ({
  fechaInicio,
  fechaFin,
  soloConDescuento,
  montoMinimo,
  montoMaximo,
  onFechaInicioChange,
  onFechaFinChange,
  onSoloConDescuentoChange,
  onMontoMinimoChange,
  onMontoMaximoChange,
  isExpanded,
  onToggleExpanded,
  estadisticas,
}: FiltrosVentasContadoProps) => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div
        className='flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={onToggleExpanded}
      >
        <div className='flex items-center gap-4'>
          <div className='w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center'>
            <span className='text-amber-600 text-lg'>⚙️</span>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Filtros Avanzados
            </h3>
            <p className='text-sm text-gray-600'>
              Refina tu búsqueda con filtros específicos
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {estadisticas && (
            <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
              {estadisticas.totalVentas} ventas
            </span>
          )}
          <span
            className={`text-gray-400 transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className='px-4 sm:px-6 pb-6 border-t border-gray-100'>
          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Rango de fechas */}
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>
                Fecha Inicio
              </label>
              <input
                type='date'
                value={fechaInicio}
                onChange={(e) => onFechaInicioChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>
                Fecha Fin
              </label>
              <input
                type='date'
                value={fechaFin}
                onChange={(e) => onFechaFinChange(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm'
              />
            </div>

            {/* Checkbox para descuentos */}
            <div className='flex items-center space-x-3 mt-6'>
              <input
                type='checkbox'
                id='solo-descuentos'
                checked={soloConDescuento}
                onChange={(e) => onSoloConDescuentoChange(e.target.checked)}
                className='w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2'
              />
              <label
                htmlFor='solo-descuentos'
                className='text-sm font-medium text-gray-700 cursor-pointer'
              >
                Solo ventas con descuento
              </label>
            </div>

            {/* Rango de montos */}
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>
                Monto Mínimo ($)
              </label>
              <input
                type='number'
                value={montoMinimo}
                onChange={(e) => onMontoMinimoChange(e.target.value)}
                placeholder='0'
                min='0'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>
                Monto Máximo ($)
              </label>
              <input
                type='number'
                value={montoMaximo}
                onChange={(e) => onMontoMaximoChange(e.target.value)}
                placeholder='Sin límite'
                min='0'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm'
              />
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {estadisticas && (
            <div className='mt-6 pt-4 border-t border-gray-100'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>
                Estadísticas Actuales
              </h4>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-lg font-bold text-sky-600'>
                    {estadisticas.totalVentas}
                  </div>
                  <div className='text-xs text-gray-600'>Total Ventas</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-green-600'>
                    ${estadisticas.montoTotal.toLocaleString()}
                  </div>
                  <div className='text-xs text-gray-600'>Monto Total</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-amber-600'>
                    {estadisticas.ventasConDescuento}
                  </div>
                  <div className='text-xs text-gray-600'>Con Descuento</div>
                </div>
                <div className='text-center'>
                  <div className='text-lg font-bold text-red-600'>
                    ${estadisticas.montoDescuentos.toLocaleString()}
                  </div>
                  <div className='text-xs text-gray-600'>Descuentos</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
