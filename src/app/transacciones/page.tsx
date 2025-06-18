"use client";

import { useState, useEffect, useMemo } from "react";
import { financiamientoDB, FinanciamientoCuota } from "@/lib/firebase/database";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { formatNumeroControl } from "@/utils/format";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

interface EstadisticasTransacciones {
  totalTransacciones: number;
  montoTotal: number;
  promedio: number;
  transaccionesContado: number;
  transaccionesFinanciamiento: number;
  montoContado: number;
  montoFinanciamiento: number;
}

interface EstadisticasComparativas {
  actual: EstadisticasTransacciones;
  anterior: EstadisticasTransacciones;
  crecimientoTransacciones: number;
  crecimientoMonto: number;
}

interface FiltrosAvanzados {
  tipoVenta: "todos" | "contado" | "financiamiento";
  clienteId: string;
  busquedaTexto: string;
  montoMin: string;
  montoMax: string;
}

type OrdenColumna = "fecha" | "cliente" | "tipo" | "monto" | "numero";
type DireccionOrden = "asc" | "desc";

interface EstadoOrdenamiento {
  columna: OrdenColumna | null;
  direccion: DireccionOrden;
}

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<FinanciamientoCuota[]>([]);
  const { clientes } = useClientesRedux();

  // Rango de fechas
  const todayISO = new Date().toISOString().substring(0, 10);
  const [fechaInicio, setFechaInicio] = useState<string>(todayISO);
  const [fechaFin, setFechaFin] = useState<string>(todayISO);

  // Estados para filtros avanzados
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({
    tipoVenta: "todos",
    clienteId: "",
    busquedaTexto: "",
    montoMin: "",
    montoMax: "",
  });

  // Estados para ordenamiento y paginación
  const [ordenamiento, setOrdenamiento] = useState<EstadoOrdenamiento>({
    columna: "fecha",
    direccion: "desc",
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(10);

  // Suscripción a todas las transacciones
  useEffect(() => {
    const unsub = financiamientoDB.suscribir((fins) => {
      setTransacciones(fins);
    });
    return unsub;
  }, []);

  // Filtrar transacciones por fechas y filtros avanzados
  const transaccionesFiltradas = useMemo(() => {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    return transacciones.filter((t) => {
      // Filtro por fecha
      const fecha = new Date(t.fechaInicio);
      if (fecha < inicio || fecha > fin) return false;

      // Filtro por tipo de venta
      if (filtros.tipoVenta !== "todos" && t.tipoVenta !== filtros.tipoVenta) {
        return false;
      }

      // Filtro por cliente
      if (filtros.clienteId && t.clienteId !== filtros.clienteId) {
        return false;
      }

      // Filtro por búsqueda de texto (número de control o cliente)
      if (filtros.busquedaTexto) {
        const textoMinuscula = filtros.busquedaTexto.toLowerCase();
        const numeroControl = formatNumeroControl(
          t.numeroControl,
          t.tipoVenta === "contado" ? "C" : "F"
        ).toLowerCase();
        const cliente = getCliente(t.clienteId);
        const nombreCliente = cliente ? cliente.nombre.toLowerCase() : "";

        if (
          !numeroControl.includes(textoMinuscula) &&
          !nombreCliente.includes(textoMinuscula)
        ) {
          return false;
        }
      }

      // Filtro por rango de montos
      if (filtros.montoMin && t.monto < parseFloat(filtros.montoMin)) {
        return false;
      }
      if (filtros.montoMax && t.monto > parseFloat(filtros.montoMax)) {
        return false;
      }

      return true;
    });
  }, [transacciones, fechaInicio, fechaFin, filtros, clientes]);

  // Calcular estadísticas del periodo actual
  const estadisticasActuales = useMemo((): EstadisticasTransacciones => {
    const transaccionesContado = transaccionesFiltradas.filter(
      (t) => t.tipoVenta === "contado"
    );
    const transaccionesFinanciamiento = transaccionesFiltradas.filter(
      (t) => t.tipoVenta === "financiamiento"
    );

    const montoContado = transaccionesContado.reduce(
      (sum, t) => sum + t.monto,
      0
    );
    const montoFinanciamiento = transaccionesFinanciamiento.reduce(
      (sum, t) => sum + t.monto,
      0
    );
    const montoTotal = montoContado + montoFinanciamiento;

    return {
      totalTransacciones: transaccionesFiltradas.length,
      montoTotal,
      promedio:
        transaccionesFiltradas.length > 0
          ? montoTotal / transaccionesFiltradas.length
          : 0,
      transaccionesContado: transaccionesContado.length,
      transaccionesFinanciamiento: transaccionesFinanciamiento.length,
      montoContado,
      montoFinanciamiento,
    };
  }, [transaccionesFiltradas]);

  // Calcular estadísticas del periodo anterior para comparación
  const estadisticasComparativas = useMemo((): EstadisticasComparativas => {
    const inicioActual = new Date(fechaInicio);
    const finActual = new Date(fechaFin);
    const diasPeriodo =
      Math.ceil(
        (finActual.getTime() - inicioActual.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Calcular fechas del periodo anterior
    const finAnterior = new Date(inicioActual);
    finAnterior.setDate(finAnterior.getDate() - 1);
    const inicioAnterior = new Date(finAnterior);
    inicioAnterior.setDate(inicioAnterior.getDate() - diasPeriodo + 1);

    const transaccionesAnteriores = transacciones.filter((t) => {
      const fecha = new Date(t.fechaInicio);
      return fecha >= inicioAnterior && fecha <= finAnterior;
    });

    const transaccionesContadoAnt = transaccionesAnteriores.filter(
      (t) => t.tipoVenta === "contado"
    );
    const transaccionesFinanciamientoAnt = transaccionesAnteriores.filter(
      (t) => t.tipoVenta === "financiamiento"
    );

    const montoContadoAnt = transaccionesContadoAnt.reduce(
      (sum, t) => sum + t.monto,
      0
    );
    const montoFinanciamientoAnt = transaccionesFinanciamientoAnt.reduce(
      (sum, t) => sum + t.monto,
      0
    );
    const montoTotalAnt = montoContadoAnt + montoFinanciamientoAnt;

    const estadisticasAnteriores: EstadisticasTransacciones = {
      totalTransacciones: transaccionesAnteriores.length,
      montoTotal: montoTotalAnt,
      promedio:
        transaccionesAnteriores.length > 0
          ? montoTotalAnt / transaccionesAnteriores.length
          : 0,
      transaccionesContado: transaccionesContadoAnt.length,
      transaccionesFinanciamiento: transaccionesFinanciamientoAnt.length,
      montoContado: montoContadoAnt,
      montoFinanciamiento: montoFinanciamientoAnt,
    };

    // Calcular porcentajes de crecimiento
    const crecimientoTransacciones =
      estadisticasAnteriores.totalTransacciones > 0
        ? ((estadisticasActuales.totalTransacciones -
            estadisticasAnteriores.totalTransacciones) /
            estadisticasAnteriores.totalTransacciones) *
          100
        : estadisticasActuales.totalTransacciones > 0
        ? 100
        : 0;

    const crecimientoMonto =
      estadisticasAnteriores.montoTotal > 0
        ? ((estadisticasActuales.montoTotal -
            estadisticasAnteriores.montoTotal) /
            estadisticasAnteriores.montoTotal) *
          100
        : estadisticasActuales.montoTotal > 0
        ? 100
        : 0;

    return {
      actual: estadisticasActuales,
      anterior: estadisticasAnteriores,
      crecimientoTransacciones,
      crecimientoMonto,
    };
  }, [transacciones, fechaInicio, fechaFin, estadisticasActuales]);

  const getCliente = (id: string) => clientes.find((c) => c.id === id);

  // Ordenar transacciones
  const transaccionesOrdenadas = useMemo(() => {
    if (!ordenamiento.columna) return transaccionesFiltradas;

    return [...transaccionesFiltradas].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (ordenamiento.columna) {
        case "fecha":
          valorA = new Date(a.fechaInicio).getTime();
          valorB = new Date(b.fechaInicio).getTime();
          break;
        case "cliente":
          const clienteA = getCliente(a.clienteId);
          const clienteB = getCliente(b.clienteId);
          valorA = clienteA ? clienteA.nombre.toLowerCase() : "";
          valorB = clienteB ? clienteB.nombre.toLowerCase() : "";
          break;
        case "tipo":
          valorA = a.tipoVenta;
          valorB = b.tipoVenta;
          break;
        case "monto":
          valorA = a.monto;
          valorB = b.monto;
          break;
        case "numero":
          valorA = a.numeroControl;
          valorB = b.numeroControl;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return ordenamiento.direccion === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenamiento.direccion === "asc" ? 1 : -1;
      return 0;
    });
  }, [transaccionesFiltradas, ordenamiento, clientes]);

  // Paginación
  const transaccionesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return transaccionesOrdenadas.slice(inicio, fin);
  }, [transaccionesOrdenadas, paginaActual, elementosPorPagina]);

  const totalPaginas = Math.ceil(
    transaccionesOrdenadas.length / elementosPorPagina
  );

  // Función para manejar ordenamiento
  const handleOrdenar = (columna: OrdenColumna) => {
    setOrdenamiento((prev) => ({
      columna,
      direccion:
        prev.columna === columna && prev.direccion === "asc" ? "desc" : "asc",
    }));
    setPaginaActual(1); // Reset a primera página
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      tipoVenta: "todos",
      clienteId: "",
      busquedaTexto: "",
      montoMin: "",
      montoMax: "",
    });
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = useMemo(() => {
    return (
      filtros.tipoVenta !== "todos" ||
      filtros.clienteId !== "" ||
      filtros.busquedaTexto !== "" ||
      filtros.montoMin !== "" ||
      filtros.montoMax !== ""
    );
  }, [filtros]);

  // Generar descripción de filtros activos para el PDF

  // Componente para mostrar una estadística con ícono
  const EstadisticaCard = ({
    titulo,
    valor,
    icono: Icono,
    color,
    crecimiento,
  }: {
    titulo: string;
    valor: string;
    icono: any;
    color: string;
    crecimiento?: number;
  }) => (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ${color}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`p-3 rounded-lg ${color.replace(
              "border-l-4",
              "bg-opacity-10"
            )}`}
          >
            <Icono className='w-6 h-6' />
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-600'>{titulo}</h3>
            <p className='text-2xl font-bold text-gray-900'>{valor}</p>
          </div>
        </div>
        {crecimiento !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              crecimiento >= 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {crecimiento >= 0 ? (
              <ArrowTrendingUpIcon className='w-3 h-3' />
            ) : (
              <ArrowTrendingDownIcon className='w-3 h-3' />
            )}
            {Math.abs(crecimiento).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent text-center'>
          Transacciones
        </h1>

        {/* Filtros básicos de fechas */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-6'>
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

        {/* Botón para mostrar/ocultar filtros avanzados */}
        <div className='flex justify-center mb-6'>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              mostrarFiltros || hayFiltrosActivos
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white text-purple-600 border border-purple-300 hover:bg-purple-50"
            }`}
          >
            <FunnelIcon className='w-5 h-5' />
            Filtros Avanzados
            {hayFiltrosActivos && (
              <span className='bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-full'>
                {
                  [
                    filtros.tipoVenta !== "todos",
                    filtros.clienteId !== "",
                    filtros.busquedaTexto !== "",
                    filtros.montoMin !== "",
                    filtros.montoMax !== "",
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros avanzados */}
        {mostrarFiltros && (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                <FunnelIcon className='w-5 h-5 text-purple-600' />
                Filtros Avanzados
              </h3>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className='flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                >
                  <XMarkIcon className='w-4 h-4' />
                  Limpiar Filtros
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Búsqueda por texto */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Búsqueda General
                </label>
                <div className='relative'>
                  <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    placeholder='N° control, cliente...'
                    value={filtros.busquedaTexto}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        busquedaTexto: e.target.value,
                      }))
                    }
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  />
                </div>
              </div>

              {/* Filtro por tipo de venta */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tipo de Venta
                </label>
                <select
                  value={filtros.tipoVenta}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      tipoVenta: e.target.value as
                        | "todos"
                        | "contado"
                        | "financiamiento",
                    }))
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                >
                  <option value='todos'>Todos los tipos</option>
                  <option value='contado'>Solo Contado</option>
                  <option value='financiamiento'>Solo Financiamiento</option>
                </select>
              </div>

              {/* Filtro por cliente */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Cliente Específico
                </label>
                <select
                  value={filtros.clienteId}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      clienteId: e.target.value,
                    }))
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                >
                  <option value=''>Todos los clientes</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de montos */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Monto Mínimo
                </label>
                <input
                  type='number'
                  placeholder='$0'
                  value={filtros.montoMin}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      montoMin: e.target.value,
                    }))
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Monto Máximo
                </label>
                <input
                  type='number'
                  placeholder='Sin límite'
                  value={filtros.montoMax}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      montoMax: e.target.value,
                    }))
                  }
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                />
              </div>
            </div>

            {/* Resumen de filtros activos */}
            {hayFiltrosActivos && (
              <div className='mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200'>
                <h4 className='text-sm font-medium text-purple-800 mb-2'>
                  Filtros Activos:
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {filtros.tipoVenta !== "todos" && (
                    <span className='inline-flex items-center gap-1 px-3 py-1 bg-purple-200 text-purple-800 text-sm rounded-full'>
                      Tipo:{" "}
                      {filtros.tipoVenta === "contado"
                        ? "Contado"
                        : "Financiamiento"}
                      <button
                        onClick={() =>
                          setFiltros((prev) => ({
                            ...prev,
                            tipoVenta: "todos",
                          }))
                        }
                        className='ml-1 hover:bg-purple-300 rounded-full p-0.5'
                      >
                        <XMarkIcon className='w-3 h-3' />
                      </button>
                    </span>
                  )}
                  {filtros.clienteId && (
                    <span className='inline-flex items-center gap-1 px-3 py-1 bg-purple-200 text-purple-800 text-sm rounded-full'>
                      Cliente: {getCliente(filtros.clienteId)?.nombre}
                      <button
                        onClick={() =>
                          setFiltros((prev) => ({ ...prev, clienteId: "" }))
                        }
                        className='ml-1 hover:bg-purple-300 rounded-full p-0.5'
                      >
                        <XMarkIcon className='w-3 h-3' />
                      </button>
                    </span>
                  )}
                  {filtros.busquedaTexto && (
                    <span className='inline-flex items-center gap-1 px-3 py-1 bg-purple-200 text-purple-800 text-sm rounded-full'>
                      Búsqueda: "{filtros.busquedaTexto}"
                      <button
                        onClick={() =>
                          setFiltros((prev) => ({ ...prev, busquedaTexto: "" }))
                        }
                        className='ml-1 hover:bg-purple-300 rounded-full p-0.5'
                      >
                        <XMarkIcon className='w-3 h-3' />
                      </button>
                    </span>
                  )}
                  {(filtros.montoMin || filtros.montoMax) && (
                    <span className='inline-flex items-center gap-1 px-3 py-1 bg-purple-200 text-purple-800 text-sm rounded-full'>
                      Monto: ${filtros.montoMin || "0"} - $
                      {filtros.montoMax || "∞"}
                      <button
                        onClick={() =>
                          setFiltros((prev) => ({
                            ...prev,
                            montoMin: "",
                            montoMax: "",
                          }))
                        }
                        className='ml-1 hover:bg-purple-300 rounded-full p-0.5'
                      >
                        <XMarkIcon className='w-3 h-3' />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel de Estadísticas */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
            <ChartBarIcon className='w-6 h-6 text-purple-600' />
            Resumen del Periodo
            {hayFiltrosActivos && (
              <span className='text-sm font-normal text-purple-600 bg-purple-100 px-2 py-1 rounded-full'>
                (Filtrado)
              </span>
            )}
          </h2>

          {/* Estadísticas principales */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
            <EstadisticaCard
              titulo='Total Transacciones'
              valor={estadisticasActuales.totalTransacciones.toString()}
              icono={DocumentTextIcon}
              color='border-l-4 border-blue-500'
              crecimiento={estadisticasComparativas.crecimientoTransacciones}
            />
            <EstadisticaCard
              titulo='Monto Total'
              valor={`$${estadisticasActuales.montoTotal.toLocaleString()}`}
              icono={CurrencyDollarIcon}
              color='border-l-4 border-green-500'
              crecimiento={estadisticasComparativas.crecimientoMonto}
            />
            <EstadisticaCard
              titulo='Promedio por Transacción'
              valor={`$${Math.round(
                estadisticasActuales.promedio
              ).toLocaleString()}`}
              icono={ChartBarIcon}
              color='border-l-4 border-yellow-500'
            />
            <EstadisticaCard
              titulo='Periodo Comparado'
              valor={`${
                Math.ceil(
                  (new Date(fechaFin).getTime() -
                    new Date(fechaInicio).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1
              } días`}
              icono={CalendarDaysIcon}
              color='border-l-4 border-purple-500'
            />
          </div>

          {/* Distribución por tipo */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Ventas al Contado */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-emerald-100 rounded-lg'>
                  <BanknotesIcon className='w-6 h-6 text-emerald-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Ventas al Contado
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Transacciones inmediatas
                  </p>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Cantidad:</span>
                  <span className='font-semibold text-emerald-600'>
                    {estadisticasActuales.transaccionesContado}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Monto total:</span>
                  <span className='font-semibold text-emerald-600'>
                    ${estadisticasActuales.montoContado.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Promedio:</span>
                  <span className='font-semibold text-emerald-600'>
                    $
                    {estadisticasActuales.transaccionesContado > 0
                      ? Math.round(
                          estadisticasActuales.montoContado /
                            estadisticasActuales.transaccionesContado
                        ).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className='pt-2'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Porcentaje del total</span>
                    <span>
                      {estadisticasActuales.totalTransacciones > 0
                        ? Math.round(
                            (estadisticasActuales.transaccionesContado /
                              estadisticasActuales.totalTransacciones) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-emerald-500 h-2 rounded-full transition-all duration-500'
                      style={{
                        width: `${
                          estadisticasActuales.totalTransacciones > 0
                            ? (estadisticasActuales.transaccionesContado /
                                estadisticasActuales.totalTransacciones) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financiamientos */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 bg-blue-100 rounded-lg'>
                  <DocumentTextIcon className='w-6 h-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Financiamientos
                  </h3>
                  <p className='text-sm text-gray-600'>Ventas a cuotas</p>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Cantidad:</span>
                  <span className='font-semibold text-blue-600'>
                    {estadisticasActuales.transaccionesFinanciamiento}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Monto total:</span>
                  <span className='font-semibold text-blue-600'>
                    ${estadisticasActuales.montoFinanciamiento.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Promedio:</span>
                  <span className='font-semibold text-blue-600'>
                    $
                    {estadisticasActuales.transaccionesFinanciamiento > 0
                      ? Math.round(
                          estadisticasActuales.montoFinanciamiento /
                            estadisticasActuales.transaccionesFinanciamiento
                        ).toLocaleString()
                      : "0"}
                  </span>
                </div>
                <div className='pt-2'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Porcentaje del total</span>
                    <span>
                      {estadisticasActuales.totalTransacciones > 0
                        ? Math.round(
                            (estadisticasActuales.transaccionesFinanciamiento /
                              estadisticasActuales.totalTransacciones) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all duration-500'
                      style={{
                        width: `${
                          estadisticasActuales.totalTransacciones > 0
                            ? (estadisticasActuales.transaccionesFinanciamiento /
                                estadisticasActuales.totalTransacciones) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de transacciones */}
        {transaccionesOrdenadas.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <DocumentTextIcon className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>
              No hay transacciones
            </h3>
            <p className='text-gray-600 mb-4'>
              {hayFiltrosActivos
                ? "No se encontraron transacciones que coincidan con los filtros aplicados."
                : "No se encontraron transacciones en el rango de fechas seleccionado."}
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className='overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Detalle de Transacciones
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {transaccionesOrdenadas.length} transacciones encontradas
                    {hayFiltrosActivos && " (filtradas)"}
                  </p>
                </div>
              </div>
            </div>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4'>
                    <button
                      onClick={() => handleOrdenar("numero")}
                      className='flex items-center gap-2 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors'
                    >
                      N° Control
                      {ordenamiento.columna === "numero" &&
                        (ordenamiento.direccion === "asc" ? (
                          <ChevronUpIcon className='w-4 h-4' />
                        ) : (
                          <ChevronDownIcon className='w-4 h-4' />
                        ))}
                    </button>
                  </th>
                  <th className='px-6 py-4'>
                    <button
                      onClick={() => handleOrdenar("fecha")}
                      className='flex items-center gap-2 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors'
                    >
                      Fecha
                      {ordenamiento.columna === "fecha" &&
                        (ordenamiento.direccion === "asc" ? (
                          <ChevronUpIcon className='w-4 h-4' />
                        ) : (
                          <ChevronDownIcon className='w-4 h-4' />
                        ))}
                    </button>
                  </th>
                  <th className='px-6 py-4'>
                    <button
                      onClick={() => handleOrdenar("cliente")}
                      className='flex items-center gap-2 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors'
                    >
                      Cliente
                      {ordenamiento.columna === "cliente" &&
                        (ordenamiento.direccion === "asc" ? (
                          <ChevronUpIcon className='w-4 h-4' />
                        ) : (
                          <ChevronDownIcon className='w-4 h-4' />
                        ))}
                    </button>
                  </th>
                  <th className='px-6 py-4'>
                    <button
                      onClick={() => handleOrdenar("tipo")}
                      className='flex items-center gap-2 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors'
                    >
                      Tipo
                      {ordenamiento.columna === "tipo" &&
                        (ordenamiento.direccion === "asc" ? (
                          <ChevronUpIcon className='w-4 h-4' />
                        ) : (
                          <ChevronDownIcon className='w-4 h-4' />
                        ))}
                    </button>
                  </th>
                  <th className='px-6 py-4'>
                    <button
                      onClick={() => handleOrdenar("monto")}
                      className='flex items-center gap-2 text-right font-semibold text-gray-700 hover:text-gray-900 transition-colors ml-auto'
                    >
                      Monto
                      {ordenamiento.columna === "monto" &&
                        (ordenamiento.direccion === "asc" ? (
                          <ChevronUpIcon className='w-4 h-4' />
                        ) : (
                          <ChevronDownIcon className='w-4 h-4' />
                        ))}
                    </button>
                  </th>
                  <th className='px-6 py-4 text-left font-semibold text-gray-700'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {transaccionesPaginadas.map(
                  (t: FinanciamientoCuota, idx: number) => {
                    const cli = getCliente(t.clienteId);
                    return (
                      <tr
                        key={t.id}
                        className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-6 py-4 font-medium text-gray-900'>
                          {t.tipoVenta === "contado"
                            ? formatNumeroControl(t.numeroControl, "C")
                            : formatNumeroControl(t.numeroControl, "F")}
                        </td>
                        <td className='px-6 py-4 text-gray-700'>
                          {new Date(t.fechaInicio).toLocaleDateString("es-ES")}
                        </td>
                        <td className='px-6 py-4 text-gray-700'>
                          {cli ? cli.nombre : "Cliente eliminado"}
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              t.tipoVenta === "contado"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {t.tipoVenta === "contado"
                              ? "Contado"
                              : "Financiamiento"}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-right font-semibold text-gray-900'>
                          ${t.monto.toLocaleString()}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => {
                                if (t.tipoVenta === "financiamiento") {
                                  window.open(
                                    `/financiamiento-cuota/${t.id}`,
                                    "_blank"
                                  );
                                }
                              }}
                              className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600'
                              title='Ver detalles'
                            >
                              <EyeIcon className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => {
                                if (cli) {
                                  window.open(`/clientes/${cli.id}`, "_blank");
                                }
                              }}
                              className='p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-600'
                              title='Ver cliente'
                            >
                              <UserIcon className='w-4 h-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>
                <div className='text-sm text-gray-700'>
                  Mostrando {(paginaActual - 1) * elementosPorPagina + 1} -{" "}
                  {Math.min(
                    paginaActual * elementosPorPagina,
                    transaccionesOrdenadas.length
                  )}{" "}
                  de {transaccionesOrdenadas.length} transacciones
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() =>
                      setPaginaActual((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginaActual === 1}
                    className='px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Anterior
                  </button>

                  <div className='flex items-center gap-1'>
                    {Array.from(
                      { length: Math.min(totalPaginas, 5) },
                      (_, i) => {
                        let numerosPagina = [];
                        if (totalPaginas <= 5) {
                          numerosPagina = Array.from(
                            { length: totalPaginas },
                            (_, i) => i + 1
                          );
                        } else {
                          if (paginaActual <= 3) {
                            numerosPagina = [1, 2, 3, 4, 5];
                          } else if (paginaActual >= totalPaginas - 2) {
                            numerosPagina = [
                              totalPaginas - 4,
                              totalPaginas - 3,
                              totalPaginas - 2,
                              totalPaginas - 1,
                              totalPaginas,
                            ];
                          } else {
                            numerosPagina = [
                              paginaActual - 2,
                              paginaActual - 1,
                              paginaActual,
                              paginaActual + 1,
                              paginaActual + 2,
                            ];
                          }
                        }

                        return numerosPagina.map((num) => (
                          <button
                            key={num}
                            onClick={() => setPaginaActual(num)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              paginaActual === num
                                ? "bg-purple-600 text-white border-purple-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {num}
                          </button>
                        ));
                      }
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setPaginaActual((prev) =>
                        Math.min(prev + 1, totalPaginas)
                      )
                    }
                    disabled={paginaActual === totalPaginas}
                    className='px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
