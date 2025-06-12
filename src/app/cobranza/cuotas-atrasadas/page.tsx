"use client";

import React from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {
  useCuotasAtrasadas,
  FinanciamientoConDatos,
} from "@/hooks/useCuotasAtrasadas";
import { useFiltrosCuotas } from "@/hooks/useFiltrosCuotas";
import { EstadisticasCobranza } from "@/components/cuotas/EstadisticasCobranza";
import { FiltrosYBusqueda } from "@/components/cuotas/FiltrosYBusqueda";
import { TarjetaCuotaAtrasada } from "@/components/cuotas/TarjetaCuotaAtrasada";
import { TablaCompacta } from "@/components/cuotas/TablaCompacta";

export default function CuotasAtrasadasPage() {
  const { financiamientosConDatos, estadisticas, loading } =
    useCuotasAtrasadas();

  const {
    busqueda,
    setBusqueda,
    filtroSeveridad,
    setFiltroSeveridad,
    vistaCompacta,
    setVistaCompacta,
    financiamientosOrdenados,
  } = useFiltrosCuotas(financiamientosConDatos);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>
            Cargando cuotas atrasadas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center lg:text-left'>
          <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
            📊 Cuotas Atrasadas
          </h1>
          <p className='text-gray-600'>
            Gestión y seguimiento de pagos pendientes
          </p>
        </div>

        {/* Estadísticas Globales */}
        <EstadisticasCobranza estadisticas={estadisticas} />

        {/* Controles */}
        <FiltrosYBusqueda
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroSeveridad={filtroSeveridad}
          setFiltroSeveridad={setFiltroSeveridad}
          vistaCompacta={vistaCompacta}
          setVistaCompacta={setVistaCompacta}
        />

        {/* Resultados */}
        {financiamientosOrdenados.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>✅</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              ¡Excelente! No hay cuotas atrasadas
            </h3>
            <p className='text-gray-600'>
              Todos los financiamientos están al día con sus pagos.
            </p>
          </div>
        ) : vistaCompacta ? (
          <TablaCompacta financiamientos={financiamientosOrdenados} />
        ) : (
          /* Vista Detallada - Tarjetas */
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {financiamientosOrdenados.map(
              (item: FinanciamientoConDatos, index: number) => (
                // @ts-ignore - React key prop is handled correctly
                <TarjetaCuotaAtrasada
                  key={`tarjeta-${item.id}-${index}`}
                  item={item}
                  index={index}
                />
              )
            )}
          </div>
        )}

        {/* Información adicional */}
        {financiamientosOrdenados.length > 0 && (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2'>
              <CalendarDaysIcon className='w-5 h-5' />
              <span>Resumen de Cobranza</span>
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Casos críticos:</span>
                <span className='ml-2 font-semibold text-red-600'>
                  {estadisticas.casosCriticos}
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Casos alto riesgo:</span>
                <span className='ml-2 font-semibold text-orange-600'>
                  {estadisticas.casosAltoRiesgo}
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Promedio por cuota:</span>
                <span className='ml-2 font-semibold'>
                  ${estadisticas.promedioPorCuota.toFixed(2)}
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Promedio de atraso:</span>
                <span className='ml-2 font-semibold'>
                  {estadisticas.promedioAtraso} cuotas
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
