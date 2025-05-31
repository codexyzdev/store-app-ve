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

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPrestamos = prestamosDB.suscribir((data) => {
      setPrestamos(data);
      setLoading(false);
    });
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubProductos = inventarioDB.suscribir(setProductos);
    const unsubCobros = cobrosDB.suscribir
      ? cobrosDB.suscribir(setCobros)
      : () => {};
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

  // Obtener el último cobro de tipo 'cuota' para un préstamo
  const getUltimaCuota = (prestamoId: string) => {
    const cobrosPrestamo = cobros
      .filter((c) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a, b) => b.fecha - a.fecha);
    return cobrosPrestamo[0] || null;
  };

  // Determinar si hay alerta de pago pendiente
  const getAlertaPago = (prestamoId: string) => {
    const ultima = getUltimaCuota(prestamoId);
    if (!ultima) return true;
    const ahora = Date.now();
    const dosSemanas = 14 * 24 * 60 * 60 * 1000;
    return ahora - ultima.fecha > dosSemanas;
  };

  const handleAbonarCuota = async (prestamo: Prestamo) => {
    const montoDefault = (prestamo.monto / prestamo.cuotas).toFixed(2);
    const montoStr = prompt(
      `Monto a abonar (cuota sugerida: $${montoDefault}):`,
      montoDefault
    );
    if (!montoStr) return;
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      alert("Monto inválido");
      return;
    }
    try {
      await cobrosDB.crear({
        prestamoId: prestamo.id,
        monto,
        fecha: Date.now(),
        tipo: "cuota",
      });
      // Reducir cuotas pendientes
      const nuevasCuotas = prestamo.cuotas - 1;
      const nuevoEstado = nuevasCuotas <= 0 ? "completado" : prestamo.estado;
      await prestamosDB.actualizar(prestamo.id, {
        cuotas: nuevasCuotas,
        estado: nuevoEstado,
      });
      alert("Abono registrado y cuotas actualizadas");
    } catch (error) {
      alert("Error al registrar el abono");
      console.error(error);
    }
  };

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Préstamos</h1>
      {loading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
        </div>
      ) : (
        <div className='bg-white shadow rounded-lg overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Cliente
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Producto
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Monto
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Cuotas
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Inicio
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Estado
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Última cuota pagada
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Alerta
                </th>
                <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {prestamos.length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center py-8 text-gray-400'>
                    No hay préstamos registrados
                  </td>
                </tr>
              ) : (
                prestamos.map((prestamo) => (
                  <tr
                    key={prestamo.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-2'>
                      <Link
                        href={`/prestamos/${prestamo.clienteId}`}
                        className='text-indigo-600 hover:underline'
                      >
                        {getClienteNombre(prestamo.clienteId)}
                      </Link>
                    </td>
                    <td className='px-4 py-2'>
                      {getProductoNombre(prestamo.productoId)}
                    </td>
                    <td className='px-4 py-2'>${prestamo.monto.toFixed(2)}</td>
                    <td className='px-4 py-2'>{prestamo.cuotas}</td>
                    <td className='px-4 py-2'>
                      {new Date(prestamo.fechaInicio).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          prestamo.estado === "activo"
                            ? "bg-green-100 text-green-800"
                            : prestamo.estado === "completado"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prestamo.estado}
                      </span>
                    </td>
                    <td className='px-4 py-2'>
                      {(() => {
                        const ultima = getUltimaCuota(prestamo.id);
                        return ultima
                          ? new Date(ultima.fecha).toLocaleDateString()
                          : "Sin pagos";
                      })()}
                    </td>
                    <td className='px-4 py-2'>
                      {getAlertaPago(prestamo.id) ? (
                        <span className='px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800'>
                          Pendiente por pagar
                        </span>
                      ) : (
                        <span className='px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800'>
                          Al día
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-2'>
                      <button
                        className='px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold transition-colors'
                        onClick={() => handleAbonarCuota(prestamo)}
                      >
                        Abonar cuota
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
