import React from "react";
import { Prestamo } from "@/lib/firebase/database";

interface GrupoCobros {
  clienteId: string;
  nombre: string;
  cedula: string;
  cobros: any[];
}

interface ListaCobrosProps {
  cobrosAgrupados: GrupoCobros[];
  prestamos: Prestamo[];
}

export default function ListaCobros({
  cobrosAgrupados,
  prestamos,
}: ListaCobrosProps) {
  return (
    <div className='mt-6 space-y-4'>
      {cobrosAgrupados.map((grupo) => (
        <div key={grupo.clienteId} className='bg-white shadow rounded-lg p-4'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='text-lg font-medium text-gray-900'>
              {grupo.nombre}
            </h3>
            <span className='text-sm text-gray-500'>{grupo.cedula}</span>
          </div>
          <div className='space-y-2'>
            {grupo.cobros.map((cobro, index) => (
              <div
                key={index}
                className='flex justify-between items-center py-2 border-b border-gray-100 last:border-0'
              >
                <div className='text-sm text-gray-600'>
                  {new Date(cobro.fecha).toLocaleString()}
                </div>
                <div className='text-sm font-medium text-gray-900'>
                  ${cobro.monto.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className='mt-2 pt-2 border-t border-gray-200'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Total: {grupo.cobros.length} cobros
              </span>
              <span className='text-sm font-medium text-gray-900'>
                $
                {grupo.cobros
                  .reduce((sum, cobro) => sum + cobro.monto, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
