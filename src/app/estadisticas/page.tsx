"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  clientesDB,
  financiamientoDB,
  cobrosDB,
  inventarioDB,
  Cliente,
  FinanciamientoCuota,
  Cobro,
  Producto,
} from "@/lib/firebase/database";

export default function EstadisticasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>(
    []
  );
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubFinanciamientos = financiamientoDB.suscribir(setFinanciamientos);
    const unsubCobros = cobrosDB.suscribir
      ? cobrosDB.suscribir(setCobros)
      : () => {};
    const unsubProductos = inventarioDB.suscribir(setProductos);

    setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubClientes();
      unsubFinanciamientos();
      unsubCobros();
      unsubProductos();
    };
  }, []);

  // Cálculos
  const financiamientosActivos = financiamientos.filter(
    (f: FinanciamientoCuota) => f.estado === "activo"
  );
  const financiamientosVencidos = financiamientos.filter(
    (f: FinanciamientoCuota) => f.estado === "atrasado"
  );
  const financiamientosCompletados = financiamientos.filter(
    (f: FinanciamientoCuota) => f.estado === "completado"
  );
  const totalFinanciamientos = financiamientos.length;
  const totalClientes = clientes.length;
  const totalProductos = productos.length;

  const totalCobros = cobros.reduce(
    (acc: number, c: Cobro) =>
      acc + (typeof c.monto === "number" ? c.monto : 0),
    0
  );

  const totalPendiente = financiamientosActivos.reduce(
    (acc: number, f: FinanciamientoCuota) => {
      const cobrosDelFinanciamiento = cobros.filter(
        (c: Cobro) => c.financiamientoId === f.id
      );
      const totalCobrado = cobrosDelFinanciamiento.reduce(
        (a: number, c: Cobro) =>
          a + (typeof c.monto === "number" ? c.monto : 0),
        0
      );
      return acc + Math.max(0, f.monto - totalCobrado);
    },
    0
  );

  const tasaCobranza =
    totalFinanciamientos > 0
      ? (financiamientosCompletados.length / totalFinanciamientos) * 100
      : 0;
  const ingresosMensuales = cobros
    .filter((c) => {
      const fecha = new Date(c.fecha);
      const ahora = new Date();
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    })
    .reduce((acc, c) => acc + c.monto, 0);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>
                Cargando estadísticas...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                Estadísticas y Reportes
              </h1>
              <p className='text-gray-600 text-lg'>
                Métricas en tiempo real del desempeño de tu negocio
              </p>
            </div>

            <div className='flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200'>
              <span className='text-2xl'>📈</span>
              <div>
                <p className='text-sm text-gray-600'>Última actualización</p>
                <p className='font-semibold text-gray-900'>
                  {new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-blue-100'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>📊</span>
              </div>
              <div>
                <p className='text-2xl font-bold text-blue-600'>
                  {totalFinanciamientos}
                </p>
                <p className='text-sm text-gray-600'>Total Financiamientos</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-6 shadow-sm border border-green-100'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>💰</span>
              </div>
              <div>
                <p className='text-2xl font-bold text-green-600'>
                  ${totalCobros.toLocaleString()}
                </p>
                <p className='text-sm text-gray-600'>Total Cobrado</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-6 shadow-sm border border-amber-100'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>⏳</span>
              </div>
              <div>
                <p className='text-2xl font-bold text-amber-600'>
                  ${totalPendiente.toLocaleString()}
                </p>
                <p className='text-sm text-gray-600'>Monto Pendiente</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-6 shadow-sm border border-purple-100'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>👥</span>
              </div>
              <div>
                <p className='text-2xl font-bold text-purple-600'>
                  {totalClientes}
                </p>
                <p className='text-sm text-gray-600'>Clientes Activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Tasa de Cobranza
              </h3>
              <span className='text-2xl'>📈</span>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600'>
                  Financiamientos completados
                </span>
                <span className='font-medium'>
                  {financiamientosCompletados.length}/{totalFinanciamientos}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div
                  className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out'
                  style={{ width: `${tasaCobranza}%` }}
                ></div>
              </div>
              <p className='text-right text-sm font-medium text-green-600'>
                {tasaCobranza.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Estado de Financiamientos
              </h3>
              <span className='text-2xl'>🎯</span>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Activos</span>
                <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium'>
                  {financiamientosActivos.length}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Completados</span>
                <span className='bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium'>
                  {financiamientosCompletados.length}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Atrasados</span>
                <span className='bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium'>
                  {financiamientosVencidos.length}
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Ingresos del Mes
              </h3>
              <span className='text-2xl'>💵</span>
            </div>
            <div className='space-y-3'>
              <p className='text-3xl font-bold text-green-600'>
                ${ingresosMensuales.toLocaleString()}
              </p>
              <p className='text-sm text-gray-600'>
                {new Date().toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-green-600'>📈</span>
                <span className='text-gray-600'>Dinero cobrado este mes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reportes detallados */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Reportes Detallados
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Link
              href='/estadisticas/clientes'
              className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group'
            >
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl text-white'>👥</span>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Por Cliente
                  </h3>
                  <p className='text-sm text-gray-600'>Ranking y detalles</p>
                </div>
              </div>
              <p className='text-gray-600 text-sm'>
                Visualiza el comportamiento de pago de cada cliente y identifica
                los mejores.
              </p>
              <div className='mt-4 flex items-center text-blue-600 text-sm font-medium'>
                Ver reporte <span className='ml-2'>→</span>
              </div>
            </Link>

            <Link
              href='/estadisticas/productos'
              className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group'
            >
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl text-white'>📦</span>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Por Producto
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Productos más vendidos
                  </p>
                </div>
              </div>
              <p className='text-gray-600 text-sm'>
                Analiza qué productos se financian más y generan mayores
                ingresos.
              </p>
              <div className='mt-4 flex items-center text-green-600 text-sm font-medium'>
                Ver reporte <span className='ml-2'>→</span>
              </div>
            </Link>

            <Link
              href='/estadisticas/fechas'
              className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group'
            >
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <span className='text-2xl text-white'>📅</span>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Por Fechas
                  </h3>
                  <p className='text-sm text-gray-600'>Evolución temporal</p>
                </div>
              </div>
              <p className='text-gray-600 text-sm'>
                Observa tendencias de ventas y cobros a lo largo del tiempo.
              </p>
              <div className='mt-4 flex items-center text-purple-600 text-sm font-medium'>
                Ver reporte <span className='ml-2'>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Resumen Rápido
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>
                Productos en Inventario
              </h4>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>📦</span>
                <div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {totalProductos}
                  </p>
                  <p className='text-sm text-gray-600'>Productos registrados</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>
                Actividad Reciente
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                  <span className='text-gray-600'>
                    Sistema funcionando correctamente
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                  <span className='text-gray-600'>
                    Datos actualizados en tiempo real
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
