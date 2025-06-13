"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import { FinanciamientoCuota, Cliente, Cobro } from "@/lib/firebase/database";
import Modal from "@/components/Modal";
import CuadriculaCuotas from "@/components/financiamiento/CuadriculaCuotas";
import PlanPagosPrint from "@/components/financiamiento/PlanPagosPrint";
import HistorialPagos from "@/components/financiamiento/HistorialPagos";
import ListaNotas from "@/components/notas/ListaNotas";

import ModalPagoCuota from "@/components/financiamiento/ModalPagoCuota";
import ClienteDetalle from "@/components/financiamiento/ClienteDetalle";
import ResumenFinanciero from "@/components/financiamiento/ResumenFinanciero";
import { useFinanciamientosRedux } from "@/hooks/useFinanciamientosRedux";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { useModalStates } from "@/hooks/useModalStates";
import {
  FinanciamientoService,
  PagoData,
} from "@/services/financiamientoService";

export default function FinanciamientoClientePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id as string;

  // Hooks Redux para datos - ÚNICA FUENTE DE VERDAD
  const {
    financiamientos,
    loading: financiamientosLoading,
    getCobrosFinanciamiento,
    calcularInfoFinanciamiento,
  } = useFinanciamientosRedux();

  const { loading: clientesLoading, getClienteById } = useClientesRedux();
  const { getProductoNombre } = useProductosRedux();

  // Hook optimizado para manejo de modales
  const modals = useModalStates();

  // Estados locales solo para UI
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [financiamientosCliente, setFinanciamientosCliente] = useState<
    FinanciamientoCuota[]
  >([]);
  const [abonando, setAbonando] = useState<{ [key: string]: boolean }>({});
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [totalCuotasAtrasadas, setTotalCuotasAtrasadas] = useState(0);
  const [actualizando, setActualizando] = useState(false);

  // Cargar datos del cliente cuando cambien los datos de Redux
  useEffect(() => {
    if (!clienteId) return;

    const clienteEncontrado = getClienteById(clienteId);
    setCliente(clienteEncontrado);

    // Filtrar financiamientos del cliente usando datos de Redux
    const financiamientosDelCliente = financiamientos.filter(
      (f) => f.clienteId === clienteId
    );
    setFinanciamientosCliente(financiamientosDelCliente);
  }, [clienteId, financiamientos, getClienteById]);

  // Calcular totales usando datos de Redux
  useEffect(() => {
    const nuevoTotalPendiente = financiamientosCliente.reduce(
      (acc: number, f: FinanciamientoCuota) => {
        if (
          f.tipoVenta !== "cuotas" ||
          (f.estado !== "activo" && f.estado !== "atrasado")
        ) {
          return acc;
        }
        const info = calcularInfoFinanciamiento(f);
        return acc + info.montoPendiente;
      },
      0
    );

    const nuevoTotalCuotasAtrasadas = financiamientosCliente.reduce(
      (acc: number, f: FinanciamientoCuota) => {
        if (
          f.tipoVenta !== "cuotas" ||
          (f.estado !== "activo" && f.estado !== "atrasado")
        ) {
          return acc;
        }
        const info = calcularInfoFinanciamiento(f);
        return acc + info.valorCuota * info.cuotasAtrasadas;
      },
      0
    );

    setTotalPendiente(nuevoTotalPendiente);
    setTotalCuotasAtrasadas(nuevoTotalCuotasAtrasadas);
  }, [financiamientosCliente, calcularInfoFinanciamiento]);

  const getProductosNombres = (financiamiento: FinanciamientoCuota) => {
    if (financiamiento.productos && financiamiento.productos.length > 0) {
      const nombres = financiamiento.productos.map((p) =>
        getProductoNombre(p.productoId)
      );
      return nombres.length === 1
        ? nombres[0]
        : `${nombres.length} productos: ${nombres.join(", ")}`;
    } else {
      return getProductoNombre(financiamiento.productoId);
    }
  };

  const handlePagarCuota = async (financiamientoId: string, data: PagoData) => {
    const financiamiento = financiamientosCliente.find(
      (f) => f.id === financiamientoId
    );
    if (!financiamiento) return;

    setAbonando((prev) => ({ ...prev, [financiamientoId]: true }));
    setActualizando(true);

    try {
      const cobrosExistentes = getCobrosFinanciamiento(financiamientoId).filter(
        (c: Cobro) =>
          (c.tipo === "cuota" || c.tipo === "inicial") &&
          !!c.id &&
          c.id !== "temp"
      );

      // Usar el servicio para procesar el pago
      await FinanciamientoService.procesarPagoCuota(
        financiamientoId,
        financiamiento,
        data,
        cobrosExistentes
      );

      // El hook Redux se actualizará automáticamente vía suscripción
    } catch (error) {
      console.error("Error al procesar pago:", error);

      if (error instanceof Error) {
        alert(`❌ Error al procesar el pago: ${error.message}`);
      } else {
        alert(
          "❌ Error desconocido al procesar el pago. Por favor, verifica los datos e intenta nuevamente."
        );
      }
    } finally {
      setAbonando((prev) => ({ ...prev, [financiamientoId]: false }));
      setActualizando(false);
    }
  };

  const imprimirPlanPagos = (financiamientoId: string) => {
    modals.openModal(`impresion-${financiamientoId}`);
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = `Plan de Pagos - ${cliente?.nombre || "Cliente"}`;
      window.print();
      document.title = originalTitle;
    }, 500);
  };

  const cerrarImpresion = (financiamientoId: string) => {
    modals.closeModal(`impresion-${financiamientoId}`);
  };

  if (financiamientosLoading || clientesLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>
            Cargando información del cliente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='container mx-auto px-4 py-6 sm:py-8'>
        {/* Header mejorado */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <button
              onClick={() => router.back()}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors'
            >
              <span className='text-xl'>←</span>
              <span className='font-medium'>Volver</span>
            </button>
          </div>

          <div className='text-center mb-6 sm:mb-8'>
            <div className='inline-flex items-center gap-3 bg-white rounded-2xl px-4 sm:px-6 py-3 shadow-sm border border-sky-100 mb-4'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-sky-500 rounded-xl flex items-center justify-center'>
                <span className='text-lg sm:text-xl text-white'>👤</span>
              </div>
              <div className='text-left'>
                <h1 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                  Detalle del Cliente
                </h1>
                <p className='text-xs sm:text-sm text-gray-600'>
                  Información detallada del cliente y sus financiamientos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente optimizada */}
        {cliente ? (
          <div className='mb-6 sm:mb-8'>
            <ClienteDetalle cliente={cliente} />
          </div>
        ) : (
          <div className='mb-8 bg-white rounded-2xl shadow-sm p-6 animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        )}

        {/* Resumen financiero mejorado */}
        <ResumenFinanciero
          totalPendiente={totalPendiente}
          totalCuotasAtrasadas={totalCuotasAtrasadas}
          actualizando={actualizando}
        />

        {/* Lista de financiamientos optimizada */}
        <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-slate-700 to-sky-500 px-4 sm:px-8 py-4 sm:py-6'>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center'>
                <span className='text-xl sm:text-2xl text-white'>📋</span>
              </div>
              <div className='text-white'>
                <h2 className='text-lg sm:text-xl font-bold mb-1'>
                  Financiamientos del Cliente
                </h2>
                <p className='text-sm sm:text-base text-sky-100'>
                  Historial completo de financiamientos y pagos
                </p>
              </div>
            </div>
          </div>

          <div className='p-4 sm:p-8'>
            {financiamientosCliente.length === 0 ? (
              <div className='text-center py-8 sm:py-12'>
                <div className='w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-3xl sm:text-4xl text-gray-400'>📭</span>
                </div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                  No hay financiamientos activos
                </h3>
                <p className='text-gray-500 text-sm sm:text-lg mb-6'>
                  Este cliente no tiene financiamientos registrados en el
                  sistema.
                </p>
                <Link
                  href='/financiamiento-cuota/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  <span>💰</span>
                  Crear Nuevo Financiamiento
                </Link>
              </div>
            ) : (
              <div className='space-y-6 sm:space-y-8'>
                {financiamientosCliente.map(
                  (financiamiento: FinanciamientoCuota, index: number) => {
                    // Usar el servicio para calcular información
                    const info = calcularInfoFinanciamiento(financiamiento);
                    const {
                      cobrosValidos,
                      valorCuota,
                      totalCobrado: abonos,
                      montoPendiente,
                      cuotasAtrasadas,
                      progreso,
                    } = info;
                    const montoTotal = financiamiento.monto;

                    const estadoPrincipal =
                      financiamiento.tipoVenta === "contado" ? (
                        <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-sky-100 text-sky-700 rounded-full font-bold text-sm'>
                          <span>💵</span>Pagado
                        </div>
                      ) : cuotasAtrasadas > 0 ? (
                        <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-full font-bold text-sm'>
                          <span>⏰</span>
                          <span className='hidden sm:inline'>Atrasado: </span>
                          {cuotasAtrasadas} cuota
                          {cuotasAtrasadas > 1 ? "s" : ""}
                        </div>
                      ) : (
                        <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm'>
                          <span>✔️</span>Al día
                        </div>
                      );

                    return (
                      <div
                        key={financiamiento.id}
                        className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300'
                      >
                        {/* Header del financiamiento */}
                        <div
                          className={`px-4 sm:px-6 py-3 sm:py-4 ${
                            cuotasAtrasadas > 0
                              ? "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
                              : montoPendiente <= 0
                              ? "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200"
                              : "bg-gradient-to-r from-sky-50 to-sky-100 border-b border-sky-200"
                          }`}
                        >
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='flex items-center gap-3 sm:gap-4'>
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                  cuotasAtrasadas > 0
                                    ? "bg-red-500 text-white"
                                    : montoPendiente <= 0
                                    ? "bg-green-500 text-white"
                                    : "bg-sky-500 text-white"
                                }`}
                              >
                                <span className='text-sm sm:text-lg font-bold'>
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <h3 className='text-base sm:text-lg font-bold text-gray-900 line-clamp-1'>
                                  {getProductosNombres(financiamiento)}
                                </h3>
                                <p className='text-xs sm:text-sm text-gray-600'>
                                  Creado el{" "}
                                  {new Date(
                                    financiamiento.fechaInicio
                                  ).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            </div>
                            {estadoPrincipal}
                          </div>
                        </div>

                        <div className='p-4 sm:p-6'>
                          <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8'>
                            {/* Información del financiamiento */}
                            <div className='space-y-6'>
                              <div>
                                <h4 className='text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                                  <span>📊</span>
                                  Información del Financiamiento
                                </h4>

                                <div className='space-y-3 sm:space-y-4'>
                                  <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                    <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                      Monto total:
                                    </span>
                                    <span className='text-base sm:text-lg font-bold text-gray-900'>
                                      ${montoTotal.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                    <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                      Monto cobrado:
                                    </span>
                                    <span className='text-base sm:text-lg font-bold text-green-600'>
                                      ${abonos.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                    <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                      Pendiente:
                                    </span>
                                    <span
                                      className={`text-base sm:text-lg font-bold ${
                                        montoPendiente > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      ${montoPendiente.toLocaleString()}
                                    </span>
                                  </div>

                                  {financiamiento.tipoVenta === "cuotas" && (
                                    <>
                                      <div className='p-3 bg-sky-50 rounded-xl'>
                                        <div className='flex items-center justify-between mb-1'>
                                          <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                            Cuotas:
                                          </span>
                                          <span className='text-base sm:text-lg font-bold text-gray-900'>
                                            {info.totalCuotas ||
                                              info.cuotasPagadas}
                                            /{financiamiento.cuotas}
                                          </span>
                                        </div>
                                        {info.cuotasIniciales > 0 && (
                                          <div className='text-xs text-gray-500'>
                                            <span>
                                              Regulares: {info.cuotasRegulares}
                                            </span>
                                            <span className='ml-2'>
                                              Iniciales: {info.cuotasIniciales}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                        <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                          Valor por cuota:
                                        </span>
                                        <span className='text-base sm:text-lg font-bold text-gray-900'>
                                          ${valorCuota.toLocaleString()}
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {/* Barra de progreso */}
                                  <div className='p-3 bg-sky-50 rounded-xl'>
                                    <div className='flex justify-between text-xs sm:text-sm font-medium text-gray-600 mb-2'>
                                      <span>Progreso del pago</span>
                                      <span>{progreso.toFixed(1)}%</span>
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-2 sm:h-3'>
                                      <div
                                        className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out ${
                                          progreso >= 100
                                            ? "bg-gradient-to-r from-green-500 to-green-600"
                                            : cuotasAtrasadas > 0
                                            ? "bg-gradient-to-r from-red-500 to-red-600"
                                            : "bg-gradient-to-r from-sky-500 to-sky-600"
                                        }`}
                                        style={{
                                          width: `${Math.min(progreso, 100)}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Acciones */}
                              {montoPendiente > 0 && (
                                <div className='space-y-3'>
                                  <h4 className='text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2'>
                                    <span>⚡</span>
                                    Acciones Rápidas
                                  </h4>

                                  <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3'>
                                    <button
                                      onClick={() => {
                                        modals.openModal(
                                          `pago-${financiamiento.id}`
                                        );
                                      }}
                                      disabled={abonando[financiamiento.id]}
                                      className='w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    >
                                      <span>💰</span>
                                      <span className='hidden sm:inline'>
                                        Pagar Cuota
                                      </span>
                                      <span className='sm:hidden'>Pagar</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        modals.toggleModal(
                                          `plan-${financiamiento.id}`
                                        )
                                      }
                                      className='w-full bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                    >
                                      <span>📅</span>
                                      <span className='hidden sm:inline'>
                                        {modals.isOpen(
                                          `plan-${financiamiento.id}`
                                        )
                                          ? "Ocultar"
                                          : "Ver"}{" "}
                                        Plan de Pagos
                                      </span>
                                      <span className='sm:hidden'>Plan</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        modals.toggleModal(
                                          `historial-${financiamiento.id}`
                                        )
                                      }
                                      className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                    >
                                      <span>📋</span>
                                      <span className='hidden sm:inline'>
                                        {modals.isOpen(
                                          `historial-${financiamiento.id}`
                                        )
                                          ? "Ocultar"
                                          : "Ver"}{" "}
                                        Historial de Pagos
                                      </span>
                                      <span className='sm:hidden'>
                                        Historial
                                      </span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        imprimirPlanPagos(financiamiento.id)
                                      }
                                      className='w-full sm:col-span-2 xl:col-span-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                    >
                                      <span>🖨️</span>
                                      <span className='hidden sm:inline'>
                                        Imprimir Plan
                                      </span>
                                      <span className='sm:hidden'>
                                        Imprimir
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Plan de pagos */}
                            {financiamiento.tipoVenta === "cuotas" &&
                              modals.isOpen(`plan-${financiamiento.id}`) && (
                                <div className='xl:col-span-1'>
                                  <div className='bg-gradient-to-r from-sky-50 to-slate-50 rounded-2xl p-4 sm:p-6 border border-sky-200'>
                                    <h4 className='text-base sm:text-lg font-semibold text-sky-800 mb-4 flex items-center gap-2'>
                                      <span>📅</span>
                                      Plan de Pagos
                                    </h4>
                                    <CuadriculaCuotas
                                      fechaInicio={financiamiento.fechaInicio}
                                      cobros={getCobrosFinanciamiento(
                                        financiamiento.id
                                      )}
                                      valorCuota={valorCuota}
                                    />
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Historial de Pagos y Notas */}
                          {financiamiento.tipoVenta === "cuotas" &&
                            modals.isOpen(`historial-${financiamiento.id}`) && (
                              <div className='mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6'>
                                <div className='xl:col-span-2'>
                                  <HistorialPagos
                                    pagos={getCobrosFinanciamiento(
                                      financiamiento.id
                                    )}
                                    valorCuota={valorCuota}
                                    titulo={`Historial de Pagos - ${getProductosNombres(
                                      financiamiento
                                    )}`}
                                  />
                                </div>
                                <div className='xl:col-span-1'>
                                  <div className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-amber-200'>
                                    <ListaNotas
                                      cobros={getCobrosFinanciamiento(
                                        financiamiento.id
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales de pago de cuota */}
      {financiamientosCliente.map((financiamiento: FinanciamientoCuota) => {
        const info = calcularInfoFinanciamiento(financiamiento);
        const { valorCuota, cuotasAtrasadas, cuotasPagadas, cuotasPendientes } =
          info;

        return (
          <ModalPagoCuota
            key={`modal-${financiamiento.id}`}
            isOpen={modals.isOpen(`pago-${financiamiento.id}`)}
            onClose={() => modals.closeModal(`pago-${financiamiento.id}`)}
            prestamo={{
              id: financiamiento.id,
              monto: financiamiento.monto,
              cuotas: financiamiento.cuotas,
            }}
            valorCuota={valorCuota}
            cuotasPendientes={cuotasPendientes}
            cuotasAtrasadas={cuotasAtrasadas}
            cuotasPagadas={cuotasPagadas}
            onPagar={(data) => handlePagarCuota(financiamiento.id, data)}
            cargando={!!abonando[financiamiento.id]}
          />
        );
      })}

      {/* Modales de impresión */}
      {financiamientosCliente.map((financiamiento: FinanciamientoCuota) => (
        <Modal
          key={`print-${financiamiento.id}`}
          isOpen={modals.isOpen(`impresion-${financiamiento.id}`)}
          onClose={() => cerrarImpresion(financiamiento.id)}
          title={`Imprimir Plan de Pagos - ${cliente?.nombre || "Cliente"}`}
        >
          <div className='print-container'>
            <div className='no-print mb-4 text-center'>
              <p className='text-gray-600 mb-3'>
                Haz clic en "Imprimir" o usa Ctrl+P para imprimir este plan de
                pagos.
              </p>
              <div className='flex gap-2 justify-center'>
                <button
                  onClick={() => window.print()}
                  className='px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition flex items-center gap-2'
                >
                  <span>🖨️</span>
                  Imprimir
                </button>
                <button
                  onClick={() => cerrarImpresion(financiamiento.id)}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
                >
                  Cerrar
                </button>
              </div>
            </div>

            {cliente && (
              <PlanPagosPrint
                prestamo={financiamiento}
                cliente={cliente}
                cobros={getCobrosFinanciamiento(financiamiento.id)}
                valorCuota={financiamiento.monto / financiamiento.cuotas}
                productosNombres={getProductosNombres(financiamiento)}
              />
            )}
          </div>
        </Modal>
      ))}

      {/* Estilos para impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .fixed.inset-0 > div:first-child { display: none !important; }
          .fixed.inset-0 .plan-pagos-print {
            position: static !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
        `,
        }}
      />
    </div>
  );
}
