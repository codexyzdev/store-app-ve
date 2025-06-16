"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  clientesDB,
  financiamientoDB,
  cobrosDB,
  inventarioDB,
  ventasContadoDB,
  Cliente,
  FinanciamientoCuota,
  Cobro,
  Producto,
  VentaContado,
} from "@/lib/firebase/database";

// Tipo unificado para los ingresos
interface IngresoUnificado {
  id: string;
  fecha: number;
  monto: number;
  tipo: "cobro" | "venta-contado";
  clienteId: string;
  financiamientoId?: string;
  numeroControl?: number;
  tipoPago?: string;
  comprobante?: string;
  descripcion?: string;
  numeroCuota?: number;
  nota?: string;
}

// Tipo para filtros de ingresos
interface FiltrosIngresos {
  fechaDesde: string;
  fechaHasta: string;
  tipoPago: string;
  tipoIngreso: string;
}

export default function EstadisticasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>(
    []
  );
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventasContado, setVentasContado] = useState<VentaContado[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para la sección de ingresos
  const [mostrarIngresos, setMostrarIngresos] = useState(false);
  const [filtrosIngresos, setFiltrosIngresos] = useState<FiltrosIngresos>({
    fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fechaHasta: new Date().toISOString().split("T")[0],
    tipoPago: "todos",
    tipoIngreso: "todos",
  });
  const [ingresoSeleccionado, setIngresoSeleccionado] =
    useState<IngresoUnificado | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const unsubClientes = clientesDB.suscribir(setClientes);
    const unsubFinanciamientos = financiamientoDB.suscribir(setFinanciamientos);
    const unsubCobros = cobrosDB.suscribir
      ? cobrosDB.suscribir(setCobros)
      : () => {};
    const unsubProductos = inventarioDB.suscribir(setProductos);
    const unsubVentasContado = ventasContadoDB.suscribir(setVentasContado);

    setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubClientes();
      unsubFinanciamientos();
      unsubCobros();
      unsubProductos();
      unsubVentasContado();
    };
  }, []);

  // Función para unificar ingresos (cobros + ventas al contado)
  const ingresosUnificados = useMemo((): IngresoUnificado[] => {
    const ingresos: IngresoUnificado[] = [];

    // Agregar cobros
    cobros.forEach((cobro) => {
      ingresos.push({
        id: cobro.id,
        fecha: cobro.fecha,
        monto: cobro.monto,
        tipo: "cobro",
        clienteId: cobro.financiamientoId
          ? financiamientos.find((f) => f.id === cobro.financiamientoId)
              ?.clienteId || ""
          : "",
        financiamientoId: cobro.financiamientoId,
        tipoPago: cobro.tipoPago || "efectivo",
        comprobante: cobro.comprobante,
        numeroCuota: cobro.numeroCuota,
        nota: cobro.nota,
      });
    });

    // Agregar ventas al contado
    ventasContado.forEach((venta) => {
      ingresos.push({
        id: venta.id,
        fecha: venta.fecha,
        monto: venta.monto,
        tipo: "venta-contado",
        clienteId: venta.clienteId,
        numeroControl: venta.numeroControl,
        descripcion: venta.descripcion,
      });
    });

    return ingresos.sort((a, b) => b.fecha - a.fecha);
  }, [cobros, ventasContado, financiamientos]);

  // Filtrar ingresos según criterios
  const ingresosFiltrados = useMemo(() => {
    const fechaDesdeMs = new Date(filtrosIngresos.fechaDesde).getTime();
    const fechaHastaMs = new Date(
      filtrosIngresos.fechaHasta + "T23:59:59"
    ).getTime();

    return ingresosUnificados.filter((ingreso: IngresoUnificado) => {
      // Filtro por fecha
      if (ingreso.fecha < fechaDesdeMs || ingreso.fecha > fechaHastaMs) {
        return false;
      }

      // Filtro por tipo de pago
      if (filtrosIngresos.tipoPago !== "todos") {
        if (
          ingreso.tipo === "cobro" &&
          ingreso.tipoPago !== filtrosIngresos.tipoPago
        ) {
          return false;
        }
        if (
          ingreso.tipo === "venta-contado" &&
          filtrosIngresos.tipoPago !== "efectivo"
        ) {
          return false; // Las ventas al contado se asumen como efectivo
        }
      }

      // Filtro por tipo de ingreso
      if (
        filtrosIngresos.tipoIngreso !== "todos" &&
        ingreso.tipo !== filtrosIngresos.tipoIngreso
      ) {
        return false;
      }

      return true;
    });
  }, [ingresosUnificados, filtrosIngresos]);

  // Calcular resumen de ingresos
  const resumenIngresos = useMemo(() => {
    const totalGeneral = ingresosFiltrados.reduce(
      (acc: number, ing: IngresoUnificado) => acc + ing.monto,
      0
    );
    const totalCobros = ingresosFiltrados
      .filter((ing: IngresoUnificado) => ing.tipo === "cobro")
      .reduce((acc: number, ing: IngresoUnificado) => acc + ing.monto, 0);
    const totalVentasContado = ingresosFiltrados
      .filter((ing: IngresoUnificado) => ing.tipo === "venta-contado")
      .reduce((acc: number, ing: IngresoUnificado) => acc + ing.monto, 0);

    const cobrosEfectivo = ingresosFiltrados
      .filter(
        (ing: IngresoUnificado) =>
          ing.tipo === "cobro" && ing.tipoPago === "efectivo"
      )
      .reduce((acc: number, ing: IngresoUnificado) => acc + ing.monto, 0);
    const cobrosTransferencia = ingresosFiltrados
      .filter(
        (ing: IngresoUnificado) =>
          ing.tipo === "cobro" && ing.tipoPago === "transferencia"
      )
      .reduce((acc: number, ing: IngresoUnificado) => acc + ing.monto, 0);

    return {
      totalGeneral,
      totalCobros,
      totalVentasContado,
      cobrosEfectivo,
      cobrosTransferencia,
      cantidadTransacciones: ingresosFiltrados.length,
    };
  }, [ingresosFiltrados]);

  // Función para obtener nombre del cliente
  const getNombreCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nombre : "Cliente no encontrado";
  };

  // Función para exportar datos
  const exportarDatos = () => {
    const csvContent = [
      [
        "Fecha",
        "Tipo",
        "Cliente",
        "Monto",
        "Forma de Pago",
        "Comprobante",
        "Notas",
      ].join(","),
      ...ingresosFiltrados.map((ing: IngresoUnificado) =>
        [
          new Date(ing.fecha).toLocaleDateString("es-ES"),
          ing.tipo === "cobro" ? "Cobro" : "Venta Contado",
          getNombreCliente(ing.clienteId),
          ing.monto,
          ing.tipoPago || "Efectivo",
          ing.comprobante || "",
          ing.nota || ing.descripcion || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ingresos_${filtrosIngresos.fechaDesde}_${filtrosIngresos.fechaHasta}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para establecer períodos rápidos
  const establecerPeriodoRapido = (tipo: string) => {
    const hoy = new Date();
    let fechaDesde = "";

    switch (tipo) {
      case "este-mes":
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        break;
      case "mes-anterior":
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const ultimoDiaMesAnterior = new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          0
        );
        fechaDesde = mesAnterior.toISOString().split("T")[0];
        setFiltrosIngresos((prev) => ({
          ...prev,
          fechaDesde,
          fechaHasta: ultimoDiaMesAnterior.toISOString().split("T")[0],
        }));
        return;
      case "ultimos-3-meses":
        fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1)
          .toISOString()
          .split("T")[0];
        break;
      case "este-ano":
        fechaDesde = new Date(hoy.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        break;
      default:
        return;
    }

    setFiltrosIngresos((prev) => ({
      ...prev,
      fechaDesde,
      fechaHasta: hoy.toISOString().split("T")[0],
    }));
  };

  // Cálculos existentes
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

            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200'>
                <span className='text-2xl'>📈</span>
                <div>
                  <p className='text-sm text-gray-600'>Última actualización</p>
                  <p className='font-semibold text-gray-900'>
                    {new Date().toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>

              {/* Botón para mostrar/ocultar sección de ingresos */}
              <button
                onClick={() => setMostrarIngresos(!mostrarIngresos)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  mostrarIngresos
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
                }`}
              >
                {mostrarIngresos
                  ? "📊 Ocultar Ingresos"
                  : "💰 Ver Ingresos Detallados"}
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
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
                <p className='text-sm text-gray-600'>Clientes Registrados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
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

        {/* Sección de Ingresos Detallados */}
        {mostrarIngresos && (
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
                <span className='text-3xl'>💰</span>
                Registro de Ingresos Detallado
              </h2>
              <button
                onClick={exportarDatos}
                className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2'
              >
                <span>📊</span>
                Exportar CSV
              </button>
            </div>

            {/* Filtros y períodos rápidos */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
              {/* Período rápido */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Períodos Rápidos
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => establecerPeriodoRapido("este-mes")}
                    className='px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                  >
                    Este Mes
                  </button>
                  <button
                    onClick={() => establecerPeriodoRapido("mes-anterior")}
                    className='px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                  >
                    Mes Anterior
                  </button>
                  <button
                    onClick={() => establecerPeriodoRapido("ultimos-3-meses")}
                    className='px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                  >
                    Últimos 3 Meses
                  </button>
                  <button
                    onClick={() => establecerPeriodoRapido("este-ano")}
                    className='px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                  >
                    Este Año
                  </button>
                </div>
              </div>

              {/* Rango de fechas personalizado */}
              <div className='lg:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rango de Fechas Personalizado
                </label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      Desde
                    </label>
                    <input
                      type='date'
                      value={filtrosIngresos.fechaDesde}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFiltrosIngresos((prev) => ({
                          ...prev,
                          fechaDesde: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      Hasta
                    </label>
                    <input
                      type='date'
                      value={filtrosIngresos.fechaHasta}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFiltrosIngresos((prev) => ({
                          ...prev,
                          fechaHasta: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tipo de Pago
                </label>
                <select
                  value={filtrosIngresos.tipoPago}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFiltrosIngresos((prev) => ({
                      ...prev,
                      tipoPago: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='todos'>Todos los tipos</option>
                  <option value='efectivo'>Efectivo</option>
                  <option value='transferencia'>Transferencia</option>
                  <option value='cheque'>Cheque</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tipo de Ingreso
                </label>
                <select
                  value={filtrosIngresos.tipoIngreso}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFiltrosIngresos((prev) => ({
                      ...prev,
                      tipoIngreso: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='todos'>Todos los ingresos</option>
                  <option value='cobro'>Solo Cobros</option>
                  <option value='venta-contado'>Solo Ventas al Contado</option>
                </select>
              </div>
            </div>

            {/* Resumen de ingresos */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
              <div className='bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg'>
                <p className='text-xs text-green-600 font-medium'>
                  Total General
                </p>
                <p className='text-lg font-bold text-green-700'>
                  ${resumenIngresos.totalGeneral.toLocaleString()}
                </p>
              </div>
              <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg'>
                <p className='text-xs text-blue-600 font-medium'>Cobros</p>
                <p className='text-lg font-bold text-blue-700'>
                  ${resumenIngresos.totalCobros.toLocaleString()}
                </p>
              </div>
              <div className='bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg'>
                <p className='text-xs text-purple-600 font-medium'>
                  Ventas Contado
                </p>
                <p className='text-lg font-bold text-purple-700'>
                  ${resumenIngresos.totalVentasContado.toLocaleString()}
                </p>
              </div>
              <div className='bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg'>
                <p className='text-xs text-amber-600 font-medium'>Efectivo</p>
                <p className='text-lg font-bold text-amber-700'>
                  $
                  {(
                    resumenIngresos.cobrosEfectivo +
                    resumenIngresos.totalVentasContado
                  ).toLocaleString()}
                </p>
              </div>
              <div className='bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg'>
                <p className='text-xs text-cyan-600 font-medium'>
                  Transferencias
                </p>
                <p className='text-lg font-bold text-cyan-700'>
                  ${resumenIngresos.cobrosTransferencia.toLocaleString()}
                </p>
              </div>
              <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg'>
                <p className='text-xs text-gray-600 font-medium'>
                  Transacciones
                </p>
                <p className='text-lg font-bold text-gray-700'>
                  {resumenIngresos.cantidadTransacciones}
                </p>
              </div>
            </div>

            {/* Tabla de ingresos */}
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-gray-50 border-b border-gray-200'>
                    <th className='px-4 py-3 text-left font-medium text-gray-700'>
                      Fecha
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-700'>
                      Tipo
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-700'>
                      Cliente
                    </th>
                    <th className='px-4 py-3 text-right font-medium text-gray-700'>
                      Monto
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-700'>
                      Forma de Pago
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-700'>
                      Comprobante
                    </th>
                    <th className='px-4 py-3 text-center font-medium text-gray-700'>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ingresosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className='px-4 py-8 text-center text-gray-500'
                      >
                        No hay ingresos en el período seleccionado
                      </td>
                    </tr>
                  ) : (
                    ingresosFiltrados.map(
                      (ingreso: IngresoUnificado, index: number) => (
                        <tr
                          key={`${ingreso.tipo}-${ingreso.id}`}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } border-b border-gray-100 hover:bg-blue-50 transition-colors`}
                        >
                          <td className='px-4 py-3'>
                            {new Date(ingreso.fecha).toLocaleDateString(
                              "es-ES"
                            )}
                          </td>
                          <td className='px-4 py-3'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ingreso.tipo === "cobro"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {ingreso.tipo === "cobro"
                                ? "Cobro"
                                : "Venta Contado"}
                            </span>
                          </td>
                          <td className='px-4 py-3 font-medium'>
                            {getNombreCliente(ingreso.clienteId)}
                          </td>
                          <td className='px-4 py-3 text-right font-bold'>
                            ${ingreso.monto.toLocaleString()}
                          </td>
                          <td className='px-4 py-3'>
                            <span className='capitalize'>
                              {ingreso.tipoPago || "Efectivo"}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            {ingreso.comprobante || "-"}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <button
                              onClick={() => {
                                setIngresoSeleccionado(ingreso);
                                setMostrarModal(true);
                              }}
                              className='text-blue-600 hover:text-blue-800 font-medium'
                            >
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {mostrarModal && ingresoSeleccionado && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Detalles del{" "}
                {ingresoSeleccionado.tipo === "cobro" ? "Cobro" : "Venta"}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                ✕
              </button>
            </div>

            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-xs text-gray-500'>Fecha</p>
                  <p className='font-medium'>
                    {new Date(ingresoSeleccionado.fecha).toLocaleDateString(
                      "es-ES"
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Monto</p>
                  <p className='font-bold text-green-600'>
                    ${ingresoSeleccionado.monto.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className='text-xs text-gray-500'>Cliente</p>
                <p className='font-medium'>
                  {getNombreCliente(ingresoSeleccionado.clienteId)}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-xs text-gray-500'>Tipo</p>
                  <p className='font-medium capitalize'>
                    {ingresoSeleccionado.tipo === "cobro"
                      ? "Cobro"
                      : "Venta al Contado"}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Forma de Pago</p>
                  <p className='font-medium capitalize'>
                    {ingresoSeleccionado.tipoPago || "Efectivo"}
                  </p>
                </div>
              </div>

              {ingresoSeleccionado.comprobante && (
                <div>
                  <p className='text-xs text-gray-500'>Comprobante</p>
                  <p className='font-medium'>
                    {ingresoSeleccionado.comprobante}
                  </p>
                </div>
              )}

              {ingresoSeleccionado.numeroCuota && (
                <div>
                  <p className='text-xs text-gray-500'>Número de Cuota</p>
                  <p className='font-medium'>
                    Cuota #{ingresoSeleccionado.numeroCuota}
                  </p>
                </div>
              )}

              {ingresoSeleccionado.numeroControl && (
                <div>
                  <p className='text-xs text-gray-500'>Número de Control</p>
                  <p className='font-medium'>
                    C-
                    {ingresoSeleccionado.numeroControl
                      .toString()
                      .padStart(4, "0")}
                  </p>
                </div>
              )}

              {(ingresoSeleccionado.nota ||
                ingresoSeleccionado.descripcion) && (
                <div>
                  <p className='text-xs text-gray-500'>Notas</p>
                  <p className='font-medium text-sm'>
                    {ingresoSeleccionado.nota ||
                      ingresoSeleccionado.descripcion}
                  </p>
                </div>
              )}
            </div>

            <div className='mt-6 flex justify-end'>
              <button
                onClick={() => setMostrarModal(false)}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
