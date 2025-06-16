import React from "react";
import Link from "next/link";
import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadasRedux";
import { getSeveridadConfig } from "@/utils/severidadUtils";
import {
  formatearTelefono,
  generarMensajeWhatsApp,
} from "@/utils/whatsappUtils";

interface TablaCompactaProps {
  financiamientos: FinanciamientoConDatos[];
}

export function TablaCompacta({ financiamientos }: TablaCompactaProps) {
  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Cliente
              </th>
              <th className='px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Producto
              </th>
              <th className='px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Cuotas Atrasadas
              </th>
              <th className='px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Monto Atrasado
              </th>
              <th className='px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Severidad
              </th>
              <th className='px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {financiamientos.map((item) => {
              const config = getSeveridadConfig(item.severidad);
              return (
                <tr
                  key={item.id}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-4 py-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-700 font-semibold text-sm'>
                          {item.cliente.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900'>
                          {item.cliente.nombre}
                        </p>
                        <p className='text-sm text-gray-500'>
                          #{item.cliente.numeroControl}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <p className='font-medium text-gray-900'>
                      {item.producto.nombre}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Financiamiento #F-{item.numeroControl}
                    </p>
                  </td>
                  <td className='px-4 py-4 text-center'>
                    <span className='text-2xl font-bold text-red-600'>
                      {item.cuotasAtrasadas}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-center'>
                    <span className='text-lg font-semibold text-gray-900'>
                      ${item.montoAtrasado.toFixed(2)}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-center'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}
                    >
                      {config.icon} {config.texto}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-center'>
                    <div className='flex justify-center space-x-2'>
                      <Link
                        href={`/financiamiento-cuota/${item.clienteId}`}
                        className='inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                      >
                        👁️ Ver
                      </Link>
                      {item.cliente.telefono && (
                        <a
                          href={`https://wa.me/${formatearTelefono(
                            item.cliente.telefono
                          )}?text=${generarMensajeWhatsApp(item)}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'
                        >
                          📱 WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
