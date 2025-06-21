import React, { useState } from "react";
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
  index?: number;
  // Para múltiples financiamientos
  todosLosFinanciamientos?: Array<{
    financiamiento: FinanciamientoCuota;
    productoNombre: string;
    calculado: FinanciamientoCalculado;
  }>;
}

export const FinanciamientoCard = ({
  financiamiento,
  clienteInfo,
  productoNombre,
  calculado,
  index = 0,
  todosLosFinanciamientos = [],
}: FinanciamientoCardProps) => {
  const {
    montoPendiente,
    cuotasAtrasadas,
    valorCuota,
    cuotasPagadas,
    progreso,
    estadoInfo,
    tieneAmortizacion,
    montoAmortizacion,
  } = calculado;

  const tieneMultiplesFinanciamientos = todosLosFinanciamientos.length > 1;

  // Calcular resumen consolidado
  const calcularResumen = () => {
    if (!tieneMultiplesFinanciamientos) return null;

    return todosLosFinanciamientos.reduce(
      (acc, item) => {
        return {
          totalPendiente: acc.totalPendiente + item.calculado.montoPendiente,
          totalAmortizacion:
            acc.totalAmortizacion + (item.calculado.montoAmortizacion || 0),
          totalCuotasAtrasadas:
            acc.totalCuotasAtrasadas + item.calculado.cuotasAtrasadas,
          financiamientosActivos: acc.financiamientosActivos + 1,
          financiamientosConAmortizacion:
            acc.financiamientosConAmortizacion +
            (item.calculado.tieneAmortizacion ? 1 : 0),
        };
      },
      {
        totalPendiente: 0,
        totalAmortizacion: 0,
        totalCuotasAtrasadas: 0,
        financiamientosActivos: 0,
        financiamientosConAmortizacion: 0,
      }
    );
  };

  const resumenConsolidado = calcularResumen();

  const FinanciamientoItem = ({
    fin,
    prod,
    calc,
    esPrincipal = false,
  }: {
    fin: FinanciamientoCuota;
    prod: string;
    calc: FinanciamientoCalculado;
    esPrincipal?: boolean;
  }) => (
    <div
      className={`p-3 rounded-lg border ${
        esPrincipal
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-semibold text-gray-700'>
            {formatNumeroControl(
              fin.numeroControl,
              fin.tipoVenta === "cuotas" ? "F" : "C"
            )}
          </span>
          {esPrincipal && (
            <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium'>
              Principal
            </span>
          )}
          {calc.tieneAmortizacion && (
            <span className='px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium'>
              Amortización
            </span>
          )}
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-semibold bg-${calc.estadoInfo.color}-100 text-${calc.estadoInfo.color}-700`}
        >
          {calc.estadoInfo.icon} {calc.estadoInfo.texto}
        </div>
      </div>

      <div className='text-sm font-medium text-gray-900 mb-2 line-clamp-1'>
        {prod}
      </div>

      <div className='grid grid-cols-3 gap-2 text-xs'>
        <div>
          <span className='text-gray-500'>Monto:</span>
          <div className='font-semibold'>${fin.monto.toLocaleString()}</div>
        </div>
        <div>
          <span className='text-gray-500'>Pendiente:</span>
          <div
            className={`font-semibold ${
              calc.montoPendiente > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            ${calc.montoPendiente.toLocaleString()}
          </div>
        </div>
        <div>
          <span className='text-gray-500'>Progreso:</span>
          <div className='font-semibold'>{calc.progreso.toFixed(1)}%</div>
        </div>
      </div>

      {calc.cuotasAtrasadas > 0 && (
        <div className='mt-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium'>
          ⚠️ {calc.cuotasAtrasadas} cuota{calc.cuotasAtrasadas > 1 ? "s" : ""}{" "}
          atrasada{calc.cuotasAtrasadas > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );

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
        {/* Header del cliente */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-3'>
            {/* Info del financiamiento principal o badge de múltiples */}
            {tieneMultiplesFinanciamientos ? (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 font-medium'>
                  Financiamientos del Cliente:
                </span>
                <span className='px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-sm font-bold border border-purple-300'>
                  📊 {todosLosFinanciamientos.length}
                </span>
              </div>
            ) : (
              financiamiento.numeroControl && (
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
              )
            )}

            {/* Estado - solo para financiamiento único */}
            {!tieneMultiplesFinanciamientos && (
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700 border border-${estadoInfo.color}-200`}
              >
                <span className='mr-1'>{estadoInfo.icon}</span>
                {estadoInfo.texto}
              </div>
            )}
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
                V-{clienteInfo.cedula}
                {tieneMultiplesFinanciamientos && (
                  <span className='ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium'>
                    Cliente Premium
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Vista para MÚLTIPLES financiamientos */}
        {tieneMultiplesFinanciamientos ? (
          <>
            {/* Resumen consolidado */}
            {resumenConsolidado && (
              <div className='mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-sm font-semibold text-indigo-800'>
                    📈 Resumen Consolidado
                  </span>
                  <span className='text-xs text-indigo-600'>
                    {resumenConsolidado.financiamientosActivos} activos
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-white/50 rounded-lg p-2'>
                    <div className='text-xs text-indigo-600 mb-1'>
                      Total Pendiente
                    </div>
                    <div className='text-lg font-bold text-indigo-900'>
                      ${resumenConsolidado.totalPendiente.toLocaleString()}
                    </div>
                  </div>
                  <div className='bg-white/50 rounded-lg p-2'>
                    <div className='text-xs text-red-600 mb-1'>
                      Cuotas Atrasadas
                    </div>
                    <div className='text-lg font-bold text-red-900'>
                      {resumenConsolidado.totalCuotasAtrasadas}
                    </div>
                  </div>
                  {/* {resumenConsolidado.totalAmortizacion > 0 && (
                    <div className='bg-white/50 rounded-lg p-2 col-span-2'>
                      <div className='text-xs text-green-600 mb-1'>
                        Total Amortización
                      </div>
                      <div className='text-sm font-bold text-green-900'>
                        ${resumenConsolidado.totalAmortizacion.toLocaleString()}
                      </div>
                    </div>
                  )} esta parte no la quiero  */}
                </div>
              </div>
            )}

            {/* Lista de financiamientos con scroll siempre visible */}
            <div className='mb-4'>
              <div className='max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-3 pr-2'>
                {todosLosFinanciamientos.map((item, idx) => (
                  <div key={item.financiamiento.id}>
                    <FinanciamientoItem
                      fin={item.financiamiento}
                      prod={item.productoNombre}
                      calc={item.calculado}
                      esPrincipal={item.financiamiento.id === financiamiento.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Vista para UN SOLO financiamiento (diseño original) */
          <>
            {/* Información de amortización si existe
            {tieneAmortizacion && montoAmortizacion > 0 && (
              <div className='mb-4 bg-green-50 border border-green-200 rounded-lg p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-green-600 font-medium tracking-wide flex items-center gap-1'>
                    Amortización de Capital
                  </span>
                  <span className='text-sm font-bold text-green-900'>
                    ${montoAmortizacion.toLocaleString()}
                  </span>
                </div>
              </div>
            )} NO LA QUIERO   */}

            {/* Información del préstamo */}
            <div className='space-y-3 mb-6'>
              <div className='bg-gray-50 rounded-lg p-3'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                    Producto
                  </span>
                </div>
                <span className='text-sm font-semibold text-gray-900 line-clamp-2'>
                  {productoNombre}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-blue-50 rounded-lg p-3'>
                  <span className='text-xs text-blue-600 font-medium uppercase tracking-wide block mb-1'>
                    {tieneAmortizacion ? "Monto Financiado" : "Monto Total"}
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
                    <span className='text-sm text-green-700 font-medium px-2 py-1 flex items-center gap-2'>
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
          </>
        )}

        {/* Acciones */}
        <div className='pt-2'>
          <Link
            href={`/financiamiento-cuota/${financiamiento.clienteId}`}
            className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center gap-2'
          >
            <span>👁️</span>
            {tieneMultiplesFinanciamientos
              ? `Gestionar Todos (${todosLosFinanciamientos.length})`
              : "Ver Detalle"}
          </Link>
        </div>
      </div>
    </div>
  );
};

FinanciamientoCard.displayName = "FinanciamientoCard";
