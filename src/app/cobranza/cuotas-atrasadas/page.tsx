"use client";

import React, { useEffect, useState } from "react";
import { prestamosDB, Prestamo, clientesDB, Cliente, inventarioDB, Producto, cobrosDB, Cobro } from "@/lib/firebase/database";
import Link from 'next/link';

export default function CuotasAtrasadasPage() {
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
      .filter((c) => c.prestamoId === prestamoId && c.tipo === 'cuota')
      .sort((a, b) => b.fecha - a.fecha);
    return cobrosPrestamo[0] || null;
  };
  // Lógica para cuotas atrasadas semanales (máximo 15 cuotas)
  function calcularCuotasAtrasadas(prestamo: Prestamo) {
    if (prestamo.estado !== 'activo') return 0;
    const fechaInicio = new Date(prestamo.fechaInicio);
    const hoy = new Date();
    // Cuotas que deberían haberse pagado hasta hoy (semanales)
    const semanasTranscurridas = Math.floor((hoy.getTime() - fechaInicio.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const cuotasEsperadas = Math.min(semanasTranscurridas + 1, Math.min(prestamo.cuotas, 15));
    // Cuotas realmente pagadas
    const cuotasPagadas = cobros.filter(c => c.prestamoId === prestamo.id && c.tipo === 'cuota').length;
    return Math.max(0, cuotasEsperadas - cuotasPagadas);
  }

  const prestamosAtrasados = prestamos.filter(p => calcularCuotasAtrasadas(p) > 0);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cuotas Atrasadas</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cuotas atrasadas</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Última cuota pagada</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prestamosAtrasados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No hay cuotas atrasadas</td>
                </tr>
              ) : (
                prestamosAtrasados.map((prestamo) => (
                  <tr key={prestamo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/prestamos/${prestamo.clienteId}`} className="text-indigo-600 hover:underline">
                        {getClienteNombre(prestamo.clienteId)}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{getProductoNombre(prestamo.productoId)}</td>
                    <td className="px-4 py-2 text-red-700 font-bold">{calcularCuotasAtrasadas(prestamo)}</td>
                    <td className="px-4 py-2">
                      {(() => {
                        const ultima = getUltimaCuota(prestamo.id);
                        return ultima ? new Date(ultima.fecha).toLocaleDateString() : 'Sin pagos';
                      })()}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/prestamos/${prestamo.clienteId}`} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold transition-colors">
                        Ver cliente
                      </Link>
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
