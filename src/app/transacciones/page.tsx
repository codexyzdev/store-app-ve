"use client";

import { useState, useEffect, useMemo } from "react";
import { financiamientoDB, FinanciamientoCuota } from "@/lib/firebase/database";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { formatNumeroControl } from "@/utils/format";

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<FinanciamientoCuota[]>([]);
  const { clientes } = useClientesRedux();

  // Rango de fechas
  const todayISO = new Date().toISOString().substring(0, 10);
  const [fechaInicio, setFechaInicio] = useState<string>(todayISO);
  const [fechaFin, setFechaFin] = useState<string>(todayISO);

  // Suscripción a todas las transacciones
  useEffect(() => {
    const unsub = financiamientoDB.suscribir((fins) => {
      setTransacciones(fins);
    });
    return unsub;
  }, []);

  const transaccionesFiltradas = useMemo(() => {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    return transacciones.filter((t) => {
      const fecha = new Date(t.fechaInicio);
      return fecha >= inicio && fecha <= fin;
    });
  }, [transacciones, fechaInicio, fechaFin]);

  const getCliente = (id: string) => clientes.find((c) => c.id === id);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent text-center'>
          Transacciones
        </h1>

        {/* Filtro de fechas */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Desde
            </label>
            <input
              type='date'
              value={fechaInicio}
              max={fechaFin}
              onChange={(e) => setFechaInicio(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Hasta
            </label>
            <input
              type='date'
              value={fechaFin}
              min={fechaInicio}
              onChange={(e) => setFechaFin(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
            />
          </div>
        </div>

        {/* Tabla de transacciones */}
        {transaccionesFiltradas.length === 0 ? (
          <p className='text-center text-gray-600'>
            No hay transacciones en el rango seleccionado.
          </p>
        ) : (
          <div className='overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                    N°
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                    Fecha
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                    Cliente
                  </th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                    Tipo
                  </th>
                  <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {transaccionesFiltradas.map((t, idx) => {
                  const cli = getCliente(t.clienteId);
                  return (
                    <tr
                      key={t.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className='px-4 py-3'>
                        {t.tipoVenta === "contado"
                          ? formatNumeroControl(t.numeroControl, "C")
                          : formatNumeroControl(t.numeroControl, "F")}
                      </td>
                      <td className='px-4 py-3'>
                        {new Date(t.fechaInicio).toLocaleDateString("es-ES")}
                      </td>
                      <td className='px-4 py-3'>
                        {cli ? cli.nombre : "Cliente eliminado"}
                      </td>
                      <td className='px-4 py-3 capitalize'>{t.tipoVenta}</td>
                      <td className='px-4 py-3 text-right'>
                        ${t.monto.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
