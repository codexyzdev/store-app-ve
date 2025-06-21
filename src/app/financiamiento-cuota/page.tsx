"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FinanciamientoCard } from "@/components/financiamiento/FinanciamientoCard";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useFinanciamientosRedux } from "@/hooks/useFinanciamientosRedux";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import {
  getClienteInfo,
  getProductoNombre,
  calcularFinanciamiento,
  FinanciamientoCalculado,
  ClienteInfo,
} from "@/utils/financiamientoHelpers";
import { FinanciamientoCuota } from "@/lib/firebase/database";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useFinanciamientosInfiniteScroll } from "@/hooks/useFinanciamientosInfiniteScroll";
import {
  BusquedaFinanciamientos,
  FiltrosRapidos,
} from "@/components/financiamiento/BusquedaFinanciamientos";
import { CargandoMasSkeleton } from "@/components/inventario/ProductosSkeleton";

interface FinanciamientoConDatos {
  financiamiento: FinanciamientoCuota;
  clienteInfo: ClienteInfo;
  productoNombre: string;
  calculado: FinanciamientoCalculado;
}

interface GrupoFinanciamientosPorCliente {
  clienteId: string;
  clienteInfo: ClienteInfo;
  financiamientos: Array<{
    financiamiento: FinanciamientoCuota;
    productoNombre: string;
    calculado: FinanciamientoCalculado;
  }>;
  financiamientoPrincipal: {
    financiamiento: FinanciamientoCuota;
    productoNombre: string;
    calculado: FinanciamientoCalculado;
  };
}

export default function FinanciamientoCuotaPage() {
  // Estados locales para filtros
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [estadoLocal, setEstadoLocal] = useState("todos");
  const [tipoVentaLocal, setTipoVentaLocal] = useState("cuotas");

  // Hooks Redux
  const {
    loading: financiamientosLoading,
    error: financiamientosError,
    financiamientos,
    cobros,
  } = useFinanciamientosRedux();

  const { clientes, loading: clientesLoading } = useClientesRedux();
  const { productos, loading: productosLoading } = useProductosRedux();

  // Hook de scroll infinito optimizado
  const {
    items: gruposOptimizados,
    isLoading: cargandoMas,
    hasMore: hayMas,
    error: errorScroll,
    loadMore: cargarMas,
    totalCount: totalElementos,
    estadisticas,
  } = useFinanciamientosInfiniteScroll(
    financiamientos,
    clientes,
    productos,
    cobros,
    {
      pageSize: 25,
      busqueda: busquedaLocal,
      estado: estadoLocal,
      tipoVenta: tipoVentaLocal,
      agruparPorCliente: true,
    }
  );

  // Hook para detectar scroll
  const { sentinelRef } = useInfiniteScroll(cargarMas, {
    hasMore: hayMas,
    isLoading: cargandoMas,
    threshold: 0.1,
    rootMargin: "200px 0px",
  });

  // Estado de carga combinado
  const cargandoInicial =
    financiamientosLoading || clientesLoading || productosLoading;
  const errorGeneral = financiamientosError || errorScroll;

  // Manejo de errores
  if (errorGeneral) {
    return (
      <ErrorMessage
        message={errorGeneral}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Loading state inicial
  if (cargandoInicial && financiamientos.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>
                Cargando financiamientos...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent flex items-center gap-3'>
              <span className='text-2xl'>💰</span>
              Financiamientos a Cuotas
            </h1>
            <p className='mt-2 text-lg text-gray-600'>
              {totalElementos > 0 ? (
                <>
                  Mostrando {gruposOptimizados.length} de {totalElementos}{" "}
                  financiamientos
                  {busquedaLocal && (
                    <span className='ml-1'>
                      para "<span className='font-medium'>{busquedaLocal}</span>
                      "
                    </span>
                  )}
                </>
              ) : (
                "Gestiona los financiamientos de tus clientes"
              )}
            </p>
          </div>

          <div className='mt-4 sm:mt-0'>
            {/* Botón nuevo financiamiento */}
            <Link
              href='/financiamiento-cuota/nuevo'
              className='inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
            >
              <span className='text-xl'>💰</span>
              <span className='hidden sm:inline'>Nuevo Financiamiento</span>
            </Link>
          </div>
        </div>

        {/* Filtros rápidos */}
        <FiltrosRapidos
          onEstadoChange={setEstadoLocal}
          estadoActivo={estadoLocal}
          contadores={estadisticas}
        />

        {/* Búsqueda */}
        <BusquedaFinanciamientos
          onBusquedaChange={setBusquedaLocal}
          busqueda={busquedaLocal}
          totalResultados={totalElementos}
          isLoading={cargandoMas}
        />

        {/* Contenido principal */}
        {gruposOptimizados.length === 0 && !cargandoMas ? (
          // Estado vacío
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-4xl sm:text-6xl mb-4 block'>💰</span>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                {busquedaLocal || estadoLocal !== "todos"
                  ? "No se encontraron financiamientos"
                  : "No hay financiamientos registrados"}
              </h3>
              <p className='text-sm sm:text-base text-gray-600 mb-6'>
                {busquedaLocal || estadoLocal !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer financiamiento en el sistema"}
              </p>
              {!busquedaLocal && estadoLocal === "todos" && (
                <Link
                  href='/financiamiento-cuota/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  <span>💰</span>
                  Crear Primer Financiamiento
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Lista de financiamientos en tarjetas */}
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'>
              {gruposOptimizados.map((grupo: any, index: number) => (
                <div key={grupo.clienteId}>
                  <FinanciamientoCard
                    financiamiento={
                      grupo.financiamientoPrincipal.financiamiento
                    }
                    clienteInfo={grupo.clienteInfo}
                    productoNombre={
                      grupo.financiamientoPrincipal.productoNombre
                    }
                    calculado={grupo.financiamientoPrincipal.calculado}
                    index={index}
                    todosLosFinanciamientos={grupo.financiamientos}
                  />
                </div>
              ))}
            </div>

            {/* Indicador de carga infinita */}
            {hayMas && (
              <div ref={sentinelRef} className='mt-8'>
                {cargandoMas && <CargandoMasSkeleton />}
              </div>
            )}

            {/* Mensaje de final */}
            {!hayMas && gruposOptimizados.length > 0 && (
              <div className='text-center py-8'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm'>
                  <span>🎉</span>
                  Has visto todos los financiamientos ({totalElementos} en
                  total)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
