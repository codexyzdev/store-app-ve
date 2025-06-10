"use client";

import { useEffect, useState } from "react";
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
import { calcularCuotasAtrasadas } from "@/utils/financiamiento";
import { FinanciamientoStats } from "@/components/financiamiento/FinanciamientoStats";

export default function FinanciamientoCuotaPage() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>(
    []
  );
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [vistaCards, setVistaCards] = useState(true);

  useEffect(() => {
    const unsubFinanciamientos = financiamientoDB.suscribir((data) => {
      setFinanciamientos(data);
      setLoading(false);
    });
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubProductos = inventarioDB.suscribir(setProductos);
    const unsubCobros = cobrosDB.suscribir
      ? cobrosDB.suscribir(setCobros)
      : () => {};
    return () => {
      unsubFinanciamientos();
      unsubClientes();
      unsubProductos();
      unsubCobros();
    };
  }, []);

  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "-";
  };

  const getClienteCedula = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.cedula : "";
  };

  const getClienteTelefono = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.telefono : "";
  };

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : "Producto no encontrado";
  };

  const getCobrosFinanciamiento = (financiamientoId: string) => {
    return cobros.filter(
      (c) =>
        c.financiamientoId === financiamientoId &&
        (c.tipo === "cuota" || c.tipo === "inicial")
    );
  };

  // Calcular estadísticas
  const financiamientosActivos = financiamientos.filter(
    (f) =>
      f.tipoVenta === "cuotas" &&
      (f.estado === "activo" || f.estado === "atrasado")
  );

  // Filtrar financiamientos
  const financiamientosFiltrados = financiamientos.filter((financiamiento) => {
    // Solo mostrar financiamientos a cuotas
    if (financiamiento.tipoVenta !== "cuotas") return false;

    // Filtro por estado
    if (filtroEstado !== "todos") {
      const cuotasAtrasadas = calcularCuotasAtrasadas(
        financiamiento,
        getCobrosFinanciamiento(financiamiento.id)
      );
      const estadoReal =
        cuotasAtrasadas > 0 ? "atrasado" : financiamiento.estado;
      if (filtroEstado !== estadoReal) return false;
    }

    // Filtro por búsqueda
    const clienteNombre = getClienteNombre(
      financiamiento.clienteId
    ).toLowerCase();
    const clienteCedula = getClienteCedula(
      financiamiento.clienteId
    ).toLowerCase();
    const clienteTelefono = getClienteTelefono(financiamiento.clienteId);
    const monto = financiamiento.monto.toFixed(2);
    const productoNombre = getProductoNombre(
      financiamiento.productoId
    ).toLowerCase();
    const numeroControl = financiamiento.numeroControl?.toString() || "";

    return (
      clienteNombre.includes(busqueda.toLowerCase()) ||
      clienteCedula.includes(busqueda.toLowerCase()) ||
      clienteTelefono.includes(busqueda) ||
      monto.includes(busqueda) ||
      productoNombre.includes(busqueda.toLowerCase()) ||
      numeroControl.includes(busqueda)
    );
  });

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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>
                Cargando financiamientos...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='w-full'>
        {/* Hero Header Section */}
        <div className='bg-white shadow-sm border-b border-gray-100'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='text-center sm:text-left'>
                <div className='flex items-center justify-center sm:justify-start gap-3 mb-2'>
                  <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-700 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg'>
                    <span className='text-2xl sm:text-3xl text-white'>💰</span>
                  </div>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                    Financiamiento a Cuota
                  </h1>
                </div>
                <p className='text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl'>
                  Administra y da seguimiento a todos los financiamientos
                  activos
                </p>
              </div>
              <div className='flex justify-center sm:justify-end'>
                <Link
                  href='/financiamiento-cuota/nuevo'
                  className='w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
                >
                  <span className='text-xl'>💰</span>
                  <span className='hidden sm:inline'>Nuevo Financiamiento</span>
                  <span className='sm:hidden'>Nuevo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
          {/* Estadísticas */}
          <div className='mb-6 sm:mb-8'>
            <FinanciamientoStats
              financiamientos={financiamientos}
              cobros={cobros}
            />
          </div>

          {/* Filtros y controles */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8'>
            <div className='space-y-4'>
              {/* Search Bar */}
              <div className='w-full'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <span className='text-gray-400 text-lg'>🔍</span>
                  </div>
                  <input
                    type='text'
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder='Buscar por cliente, cédula, teléfono, monto, producto o número de control...'
                    className='w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base'
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                {/* Status Filter */}
                <div className='flex-1'>
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className='w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white'
                  >
                    <option value='todos'>📊 Todos los estados</option>
                    <option value='activo'>✅ Activos</option>
                    <option value='atrasado'>⚠️ Atrasados</option>
                    <option value='completado'>💚 Completados</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className='flex bg-gray-100 rounded-xl p-1 self-start'>
                  <button
                    onClick={() => setVistaCards(true)}
                    className={`p-2 sm:p-3 rounded-lg transition-colors ${
                      vistaCards
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title='Vista de tarjetas'
                  >
                    <span className='text-base sm:text-lg'>🔷</span>
                  </button>
                  <button
                    onClick={() => setVistaCards(false)}
                    className={`p-2 sm:p-3 rounded-lg transition-colors ${
                      !vistaCards
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title='Vista de lista'
                  >
                    <span className='text-base sm:text-lg'>📋</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de financiamientos */}
          {financiamientosFiltrados.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
              <div className='max-w-md mx-auto'>
                <span className='text-6xl mb-4 block'>💰</span>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  {busqueda || filtroEstado !== "todos"
                    ? "No se encontraron financiamientos"
                    : "No hay financiamientos registrados"}
                </h3>
                <p className='text-gray-600 mb-6'>
                  {busqueda || filtroEstado !== "todos"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Comienza creando tu primer financiamiento en el sistema"}
                </p>
                {!busqueda && filtroEstado === "todos" && (
                  <Link
                    href='/financiamiento-cuota/nuevo'
                    className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                  >
                    <span>💰</span>
                    Crear Primer Financiamiento
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div
              className={
                vistaCards
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6"
                  : "space-y-3 sm:space-y-4"
              }
            >
              {financiamientosFiltrados.map((financiamiento, index) => {
                const clienteNombre = getClienteNombre(
                  financiamiento.clienteId
                );
                const clienteTelefono = getClienteTelefono(
                  financiamiento.clienteId
                );
                const productoNombre = getProductoNombre(
                  financiamiento.productoId
                );
                const cobrosValidos = getCobrosFinanciamiento(
                  financiamiento.id
                );
                const totalCobrado = cobrosValidos.reduce(
                  (acc, cobro) => acc + cobro.monto,
                  0
                );
                const montoPendiente = financiamiento.monto - totalCobrado;
                const cuotasAtrasadas = calcularCuotasAtrasadas(
                  financiamiento,
                  cobrosValidos
                );
                const valorCuota = Math.round(
                  financiamiento.monto / financiamiento.cuotas
                );
                const cuotasPagadas = cobrosValidos.length;
                const progreso = (totalCobrado / financiamiento.monto) * 100;

                const estadoInfo =
                  cuotasAtrasadas > 0
                    ? { color: "red", texto: "Atrasado", icon: "⚠️" }
                    : montoPendiente <= 0
                    ? { color: "green", texto: "Completado", icon: "✅" }
                    : { color: "blue", texto: "Al día", icon: "💰" };

                return vistaCards ? (
                  // Vista de tarjetas
                  <div
                    key={financiamiento.id}
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
                      {/* Header del préstamo */}
                      <div className='mb-4'>
                        {/* Número de control y estado */}
                        <div className='flex items-center justify-between mb-3'>
                          {financiamiento.numeroControl && (
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-gray-500 font-medium'>
                                N° Control:
                              </span>
                              <span className='px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-lg text-sm font-bold tracking-wide'>
                                F-
                                {financiamiento.numeroControl
                                  .toString()
                                  .padStart(3, "0")}
                              </span>
                            </div>
                          )}
                          <div
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700 border border-${estadoInfo.color}-200`}
                          >
                            <span className='mr-1'>{estadoInfo.icon}</span>
                            {estadoInfo.texto}
                          </div>
                        </div>

                        {/* Cliente info */}
                        <div className='flex items-center gap-4'>
                          <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                            {getInitials(clienteNombre)}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-bold text-lg text-gray-900 truncate mb-1'>
                              {clienteNombre}
                            </h3>
                            <p className='text-sm text-gray-600 flex items-center gap-1'>
                              <span>📱</span>
                              {clienteTelefono}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información del préstamo */}
                      <div className='space-y-3 mb-6'>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                              Producto
                            </span>
                          </div>
                          <span className='text-sm font-semibold text-gray-900'>
                            {productoNombre}
                          </span>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          <div className='bg-blue-50 rounded-lg p-3'>
                            <span className='text-xs text-blue-600 font-medium uppercase tracking-wide block mb-1'>
                              Monto Total
                            </span>
                            <span className='text-lg font-bold text-blue-900'>
                              ${financiamiento.monto.toLocaleString()}
                            </span>
                          </div>

                          <div
                            className={`${
                              montoPendiente > 0 ? "bg-red-50" : "bg-green-50"
                            } rounded-lg p-3`}
                          >
                            <span
                              className={`text-xs font-medium uppercase tracking-wide block mb-1 ${
                                montoPendiente > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              Pendiente
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                montoPendiente > 0
                                  ? "text-red-900"
                                  : "text-green-900"
                              }`}
                            >
                              ${montoPendiente.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                          <span className='text-sm text-gray-600 flex items-center gap-2'>
                            <span>📅</span>
                            Cuotas:
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {cuotasPagadas}/{financiamiento.cuotas}
                            <span className='text-xs text-gray-500 ml-1'>
                              (${valorCuota.toLocaleString()} c/u)
                            </span>
                          </span>
                        </div>

                        {cuotasAtrasadas > 0 && (
                          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-red-700 font-medium flex items-center gap-2'>
                                <span>⚠️</span>
                                Cuotas Atrasadas:
                              </span>
                              <span className='text-sm font-bold text-red-800 bg-red-100 px-2 py-1 rounded'>
                                {cuotasAtrasadas} cuota
                                {cuotasAtrasadas > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className='flex items-center justify-between py-2'>
                          <span className='text-sm text-gray-600 flex items-center gap-2'>
                            <span>📅</span>
                            Inicio:
                          </span>
                          <span className='text-sm font-medium text-gray-900'>
                            {formatFecha(financiamiento.fechaInicio)}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className='mb-6'>
                        <div className='flex justify-between text-sm text-gray-600 mb-2'>
                          <span>Progreso del pago</span>
                          <span>{progreso.toFixed(1)}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3'>
                          <div
                            className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                              progreso >= 100
                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                : cuotasAtrasadas > 0
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : "bg-gradient-to-r from-blue-500 to-blue-600"
                            }`}
                            style={{ width: `${Math.min(progreso, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className='pt-2'>
                        <Link
                          href={`/financiamiento-cuota/${financiamiento.clienteId}`}
                          className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center gap-2'
                        >
                          <span>👁️</span>
                          Ver Detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Vista de lista
                  <div
                    key={financiamiento.id}
                    className='bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-4 group transition-all duration-200'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg'>
                        {getInitials(clienteNombre)}
                      </div>

                      <div className='flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2'>
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='font-semibold text-gray-900 truncate'>
                              {clienteNombre}
                            </h3>
                            {financiamiento.numeroControl && (
                              <span className='px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded text-xs font-bold tracking-wide'>
                                F-
                                {financiamiento.numeroControl
                                  .toString()
                                  .padStart(3, "0")}
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-gray-500 flex items-center gap-1'>
                            <span>📱</span>
                            {clienteTelefono}
                          </p>
                        </div>

                        <div>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {productoNombre}
                          </p>
                          <p className='text-xs text-gray-500'>
                            ${financiamiento.monto.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {cuotasPagadas}/{financiamiento.cuotas}
                          </p>
                          <p className='text-xs text-gray-500'>
                            ${valorCuota.toLocaleString()} c/u
                          </p>
                        </div>

                        <div>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700`}
                          >
                            <span>{estadoInfo.icon}</span>
                            {estadoInfo.texto}
                          </div>
                          {cuotasAtrasadas > 0 && (
                            <p className='text-xs text-red-600 mt-1'>
                              {cuotasAtrasadas} atrasada
                              {cuotasAtrasadas > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Link
                          href={`/financiamiento-cuota/${financiamiento.clienteId}`}
                          className='px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2'
                        >
                          <span>👁️</span>
                          Ver Detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
