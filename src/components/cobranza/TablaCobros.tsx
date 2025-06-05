import React from "react";
import { Cobro, Cliente, Prestamo } from "@/lib/firebase/database";
import ResumenCliente from "../prestamos/ResumenCliente";

interface GrupoCobros {
  clienteId: string;
  nombre: string;
  cedula: string;
  cobros: Cobro[];
}

interface TablaCobrosProps {
  cobrosAgrupados: GrupoCobros[];
  prestamos: Prestamo[];
}

export default function TablaCobros({
  cobrosAgrupados,
  prestamos,
}: TablaCobrosProps) {
  const getPrestamoInfo = (prestamoId: string) => {
    const prestamo = prestamos.find((p) => p.id === prestamoId);
    return prestamo ? `Préstamo #${prestamo.id.slice(0, 8)}` : "N/A";
  };

  return (
    <div className='bg-white shadow rounded-lg overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Cliente
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Préstamo
            </th>
            <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
              Monto
            </th>
            <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
              Hora
            </th>
            <th className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'>
              Tipo
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {cobrosAgrupados.length === 0 ? (
            <tr>
              <td colSpan={5} className='text-center py-8 text-gray-400'>
                No hay cobros registrados hoy
              </td>
            </tr>
          ) : (
            cobrosAgrupados.map((grupo) => (
              <React.Fragment key={grupo.clienteId}>
                {grupo.cobros.map((cobro) => (
                  <tr key={cobro.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <ResumenCliente
                        nombre={grupo.nombre}
                        cedula={grupo.cedula}
                      />
                    </td>
                    <td className='px-4 py-3'>
                      {getPrestamoInfo(cobro.prestamoId)}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      ${cobro.monto.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      {new Date(cobro.fecha).toLocaleTimeString()}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          cobro.tipo === "cuota"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {cobro.tipo === "cuota" ? "Cuota" : "Abono"}
                      </span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
