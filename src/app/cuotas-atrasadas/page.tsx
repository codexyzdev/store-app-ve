"use client";

// React se omite debido a la transformación automática JSX
import React, { useState } from "react";

import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {
  setBusqueda,
  setFiltroSeveridad,
  setVistaCompacta,
} from "@/store/slices/cuotasAtrasadasSlice";
import { useCuotasAtrasadasRedux } from "@/hooks/useCuotasAtrasadasRedux";
import { useAppDispatch } from "@/store/hooks";
import { EstadisticasCobranza } from "@/components/cuotas/EstadisticasCobranza";
import { FiltrosYBusqueda } from "@/components/cuotas/FiltrosYBusqueda";
import { TarjetaCuotaAtrasada } from "@/components/cuotas/TarjetaCuotaAtrasada";
import { TablaCompacta } from "@/components/cuotas/TablaCompacta";
import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadasRedux";
import Modal from "@/components/Modal";
import CuotasMorosasPrint from "@/components/cuotas/CuotasMorosasPrint";

export default function CuotasAtrasadasPage() {
  const dispatch = useAppDispatch();
  const {
    loading,
    estadisticas,
    financiamientosOrdenados,
    filters: { busqueda, filtroSeveridad, vistaCompacta },
  } = useCuotasAtrasadasRedux();

  const [mostrarImpresion, setMostrarImpresion] = useState(false);

  const handleBusqueda = (value: string) => dispatch(setBusqueda(value));
  const handleFiltroSeveridad = (
    value: "todos" | "baja" | "media" | "alta" | "critica"
  ) => dispatch(setFiltroSeveridad(value));
  const handleVistaCompacta = (value: boolean) =>
    dispatch(setVistaCompacta(value));

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
          setBusqueda={handleBusqueda}
          filtroSeveridad={filtroSeveridad}
          setFiltroSeveridad={handleFiltroSeveridad}
          vistaCompacta={vistaCompacta}
          setVistaCompacta={handleVistaCompacta}
        />

        {/* Botón imprimir morosos */}
        {financiamientosOrdenados.length > 0 && (
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() => setMostrarImpresion(true)}
              className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
            >
              <span className='text-xl'>🖨️</span>
              Imprimir Morosos
            </button>
          </div>
        )}

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
                <div key={`tarjeta-${item.id}-${index}`}>
                  <TarjetaCuotaAtrasada item={item} index={index} />
                </div>
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

      {/* Modal de impresión */}
      <Modal
        isOpen={mostrarImpresion}
        onClose={() => setMostrarImpresion(false)}
        title='Imprimir Clientes Morosos'
      >
        <div className='print-container'>
          <div className='no-print mb-4 text-center'>
            <p className='text-gray-600 mb-3'>
              Haz clic en "Imprimir" o usa Ctrl+P para imprimir la lista de
              clientes morosos.
            </p>
            <div className='flex gap-2 justify-center'>
              <button
                onClick={() => window.print()}
                className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2'
              >
                <span>🖨️</span>
                Imprimir
              </button>
              <button
                onClick={() => setMostrarImpresion(false)}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
              >
                Cerrar
              </button>
            </div>
          </div>

          <CuotasMorosasPrint financiamientos={financiamientosOrdenados} />
        </div>
      </Modal>

      {/* Estilos para impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            .no-print { display: none !important; }
            .print-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .fixed.inset-0 > div:first-child { display: none !important; }
            .cuotas-morosas-print {
              position: static !important;
              transform: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 20px !important;
            }
          }`,
        }}
      />

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
