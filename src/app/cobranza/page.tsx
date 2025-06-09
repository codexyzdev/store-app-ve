"use client";

import { useState, useEffect } from "react";
import {
  prestamosDB,
  clientesDB,
  cobrosDB,
  Prestamo,
  Cliente,
  Cobro,
} from "@/lib/firebase/database";
import { calcularCuotasAtrasadas } from "@/utils/prestamos";
import Link from "next/link";

export default function CobranzaPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const unsubPrestamos = prestamosDB.suscribir(setPrestamos);
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubCobros = cobrosDB.suscribir
      ? cobrosDB.suscribir(setCobros)
      : () => {};

    // Simular carga
    setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubPrestamos();
      unsubClientes();
      unsubCobros();
    };
  }, []);

  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "-";
  };

  const getClienteTelefono = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.telefono : "";
  };

  const getCobrosPrestamo = (prestamoId: string) => {
    return cobros.filter(
      (c) => c.prestamoId === prestamoId && c.tipo === "cuota"
    );
  };

  // Filtrar préstamos con cuotas atrasadas
  const prestamosAtrasados = prestamos
    .filter((p) => p.tipoVenta === "cuotas" && p.estado === "activo")
    .map((prestamo) => {
      const cobrosPrestamo = getCobrosPrestamo(prestamo.id);
      const cuotasAtrasadas = calcularCuotasAtrasadas(prestamo, cobrosPrestamo);
      const clienteNombre = getClienteNombre(prestamo.clienteId);
      const clienteTelefono = getClienteTelefono(prestamo.clienteId);

      return {
        ...prestamo,
        cuotasAtrasadas,
        clienteNombre,
        clienteTelefono,
        cobrosValidos: cobrosPrestamo,
      };
    })
    .filter((p) => p.cuotasAtrasadas > 0)
    .filter(
      (p) =>
        busqueda === "" ||
        p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.clienteTelefono.includes(busqueda)
    )
    .sort((a, b) => b.cuotasAtrasadas - a.cuotasAtrasadas);

  const totalAtrasadas = prestamosAtrasados.reduce(
    (sum, p) => sum + p.cuotasAtrasadas,
    0
  );
  const montoTotalAtrasado = prestamosAtrasados.reduce((sum, p) => {
    const valorCuota = p.monto / p.cuotas;
    return sum + valorCuota * p.cuotasAtrasadas;
  }, 0);

  const formatFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getDiasAtraso = (prestamo: any) => {
    const hoy = new Date();
    const fechaInicio = new Date(prestamo.fechaInicio);
    const cuotasPagadas = prestamo.cobrosValidos.length;
    const cuotasDeberianEstarPagadas =
      Math.floor(
        (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
      ) + 1;

    if (cuotasDeberianEstarPagadas > cuotasPagadas) {
      const cuotasAtrasadas = cuotasDeberianEstarPagadas - cuotasPagadas;
      return Math.min(cuotasAtrasadas * 30, 180); // Máximo 6 meses
    }
    return 0;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>
                Cargando información de cobranza...
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
                Gestión de Cobranza
              </h1>
              <p className='text-gray-600 text-lg'>
                Clientes con cuotas atrasadas que requieren seguimiento
              </p>
            </div>

            <div className='flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200'>
              <span className='text-2xl'>📊</span>
              <div>
                <p className='text-sm text-gray-600'>Estado General</p>
                <p
                  className={`font-semibold ${
                    prestamosAtrasados.length === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {prestamosAtrasados.length === 0
                    ? "Al día"
                    : "Requiere atención"}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-8'>
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-red-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>⚠️</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-red-600'>
                    {prestamosAtrasados.length}
                  </p>
                  <p className='text-sm text-gray-600'>Clientes con Atraso</p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-sm border border-amber-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>📋</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-amber-600'>
                    {totalAtrasadas}
                  </p>
                  <p className='text-sm text-gray-600'>Cuotas Atrasadas</p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-sm border border-purple-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>💰</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-purple-600'>
                    ${montoTotalAtrasado.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-600'>Monto Atrasado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
            <div className='flex-1 w-full lg:max-w-md'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <span className='text-gray-400 text-lg'>🔍</span>
                </div>
                <input
                  type='text'
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder='Buscar por nombre o teléfono del cliente...'
                  className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                />
              </div>
            </div>

            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{prestamosAtrasados.length}</span>{" "}
              resultados encontrados
            </div>
          </div>
        </div>

        {/* Lista de cobranza */}
        {prestamosAtrasados.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-6xl mb-4 block'>🎉</span>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                ¡Excelente! No hay cuotas atrasadas
              </h3>
              <p className='text-gray-600 mb-6'>
                Todos los clientes están al día con sus pagos
              </p>
              <Link
                href='/prestamos'
                className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
              >
                <span>💰</span>
                Ver Préstamos
              </Link>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {prestamosAtrasados.map((prestamo, index) => {
              const valorCuota = prestamo.monto / prestamo.cuotas;
              const montoAtrasado = valorCuota * prestamo.cuotasAtrasadas;
              const diasAtraso = getDiasAtraso(prestamo);
              const severidad =
                prestamo.cuotasAtrasadas > 2
                  ? "alta"
                  : prestamo.cuotasAtrasadas > 1
                  ? "media"
                  : "baja";

              return (
                <div
                  key={prestamo.id}
                  className='bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden group hover:-translate-y-1 transition-all duration-300'
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationName: "fadeInUp",
                    animationDuration: "0.6s",
                    animationTimingFunction: "ease-out",
                    animationFillMode: "forwards",
                  }}
                >
                  <div className='p-6'>
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                        {getInitials(prestamo.clienteNombre)}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-lg text-gray-900 truncate'>
                          {prestamo.clienteNombre}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          📞 {prestamo.clienteTelefono}
                        </p>
                      </div>

                      <div className='text-right'>
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            severidad === "alta"
                              ? "bg-red-100 text-red-700"
                              : severidad === "media"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          <span>
                            {severidad === "alta"
                              ? "🚨"
                              : severidad === "media"
                              ? "⚠️"
                              : "⏰"}
                          </span>
                          {severidad === "alta"
                            ? "Crítico"
                            : severidad === "media"
                            ? "Medio"
                            : "Bajo"}
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                      <div className='text-center p-3 bg-red-50 rounded-xl'>
                        <p className='text-sm text-gray-600'>
                          Cuotas Atrasadas
                        </p>
                        <p className='text-xl font-bold text-red-600'>
                          {prestamo.cuotasAtrasadas}
                        </p>
                      </div>
                      <div className='text-center p-3 bg-amber-50 rounded-xl'>
                        <p className='text-sm text-gray-600'>Monto Atrasado</p>
                        <p className='text-lg font-bold text-amber-600'>
                          ${montoAtrasado.toFixed(2)}
                        </p>
                      </div>
                      <div className='text-center p-3 bg-blue-50 rounded-xl'>
                        <p className='text-sm text-gray-600'>Valor Cuota</p>
                        <p className='text-lg font-bold text-blue-600'>
                          ${valorCuota.toFixed(2)}
                        </p>
                      </div>
                      <div className='text-center p-3 bg-purple-50 rounded-xl'>
                        <p className='text-sm text-gray-600'>Días de Atraso</p>
                        <p className='text-lg font-bold text-purple-600'>
                          ~{diasAtraso}
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-3'>
                      <Link
                        href={`/prestamos/${prestamo.clienteId}`}
                        className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200'
                      >
                        Ver Préstamo
                      </Link>
                      <button className='flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-xl font-medium transition-colors'>
                        📞 Contactar
                      </button>
                      <button className='flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 px-4 rounded-xl font-medium transition-colors'>
                        💰 Registrar Pago
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `,
        }}
      />
    </div>
  );
}
