"use client";

import React, { useEffect, useState } from "react";
import {
  financiamientoDB,
  FinanciamientoCuota,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";
import Link from "next/link";
import {
  ExclamationCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { calcularCuotasAtrasadas } from "@/utils/financiamiento";

interface FinanciamientoConDatos extends FinanciamientoCuota {
  cliente: Cliente;
  producto: Producto;
  cuotasAtrasadas: number;
  montoAtrasado: number;
  valorCuota: number;
  ultimaCuota: Cobro | null;
  diasAtraso: number;
  severidad: "baja" | "media" | "alta" | "critica";
}

export default function CuotasAtrasadasPage() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>(
    []
  );
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroSeveridad, setFiltroSeveridad] = useState<
    "todos" | "baja" | "media" | "alta" | "critica"
  >("todos");
  const [vistaCompacta, setVistaCompacta] = useState(false);

  useEffect(() => {
    const unsubFinanciamientos = financiamientoDB.suscribir((data) => {
      setFinanciamientos(
        data.filter((f) => f.tipoVenta === "cuotas" && f.estado === "activo")
      );
      setLoading(false);
    });
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubProductos = inventarioDB.suscribir(setProductos);
    const unsubCobros = cobrosDB.suscribir(setCobros);

    return () => {
      unsubFinanciamientos();
      unsubClientes();
      unsubProductos();
      unsubCobros();
    };
  }, []);

  // Funciones auxiliares
  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "-";
  };

  const getClienteTelefono = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.telefono : "";
  };

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : "-";
  };

  const getUltimaCuota = (financiamientoId: string) => {
    const cobrosFinanciamiento = cobros
      .filter(
        (c) => c.financiamientoId === financiamientoId && c.tipo === "cuota"
      )
      .sort((a, b) => b.fecha - a.fecha);
    return cobrosFinanciamiento[0] || null;
  };

  // Procesar datos y calcular información adicional
  const financiamientosConDatos: FinanciamientoConDatos[] = financiamientos
    .map((financiamiento) => {
      const cliente = clientes.find((c) => c.id === financiamiento.clienteId);
      const producto = productos.find(
        (p) => p.id === financiamiento.productoId
      );

      if (!cliente || !producto) return null;

      const cobrosFinanciamiento = cobros.filter(
        (c) => c.financiamientoId === financiamiento.id && c.tipo === "cuota"
      );

      const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
      const valorCuota = Math.round(
        financiamiento.monto / financiamiento.cuotas
      );
      const montoAtrasado = valorCuota * cuotasAtrasadas;

      const ultimaCuota =
        cobrosFinanciamiento.sort((a, b) => b.fecha - a.fecha)[0] || null;

      // Calcular días de atraso aproximados
      const fechaInicio = new Date(financiamiento.fechaInicio);
      const hoy = new Date();
      const semanasPasadas = Math.floor(
        (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      const cuotasPagadas = cobrosFinanciamiento.length;
      const cuotasQueDeberianEstarPagadas = Math.min(
        semanasPasadas,
        financiamiento.cuotas
      );
      const diasAtraso = Math.max(
        0,
        (cuotasQueDeberianEstarPagadas - cuotasPagadas) * 7
      );

      // Determinar severidad
      let severidad: "baja" | "media" | "alta" | "critica" = "baja";
      if (cuotasAtrasadas >= 8) severidad = "critica";
      else if (cuotasAtrasadas >= 5) severidad = "alta";
      else if (cuotasAtrasadas >= 3) severidad = "media";

      return {
        ...financiamiento,
        cliente,
        producto,
        cuotasAtrasadas,
        montoAtrasado,
        valorCuota,
        ultimaCuota,
        diasAtraso,
        severidad,
      };
    })
    .filter(
      (item): item is FinanciamientoConDatos =>
        item !== null && item.cuotasAtrasadas > 0
    );

  // Filtrar datos
  const financiamientosFiltrados = financiamientosConDatos.filter((item) => {
    // Filtro por severidad
    if (filtroSeveridad !== "todos" && item.severidad !== filtroSeveridad) {
      return false;
    }

    // Filtro por búsqueda
    if (busqueda) {
      const textoBusqueda = busqueda.toLowerCase();
      return (
        item.cliente.nombre.toLowerCase().includes(textoBusqueda) ||
        item.cliente.cedula.includes(textoBusqueda) ||
        item.cliente.telefono.includes(textoBusqueda) ||
        item.producto.nombre.toLowerCase().includes(textoBusqueda) ||
        item.numeroControl.toString().includes(textoBusqueda)
      );
    }

    return true;
  });

  // Ordenar por severidad y cuotas atrasadas
  const financiamientosOrdenados = financiamientosFiltrados.sort((a, b) => {
    const ordenSeveridad = { critica: 4, alta: 3, media: 2, baja: 1 };
    if (ordenSeveridad[a.severidad] !== ordenSeveridad[b.severidad]) {
      return ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad];
    }
    return b.cuotasAtrasadas - a.cuotasAtrasadas;
  });

  // Estadísticas globales
  const totalCuotasAtrasadas = financiamientosConDatos.reduce(
    (acc, item) => acc + item.cuotasAtrasadas,
    0
  );
  const totalMontoAtrasado = financiamientosConDatos.reduce(
    (acc, item) => acc + item.montoAtrasado,
    0
  );
  const clientesAfectados = new Set(
    financiamientosConDatos.map((item) => item.clienteId)
  ).size;

  const formatearTelefono = (telefono: string) => {
    const numeroLimpio = telefono.replace(/\D/g, "");
    return numeroLimpio.startsWith("58") ? numeroLimpio : `58${numeroLimpio}`;
  };

  const generarMensajeWhatsApp = (item: FinanciamientoConDatos) => {
    return encodeURIComponent(
      `Hola ${item.cliente.nombre}, espero que te encuentres bien.

Te escribo desde Los Tiburones para recordarte que tienes ${
        item.cuotasAtrasadas
      } cuota${item.cuotasAtrasadas > 1 ? "s" : ""} atrasada${
        item.cuotasAtrasadas > 1 ? "s" : ""
      } de tu financiamiento #F-${
        item.numeroControl
      } por un monto de $${item.montoAtrasado.toFixed(2)}.

📋 Detalles:
• Producto: ${item.producto.nombre}
• Valor por cuota: $${item.valorCuota.toFixed(2)}
• Cuotas atrasadas: ${item.cuotasAtrasadas}

¿Podrías ponerte al día con los pagos? Estoy aquí para ayudarte con cualquier duda o acordar un plan de pago.

Gracias por tu atención.
Los Tiburones 🦈`
    );
  };

  const getSeveridadConfig = (severidad: string) => {
    switch (severidad) {
      case "critica":
        return {
          color: "border-red-600 bg-red-50",
          textColor: "text-red-700",
          badge: "bg-red-600 text-white",
          icon: "🚨",
          texto: "CRÍTICO",
        };
      case "alta":
        return {
          color: "border-orange-500 bg-orange-50",
          textColor: "text-orange-700",
          badge: "bg-orange-500 text-white",
          icon: "⚠️",
          texto: "ALTO",
        };
      case "media":
        return {
          color: "border-yellow-500 bg-yellow-50",
          textColor: "text-yellow-700",
          badge: "bg-yellow-500 text-white",
          icon: "⚡",
          texto: "MEDIO",
        };
      default:
        return {
          color: "border-blue-500 bg-blue-50",
          textColor: "text-blue-700",
          badge: "bg-blue-500 text-white",
          icon: "📋",
          texto: "BAJO",
        };
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>
            Cargando cuotas atrasadas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center lg:text-left'>
          <h1 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>
            📊 Cuotas Atrasadas
          </h1>
          <p className='text-gray-600'>
            Gestión y seguimiento de pagos pendientes
          </p>
        </div>

        {/* Estadísticas Globales */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6'>
          <div className='bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-red-100 text-sm font-medium'>
                  Total Atrasado
                </p>
                <p className='text-3xl font-bold'>
                  ${totalMontoAtrasado.toFixed(2)}
                </p>
              </div>
              <div className='bg-red-400 bg-opacity-30 rounded-full p-3'>
                <span className='text-2xl'>💰</span>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-orange-100 text-sm font-medium'>
                  Cuotas Pendientes
                </p>
                <p className='text-3xl font-bold'>{totalCuotasAtrasadas}</p>
              </div>
              <div className='bg-orange-400 bg-opacity-30 rounded-full p-3'>
                <span className='text-2xl'>⏰</span>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-100 text-sm font-medium'>
                  Clientes Afectados
                </p>
                <p className='text-3xl font-bold'>{clientesAfectados}</p>
              </div>
              <div className='bg-blue-400 bg-opacity-30 rounded-full p-3'>
                <UsersIcon className='w-8 h-8' />
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between'>
            {/* Búsqueda */}
            <div className='relative flex-1 max-w-md'>
              <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                🔍
              </span>
              <input
                type='text'
                placeholder='Buscar por cliente, cédula, teléfono o producto...'
                value={busqueda}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBusqueda(e.target.value)
                }
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* Filtros */}
            <div className='flex flex-wrap gap-3'>
              <select
                value={filtroSeveridad}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFiltroSeveridad(e.target.value as any)
                }
                className='px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
              >
                <option value='todos'>Todas las severidades</option>
                <option value='critica'>🚨 Crítico</option>
                <option value='alta'>⚠️ Alto</option>
                <option value='media'>⚡ Medio</option>
                <option value='baja'>📋 Bajo</option>
              </select>

              <button
                onClick={() => setVistaCompacta(!vistaCompacta)}
                className={`px-4 py-3 rounded-xl border transition-colors ${
                  vistaCompacta
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {vistaCompacta ? "📋 Vista Normal" : "📊 Vista Compacta"}
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {financiamientosOrdenados.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>✅</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              ¡Excelente! No hay cuotas atrasadas
            </h3>
            <p className='text-gray-600'>
              Todos los financiamientos están al día con sus pagos.
            </p>
          </div>
        ) : vistaCompacta ? (
          /* Vista Compacta - Tabla */
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
                  {financiamientosOrdenados.map((item) => {
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
        ) : (
          /* Vista Detallada - Tarjetas */
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {financiamientosOrdenados.map((item, index) => {
              const config = getSeveridadConfig(item.severidad);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 ${config.color} overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* Header de la tarjeta */}
                  <div className={`px-6 py-4 ${config.color} border-b`}>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
                          <span className='text-2xl'>{config.icon}</span>
                        </div>
                        <div>
                          <h3
                            className={`font-bold text-lg ${config.textColor}`}
                          >
                            {item.cliente.nombre}
                          </h3>
                          <p
                            className={`text-sm opacity-80 ${config.textColor}`}
                          >
                            Cliente #{item.cliente.numeroControl} • C.I.{" "}
                            {item.cliente.cedula}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}
                      >
                        {config.texto}
                      </span>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className='p-6 space-y-4'>
                    {/* Información del producto */}
                    <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-xl'>
                      <span className='text-gray-500'>🏷️</span>
                      <div>
                        <p className='font-semibold text-gray-900'>
                          {item.producto.nombre}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Financiamiento #F-{item.numeroControl}
                        </p>
                      </div>
                    </div>

                    {/* Métricas principales */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='text-center p-4 bg-red-50 rounded-xl border border-red-200'>
                        <div className='text-3xl font-bold text-red-600 mb-1'>
                          {item.cuotasAtrasadas}
                        </div>
                        <div className='text-sm text-red-700 font-medium'>
                          Cuotas Atrasadas
                        </div>
                      </div>
                      <div className='text-center p-4 bg-orange-50 rounded-xl border border-orange-200'>
                        <div className='text-2xl font-bold text-orange-600 mb-1'>
                          ${item.montoAtrasado.toFixed(2)}
                        </div>
                        <div className='text-sm text-orange-700 font-medium'>
                          Monto Atrasado
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className='space-y-3 text-sm'>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600'>Valor por cuota:</span>
                        <span className='font-semibold'>
                          ${item.valorCuota.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600'>
                          Días aprox. de atraso:
                        </span>
                        <span className='font-semibold text-red-600'>
                          ~{item.diasAtraso} días
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-gray-600'>
                          Última cuota pagada:
                        </span>
                        <span className='font-semibold'>
                          {item.ultimaCuota
                            ? new Date(
                                item.ultimaCuota.fecha
                              ).toLocaleDateString()
                            : "Sin pagos"}
                        </span>
                      </div>
                      {item.cliente.telefono && (
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-600'>Teléfono:</span>
                          <span className='font-semibold'>
                            {item.cliente.telefono}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className='flex space-x-3 pt-4 border-t border-gray-200'>
                      <Link
                        href={`/financiamiento-cuota/${item.clienteId}`}
                        className='flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-2'
                      >
                        <span>👁️</span>
                        <span>Ver Detalles</span>
                      </Link>
                      {item.cliente.telefono && (
                        <a
                          href={`https://wa.me/${formatearTelefono(
                            item.cliente.telefono
                          )}?text=${generarMensajeWhatsApp(item)}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex-1 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-center flex items-center justify-center space-x-2'
                        >
                          <span>📱</span>
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        {financiamientosOrdenados.length > 0 && (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2'>
              <CalendarDaysIcon className='w-5 h-5' />
              <span>Resumen de Cobranza</span>
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Casos críticos:</span>
                <span className='ml-2 font-semibold text-red-600'>
                  {
                    financiamientosOrdenados.filter(
                      (item) => item.severidad === "critica"
                    ).length
                  }
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Casos alto riesgo:</span>
                <span className='ml-2 font-semibold text-orange-600'>
                  {
                    financiamientosOrdenados.filter(
                      (item) => item.severidad === "alta"
                    ).length
                  }
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Promedio por cuota:</span>
                <span className='ml-2 font-semibold'>
                  $
                  {financiamientosOrdenados.length > 0
                    ? (
                        financiamientosOrdenados.reduce(
                          (acc, item) => acc + item.valorCuota,
                          0
                        ) / financiamientosOrdenados.length
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div>
                <span className='text-gray-600'>Promedio de atraso:</span>
                <span className='ml-2 font-semibold'>
                  {financiamientosOrdenados.length > 0
                    ? Math.round(
                        financiamientosOrdenados.reduce(
                          (acc, item) => acc + item.cuotasAtrasadas,
                          0
                        ) / financiamientosOrdenados.length
                      )
                    : 0}{" "}
                  cuotas
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
