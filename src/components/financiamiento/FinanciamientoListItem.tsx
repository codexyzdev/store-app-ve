import { memo } from "react";
import Link from "next/link";
import { FinanciamientoCuota } from "@/lib/firebase/database";
import {
  FinanciamientoCalculado,
  ClienteInfo,
  getInitials,
} from "@/utils/financiamientoHelpers";

interface FinanciamientoListItemProps {
  financiamiento: FinanciamientoCuota;
  clienteInfo: ClienteInfo;
  productoNombre: string;
  calculado: FinanciamientoCalculado;
}

export const FinanciamientoListItem = memo(
  ({
    financiamiento,
    clienteInfo,
    productoNombre,
    calculado,
  }: FinanciamientoListItemProps) => {
    const { cuotasAtrasadas, valorCuota, cuotasPagadas, estadoInfo } =
      calculado;

    return (
      <div className='bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-4 group transition-all duration-200'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg'>
            {getInitials(clienteInfo.nombre)}
          </div>

          <div className='flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <h3 className='font-semibold text-gray-900 truncate'>
                  {clienteInfo.nombre}
                </h3>
                {financiamiento.numeroControl && (
                  <span className='px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded text-xs font-bold tracking-wide'>
                    F-
                    {financiamiento.numeroControl.toString().padStart(3, "0")}
                  </span>
                )}
              </div>
              <p className='text-xs text-gray-500 flex items-center gap-1'>
                <span>📱</span>
                {clienteInfo.telefono}
              </p>
            </div>

            <div>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {productoNombre}
              </p>
              <p className='text-xs text-gray-500'>
                ${financiamiento.monto.toLocaleString()}
              </p>
            </div>

            <div>
              <p className='text-sm font-medium text-gray-900'>
                {cuotasPagadas}/{financiamiento.cuotas}
              </p>
              <p className='text-xs text-gray-500'>
                ${valorCuota.toLocaleString()} c/u
              </p>
            </div>

            <div>
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700`}
              >
                <span>{estadoInfo.icon}</span>
                {estadoInfo.texto}
              </div>
              {cuotasAtrasadas > 0 && (
                <p className='text-xs text-red-600 mt-1'>
                  {cuotasAtrasadas} atrasada
                  {cuotasAtrasadas > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div>
            <Link
              href={`/financiamiento-cuota/${financiamiento.clienteId}`}
              className='px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2'
            >
              <span>👁️</span>
              Ver Detalle
            </Link>
          </div>
        </div>
      </div>
    );
  }
);

FinanciamientoListItem.displayName = "FinanciamientoListItem";
