import React from "react";
import { Prestamo } from "@/lib/firebase/database";

interface CobroPendiente {
  clienteId: string;
  nombre: string;
  cedula: string;
  monto: number;
  cuota: number;
  producto: string;
  telefono?: string;
}

interface ListaCobrosPendientesProps {
  pendientes: CobroPendiente[];
  onRegistrarCobro: (pendiente: CobroPendiente) => void;
  onContactarCliente: (pendiente: CobroPendiente) => void;
}

export default function ListaCobrosPendientes({
  pendientes,
  onRegistrarCobro,
  onContactarCliente,
}: ListaCobrosPendientesProps) {
  // Filtrar duplicados basados en clienteId y cuota
  const pendientesUnicos = pendientes.filter(
    (pendiente, index, array) =>
      array.findIndex(
        (p) =>
          p.clienteId === pendiente.clienteId &&
          p.cuota === pendiente.cuota &&
          p.producto === pendiente.producto
      ) === index
  );

  return (
    <div className='mb-8'>
      <h2 className='text-lg font-semibold mb-4'>Cobros pendientes para hoy</h2>
      {pendientesUnicos.length === 0 ? (
        <div className='text-gray-500'>No hay cobros pendientes para hoy.</div>
      ) : (
        <div className='space-y-4'>
          {pendientesUnicos.map((pendiente, index) => (
            <div
              key={`cobro-${pendiente.clienteId}-${pendiente.cuota}-${index}`}
              className='bg-yellow-50 shadow rounded-lg p-4'
            >
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <span className='font-bold text-indigo-700'>
                    {pendiente.nombre}
                  </span>
                  <span className='ml-2 text-gray-500'>{pendiente.cedula}</span>
                  <span className='ml-2 text-gray-500'>
                    {pendiente.producto}
                  </span>
                </div>
                {pendiente.telefono && (
                  <button
                    className='text-xs text-blue-700 hover:underline ml-2'
                    onClick={() => onContactarCliente(pendiente)}
                  >
                    Contactar
                  </button>
                )}
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-700'>
                  Cuota #{pendiente.cuota} - ${pendiente.monto.toFixed(2)}
                </span>
                <button
                  className='text-xs text-green-700 hover:underline'
                  onClick={() => onRegistrarCobro(pendiente)}
                >
                  Registrar cobro
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
