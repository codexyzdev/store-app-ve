import { useState } from "react";
import { FinanciamientoCuota, Cliente, Cobro } from "@/lib/firebase/database";
import { useFinanciamientosRedux } from "@/hooks/useFinanciamientosRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { useModalStates } from "@/hooks/useModalStates";
import {
  FinanciamientoService,
  PagoData,
} from "@/services/financiamientoService";
import Modal from "@/components/Modal";
import CuadriculaCuotas from "@/components/financiamiento/CuadriculaCuotas";
import HistorialPagos from "@/components/financiamiento/HistorialPagos";
import ListaNotas from "@/components/notas/ListaNotas";
import ModalPagoCuota from "@/components/financiamiento/ModalPagoCuota";
import PlanPagosPrint from "@/components/financiamiento/PlanPagosPrint";

interface FinanciamientoIndividualCardProps {
  financiamiento: FinanciamientoCuota;
  cliente: Cliente | null;
  index: number;
  onActualizando: (actualizando: boolean) => void;
}

export default function FinanciamientoIndividualCard({
  financiamiento,
  cliente,
  index,
  onActualizando,
}: FinanciamientoIndividualCardProps) {
  // Hooks Redux
  const { getCobrosFinanciamiento, calcularInfoFinanciamiento } =
    useFinanciamientosRedux();
  const { getProductoNombre } = useProductosRedux();

  // Hook optimizado para modales
  const modals = useModalStates();

  // Estados locales
  const [abonando, setAbonando] = useState(false);

  // Calcular información del financiamiento
  const info = calcularInfoFinanciamiento(financiamiento);
  const {
    cobrosValidos,
    valorCuota,
    totalCobrado: abonos,
    montoPendiente,
    cuotasAtrasadas,
    progreso,
    cuotasPagadas,
    cuotasPendientes,
  } = info;
  const montoTotal = financiamiento.monto;

  // Función para obtener nombres de productos
  const getProductosNombres = () => {
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

  // Manejar pago de cuota
  const handlePagarCuota = async (data: PagoData) => {
    setAbonando(true);
    onActualizando(true);

    try {
      const cobrosExistentes = getCobrosFinanciamiento(
        financiamiento.id
      ).filter(
        (c: Cobro) =>
          (c.tipo === "cuota" || c.tipo === "inicial") &&
          !!c.id &&
          c.id !== "temp"
      );

      await FinanciamientoService.procesarPagoCuota(
        financiamiento.id,
        financiamiento,
        data,
        cobrosExistentes
      );
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
      setAbonando(false);
      onActualizando(false);
    }
  };

  // Funciones de impresión
  const imprimirPlanPagos = () => {
    modals.openModal(`impresion-${financiamiento.id}`);
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = `Plan de Pagos - ${cliente?.nombre || "Cliente"}`;
      window.print();
      document.title = originalTitle;
    }, 500);
  };

  // Estado del financiamiento
  const estadoPrincipal =
    financiamiento.tipoVenta === "contado" ? (
      <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-sky-100 text-sky-700 rounded-full font-bold text-sm'>
        <span>💵</span>Pagado
      </div>
    ) : cuotasAtrasadas > 0 ? (
      <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-full font-bold text-sm'>
        <span>⏰</span>
        <span className='hidden sm:inline'>Atrasado: </span>
        {cuotasAtrasadas} cuota{cuotasAtrasadas > 1 ? "s" : ""}
      </div>
    ) : (
      <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm'>
        <span>✔️</span>Al día
      </div>
    );

  return (
    <>
      <div className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300'>
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
                  {getProductosNombres()}
                </h3>
                <p className='text-xs sm:text-sm text-gray-600'>
                  Creado el{" "}
                  {new Date(financiamiento.fechaInicio).toLocaleDateString(
                    "es-ES"
                  )}
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
                        montoPendiente > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      ${montoPendiente.toLocaleString()}
                    </span>
                  </div>

                  {financiamiento.tipoVenta === "cuotas" && (
                    <>
                      <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                        <span className='text-xs sm:text-sm font-medium text-gray-600'>
                          Cuotas:
                        </span>
                        <span className='text-base sm:text-lg font-bold text-gray-900'>
                          {cobrosValidos.length}/{financiamiento.cuotas}
                        </span>
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
                      onClick={() =>
                        modals.openModal(`pago-${financiamiento.id}`)
                      }
                      disabled={abonando}
                      className='w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                      <span>💰</span>
                      <span className='hidden sm:inline'>Pagar Cuota</span>
                      <span className='sm:hidden'>Pagar</span>
                    </button>

                    <button
                      onClick={() =>
                        modals.toggleModal(`plan-${financiamiento.id}`)
                      }
                      className='w-full bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                    >
                      <span>📅</span>
                      <span className='hidden sm:inline'>
                        {modals.isOpen(`plan-${financiamiento.id}`)
                          ? "Ocultar"
                          : "Ver"}{" "}
                        Plan de Pagos
                      </span>
                      <span className='sm:hidden'>Plan</span>
                    </button>

                    <button
                      onClick={() =>
                        modals.toggleModal(`historial-${financiamiento.id}`)
                      }
                      className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                    >
                      <span>📋</span>
                      <span className='hidden sm:inline'>
                        {modals.isOpen(`historial-${financiamiento.id}`)
                          ? "Ocultar"
                          : "Ver"}{" "}
                        Historial de Pagos
                      </span>
                      <span className='sm:hidden'>Historial</span>
                    </button>

                    <button
                      onClick={imprimirPlanPagos}
                      className='w-full sm:col-span-2 xl:col-span-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                    >
                      <span>🖨️</span>
                      <span className='hidden sm:inline'>Imprimir Plan</span>
                      <span className='sm:hidden'>Imprimir</span>
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
                      cobros={getCobrosFinanciamiento(financiamiento.id)}
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
                    pagos={getCobrosFinanciamiento(financiamiento.id)}
                    valorCuota={valorCuota}
                    titulo={`Historial de Pagos - ${getProductosNombres()}`}
                  />
                </div>
                <div className='xl:col-span-1'>
                  <div className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-amber-200'>
                    <ListaNotas
                      cobros={getCobrosFinanciamiento(financiamiento.id)}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Modal de pago de cuota */}
      <ModalPagoCuota
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
        onPagar={handlePagarCuota}
        cargando={abonando}
      />

      {/* Modal de impresión */}
      <Modal
        isOpen={modals.isOpen(`impresion-${financiamiento.id}`)}
        onClose={() => modals.closeModal(`impresion-${financiamiento.id}`)}
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
                onClick={() =>
                  modals.closeModal(`impresion-${financiamiento.id}`)
                }
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
              >
                Cerrar
              </button>
            </div>
          </div>

          {cliente && (
            <PlanPagosPrint
              financiamiento={financiamiento}
              cliente={cliente}
              cobros={getCobrosFinanciamiento(financiamiento.id)}
              valorCuota={financiamiento.monto / financiamiento.cuotas}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
