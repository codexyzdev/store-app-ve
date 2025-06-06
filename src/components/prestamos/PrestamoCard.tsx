import React, { useState } from "react";
import HistorialPagos from "@/components/prestamos/HistorialPagos";
import AbonarCuotaForm from "@/components/prestamos/AbonarCuotaForm";

interface PrestamoCardProps {
  prestamo: any;
  producto: any;
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
  onAbonarCuota: (data: any) => void;
  pagos: any[];
  Tooltip: React.FC<{ text: string }>;
}

const PrestamoCard: React.FC<PrestamoCardProps> = ({
  prestamo,
  producto,
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
    <div className='p-6 bg-white rounded-2xl shadow border border-gray-200 flex flex-col gap-4 min-h-[220px]'>
      <div className='flex flex-wrap gap-2 items-center mb-2'>
        {estadoPrincipal}
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
            prestamo.estado === "activo"
              ? "bg-green-100 text-green-800"
              : prestamo.estado === "completado"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {prestamo.tipoVenta === "contado" ? "Contado" : prestamo.estado}
        </span>
        <span className='ml-2 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700'>
          Tipo: {prestamo.tipoVenta === "contado" ? "Contado" : "Cuotas"}
        </span>
      </div>
      <div className='flex items-center gap-2 text-gray-700'>
        <span className='font-semibold'>📦 Producto:</span>
        <span className='text-gray-900'>{producto?.nombre || "-"}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-700'>
        <span className='font-semibold'>💵 Monto total:</span>
        <span className='text-gray-900'>${montoTotal.toFixed(2)}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-700'>
        <span className='font-semibold'>📅 Inicio:</span>
        <span className='text-gray-900'>
          {new Date(prestamo.fechaInicio).toLocaleDateString()}
        </span>
      </div>
      {prestamo.tipoVenta === "cuotas" && (
        <>
          <div className='flex items-center gap-2 text-gray-700'>
            <span className='font-semibold'>⏳ Monto pendiente:</span>
            <span className='text-gray-900'>${montoPendiente.toFixed(2)}</span>
            <Tooltip text='Lo que falta por pagar de este préstamo.' />
          </div>
          <div className='flex items-center gap-2 text-gray-700'>
            <span className='font-semibold'>⏰ Cuotas atrasadas:</span>
            <span className='text-red-700 font-bold'>{cuotasAtrasadas}</span>
            <Tooltip text='Cuotas vencidas y no pagadas de este préstamo.' />
          </div>
          <div className='flex items-center gap-2 text-gray-700'>
            <span className='font-semibold'>📋 Cuotas pendientes:</span>
            <span className='text-gray-900'>{cuotasPendientes}</span>
            <Tooltip text='Cuotas que faltan por pagar para completar el préstamo.' />
          </div>
        </>
      )}
      {/* Botón de abonar cuota solo para cuotas activas y si hay monto pendiente */}
      {prestamo.tipoVenta === "cuotas" &&
        prestamo.estado === "activo" &&
        montoPendiente > 0 &&
        cuotasPendientes > 0 && (
          <>
            <button
              className='mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-fit text-base'
              onClick={() => setMostrarModalAbono(true)}
              disabled={abonando}
            >
              Abonar cuota
            </button>
            <AbonarCuotaForm
              isOpen={mostrarModalAbono}
              onClose={() => setMostrarModalAbono(false)}
              montoPrestamo={prestamo.monto}
              cuotasTotales={prestamo.cuotas}
              loading={abonando}
              onSubmit={onAbonarCuota}
              error={
                montoAbono <= 0 || isNaN(montoAbono)
                  ? "Ingresa un monto válido"
                  : undefined
              }
              numeroCuota={pagos.length + 1}
              totalCuotas={prestamo.cuotas}
            />
          </>
        )}
      {/* Mostrar estado pagado si el préstamo está completado o no hay monto/cuotas pendientes */}
      {prestamo.tipoVenta === "cuotas" &&
        (prestamo.estado === "completado" ||
          montoPendiente === 0 ||
          cuotasPendientes === 0) && (
          <div className='mt-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold text-center w-full sm:w-fit'>
            ✅ Préstamo pagado
          </div>
        )}
      {/* Botón para mostrar/ocultar historial de pagos */}
      {prestamo.tipoVenta === "cuotas" && (
        <div className='mt-2'>
          <button
            type='button'
            className='text-indigo-600 font-semibold hover:underline focus:outline-none mb-2'
            onClick={() => setMostrarHistorial((v: boolean) => !v)}
          >
            {mostrarHistorial
              ? "Ocultar historial de pagos"
              : "Ver historial de pagos"}
          </button>
          {mostrarHistorial && <HistorialPagos pagos={pagos} />}
        </div>
      )}
    </div>
  );
};

export default PrestamoCard;
