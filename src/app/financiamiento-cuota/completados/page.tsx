"use client";

import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
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
import { FinanciamientoListItem } from "@/components/financiamiento/FinanciamientoListItem";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function FinanciamientosCompletadosPage() {
  const { financiamientos, cobros, loading, error } = useFinanciamientosRedux();
  const { clientes } = useClientesRedux();
  const { productos } = useProductosRedux();

  // Filtrar financiamientos completados
  const financiamientosCompletados = useMemo(() => {
    return financiamientos.filter((f) => {
      // Excluir ventas al contado, sólo evaluar financiamientos a cuotas
      if (f.tipoVenta !== "cuotas") return false;

      // Considerar completado si está marcado como completado o si el total cobrado >= monto
      const cobrosFin = cobros.filter(
        (c) =>
          c.financiamientoId === f.id &&
          (c.tipo === "cuota" || c.tipo === "inicial")
      );
      const totalCobradoItem = cobrosFin.reduce((acc, c) => acc + c.monto, 0);
      if (f.estado === "completado") return true;
      return totalCobradoItem >= f.monto;
    });
  }, [financiamientos, cobros]);

  // Construir datos para los ítems de lista
  const items = useMemo(() => {
    return financiamientosCompletados.map((financiamiento) => {
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
  }, [financiamientosCompletados, clientes, productos, cobros]);

  const PAGE_SIZE = 25;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, items.length));
  }, [items.length]);

  const sentinelRef = useInfiniteScroll(loadMore);

  const itemsToRender = items.slice(0, visibleCount);

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  if (loading && financiamientos.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-600 font-medium'>Cargando financiamientos...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
            Financiamientos Completados ({items.length})
          </h1>
          <Link
            href='/financiamiento-cuota'
            className='inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-medium'
          >
            ← Volver
          </Link>
        </div>

        {/* Lista */}
        <div className='space-y-4'>
          {items.length === 0 && (
            <p className='text-gray-600'>No hay financiamientos completados.</p>
          )}

          {itemsToRender.map(
            ({ financiamiento, clienteInfo, productoNombre, calculado }) => (
              <FinanciamientoListItem
                key={financiamiento.id}
                financiamiento={financiamiento}
                clienteInfo={clienteInfo as ClienteInfo}
                productoNombre={productoNombre}
                calculado={calculado as FinanciamientoCalculado}
              />
            )
          )}

          {visibleCount < items.length && (
            <div ref={sentinelRef} className='h-10' />
          )}
        </div>
      </div>
    </div>
  );
}
