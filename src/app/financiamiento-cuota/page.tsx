"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FinanciamientoCard } from "@/components/financiamiento/FinanciamientoCard";
import { FinanciamientoListItem } from "@/components/financiamiento/FinanciamientoListItem";
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

interface FinanciamientoConDatos {
  financiamiento: FinanciamientoCuota;
  clienteInfo: ClienteInfo;
  productoNombre: string;
  calculado: FinanciamientoCalculado;
}

export default function FinanciamientoCuotaPage() {
  // Hooks Redux como única fuente de verdad
  const {
    financiamientosFiltrados,
    filters,

    loading: financiamientosLoading,
    error: financiamientosError,
    financiamientos,
    cobros,
    setBusqueda,
    setEstado,
    setTipoVenta,
    updateFiltersWithData,
    initialized,
  } = useFinanciamientosRedux();

  const { clientes, loading: clientesLoading } = useClientesRedux();
  const { productos, loading: productosLoading } = useProductosRedux();

  const [vistaCards, setVistaCards] = useState(true);

  // Estado de carga combinado
  const loading = financiamientosLoading || clientesLoading || productosLoading;
  const error = financiamientosError;

  // Actualizar filtros cuando cambien los datos
  useEffect(() => {
    if (clientes.length > 0 && productos.length > 0) {
      updateFiltersWithData(clientes, productos);
    }
  }, [clientes, productos, updateFiltersWithData]);

  // Establecer tipoVenta a "cuotas" al montar y limpiarlo al desmontar
  useEffect(() => {
    setTipoVenta("cuotas");
    return () => {
      setTipoVenta("todos");
    };
  }, [setTipoVenta]);

  // Usar financiamientos filtrados de Redux
  const financiamientosParaMostrar =
    initialized && financiamientosFiltrados.length >= 0
      ? financiamientosFiltrados
      : financiamientos;

  // Calcular datos para cada financiamiento
  const PAGE_SIZE = 25;

  const financiamientosConDatos: FinanciamientoConDatos[] =
    React.useMemo(() => {
      return financiamientosParaMostrar.map((financiamiento) => {
        const clienteInfo = getClienteInfo(financiamiento.clienteId, clientes);
        const productoNombre = getProductoNombre(
          financiamiento.productoId,
          productos
        );
        const calculado = calcularFinanciamiento(financiamiento, cobros);

        return {
          financiamiento,
          clienteInfo,
          productoNombre,
          calculado,
        };
      });
    }, [financiamientosParaMostrar, clientes, productos, cobros]);

  // Estado para control de items visibles
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadMore = React.useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, financiamientosConDatos.length)
    );
  }, [financiamientosConDatos.length]);

  const sentinelRef = useInfiniteScroll(loadMore);

  const itemsToRender = financiamientosConDatos.slice(0, visibleCount);

  // Manejo de errores
  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  // Loading state
  if (loading && financiamientos.length === 0) {
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
      <div className='w-full'>
        {/* Hero Header Section - Optimizado para móvil */}
        <div className='bg-white shadow-sm border-b border-gray-100'>
          <div className='max-w-7xl mx-auto px-4 py-4 sm:py-6'>
            <div className='flex flex-col gap-3 sm:gap-4'>
              {/* Título principal */}
              <div className='text-center'>
                <div className='flex items-center justify-center gap-2 sm:gap-3 mb-2'>
                  <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-sky-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg'>
                    <span className='text-lg sm:text-2xl text-white'>💰</span>
                  </div>
                  <h1 className='text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                    Financiamiento a Cuotas
                  </h1>
                </div>
                <p className='text-xs sm:text-sm lg:text-base text-gray-600 px-2'>
                  Administra y da seguimiento a todos los financiamientos
                  activos
                </p>
              </div>

              {/* Botón nuevo - Centrado en móvil */}
              <div className='flex justify-center'>
                <Link
                  href='/financiamiento-cuota/nuevo'
                  className='w-full sm:w-auto max-w-xs inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
                >
                  <span className='text-lg'>💰</span>
                  <span className='text-sm sm:text-base'>Nuevo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 py-4 sm:py-6'>
          {/* Filtros y controles - Optimizado para móvil */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6'>
            <div className='space-y-3 sm:space-y-4'>
              {/* Search Bar */}
              <div className='w-full'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <span className='text-gray-400 text-base sm:text-lg'>
                      🔍
                    </span>
                  </div>
                  <input
                    type='text'
                    value={filters.busqueda}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBusqueda(e.target.value)
                    }
                    placeholder='Buscar por Número de Control'
                    className='w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base'
                    aria-label='Buscar financiamientos por número de control exacto'
                    role='searchbox'
                    title='Ejemplos: F-000001, f-000001, 000001, 1'
                  />
                </div>

                {/* Ayuda de búsqueda - Optimizada para móvil */}
                <div className='mt-2 flex flex-col sm:flex-row gap-2 text-xs'>
                  <span className='bg-blue-50 px-2 py-1 rounded-md text-center sm:text-left'>
                    💡 Búsqueda exacta por Número de Control
                  </span>
                  <span className='bg-purple-50 px-2 py-1 rounded-md text-center sm:text-left'>
                    Ejemplos: F-000001, f-000001, 000001, 1
                  </span>
                </div>
              </div>

              {/* Filters Row - Stack en móvil */}
              <div className='flex flex-col sm:flex-row gap-3'>
                {/* Status Filter */}
                <div className='flex-1'>
                  <select
                    value={filters.estado}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setEstado(
                        e.target.value as "todos" | "activo" | "atrasado"
                      )
                    }
                    className='w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white'
                  >
                    <option value='todos'>📊 Todos los estados</option>
                    <option value='activo'>✅ Activos</option>
                    <option value='atrasado'>⚠️ Atrasados</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className='flex justify-center sm:justify-start'>
                  <div className='flex bg-gray-100 rounded-xl p-1'>
                    <button
                      onClick={() => setVistaCards(true)}
                      className={`p-2 sm:p-3 rounded-lg transition-colors ${
                        vistaCards
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title='Vista de tarjetas'
                      aria-pressed={vistaCards}
                      aria-label='Cambiar a vista de tarjetas'
                    >
                      <span className='text-base'>🔷</span>
                    </button>
                    <button
                      onClick={() => setVistaCards(false)}
                      className={`p-2 sm:p-3 rounded-lg transition-colors ${
                        !vistaCards
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title='Vista de lista'
                      aria-pressed={!vistaCards}
                      aria-label='Cambiar a vista de lista'
                    >
                      <span className='text-base'>📋</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de financiamientos */}
          {financiamientosConDatos.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center'>
              <div className='max-w-md mx-auto'>
                <span className='text-4xl sm:text-6xl mb-4 block'>💰</span>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                  {filters.busqueda || filters.estado !== "todos"
                    ? "No se encontraron financiamientos"
                    : "No hay financiamientos registrados"}
                </h3>
                <p className='text-sm sm:text-base text-gray-600 mb-6'>
                  {filters.busqueda || filters.estado !== "todos"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primer financiamiento en el sistema"}
                </p>
                {!filters.busqueda && filters.estado === "todos" && (
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
            <div
              className={
                vistaCards
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                  : "space-y-3 sm:space-y-4"
              }
            >
              {itemsToRender.map(
                (item: FinanciamientoConDatos, index: number) => {
                  return vistaCards ? (
                    <FinanciamientoCard
                      key={item.financiamiento.id}
                      financiamiento={item.financiamiento}
                      clienteInfo={item.clienteInfo}
                      productoNombre={item.productoNombre}
                      calculado={item.calculado}
                    />
                  ) : (
                    <FinanciamientoListItem
                      key={item.financiamiento.id}
                      financiamiento={item.financiamiento}
                      clienteInfo={item.clienteInfo}
                      productoNombre={item.productoNombre}
                      calculado={item.calculado}
                    />
                  );
                }
              )}
            </div>
          )}

          {/* Sentinel para cargar más */}
          {visibleCount < financiamientosConDatos.length && (
            <div ref={sentinelRef} className='h-10' />
          )}
        </div>
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
        `,
        }}
      />
    </div>
  );
}
