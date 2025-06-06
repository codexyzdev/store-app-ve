import React from "react";
import { Prestamo } from "@/lib/firebase/database";

interface GrupoCobros {
  clienteId: string;
  nombre: string;
  cedula: string;
  cobros: any[];
}

interface TablaCobrosProps {
  cobrosAgrupados: GrupoCobros[];
  prestamos: Prestamo[];
}

export default function TablaCobros({
  cobrosAgrupados,
  prestamos,
}: TablaCobrosProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Cliente
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Cédula
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Cantidad de Cobros
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Monto Total
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {cobrosAgrupados.map((grupo) => (
            <tr key={grupo.clienteId}>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm font-medium text-gray-900'>
                  {grupo.nombre}
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-500'>{grupo.cedula}</div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-500'>
                  {grupo.cobros.length}
                </div>
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm text-gray-500'>
                  $
                  {grupo.cobros
                    .reduce((sum, cobro) => sum + cobro.monto, 0)
                    .toFixed(2)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
