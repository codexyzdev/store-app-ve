"use client";

import { useEffect, useState } from "react";
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
import { calcularCuotasAtrasadas } from "@/utils/prestamos";

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [vistaCards, setVistaCards] = useState(true);

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

  const getCobrosPrestamo = (prestamoId: string) => {
    return cobros.filter(
      (c) => c.prestamoId === prestamoId && c.tipo === "cuota"
    );
  };

  const getUltimaCuota = (prestamoId: string) => {
    const cobrosPrestamo = getCobrosPrestamo(prestamoId).sort(
      (a, b) => b.fecha - a.fecha
    );
    return cobrosPrestamo[0] || null;
  };

  // Calcular estadísticas
  const prestamosActivos = prestamos.filter(
    (p) =>
      p.tipoVenta === "cuotas" &&
      (p.estado === "activo" || p.estado === "atrasado")
  );
  const prestamosAtrasados = prestamosActivos.filter((p) => {
    const cuotasAtrasadas = calcularCuotasAtrasadas(p, getCobrosPrestamo(p.id));
    return cuotasAtrasadas > 0;
  });

  // Filtrar préstamos
  const prestamosFiltrados = prestamos.filter((prestamo) => {
    // Solo mostrar préstamos a cuotas
    if (prestamo.tipoVenta !== "cuotas") return false;

    // Filtro por estado
    if (filtroEstado !== "todos") {
      const cuotasAtrasadas = calcularCuotasAtrasadas(
        prestamo,
        getCobrosPrestamo(prestamo.id)
      );
      const estadoReal = cuotasAtrasadas > 0 ? "atrasado" : prestamo.estado;
      if (filtroEstado !== estadoReal) return false;
    }

    // Filtro por búsqueda
    const clienteNombre = getClienteNombre(prestamo.clienteId).toLowerCase();
    const clienteCedula = getClienteCedula(prestamo.clienteId).toLowerCase();
    const clienteTelefono = getClienteTelefono(prestamo.clienteId);
    const monto = prestamo.monto.toFixed(2);
    const productoNombre = getProductoNombre(prestamo.productoId).toLowerCase();

    return (
      clienteNombre.includes(busqueda.toLowerCase()) ||
      clienteCedula.includes(busqueda.toLowerCase()) ||
      clienteTelefono.includes(busqueda) ||
      monto.includes(busqueda) ||
      productoNombre.includes(busqueda.toLowerCase())
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
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex justify-center items-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              <p className='text-gray-600 font-medium'>Cargando préstamos...</p>
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
                Gestión de Préstamos
              </h1>
              <p className='text-gray-600 text-lg'>
                Administra y da seguimiento a todos los préstamos activos
              </p>
            </div>

            <Link
              href='/prestamos/nuevo'
              className='inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
            >
              <span className='text-xl'>💰</span>
              Nuevo Préstamo
            </Link>
          </div>

          {/* Estadísticas */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-blue-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>💰</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-600'>
                    {prestamosActivos.length}
                  </p>
                  <p className='text-sm text-gray-600'>Préstamos Activos</p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-sm border border-red-100'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center'>
                  <span className='text-xl text-white'>⚠️</span>
                </div>
                <div>
                  <p className='text-2xl font-bold text-red-600'>
                    {prestamosAtrasados.length}
                  </p>
                  <p className='text-sm text-gray-600'>Préstamos Atrasados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y controles */}
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
                  placeholder='Buscar por cliente, cédula, teléfono, monto o producto...'
                  className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                />
              </div>
            </div>

            <div className='flex gap-2 items-center'>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              >
                <option value='todos'>Todos los estados</option>
                <option value='activo'>Activos</option>
                <option value='atrasado'>Atrasados</option>
                <option value='completado'>Completados</option>
              </select>

              <button
                onClick={() => setVistaCards(true)}
                className={`p-3 rounded-lg transition-colors ${
                  vistaCards
                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title='Vista de tarjetas'
              >
                <span className='text-lg'>📋</span>
              </button>
              <button
                onClick={() => setVistaCards(false)}
                className={`p-3 rounded-lg transition-colors ${
                  !vistaCards
                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title='Vista de lista'
              >
                <span className='text-lg'>📝</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de préstamos */}
        {prestamosFiltrados.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <span className='text-6xl mb-4 block'>💰</span>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                {busqueda || filtroEstado !== "todos"
                  ? "No se encontraron préstamos"
                  : "No hay préstamos registrados"}
              </h3>
              <p className='text-gray-600 mb-6'>
                {busqueda || filtroEstado !== "todos"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primer préstamo en el sistema"}
              </p>
              {!busqueda && filtroEstado === "todos" && (
                <Link
                  href='/prestamos/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  <span>💰</span>
                  Crear Primer Préstamo
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              vistaCards
                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {prestamosFiltrados.map((prestamo, index) => {
              const clienteNombre = getClienteNombre(prestamo.clienteId);
              const clienteTelefono = getClienteTelefono(prestamo.clienteId);
              const productoNombre = getProductoNombre(prestamo.productoId);
              const cobrosValidos = getCobrosPrestamo(prestamo.id);
              const totalCobrado = cobrosValidos.reduce(
                (acc, cobro) => acc + cobro.monto,
                0
              );
              const montoPendiente = prestamo.monto - totalCobrado;
              const cuotasAtrasadas = calcularCuotasAtrasadas(
                prestamo,
                cobrosValidos
              );
              const valorCuota = prestamo.monto / prestamo.cuotas;
              const cuotasPagadas = cobrosValidos.length;
              const progreso = (totalCobrado / prestamo.monto) * 100;

              const estadoInfo =
                cuotasAtrasadas > 0
                  ? { color: "red", texto: "Atrasado", icon: "⚠️" }
                  : montoPendiente <= 0
                  ? { color: "green", texto: "Completado", icon: "✅" }
                  : { color: "blue", texto: "Al día", icon: "💰" };

              return vistaCards ? (
                // Vista de tarjetas
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
                    {/* Header del préstamo */}
                    <div className='flex items-center gap-4 mb-4'>
                      <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                        {getInitials(clienteNombre)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-lg text-gray-900 truncate'>
                          {clienteNombre}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {clienteTelefono}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700`}
                      >
                        <span className='mr-1'>{estadoInfo.icon}</span>
                        {estadoInfo.texto}
                      </div>
                    </div>

                    {/* Información del préstamo */}
                    <div className='space-y-3 mb-6'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Producto:</span>
                        <span className='text-sm font-medium text-gray-900 truncate ml-2'>
                          {productoNombre}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Monto total:
                        </span>
                        <span className='text-sm font-bold text-gray-900'>
                          ${prestamo.monto.toLocaleString()}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>
                          Pendiente:
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            montoPendiente > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          ${montoPendiente.toLocaleString()}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Cuotas:</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {cuotasPagadas}/{prestamo.cuotas} ($
                          {valorCuota.toFixed(2)} c/u)
                        </span>
                      </div>

                      {cuotasAtrasadas > 0 && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600'>
                            Atrasadas:
                          </span>
                          <span className='text-sm font-bold text-red-600'>
                            {cuotasAtrasadas} cuota
                            {cuotasAtrasadas > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Inicio:</span>
                        <span className='text-sm text-gray-900'>
                          {formatFecha(prestamo.fechaInicio)}
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
                    <div className='flex gap-2'>
                      <Link
                        href={`/prestamos/${prestamo.clienteId}`}
                        className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 text-sm'
                      >
                        Ver Detalle
                      </Link>
                      {montoPendiente > 0 && (
                        <button className='px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors text-sm font-medium'>
                          💰 Cobrar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Vista de lista
                <div
                  key={prestamo.id}
                  className='bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-4 group transition-all duration-200'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg'>
                      {getInitials(clienteNombre)}
                    </div>

                    <div className='flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2'>
                      <div>
                        <h3 className='font-semibold text-gray-900 truncate'>
                          {clienteNombre}
                        </h3>
                        <p className='text-xs text-gray-500'>
                          {clienteTelefono}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {productoNombre}
                        </p>
                        <p className='text-xs text-gray-500'>
                          ${prestamo.monto.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {cuotasPagadas}/{prestamo.cuotas}
                        </p>
                        <p className='text-xs text-gray-500'>
                          ${valorCuota.toFixed(2)} c/u
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

                    <div className='flex gap-2'>
                      <Link
                        href={`/prestamos/${prestamo.clienteId}`}
                        className='px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium'
                      >
                        Ver Detalle
                      </Link>
                      {montoPendiente > 0 && (
                        <button className='px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-sm'>
                          💰
                        </button>
                      )}
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
