import React from "react";
import Link from "next/link";
import HistorialPagos from "@/components/financiamiento/HistorialPagos";
import AbonarCuotaForm from "@/components/financiamiento/AbonarCuotaForm";
import {
  FinanciamientoCuota,
  Cliente,
  Producto,
  Cobro,
} from "@/lib/firebase/database";
import {
  FinanciamientoCalculado,
  ClienteInfo,
  formatFecha,
  getInitials,
} from "@/utils/financiamientoHelpers";
import { formatNumeroControl } from "@/utils/format";

interface FinanciamientoCardProps {
  financiamiento: FinanciamientoCuota;
  clienteInfo: ClienteInfo;
  productoNombre: string;
  calculado: FinanciamientoCalculado;
  index: number;
}

export const FinanciamientoCard = ({
  financiamiento,
  clienteInfo,
  productoNombre,
  calculado,
  index,
}: FinanciamientoCardProps) => {
  const {
    montoPendiente,
    cuotasAtrasadas,
    valorCuota,
    cuotasPagadas,
    progreso,
    estadoInfo,
  } = calculado;

  return (
    <div
      className='bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden group hover:-translate-y-1 transition-all duration-300'
      style={{
        animationDelay: `${index * 100}ms`,
        animationName: "fadeInUp",
        animationDuration: "0.6s",
        animationTimingFunction: "ease-out",
        animationFillMode: "forwards",
      }}
    >
      <div className='p-6'>
        {/* Header del préstamo */}
        <div className='mb-4'>
          {/* Número de control y estado */}
          <div className='flex items-center justify-between mb-3'>
            {financiamiento.numeroControl && (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 font-medium'>
                  N° Control:
                </span>
                <span className='px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-lg text-sm font-bold tracking-wide'>
                  {formatNumeroControl(
                    financiamiento.numeroControl,
                    financiamiento.tipoVenta === "cuotas" ? "F" : "C"
                  )}
                </span>
              </div>
            )}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700 border border-${estadoInfo.color}-200`}
            >
              <span className='mr-1'>{estadoInfo.icon}</span>
              {estadoInfo.texto}
            </div>
          </div>

          {/* Cliente info */}
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg'>
              {getInitials(clienteInfo.nombre)}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-bold text-lg text-gray-900 truncate mb-1'>
                {clienteInfo.nombre}
              </h3>
              <p className='text-sm text-gray-600 flex items-center gap-1'>
                <span>📱</span>
                {clienteInfo.telefono}
              </p>
            </div>
          </div>
        </div>

        {/* Información del préstamo */}
        <div className='space-y-3 mb-6'>
          <div className='bg-gray-50 rounded-lg p-3'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                Producto
              </span>
            </div>
            <span className='text-sm font-semibold text-gray-900'>
              {productoNombre}
            </span>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-blue-50 rounded-lg p-3'>
              <span className='text-xs text-blue-600 font-medium uppercase tracking-wide block mb-1'>
                Monto Total
              </span>
              <span className='text-lg font-bold text-blue-900'>
                ${financiamiento.monto.toLocaleString()}
              </span>
            </div>

            <div
              className={`${
                montoPendiente > 0 ? "bg-red-50" : "bg-green-50"
              } rounded-lg p-3`}
            >
              <span
                className={`text-xs font-medium uppercase tracking-wide block mb-1 ${
                  montoPendiente > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                Pendiente
              </span>
              <span
                className={`text-lg font-bold ${
                  montoPendiente > 0 ? "text-red-900" : "text-green-900"
                }`}
              >
                ${montoPendiente.toLocaleString()}
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between py-2 border-b border-gray-100'>
            <span className='text-sm text-gray-600 flex items-center gap-2'>
              <span>📅</span>
              Cuotas:
            </span>
            <span className='text-sm font-semibold text-gray-900'>
              {cuotasPagadas}/{financiamiento.cuotas}
              <span className='text-xs text-gray-500 ml-1'>
                (${valorCuota.toLocaleString()} c/u)
              </span>
            </span>
          </div>

          <div
            className={`rounded-lg p-3 flex items-center justify-between ${
              cuotasAtrasadas > 0
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            {cuotasAtrasadas > 0 ? (
              <>
                <span className='text-sm text-red-700 font-medium flex items-center gap-2'>
                  <span>⚠️</span>
                  Cuotas Atrasadas:
                </span>
                <span className='text-sm font-bold text-red-800 bg-red-100 px-2 py-1 rounded'>
                  {cuotasAtrasadas} cuota
                  {cuotasAtrasadas > 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                <span className='text-sm text-green-700 font-medium px-2 py-1 flex items-center  gap-2'>
                  <span>✅</span>
                  Pagos al día
                </span>
              </>
            )}
          </div>

          <div className='flex items-center justify-between py-2'>
            <span className='text-sm text-gray-600 flex items-center gap-2'>
              <span>📅</span>
              Inicio:
            </span>
            <span className='text-sm font-medium text-gray-900'>
              {formatFecha(financiamiento.fechaInicio)}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className='mb-6'>
          <div className='flex justify-between text-sm text-gray-600 mb-2'>
            <span>Progreso del pago</span>
            <span>{progreso.toFixed(1)}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                progreso >= 100
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : cuotasAtrasadas > 0
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600"
              }`}
              style={{ width: `${Math.min(progreso, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Acciones */}
        <div className='pt-2'>
          <Link
            href={`/financiamiento-cuota/${financiamiento.clienteId}`}
            className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center gap-2'
          >
            <span>👁️</span>
            Ver Detalle
          </Link>
        </div>
      </div>
    </div>
  );
};

FinanciamientoCard.displayName = "FinanciamientoCard";
