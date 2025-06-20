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
  onAbrirCalendario: () => void;
  onAbrirHistorial: () => void;
  onImprimir: () => void;
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
    onAbrirCalendario,
    onAbrirHistorial,
    onImprimir,
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
            onAbrirCalendario={onAbrirCalendario}
            onAbrirHistorial={onAbrirHistorial}
            onImprimir={onImprimir}
            cargando={cargando}
          />
        </div>
      </div>
    );
  }
);

FinanciamientoItem.displayName = "FinanciamientoItem";
