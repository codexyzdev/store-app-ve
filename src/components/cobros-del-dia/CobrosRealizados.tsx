import React from "react";
import {
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { GrupoCobros } from "@/store/slices/cobrosDelDiaSlice";

interface CobrosRealizadosProps {
  cobrosAgrupados: GrupoCobros[];
}

export function CobrosRealizados({ cobrosAgrupados }: CobrosRealizadosProps) {
  if (cobrosAgrupados.length === 0) {
    return (
      <div className='text-center py-12 bg-white rounded-lg shadow'>
        <div className='text-gray-400 mb-4'>📋</div>
        <h3 className='text-lg font-semibold text-gray-600 mb-2'>
          Sin cobros realizados
        </h3>
        <p className='text-gray-500'>Aún no se han realizado cobros hoy</p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='divide-y divide-gray-200'>
        {cobrosAgrupados.map((grupo) => (
          <div key={grupo.clienteId} className='p-4'>
            <div className='flex items-center justify-between gap-4 mb-3'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircleIcon className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>
                    {grupo.nombre}
                  </h4>
                  <p className='text-sm text-gray-500'>{grupo.cedula}</p>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-lg font-bold text-green-600'>
                  ${grupo.totalCobrado.toFixed(2)}
                </div>
                <div className='text-xs text-gray-500'>
                  {grupo.cobros.length} cobro
                  {grupo.cobros.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Detalles de los cobros */}
            <div className='ml-13 space-y-2'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <PhoneIcon className='w-4 h-4 text-gray-400' />
                <span>{grupo.telefono}</span>
              </div>

              {/* Lista de cobros individuales */}
              <div className='bg-gray-50 rounded-lg p-3'>
                <h5 className='text-sm font-medium text-gray-700 mb-2'>
                  Cobros realizados:
                </h5>
                <div className='space-y-1'>
                  {grupo.cobros.map((cobro, index) => (
                    <div
                      key={cobro.id}
                      className='flex justify-between items-center text-sm'
                    >
                      <span className='text-gray-600'>
                        {cobro.tipo === "cuota"
                          ? `Cuota #${cobro.numeroCuota || index + 1}`
                          : "Pago"}
                        {cobro.descripcion && ` - ${cobro.descripcion}`}
                      </span>
                      <span className='font-medium text-green-600'>
                        ${cobro.monto.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
