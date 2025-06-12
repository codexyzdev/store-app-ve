"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setEstadoFinanciero,
  setNivelRiesgo,
  setSoloConAtrasos,
  setSoloActivos,
  clearFilters,
} from "@/store/slices/clientesSlice";

export function FiltrosFinancieros() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.clientes.filters);

  const estadosFinancieros = [
    { value: "todos", label: "Todos los Estados", color: "bg-gray-100" },
    {
      value: "excelente",
      label: "Excelente",
      color: "bg-green-100 text-green-800",
    },
    { value: "bueno", label: "Bueno", color: "bg-blue-100 text-blue-800" },
    {
      value: "regular",
      label: "Regular",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "malo", label: "Malo", color: "bg-orange-100 text-orange-800" },
    { value: "critico", label: "Crítico", color: "bg-red-100 text-red-800" },
    { value: "nuevo", label: "Nuevos", color: "bg-purple-100 text-purple-800" },
  ];

  const nivelesRiesgo = [
    { value: "todos", label: "Todos los Riesgos", color: "bg-gray-100" },
    {
      value: "bajo",
      label: "Riesgo Bajo",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "medio",
      label: "Riesgo Medio",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "alto",
      label: "Riesgo Alto",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "critico",
      label: "Riesgo Crítico",
      color: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Filtros principales */}
        <div className='flex-1 space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <span>🎯</span>
            Filtros Financieros
          </h3>

          {/* Estado Financiero */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Estado Financiero
            </label>
            <div className='flex flex-wrap gap-2'>
              {estadosFinancieros.map((estado) => (
                <button
                  key={estado.value}
                  onClick={() =>
                    dispatch(setEstadoFinanciero(estado.value as any))
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.estadoFinanciero === estado.value
                      ? estado.color + " ring-2 ring-offset-1 ring-gray-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {estado.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de Riesgo */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Nivel de Riesgo
            </label>
            <div className='flex flex-wrap gap-2'>
              {nivelesRiesgo.map((riesgo) => (
                <button
                  key={riesgo.value}
                  onClick={() => dispatch(setNivelRiesgo(riesgo.value as any))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.nivelRiesgo === riesgo.value
                      ? riesgo.color + " ring-2 ring-offset-1 ring-gray-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {riesgo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros de toggle */}
        <div className='lg:w-80 space-y-4'>
          <h4 className='text-sm font-medium text-gray-700'>Filtros Rápidos</h4>

          {/* Solo con atrasos */}
          <div className='flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>⚠️</span>
              <div>
                <div className='font-medium text-red-900'>Solo con Atrasos</div>
                <div className='text-sm text-red-700'>
                  Clientes que requieren seguimiento
                </div>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={filters.soloConAtrasos}
                onChange={(e) => dispatch(setSoloConAtrasos(e.target.checked))}
                className='sr-only peer'
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Solo activos */}
          <div className='flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>💼</span>
              <div>
                <div className='font-medium text-green-900'>Solo Activos</div>
                <div className='text-sm text-green-700'>
                  Con financiamientos en curso
                </div>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={filters.soloActivos}
                onChange={(e) => dispatch(setSoloActivos(e.target.checked))}
                className='sr-only peer'
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Limpiar filtros */}
          <button
            onClick={() => dispatch(clearFilters())}
            className='w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2'
          >
            <span>🔄</span>
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
