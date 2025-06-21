"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { useVentasContadoInfiniteScroll } from "@/hooks/useVentasContadoInfiniteScroll";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  formatNumeroControl,
  normalizarNumeroControl,
  esFormatoNumeroControl,
} from "@/utils/format";
import Modal from "@/components/Modal";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import FacturaVentaContadoPDF from "@/components/pdf/FacturaVentaContadoPDF";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ventasContadoDB, VentaContado } from "@/lib/firebase/database";
import { formatearCedula } from "@/utils/format";

export default function VentasContadoPage() {
  const { clientes, loading: clientesLoading } = useClientesRedux();
  const { productos, loading: productosLoading } = useProductosRedux();

  // Estados locales para ventas
  const [ventas, setVentas] = useState<VentaContado[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(true);

  // Estados de búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState<
    "nombre" | "cedula" | "numeroControl"
  >("nombre");

  // Estados de modal
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaContado | null>(null);
  const [mostrarPDF, setMostrarPDF] = useState(false);

  // Suscripción tiempo real a ventas al contado
  useEffect(() => {
    const unsub = ventasContadoDB.suscribir((lista) => {
      setVentas(lista);
      setLoadingVentas(false);
    });
    return () => unsub();
  }, []);

  // Hook de scroll infinito
  const {
    items: ventasParaMostrar,
    isLoading: scrollLoading,
    hasMore,
    error: scrollError,
    loadMore,
    totalCount,
    estadisticas,
  } = useVentasContadoInfiniteScroll(ventas, clientes, productos, {
    pageSize: 20, // Cargar 20 ventas por lote
    busqueda,
    tipoBusqueda,
  });

  // Configurar intersection observer para scroll infinito
  const { sentinelRef } = useInfiniteScroll(loadMore, {
    hasMore,
    isLoading: scrollLoading,
    threshold: 0.1,
    rootMargin: "100px",
  });

  const handleVerFactura = (venta: VentaContado) => {
    setVentaSeleccionada(venta);
    setMostrarPDF(true);
  };

  const cargandoInicial = clientesLoading || productosLoading || loadingVentas;

  if (cargandoInicial) {
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
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center'>
              <span className='text-2xl text-white'>💵</span>
            </div>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
                Ventas al Contado
              </h1>
              <p className='text-sm text-gray-600'>
                {totalCount > 0 ? (
                  busqueda ? (
                    <>
                      {totalCount} resultado{totalCount !== 1 ? "s" : ""}{" "}
                      encontrado{totalCount !== 1 ? "s" : ""} para "
                      <span className='font-medium'>{busqueda}</span>"
                    </>
                  ) : (
                    <>
                      {ventasParaMostrar.length} de {totalCount} ventas cargadas
                      {hasMore && ` • Scroll para cargar más`}
                    </>
                  )
                ) : (
                  "Gestiona las ventas al contado de tu negocio"
                )}
              </p>
            </div>
          </div>

          <Link
            href='/ventas-contado/nuevo'
            className='inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
          >
            <span className='text-xl'>💵</span>
            <span className='hidden sm:inline'>Nueva Venta</span>
            <span className='sm:hidden'>Nueva</span>
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        {estadisticas && (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>📊</span>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total Ventas</p>
                  <p className='text-lg font-bold text-gray-900'>
                    {estadisticas.totalVentas}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>💰</span>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Monto Total</p>
                  <p className='text-lg font-bold text-gray-900'>
                    ${estadisticas.montoTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>📈</span>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Promedio</p>
                  <p className='text-lg font-bold text-gray-900'>
                    ${estadisticas.promedioVenta.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>👥</span>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Hoy</p>
                  <p className='text-lg font-bold text-gray-900'>
                    {estadisticas.ventasHoy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-2xl'>🔍</span>
            <h2 className='text-xl font-semibold text-gray-800'>
              Buscar Ventas
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
                desc: "Solo números de venta",
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
                  ? "Buscar por número de control (ej: C-000001, c-000001, 1)..."
                  : "Buscar por nombre de cliente..."
              }
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors'
            />
          </div>

          {busqueda && (
            <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800 font-medium'>
                🔍 Búsqueda global activa
              </p>
              <p className='text-xs text-blue-600 mt-1'>
                {totalCount === 0
                  ? "No se encontraron resultados en toda la base de datos"
                  : `${totalCount} resultado${
                      totalCount !== 1 ? "s" : ""
                    } encontrado${
                      totalCount !== 1 ? "s" : ""
                    } de todas las ventas`}
              </p>
            </div>
          )}
        </div>

        {/* Error de scroll */}
        {scrollError && (
          <div className='mb-6'>
            <ErrorMessage message={scrollError} />
          </div>
        )}

        {/* Lista de ventas */}
        <div className='mt-8'>
          {ventasParaMostrar.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl'>💵</span>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {busqueda
                  ? "No se encontraron ventas"
                  : "No hay ventas registradas"}
              </h3>
              <p className='text-gray-600 mb-6'>
                {busqueda
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza registrando tu primera venta al contado"}
              </p>
              {!busqueda && (
                <div className='flex items-center justify-center gap-2 text-sky-600 text-sm'>
                  <span>💡</span>
                  <span>Usa el botón "Nueva Venta" para agregar una venta</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {ventasParaMostrar.map((ventaConDatos) => {
                  const { venta } = ventaConDatos;
                  const tieneDescuento =
                    venta.montoDescuento && venta.montoDescuento > 0;

                  return (
                    <div
                      key={venta.id}
                      className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200'
                      onClick={() => handleVerFactura(venta)}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-500'>
                          N° Venta
                        </span>
                        <span className='px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold'>
                          {formatNumeroControl(venta.numeroControl, "C")}
                        </span>
                      </div>

                      <div className='space-y-1'>
                        <p className='font-semibold text-gray-900'>
                          {ventaConDatos.cliente?.nombre ||
                            "Cliente no encontrado"}
                          {ventaConDatos.cliente?.cedula &&
                            ` - V${formatearCedula(
                              ventaConDatos.cliente.cedula
                            )}`}
                        </p>
                        <p className='text-sm text-gray-600 line-clamp-2'>
                          {ventaConDatos.productos}
                        </p>
                      </div>

                      <div className='flex justify-between items-center mt-auto'>
                        <span className='text-sm text-gray-500'>
                          {tieneDescuento ? "Total Pagado" : "Monto"}
                        </span>
                        <span className='text-lg font-bold text-gray-900'>
                          ${venta.monto.toLocaleString()}
                        </span>
                      </div>

                      {/* Mostrar información de descuento si existe */}
                      {tieneDescuento && (
                        <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm'>
                          <div className='flex justify-between items-center mb-1'>
                            <span className='text-gray-600'>
                              Monto Original:
                            </span>
                            <span className='font-semibold'>
                              ${venta.montoOriginal?.toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between items-center text-amber-600'>
                            <span>Descuento Aplicado:</span>
                            <span className='font-semibold'>
                              -${venta.montoDescuento?.toLocaleString()}
                              {venta.descuentoTipo === "porcentaje" &&
                                venta.descuentoValor &&
                                ` (${venta.descuentoValor}%)`}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-500'>Fecha</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {new Date(venta.fecha).toLocaleDateString("es-ES")}
                        </span>
                      </div>

                      <div className='pt-2 border-t border-gray-100'>
                        <div className='flex items-center justify-center gap-2 text-sky-600 text-sm font-medium'>
                          <span>📄</span>
                          <span>Click para ver factura</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sentinel para scroll infinito */}
              <div ref={sentinelRef} className='h-4 w-full mt-6' />

              {/* Loading más elementos */}
              {scrollLoading && (
                <div className='flex items-center justify-center py-8'>
                  <div className='flex flex-col items-center gap-2'>
                    <LoadingSpinner size='sm' />
                    <p className='text-sm text-gray-600'>
                      Cargando más ventas...
                    </p>
                  </div>
                </div>
              )}

              {/* No hay más elementos */}
              {!hasMore && ventasParaMostrar.length > 0 && (
                <div className='text-center py-8'>
                  <div className='inline-flex items-center gap-2 text-gray-500 text-sm'>
                    <span>✅</span>
                    <span>
                      Has visto todas las {totalCount} ventas disponibles
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal PDF */}
        <Modal
          isOpen={mostrarPDF && !!ventaSeleccionada}
          onClose={() => setMostrarPDF(false)}
          title={`Factura N° ${
            ventaSeleccionada
              ? formatNumeroControl(ventaSeleccionada.numeroControl, "C")
              : ""
          }`}
        >
          {ventaSeleccionada && (
            <div className='space-y-4'>
              {/* Botón de descarga */}
              <div className='flex justify-center mb-4'>
                <PDFDownloadLink
                  document={
                    <FacturaVentaContadoPDF
                      venta={ventaSeleccionada}
                      cliente={
                        clientes.find(
                          (c) => c.id === ventaSeleccionada.clienteId
                        ) || null
                      }
                      productos={productos}
                    />
                  }
                  fileName={`factura-${formatNumeroControl(
                    ventaSeleccionada.numeroControl,
                    "C"
                  )}.pdf`}
                  className='inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg'
                >
                  {({ loading }: { loading: boolean }) => (
                    <>
                      <span>💾</span>
                      {loading
                        ? "Generando..."
                        : `Descargar Factura ${formatNumeroControl(
                            ventaSeleccionada.numeroControl,
                            "C"
                          )}`}
                    </>
                  )}
                </PDFDownloadLink>
              </div>

              {/* Visor PDF */}
              <div
                className='border border-gray-300 rounded-lg overflow-hidden'
                style={{ height: "500px" }}
              >
                <PDFViewer width='100%' height='100%' showToolbar={false}>
                  <FacturaVentaContadoPDF
                    venta={ventaSeleccionada}
                    cliente={
                      clientes.find(
                        (c) => c.id === ventaSeleccionada.clienteId
                      ) || null
                    }
                    productos={productos}
                  />
                </PDFViewer>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
