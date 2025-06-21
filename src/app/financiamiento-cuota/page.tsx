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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  formatNumeroControl,
  normalizarNumeroControl,
  esFormatoNumeroControl,
} from "@/utils/format";

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
  // Estados locales
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [tipoBusqueda, setTipoBusqueda] = useState<
    "nombre" | "cedula" | "numeroControl"
  >("nombre");

  // Hooks Redux
  const {
    loading: financiamientosLoading,
    error: financiamientosError,
    financiamientos,
    cobros,
  } = useFinanciamientosRedux();

  const { clientes, loading: clientesLoading } = useClientesRedux();
  const { productos, loading: productosLoading } = useProductosRedux();

  // Procesar financiamientos con datos calculados
  const financiamientosConDatos: FinanciamientoConDatos[] = financiamientos
    .filter((f) => f.tipoVenta === "cuotas") // Solo financiamientos a cuotas
    .map((financiamiento) => {
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

  // Filtrar por búsqueda según el tipo seleccionado
  const financiamientosFiltrados = financiamientosConDatos.filter((item) => {
    if (!busqueda) return true;

    const terminoBusqueda = busqueda.trim();
    const terminoLower = terminoBusqueda.toLowerCase();

    switch (tipoBusqueda) {
      case "cedula":
        // Búsqueda específica por cédula
        return item.clienteInfo.cedula.toLowerCase().includes(terminoLower);

      case "numeroControl":
        // Búsqueda específica por número de control
        const numeroControlFormateado = formatNumeroControl(
          item.financiamiento.numeroControl,
          "F"
        );
        if (esFormatoNumeroControl(terminoBusqueda)) {
          const numeroNormalizado = normalizarNumeroControl(terminoBusqueda);
          return (
            numeroNormalizado !== null &&
            item.financiamiento.numeroControl === numeroNormalizado
          );
        }
        return (
          numeroControlFormateado.toLowerCase().includes(terminoLower) ||
          item.financiamiento.numeroControl.toString().includes(terminoLower)
        );

      case "nombre":
      default:
        // Búsqueda específica por nombre de cliente
        return item.clienteInfo.nombre.toLowerCase().includes(terminoLower);
    }
  });

  // Filtrar por estado
  const financiamientosFiltradosPorEstado = financiamientosFiltrados.filter(
    (item) => {
      if (estadoFiltro === "todos") return true;

      const estado =
        item.calculado.cuotasAtrasadas > 0
          ? "atrasado"
          : item.calculado.montoPendiente <= 0
          ? "completado"
          : "activo";

      return estado === estadoFiltro;
    }
  );

  // Agrupar por cliente
  const gruposFinanciamientos = financiamientosFiltradosPorEstado.reduce(
    (grupos, item) => {
      const clienteId = item.financiamiento.clienteId;
      if (!grupos[clienteId]) {
        grupos[clienteId] = {
          clienteId,
          clienteInfo: item.clienteInfo,
          financiamientos: [],
          financiamientoPrincipal: item,
        };
      }
      grupos[clienteId].financiamientos.push({
        financiamiento: item.financiamiento,
        productoNombre: item.productoNombre,
        calculado: item.calculado,
      });
      return grupos;
    },
    {} as Record<string, GrupoFinanciamientosPorCliente>
  );

  const gruposArray = Object.values(gruposFinanciamientos);

  // Calcular estadísticas
  const estadisticas = {
    todos: financiamientosConDatos.length,
    activos: financiamientosConDatos.filter((f) => {
      const estado =
        f.calculado.cuotasAtrasadas > 0
          ? "atrasado"
          : f.calculado.montoPendiente <= 0
          ? "completado"
          : "activo";
      return estado === "activo";
    }).length,
    atrasados: financiamientosConDatos.filter(
      (f) => f.calculado.cuotasAtrasadas > 0
    ).length,
    completados: financiamientosConDatos.filter(
      (f) => f.calculado.montoPendiente <= 0
    ).length,
  };

  // Estado de carga combinado
  const cargandoInicial =
    financiamientosLoading || clientesLoading || productosLoading;
  const errorGeneral = financiamientosError;

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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
          <div className='flex items-center justify-center h-64'>
            <LoadingSpinner size='lg' />
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
              {gruposArray.length > 0 ? (
                <>
                  {gruposArray.length} financiamiento
                  {gruposArray.length !== 1 ? "s" : ""} encontrado
                  {gruposArray.length !== 1 ? "s" : ""}
                  {busqueda && (
                    <span className='ml-1'>
                      para "<span className='font-medium'>{busqueda}</span>"
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
              <span className='inline'>Nuevo Financiamiento</span>
            </Link>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-6'>
          {[
            {
              key: "todos",
              label: "Todos",
              icon: "📊",
              count: estadisticas.todos,
            },
            // {
            //   key: "activo",
            //   label: "Activos",
            //   icon: "✅",
            //   count: estadisticas.activos,
            // },
            {
              key: "atrasado",
              label: "Atrasados",
              icon: "⚠️",
              count: estadisticas.atrasados,
            },
            {
              key: "completado",
              label: "Completados",
              icon: "🎉",
              count: estadisticas.completados,
            },
          ].map((filtro) => (
            <button
              key={filtro.key}
              onClick={() => setEstadoFiltro(filtro.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                estadoFiltro === filtro.key
                  ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span>{filtro.icon}</span>
              <span className='font-medium'>{filtro.label}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  estadoFiltro === filtro.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {filtro.count}
              </span>
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-2xl'>🔍</span>
            <h2 className='text-xl font-semibold text-gray-800'>
              Buscar Financiamientos
            </h2>
          </div>

          {/* Botones de tipo de búsqueda */}
          <div className='flex flex-wrap gap-2 mb-4'>
            {[
              {
                key: "nombre",
                label: "Por Nombre",
                icon: "👤",
                desc: "Solo nombres de clientes",
              },
              {
                key: "cedula",
                label: "Por Cédula",
                icon: "🆔",
                desc: "Solo cédulas de clientes",
              },
              {
                key: "numeroControl",
                label: "Por N° Control",
                icon: "📄",
                desc: "Solo números de financiamiento",
              },
            ].map((tipo) => (
              <button
                key={tipo.key}
                onClick={() => {
                  setTipoBusqueda(tipo.key as any);
                  setBusqueda(""); // Limpiar búsqueda al cambiar tipo
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  tipoBusqueda === tipo.key
                    ? "bg-sky-500 text-white border-sky-500 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                title={tipo.desc}
              >
                <span>{tipo.icon}</span>
                <span>{tipo.label}</span>
              </button>
            ))}
          </div>

          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-400'>🔍</span>
            </div>
            <input
              type='text'
              value={busqueda}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBusqueda(e.target.value)
              }
              placeholder={
                tipoBusqueda === "nombre"
                  ? "Buscar por nombre de cliente (ej: María García)..."
                  : tipoBusqueda === "cedula"
                  ? "Buscar por cédula (ej: 26541412)..."
                  : tipoBusqueda === "numeroControl"
                  ? "Buscar por número de control (ej: F-000001, f-000001, 1)..."
                  : "Buscar por nombre de cliente..."
              }
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors'
            />
          </div>

          {busqueda && (
            <p className='text-sm text-gray-500 mt-2'>
              {financiamientosFiltrados.length === 0
                ? "No se encontraron resultados"
                : `${financiamientosFiltrados.length} resultado${
                    financiamientosFiltrados.length !== 1 ? "s" : ""
                  } encontrado${
                    financiamientosFiltrados.length !== 1 ? "s" : ""
                  }`}
            </p>
          )}
        </div>

        {/* Contenido principal */}
        {financiamientosFiltradosPorEstado.length === 0 ? (
          // Estado vacío
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-4xl sm:text-6xl mb-4 block'>💰</span>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                {busqueda || estadoFiltro !== "todos"
                  ? "No se encontraron financiamientos"
                  : "No hay financiamientos registrados"}
              </h3>
              <p className='text-sm sm:text-base text-gray-600 mb-6'>
                {busqueda || estadoFiltro !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer financiamiento en el sistema"}
              </p>
              {!busqueda && estadoFiltro === "todos" && (
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
              {gruposArray.map((grupo, index) => (
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
          </>
        )}
      </div>
    </div>
  );
}
