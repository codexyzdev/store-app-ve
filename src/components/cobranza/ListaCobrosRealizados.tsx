import React from "react";
import { Cobro } from "@/lib/firebase/database";

interface GrupoCobros {
  clienteId: string;
  nombre: string;
  cedula: string;
  cobros: Cobro[];
}

interface ListaCobrosRealizadosProps {
  cobrosAgrupados: GrupoCobros[];
  onVerHistorial: (clienteId: string) => void;
  onImprimirRecibo: (cobro: Cobro) => void;
}

export default function ListaCobrosRealizados({
  cobrosAgrupados,
  onVerHistorial,
  onImprimirRecibo,
}: ListaCobrosRealizadosProps) {
  return (
    <div className='mb-8'>
      <h2 className='text-lg font-semibold mb-4'>Cobros realizados hoy</h2>
      {cobrosAgrupados.length === 0 ? (
        <div className='text-gray-500'>No hay cobros registrados hoy.</div>
      ) : (
        <div className='space-y-4'>
          {cobrosAgrupados.map((grupo) => (
            <div
              key={grupo.clienteId}
              className='bg-white shadow rounded-lg p-4'
            >
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <span className='font-bold text-indigo-700'>
                    {grupo.nombre}
                  </span>
                  <span className='ml-2 text-gray-500'>{grupo.cedula}</span>
                </div>
                <button
                  className='text-sm text-blue-600 hover:underline'
                  onClick={() => onVerHistorial(grupo.clienteId)}
                >
                  Ver historial
                </button>
              </div>
              <div className='space-y-2'>
                {grupo.cobros.map((cobro) => (
                  <div
                    key={cobro.id}
                    className='flex justify-between items-center border-b border-gray-100 py-2 last:border-0'
                  >
                    <span className='text-sm text-gray-700'>
                      {new Date(cobro.fecha).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      - ${cobro.monto.toFixed(2)}
                    </span>
                    <button
                      className='text-xs text-green-700 hover:underline'
                      onClick={() => onImprimirRecibo(cobro)}
                    >
                      Imprimir recibo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
