"use client";

import React, { useEffect, useState } from "react";
import {
  prestamosDB,
  Prestamo,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";
import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { calcularCuotasAtrasadas } from "@/utils/prestamos";

export default function CuotasAtrasadasPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  // Calcular resumen global
  const prestamosAtrasados = prestamos.filter(
    (p) => calcularCuotasAtrasadas(p, cobros) > 0
  );
  const totalCuotasAtrasadas = prestamosAtrasados.reduce(
    (acc, p) => acc + calcularCuotasAtrasadas(p, cobros),
    0
  );
  const totalMontoAtrasado = prestamosAtrasados.reduce((acc, p) => {
    // Suma el monto de las cuotas atrasadas (asume monto/cuotas)
    const montoPorCuota = p.monto / p.cuotas;
    return acc + montoPorCuota * calcularCuotasAtrasadas(p, cobros);
  }, 0);

  useEffect(() => {
    const unsubPrestamos = prestamosDB.suscribir((data) => {
      setPrestamos(data);
      setLoading(false);
    });
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubProductos = inventarioDB.suscribir(setProductos);
    const unsubCobros = cobrosDB.suscribir(setCobros);
    return () => {
      unsubPrestamos();
      unsubClientes();
      unsubProductos();
      unsubCobros();
    };
  }, []);

  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "-";
  };
  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : "-";
  };
  const getUltimaCuota = (prestamoId: string) => {
    const cobrosPrestamo = cobros
      .filter((c) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a, b) => b.fecha - a.fecha);
    return cobrosPrestamo[0] || null;
  };

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Cuotas Atrasadas</h1>

      {/* Resumen global */}
      <div className='flex flex-wrap gap-4 mb-8'>
        <div className='flex-1 min-w-[220px] bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center shadow'>
          <span className='text-xs text-blue-700 font-semibold flex items-center gap-1'>
            Monto atrasado total
            <InformationCircleIcon
              className='w-4 h-4'
              title='Suma de todas las cuotas atrasadas'
            />
          </span>
          <span className='text-2xl font-bold text-blue-700 mt-1'>
            ${totalMontoAtrasado.toFixed(2)}
          </span>
        </div>
        <div className='flex-1 min-w-[220px] bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center shadow'>
          <span className='text-xs text-red-700 font-semibold flex items-center gap-1'>
            Cuotas atrasadas totales
            <InformationCircleIcon
              className='w-4 h-4'
              title='Cantidad total de cuotas atrasadas'
            />
          </span>
          <span className='text-2xl font-bold text-red-700 mt-1'>
            {totalCuotasAtrasadas}
          </span>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
        </div>
      ) : (
        <>
          {/* Tabla para escritorio */}
          <div className='bg-white shadow rounded-lg overflow-x-auto hidden md:block'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'
                  >
                    Cliente
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'
                  >
                    Producto
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'
                  >
                    Cuotas atrasadas
                    <span title='Cantidad de cuotas vencidas'>
                      <InformationCircleIcon className='inline w-4 h-4 ml-1 text-gray-400' />
                    </span>
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'
                  >
                    Monto atrasado
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'
                  >
                    Última cuota pagada
                  </th>
                  <th
                    scope='col'
                    className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase'
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {prestamosAtrasados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center py-8 text-gray-400'>
                      No hay cuotas atrasadas
                    </td>
                  </tr>
                ) : (
                  prestamosAtrasados.map((prestamo) => {
                    const cuotasAtrasadas = calcularCuotasAtrasadas(
                      prestamo,
                      cobros
                    );
                    const montoPorCuota = prestamo.monto / prestamo.cuotas;
                    const montoAtrasado = montoPorCuota * cuotasAtrasadas;
                    return (
                      <tr
                        key={prestamo.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          cuotasAtrasadas >= 3 ? "bg-red-50" : ""
                        }`}
                      >
                        <td className='px-4 py-2'>
                          <Link
                            href={`/prestamos/${prestamo.clienteId}`}
                            className='text-indigo-600 hover:underline font-semibold'
                          >
                            {getClienteNombre(prestamo.clienteId)}
                          </Link>
                        </td>
                        <td className='px-4 py-2'>
                          {getProductoNombre(prestamo.productoId)}
                        </td>
                        <td className='px-4 py-2 text-red-700 font-bold text-center'>
                          {cuotasAtrasadas}
                          {cuotasAtrasadas >= 5 && (
                            <span className='ml-2 inline-block px-2 py-0.5 bg-red-600 text-white text-xs rounded-full'>
                              ¡Crítico!
                            </span>
                          )}
                        </td>
                        <td className='px-4 py-2 text-blue-700 font-semibold text-center'>
                          {new Intl.NumberFormat("es-VE", {
                            style: "currency",
                            currency: "USD",
                          }).format(montoAtrasado)}
                        </td>
                        <td className='px-4 py-2 text-center'>
                          {(() => {
                            const ultima = getUltimaCuota(prestamo.id);
                            return ultima
                              ? new Date(ultima.fecha).toLocaleDateString()
                              : "Sin pagos";
                          })()}
                        </td>
                        <td className='px-4 py-2 text-center'>
                          <Link
                            href={`/prestamos/${prestamo.clienteId}`}
                            className='px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold transition-colors'
                            aria-label='Ver cliente'
                          >
                            Ver cliente
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para móvil */}
          <div className='md:hidden space-y-4'>
            {prestamosAtrasados.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                No hay cuotas atrasadas
              </div>
            ) : (
              prestamosAtrasados.map((prestamo) => {
                const cuotasAtrasadas = calcularCuotasAtrasadas(
                  prestamo,
                  cobros
                );
                const montoPorCuota = prestamo.monto / prestamo.cuotas;
                const montoAtrasado = montoPorCuota * cuotasAtrasadas;
                return (
                  <div
                    key={prestamo.id}
                    className={`bg-white shadow rounded-xl p-4 flex flex-col gap-2 border border-gray-100 ${
                      cuotasAtrasadas >= 3 ? "bg-red-50" : ""
                    }`}
                  >
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base'>
                        {getClienteNombre(prestamo.clienteId)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className='text-indigo-700 font-semibold'>
                          {getClienteNombre(prestamo.clienteId)}
                        </span>
                        <span className='ml-2 text-xs text-gray-500'>
                          C.I.:{" "}
                          {(() => {
                            const cliente = clientes.find(
                              (c) => c.id === prestamo.clienteId
                            );
                            return cliente ? cliente.cedula : "";
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-4 text-sm'>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Producto:
                        </span>{" "}
                        {getProductoNombre(prestamo.productoId)}
                      </div>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Cuotas atrasadas:
                        </span>{" "}
                        <span className='text-red-700 font-bold'>
                          {cuotasAtrasadas}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-4 text-sm'>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Monto atrasado:
                        </span>{" "}
                        <span className='text-blue-700 font-semibold'>
                          {new Intl.NumberFormat("es-VE", {
                            style: "currency",
                            currency: "USD",
                          }).format(montoAtrasado)}
                        </span>
                      </div>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Última cuota:
                        </span>{" "}
                        {(() => {
                          const ultima = getUltimaCuota(prestamo.id);
                          return ultima
                            ? new Date(ultima.fecha).toLocaleDateString()
                            : "Sin pagos";
                        })()}
                      </div>
                    </div>
                    <div className='flex justify-end mt-2'>
                      <Link
                        href={`/prestamos/${prestamo.clienteId}`}
                        className='px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-xs shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        aria-label='Ver cliente'
                      >
                        Ver cliente
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
