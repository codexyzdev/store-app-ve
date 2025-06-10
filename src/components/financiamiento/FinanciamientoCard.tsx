import React, { useState } from "react";
import HistorialPagos from "@/components/financiamiento/HistorialPagos";
import AbonarCuotaForm from "@/components/financiamiento/AbonarCuotaForm";

interface FinanciamientoCardProps {
  financiamiento: any;
  producto: any;
  productosDelFinanciamiento?: any[];
  abonos: number;
  montoTotal: number;
  montoPendiente: number;
  valorCuota: number;
  cuotasPendientes: number;
  cuotasAtrasadas: number;
  estadoPrincipal: any; // ReactNode fallback
  mostrarFormularioAbono: boolean;
  abonando: boolean;
  montoAbono: number;
  onMostrarFormularioAbono: () => void;
  onChangeMontoAbono: (valor: number) => void;
  onAbonarCuota: (data: any) => Promise<void>;
  pagos: any[];
  Tooltip: React.FC<{ text: string }>;
}

const FinanciamientoCard: React.FC<FinanciamientoCardProps> = ({
  financiamiento,
  producto,
  productosDelFinanciamiento,
  abonos,
  montoTotal,
  montoPendiente,
  valorCuota,
  cuotasPendientes,
  cuotasAtrasadas,
  estadoPrincipal,
  abonando,
  montoAbono,
  onChangeMontoAbono,
  onAbonarCuota,
  pagos,
  Tooltip,
}) => {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarModalAbono, setMostrarModalAbono] = useState(false);

  return (
    <div className='p-4 sm:p-6 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col gap-4 min-h-[220px]'>
      <div className='flex flex-wrap gap-2 items-center mb-2'>
        {estadoPrincipal}
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
            financiamiento.estado === "activo"
              ? "bg-green-100 text-green-800"
              : financiamiento.estado === "completado"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {financiamiento.tipoVenta === "contado"
            ? "Contado"
            : financiamiento.estado}
        </span>
        <span className='ml-2 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700'>
          Tipo: {financiamiento.tipoVenta === "contado" ? "Contado" : "Cuotas"}
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
        <div className='flex items-center gap-2 text-gray-700'>
          <span className='font-semibold'>
            📦 Producto
            {productosDelFinanciamiento && productosDelFinanciamiento.length > 1
              ? "s"
              : ""}
            :
          </span>
          {productosDelFinanciamiento &&
          productosDelFinanciamiento.length > 0 ? (
            <div className='flex-1'>
              <span className='text-gray-900'>
                {productosDelFinanciamiento.length === 1
                  ? productosDelFinanciamiento[0].nombre
                  : `${productosDelFinanciamiento.length} productos`}
              </span>
              {productosDelFinanciamiento.length > 1 && (
                <div className='text-xs text-gray-500 mt-1'>
                  {productosDelFinanciamiento
                    .slice(0, 2)
                    .map((p: any, index: number) => p.nombre)
                    .join(", ")}
                  {productosDelFinanciamiento.length > 2 &&
                    ` y ${productosDelFinanciamiento.length - 2} más`}
                </div>
              )}
            </div>
          ) : (
            <span className='text-gray-900'>{producto?.nombre || "-"}</span>
          )}
        </div>
        <div className='flex items-center gap-2 text-gray-700'>
          <span className='font-semibold'>💵 Monto total:</span>
          <span className='text-gray-900 font-semibold'>
            ${montoTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 text-gray-700'>
        <span className='font-semibold'>📅 Inicio:</span>
        <span className='text-gray-900'>
          {new Date(financiamiento.fechaInicio).toLocaleDateString()}
        </span>
      </div>

      {financiamiento.tipoVenta === "cuotas" && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3'>
          <div className='flex items-center gap-2 text-gray-700'>
            <span className='font-semibold'>⏳ Monto pendiente:</span>
            <span className='text-blue-600 font-bold'>
              ${montoPendiente.toFixed(2)}
            </span>
            <Tooltip text='Lo que falta por pagar de este financiamiento.' />
          </div>
          <div className='flex items-center gap-2 text-gray-700'>
            <span className='font-semibold'>⏰ Cuotas atrasadas:</span>
            <span className='text-red-700 font-bold'>{cuotasAtrasadas}</span>
            <Tooltip text='Cuotas vencidas y no pagadas de este financiamiento.' />
          </div>
          <div className='flex items-center gap-2 text-gray-700 sm:col-span-2'>
            <span className='font-semibold'>📋 Cuotas pendientes:</span>
            <span className='text-gray-900 font-semibold'>
              {cuotasPendientes}
            </span>
            <Tooltip text='Cuotas que faltan por pagar para completar el financiamiento.' />
          </div>
        </div>
      )}

      {/* Botón de abonar cuota solo para cuotas activas y si hay monto pendiente */}
      {financiamiento.tipoVenta === "cuotas" &&
        (financiamiento.estado === "activo" ||
          financiamiento.estado === "atrasado") &&
        montoPendiente > 0 &&
        cuotasPendientes > 0 && (
          <div className='mt-2'>
            <button
              className='w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold'
              onClick={() => setMostrarModalAbono(true)}
              disabled={abonando}
            >
              {abonando ? "Procesando..." : "Abonar cuota"}
            </button>
            <AbonarCuotaForm
              isOpen={mostrarModalAbono}
              onClose={() => setMostrarModalAbono(false)}
              montoFinanciamiento={financiamiento.monto}
              cuotasTotales={financiamiento.cuotas}
              loading={abonando}
              onSubmit={onAbonarCuota}
              error={
                montoAbono <= 0 || isNaN(montoAbono)
                  ? "Ingresa un monto válido"
                  : undefined
              }
              numeroCuota={pagos.length + 1}
              totalCuotas={financiamiento.cuotas}
            />
          </div>
        )}

      {/* Mostrar estado pagado si el financiamiento está completado o no hay monto/cuotas pendientes */}
      {financiamiento.tipoVenta === "cuotas" &&
        (financiamiento.estado === "completado" ||
          montoPendiente === 0 ||
          cuotasPendientes === 0) && (
          <div className='mt-2 w-full sm:w-auto px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-center'>
            ✅ Financiamiento pagado
          </div>
        )}

      {/* Botón para mostrar/ocultar historial de pagos */}
      {financiamiento.tipoVenta === "cuotas" && (
        <div className='mt-2 border-t border-gray-100 pt-3'>
          <button
            type='button'
            className='text-indigo-600 font-semibold hover:underline focus:outline-none mb-2 text-sm'
            onClick={() => setMostrarHistorial((v: boolean) => !v)}
          >
            {mostrarHistorial
              ? "Ocultar historial de pagos"
              : "Ver historial de pagos"}
          </button>
          {mostrarHistorial && <HistorialPagos pagos={pagos} />}
        </div>
      )}

      {/* Detalle de productos múltiples */}
      {productosDelFinanciamiento && productosDelFinanciamiento.length > 1 && (
        <div className='mt-4 p-4 bg-gray-50 rounded-lg border'>
          <h4 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
            📋 Detalle de Productos ({productosDelFinanciamiento.length})
          </h4>
          <div className='space-y-2'>
            {productosDelFinanciamiento.map((item: any, index: number) => (
              <div
                key={index}
                className='flex justify-between items-center text-sm bg-white p-2 rounded border'
              >
                <span className='text-gray-800'>{item.nombre}</span>
                <div className='text-right text-gray-600'>
                  <div>
                    {item.cantidad} x ${item.precioUnitario.toFixed(2)}
                  </div>
                  <div className='font-semibold text-gray-800'>
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanciamientoCard;
