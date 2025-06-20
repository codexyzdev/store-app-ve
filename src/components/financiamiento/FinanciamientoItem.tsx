import { memo } from "react";
import { FinanciamientoCuota } from "@/lib/firebase/database";
import { FinanciamientoSummaryCard } from "./FinanciamientoSummaryCard";
import { FinanciamientoActionsGrid } from "./FinanciamientoActionsGrid";
import CuadriculaCuotas from "./CuadriculaCuotas";
import HistorialPagos from "./HistorialPagos";
import ListaNotas from "../notas/ListaNotas";

interface FinanciamientoItemProps {
  financiamiento: FinanciamientoCuota;
  index: number;
  productoNombre: string;
  info: {
    valorCuota: number;
    totalCobrado: number;
    montoPendiente: number;
    cuotasAtrasadas: number;
    cuotasPagadas: number;
    progreso: number;
    totalCuotas?: number;
    cuotasPendientes?: number;
    cobrosIniciales?: number;
  };
  cobros: any[];
  onPagarCuota: () => void;
  onTogglePlan: () => void;
  onToggleHistorial: () => void;
  onImprimir: () => void;
  isPlanOpen: boolean;
  isHistorialOpen: boolean;
  cargando: boolean;
}

export const FinanciamientoItem = memo(
  ({
    financiamiento,
    index,
    productoNombre,
    info,
    cobros,
    onPagarCuota,
    onTogglePlan,
    onToggleHistorial,
    onImprimir,
    isPlanOpen,
    isHistorialOpen,
    cargando,
  }: FinanciamientoItemProps) => {
    const financiamientoInfo = {
      ...info,
      cuotasTotales: info.totalCuotas || financiamiento.cuotas,
      montoTotal: financiamiento.monto,
    };

    return (
      <div className='space-y-6'>
        {/* Tarjeta de resumen */}
        <FinanciamientoSummaryCard
          financiamientoInfo={financiamientoInfo}
          productoNombre={productoNombre}
          fechaInicio={financiamiento.fechaInicio}
          index={index}
        />

        {/* Grid de acciones en una tarjeta separada */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
          <FinanciamientoActionsGrid
            financiamientoId={financiamiento.id}
            montoPendiente={info.montoPendiente}
            onPagarCuota={onPagarCuota}
            onTogglePlan={onTogglePlan}
            onToggleHistorial={onToggleHistorial}
            onImprimir={onImprimir}
            isPlanOpen={isPlanOpen}
            isHistorialOpen={isHistorialOpen}
            cargando={cargando}
          />
        </div>

        {/* Plan de pagos - Mostrar solo si está abierto */}
        {isPlanOpen && (
          <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200'>
            <h4 className='text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2'>
              <span>📅</span>
              Plan de Pagos
            </h4>
            <CuadriculaCuotas
              fechaInicio={financiamiento.fechaInicio}
              cobros={cobros}
              valorCuota={info.valorCuota}
            />
          </div>
        )}

        {/* Historial de Pagos y Notas - Mostrar solo si está abierto */}
        {isHistorialOpen && (
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
            <div className='xl:col-span-2'>
              <HistorialPagos
                pagos={cobros}
                valorCuota={info.valorCuota}
                titulo={`Historial de Pagos - ${productoNombre}`}
              />
            </div>
            <div className='xl:col-span-1'>
              <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200'>
                <ListaNotas cobros={cobros} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FinanciamientoItem.displayName = "FinanciamientoItem";
