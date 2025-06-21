"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatNumeroControl } from "@/utils/format";
import Modal from "@/components/Modal";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import FacturaVentaContadoPDF from "@/components/pdf/FacturaVentaContadoPDF";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ventasContadoDB, VentaContado } from "@/lib/firebase/database";
import { formatearCedula } from "@/utils/format";

export default function VentasContadoPage() {
  const { clientes, loading: clientesLoading } = useClientesRedux();
  const { productos, loading: productosLoading } = useProductosRedux();

  // Estados locales
  const [ventas, setVentas] = useState<VentaContado[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaContado | null>(null);
  const [mostrarPDF, setMostrarPDF] = useState(false);

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(20);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Suscripción tiempo real a ventas al contado
  useEffect(() => {
    const unsub = ventasContadoDB.suscribir((lista) => {
      setVentas(lista);
      setLoadingVentas(false);
    });
    return () => unsub();
  }, []);

  // Filtrar ventas por búsqueda (BÚSQUEDA GLOBAL)
  const ventasFiltradas = ventas.filter((venta) => {
    if (!busqueda) return true;

    const terminoBusqueda = busqueda.toLowerCase();
    const cliente = clientes.find((c) => c.id === venta.clienteId);
    const numeroControl = formatNumeroControl(venta.numeroControl, "C");

    return (
      cliente?.nombre.toLowerCase().includes(terminoBusqueda) ||
      cliente?.cedula?.toLowerCase().includes(terminoBusqueda) ||
      numeroControl.toLowerCase().includes(terminoBusqueda) ||
      (venta.productos &&
        venta.productos.some((p) => {
          const producto = productos.find((prod) => prod.id === p.productoId);
          return producto?.nombre.toLowerCase().includes(terminoBusqueda);
        }))
    );
  });

  // Lógica de paginación
  const hayBusqueda = busqueda.trim() !== "";
  const ventasParaMostrar =
    hayBusqueda || mostrarTodos ? ventasFiltradas : ventasFiltradas;

  // Si hay búsqueda o mostrar todos, mostrar todos los resultados
  // Si no, aplicar paginación
  const ventasFinales =
    hayBusqueda || mostrarTodos
      ? ventasParaMostrar
      : ventasParaMostrar.slice(
          (paginaActual - 1) * elementosPorPagina,
          paginaActual * elementosPorPagina
        );

  // Calcular información de paginación
  const totalPaginas = Math.ceil(ventasFiltradas.length / elementosPorPagina);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina + 1;
  const indiceFin = Math.min(
    paginaActual * elementosPorPagina,
    ventasFiltradas.length
  );

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setPaginaActual(1);
    setMostrarTodos(false);
  }, [busqueda]);

  // Funciones de navegación
  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
  };

  const handleVerFactura = (venta: VentaContado) => {
    setVentaSeleccionada(venta);
    setMostrarPDF(true);
  };

  const getProductosTexto = (productosVenta: any[] | undefined) => {
    if (!productosVenta) return "Sin productos";

    return productosVenta
      .map((p) => {
        const producto = productos.find((prod) => prod.id === p.productoId);
        return `${producto?.nombre || "Producto no encontrado"} (${
          p.cantidad
        })`;
      })
      .join(", ");
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
                {hayBusqueda ? (
                  <>
                    <span className='text-sky-600 font-medium'>
                      🔍 Búsqueda global activa:
                    </span>{" "}
                    {ventasFiltradas.length} resultado
                    {ventasFiltradas.length !== 1 ? "s" : ""} de {ventas.length}{" "}
                    ventas totales
                  </>
                ) : mostrarTodos ? (
                  <>
                    <span className='text-green-600 font-medium'>
                      📋 Mostrando todas:
                    </span>{" "}
                    {ventas.length} ventas totales
                  </>
                ) : ventas.length > elementosPorPagina ? (
                  <>
                    Mostrando {indiceInicio}-{indiceFin} de {ventas.length}{" "}
                    <span className='block md:inline'>
                    ventas (Página {paginaActual} de {totalPaginas})
                    </span>

                  </>
                ) : (
                  `${ventas.length} ventas registradas`
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

        {/* Búsqueda */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex items-center gap-3 mb-2'>
            <span className='text-2xl'>🔍</span>
            <h2 className='text-xl font-semibold text-gray-800'>
              Buscar Ventas
            </h2>
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
              placeholder='Busca por cliente, cédula o N° de venta...'
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors'
            />
          </div>

          {busqueda && (
            <div className='flex items-center justify-between mt-3'>
              <p className='text-sm text-gray-500'>
                {ventasFiltradas.length === 0
                  ? "No se encontraron resultados"
                  : `${ventasFiltradas.length} resultado${
                      ventasFiltradas.length !== 1 ? "s" : ""
                    } encontrado${ventasFiltradas.length !== 1 ? "s" : ""}`}
              </p>
              <span className='text-xs px-2 py-1 bg-sky-100 text-sky-700 rounded-full font-medium'>
                🔍 Búsqueda Global
              </span>
            </div>
          )}

          {/* Controles de vista cuando no hay búsqueda */}
          {!hayBusqueda && ventas.length > elementosPorPagina && (
            <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-200'>
              <div className='flex items-center gap-3'>
                {!mostrarTodos ? (
                  <button
                    onClick={() => setMostrarTodos(true)}
                    className='inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium'
                  >
                    <span>📋</span>
                    Ver todas las ventas
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMostrarTodos(false);
                      setPaginaActual(1);
                    }}
                    className='inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium'
                  >
                    <span>📄</span>
                    Volver a paginación
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Controles de paginación (arriba) */}
        {!hayBusqueda && !mostrarTodos && totalPaginas > 1 && (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6'>
            {/* Vista móvil */}
            <div className='flex sm:hidden items-center justify-between'>
              <button
                onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className='flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
              >
                ← Anterior
              </button>

              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>
                  {paginaActual} de {totalPaginas}
                </span>
              </div>

              <button
                onClick={() =>
                  irAPagina(Math.min(totalPaginas, paginaActual + 1))
                }
                disabled={paginaActual === totalPaginas}
                className='flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
              >
                Siguiente →
              </button>
            </div>

            {/* Vista desktop */}
            <div className='hidden sm:flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => irAPagina(1)}
                  disabled={paginaActual === 1}
                  className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  Primera
                </button>
                <button
                  onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  ← Anterior
                </button>
              </div>

              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pagina;
                  if (totalPaginas <= 5) {
                    pagina = i + 1;
                  } else if (paginaActual <= 3) {
                    pagina = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pagina = totalPaginas - 4 + i;
                  } else {
                    pagina = paginaActual - 2 + i;
                  }

                  return (
                    <button
                      key={pagina}
                      onClick={() => irAPagina(pagina)}
                      className={`px-3 py-2 text-sm rounded-lg font-medium ${
                        paginaActual === pagina
                          ? "bg-sky-500 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                })}
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() =>
                    irAPagina(Math.min(totalPaginas, paginaActual + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  Siguiente →
                </button>
                <button
                  onClick={() => irAPagina(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                  className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de ventas */}
        <div className='mt-8'>
          {ventasFinales.length === 0 ? (
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
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {ventasFinales.map((venta) => {
                const cliente = clientes.find((c) => c.id === venta.clienteId);
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
                        {cliente?.nombre || "Cliente no encontrado"}
                        {cliente?.cedula &&
                          ` - V${formatearCedula(cliente.cedula)}`}
                      </p>
                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {getProductosTexto(venta.productos)}
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
                          <span className='text-gray-600'>Monto Original:</span>
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
          )}
          {/* Controles de paginación (abajo) */}
          {!hayBusqueda &&
            !mostrarTodos &&
            totalPaginas > 1 &&
            ventasFinales.length > 0 && (
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-6'>
                {/* Vista móvil */}
                <div className='flex sm:hidden items-center justify-between'>
                  <button
                    onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    className='flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                  >
                    ← Anterior
                  </button>

                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>
                      {paginaActual} de {totalPaginas}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      irAPagina(Math.min(totalPaginas, paginaActual + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                    className='flex items-center gap-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                  >
                    Siguiente →
                  </button>
                </div>

                {/* Vista desktop */}
                <div className='hidden sm:flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => irAPagina(1)}
                      disabled={paginaActual === 1}
                      className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                    >
                      Primera
                    </button>
                    <button
                      onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
                      disabled={paginaActual === 1}
                      className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                    >
                      ← Anterior
                    </button>
                  </div>

                  <div className='flex items-center gap-1'>
                    {Array.from(
                      { length: Math.min(5, totalPaginas) },
                      (_, i) => {
                        let pagina;
                        if (totalPaginas <= 5) {
                          pagina = i + 1;
                        } else if (paginaActual <= 3) {
                          pagina = i + 1;
                        } else if (paginaActual >= totalPaginas - 2) {
                          pagina = totalPaginas - 4 + i;
                        } else {
                          pagina = paginaActual - 2 + i;
                        }

                        return (
                          <button
                            key={pagina}
                            onClick={() => irAPagina(pagina)}
                            className={`px-3 py-2 text-sm rounded-lg font-medium ${
                              paginaActual === pagina
                                ? "bg-sky-500 text-white"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pagina}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        irAPagina(Math.min(totalPaginas, paginaActual + 1))
                      }
                      disabled={paginaActual === totalPaginas}
                      className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                    >
                      Siguiente →
                    </button>
                    <button
                      onClick={() => irAPagina(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                      className='px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                    >
                      Última
                    </button>
                  </div>
                </div>

                <div className='text-center mt-3 pt-3 border-t border-gray-100'>
                  <p className='text-sm text-gray-500'>
                    Mostrando {indiceInicio}-{indiceFin} de {ventas.length}{" "}
                    ventas totales
                  </p>
                </div>
              </div>
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
