"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useFinanciamientosRedux } from "@/hooks/useFinanciamientosRedux";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatNumeroControl } from "@/utils/format";
import {
  getClienteInfo,
  getProductoNombre,
} from "@/utils/financiamientoHelpers";

export default function VentasContadoPage() {
  const {
    financiamientos,
    setTipoVenta,
    filters,
    setBusqueda,
    loading,
    error,
  } = useFinanciamientosRedux();

  const { clientes } = useClientesRedux();
  const { productos } = useProductosRedux();

  // Fijar tipoVenta = "contado" al entrar
  useEffect(() => {
    setTipoVenta("contado");
    return () => {
      setTipoVenta("todos");
    };
  }, [setTipoVenta]);

  // Construir lista de ventas al contado
  const ventasContado = useMemo(() => {
    return financiamientos.filter((f) => f.tipoVenta === "contado");
  }, [financiamientos]);

  const items = useMemo(() => {
    return ventasContado.map((f) => {
      const cliente = getClienteInfo(f.clienteId, clientes);
      const producto = getProductoNombre(f.productoId, productos);
      return { f, cliente, producto };
    });
  }, [ventasContado, clientes, productos]);

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
            Ventas al Contado ({items.length})
          </h1>
          <Link
            href='/financiamiento-cuota'
            className='inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-medium'
          >
            ← Financiamientos
          </Link>
        </div>

        {/* Buscador */}
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
              <span className='text-gray-400 text-lg'>🔍</span>
            </div>
            <input
              type='text'
              value={filters.busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder='Buscar por cliente, producto o Nº de venta...'
              className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm'
            />
          </div>
        </div>

        {/* Lista */}
        {items.length === 0 ? (
          <p className='text-gray-600'>No hay ventas al contado registradas.</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {items.map(({ f, cliente, producto }) => (
              <div
                key={f.id}
                className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-500'>
                    N° Venta
                  </span>
                  <span className='px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold'>
                    {formatNumeroControl(f.numeroControl, "C")}
                  </span>
                </div>

                <div className='space-y-1'>
                  <p className='font-semibold text-gray-900'>
                    {cliente?.nombre}
                  </p>
                  <p className='text-sm text-gray-600'>{producto}</p>
                </div>

                <div className='flex justify-between items-center mt-auto'>
                  <span className='text-sm text-gray-500'>Monto</span>
                  <span className='text-lg font-bold text-gray-900'>
                    ${f.monto.toLocaleString()}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>Fecha</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {new Date(f.fechaInicio).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
