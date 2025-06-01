"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  clientesDB,
  prestamosDB,
  cobrosDB,
  inventarioDB,
  Cliente,
  Prestamo,
  Cobro,
  Producto,
} from "@/lib/firebase/database";

export default function EstadisticasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientesDB.suscribir(setClientes);
    prestamosDB.suscribir(setPrestamos);
    cobrosDB.suscribir(setCobros);
    inventarioDB.suscribir(setProductos);
    setTimeout(() => setLoading(false), 1000); // Espera breve para cargar todo
  }, []);

  // Cálculos
  const prestamosActivos = prestamos.filter(
    (p: Prestamo) => p.estado === "activo"
  );
  const prestamosVencidos = prestamos.filter(
    (p: Prestamo) => p.estado === "atrasado"
  );
  const prestamosCompletados = prestamos.filter(
    (p: Prestamo) => p.estado === "completado"
  );
  const totalPrestamos = prestamos.length;
  const totalClientes = clientes.length;
  const totalProductos = productos.length;
  const totalCobros = cobros.reduce(
    (acc: number, c: Cobro) =>
      acc + (typeof c.monto === "number" ? c.monto : 0),
    0
  );
  const totalPendiente = prestamosActivos.reduce((acc: number, p: Prestamo) => {
    const producto = productos.find(
      (prod: Producto) => prod.id === p.productoId
    );
    const precioProducto =
      producto && typeof producto.precio === "number" ? producto.precio : 0;
    const montoTotal = precioProducto * 1.5;
    const abonos = cobros
      .filter((c: Cobro) => c.prestamoId === p.id)
      .reduce(
        (a: number, c: Cobro) =>
          a + (typeof c.monto === "number" ? c.monto : 0),
        0
      );
    return acc + Math.max(0, montoTotal - abonos);
  }, 0);

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-2'>Estadísticas</h1>
      <p className='mb-6'>
        Reportes y estadísticas en tiempo real del sistema.
      </p>

      {loading ? (
        <div>Cargando estadísticas...</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div className='border rounded p-4 shadow-sm bg-indigo-50'>
            <h2 className='text-lg font-semibold text-indigo-700'>
              Préstamos totales
            </h2>
            <p className='text-3xl font-bold'>{totalPrestamos}</p>
          </div>
          <div className='border rounded p-4 shadow-sm bg-green-50'>
            <h2 className='text-lg font-semibold text-green-700'>
              Total cobrado
            </h2>
            <p className='text-3xl font-bold'>${totalCobros.toFixed(2)}</p>
          </div>
          <div className='border rounded p-4 shadow-sm bg-yellow-50'>
            <h2 className='text-lg font-semibold text-yellow-700'>
              Monto pendiente
            </h2>
            <p className='text-3xl font-bold'>${totalPendiente.toFixed(2)}</p>
          </div>
          <div className='border rounded p-4 shadow-sm bg-blue-50'>
            <h2 className='text-lg font-semibold text-blue-700'>
              Clientes activos
            </h2>
            <p className='text-3xl font-bold'>{totalClientes}</p>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Link
          href='/estadisticas/clientes'
          className='border rounded p-4 shadow-sm hover:bg-indigo-100 transition block'
        >
          <h2 className='text-lg font-semibold'>Por Cliente</h2>
          <p>Ver ranking y detalles de clientes.</p>
        </Link>
        <Link
          href='/estadisticas/productos'
          className='border rounded p-4 shadow-sm hover:bg-green-100 transition block'
        >
          <h2 className='text-lg font-semibold'>Por Producto</h2>
          <p>Ver productos más financiados y montos.</p>
        </Link>
        <Link
          href='/estadisticas/fechas'
          className='border rounded p-4 shadow-sm hover:bg-yellow-100 transition block'
        >
          <h2 className='text-lg font-semibold'>Por Fechas</h2>
          <p>Ver evolución de cobros y préstamos.</p>
        </Link>
      </div>
    </div>
  );
}
