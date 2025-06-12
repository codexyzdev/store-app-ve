"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FinanciamientoStats } from "@/components/financiamiento/FinanciamientoStats";
import { FinanciamientoCard } from "@/components/financiamiento/FinanciamientoCard";
import { FinanciamientoListItem } from "@/components/financiamiento/FinanciamientoListItem";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useFinanciamientoData } from "@/hooks/useFinanciamientoData";
import {
  filtrarFinanciamientos,
  getClienteInfo,
  getProductoNombre,
  calcularFinanciamiento,
  FinanciamientoCalculado,
  ClienteInfo,
} from "@/utils/financiamientoHelpers";
import { FinanciamientoCuota } from "@/lib/firebase/database";

interface FinanciamientoConDatos {
  financiamiento: FinanciamientoCuota;
  clienteInfo: ClienteInfo;
  productoNombre: string;
  calculado: FinanciamientoCalculado;
}

export default function FinanciamientoCuotaPage() {
  const { financiamientos, clientes, productos, cobros, loading, error } =
    useFinanciamientoData();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [vistaCards, setVistaCards] = useState(true);

  // Calcular financiamientos filtrados
  const financiamientosFiltrados = filtrarFinanciamientos(
    financiamientos,
    busqueda,
    filtroEstado,
    clientes,
    productos,
    cobros
  );

  // Calcular datos para cada financiamiento
  const financiamientosConDatos: FinanciamientoConDatos[] =
    financiamientosFiltrados.map((financiamiento) => {
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

  // Manejo de errores
  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  // Loading state
  if (loading) {
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
        {/* Hero Header Section */}
        <div className='bg-white shadow-sm border-b border-gray-100'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='text-center sm:text-left'>
                <div className='flex items-center justify-center sm:justify-start gap-3 mb-2'>
                  <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-700 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg'>
                    <span className='text-2xl sm:text-3xl text-white'>💰</span>
                  </div>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                    Financiamiento a Cuota
                  </h1>
                </div>
                <p className='text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl'>
                  Administra y da seguimiento a todos los financiamientos
                  activos
                </p>
              </div>
              <div className='flex justify-center sm:justify-end'>
                <Link
                  href='/financiamiento-cuota/nuevo'
                  className='w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
                >
                  <span className='text-xl'>💰</span>
                  <span className='hidden sm:inline'>Nuevo Financiamiento</span>
                  <span className='sm:hidden'>Nuevo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
          {/* Estadísticas */}
          <div className='mb-6 sm:mb-8'>
            <FinanciamientoStats
              financiamientos={financiamientos}
              cobros={cobros}
            />
          </div>

          {/* Filtros y controles */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8'>
            <div className='space-y-4'>
              {/* Search Bar */}
              <div className='w-full'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <span className='text-gray-400 text-lg'>🔍</span>
                  </div>
                  <input
                    type='text'
                    value={busqueda}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBusqueda(e.target.value)
                    }
                    placeholder='Buscar por cliente, cédula, teléfono, monto, producto o número de control...'
                    className='w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base'
                    aria-label='Buscar financiamientos por cliente, cédula o producto'
                    role='searchbox'
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                {/* Status Filter */}
                <div className='flex-1'>
                  <select
                    value={filtroEstado}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFiltroEstado(e.target.value)
                    }
                    className='w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white'
                  >
                    <option value='todos'>📊 Todos los estados</option>
                    <option value='activo'>✅ Activos</option>
                    <option value='atrasado'>⚠️ Atrasados</option>
                    <option value='completado'>💚 Completados</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className='flex bg-gray-100 rounded-xl p-1 self-start'>
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
                    <span className='text-base sm:text-lg'>🔷</span>
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
                    <span className='text-base sm:text-lg'>📋</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de financiamientos */}
          {financiamientosConDatos.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
              <div className='max-w-md mx-auto'>
                <span className='text-6xl mb-4 block'>💰</span>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {busqueda || filtroEstado !== "todos"
                    ? "No se encontraron financiamientos"
                    : "No hay financiamientos registrados"}
                </h3>
                <p className='text-gray-600 mb-6'>
                  {busqueda || filtroEstado !== "todos"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primer financiamiento en el sistema"}
                </p>
                {!busqueda && filtroEstado === "todos" && (
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
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-3 sm:space-y-4"
              }
            >
              {financiamientosConDatos.map(
                (item: FinanciamientoConDatos, index: number) => {
                  return vistaCards ? (
                    <FinanciamientoCard
                      key={item.financiamiento.id}
                      financiamiento={item.financiamiento}
                      clienteInfo={item.clienteInfo}
                      productoNombre={item.productoNombre}
                      calculado={item.calculado}
                      index={index}
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
