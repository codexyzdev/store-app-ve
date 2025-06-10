"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
import Modal from "@/components/Modal";
import CuadriculaCuotas from "@/components/financiamiento/CuadriculaCuotas";
import PlanPagosPrint from "@/components/financiamiento/PlanPagosPrint";
import { calcularCuotasAtrasadas } from "@/utils/financiamiento";
import { esEnlaceGoogleMaps, extraerCoordenadas } from "@/utils/maps";
import Minimapa from "@/components/maps/Minimapa";
import ModalPagoCuota from "@/components/financiamiento/ModalPagoCuota";

export default function FinanciamientoClientePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>(
    []
  );
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [abonando, setAbonando] = useState<{ [key: string]: boolean }>({});
  const [modalPagoCuotaAbierto, setModalPagoCuotaAbierto] = useState<{
    [key: string]: boolean;
  }>({});
  const [mostrarPlanPago, setMostrarPlanPago] = useState<{
    [key: string]: boolean;
  }>({});
  const [mostrarImpresion, setMostrarImpresion] = useState<{
    [key: string]: boolean;
  }>({});
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [totalCuotasAtrasadas, setTotalCuotasAtrasadas] = useState(0);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (!clienteId) return;
    clientesDB.obtener(clienteId).then(setCliente);
    financiamientoDB.suscribir((data) => {
      setFinanciamientos(data.filter((f) => f.clienteId === clienteId));
      setLoading(false);
    });
    cobrosDB.suscribir(setCobros);
    inventarioDB.suscribir(setProductos);
  }, [clienteId]);

  useEffect(() => {
    // Calcular totales
    const nuevoTotalPendiente = financiamientos.reduce(
      (acc: number, f: FinanciamientoCuota) => {
        if (
          f.tipoVenta !== "cuotas" ||
          (f.estado !== "activo" && f.estado !== "atrasado")
        )
          return acc;
        const abonos = getCobrosFinanciamiento(f.id).reduce(
          (acc2: number, cobro: Cobro) =>
            acc2 +
            (typeof cobro.monto === "number" && !isNaN(cobro.monto)
              ? cobro.monto
              : 0),
          0
        );
        const montoPendiente = Math.max(
          0,
          Number.isFinite(f.monto - abonos) ? f.monto - abonos : 0
        );
        return acc + montoPendiente;
      },
      0
    );

    const nuevoTotalCuotasAtrasadas = financiamientos.reduce(
      (acc: number, f: FinanciamientoCuota) => {
        if (
          f.tipoVenta !== "cuotas" ||
          (f.estado !== "activo" && f.estado !== "atrasado")
        )
          return acc;
        const valorCuota =
          Number.isFinite(f.monto / f.cuotas) && f.monto > 0 && f.cuotas > 0
            ? f.monto / f.cuotas
            : 0.01;
        const atrasadas = calcularCuotasAtrasadas(f, cobros);
        return acc + atrasadas * valorCuota;
      },
      0
    );

    setTotalPendiente(nuevoTotalPendiente);
    setTotalCuotasAtrasadas(nuevoTotalCuotasAtrasadas);
  }, [financiamientos, productos, cobros]);

  const getProductosFinanciamiento = (financiamiento: FinanciamientoCuota) => {
    if (financiamiento.productos && financiamiento.productos.length > 0) {
      return financiamiento.productos.map((p) => {
        const producto = productos.find((prod) => prod.id === p.productoId);
        return {
          ...p,
          nombre: producto?.nombre || "Producto no encontrado",
          producto: producto,
        };
      });
    } else {
      const producto = productos.find(
        (p) => p.id === financiamiento.productoId
      );
      return [
        {
          productoId: financiamiento.productoId,
          cantidad: 1,
          precioUnitario: producto?.precio || 0,
          subtotal: producto?.precio || 0,
          nombre: producto?.nombre || "Producto no encontrado",
          producto: producto,
        },
      ];
    }
  };

  const getProductosNombres = (financiamiento: FinanciamientoCuota) => {
    const productosDelFinanciamiento =
      getProductosFinanciamiento(financiamiento);
    if (productosDelFinanciamiento.length === 1) {
      return productosDelFinanciamiento[0].nombre;
    } else {
      return `${
        productosDelFinanciamiento.length
      } productos: ${productosDelFinanciamiento
        .map((p) => p.nombre)
        .join(", ")}`;
    }
  };

  const getCobrosFinanciamiento = (financiamientoId: string) =>
    cobros
      .filter(
        (c: Cobro) =>
          c.financiamientoId === financiamientoId && c.tipo === "cuota"
      )
      .sort((a: Cobro, b: Cobro) => b.fecha - a.fecha);

  const handlePagarCuota = async (
    financiamientoId: string,
    data: {
      monto: number;
      tipoPago: string;
      comprobante?: string;
      imagenComprobante?: string;
      fecha?: string;
    }
  ) => {
    const financiamiento = financiamientos.find(
      (f) => f.id === financiamientoId
    );
    if (!financiamiento) return;

    setAbonando((prev) => ({ ...prev, [financiamientoId]: true }));
    setActualizando(true);

    try {
      const valorCuota = financiamiento.monto / financiamiento.cuotas;
      const cuotasAPagar = Math.floor(data.monto / valorCuota);

      const cobrosExistentes = getCobrosFinanciamiento(financiamientoId).filter(
        (c: Cobro) => c.tipo === "cuota" && !!c.id && c.id !== "temp"
      );

      // Crear cobros
      for (let i = 0; i < cuotasAPagar; i++) {
        await cobrosDB.crear({
          financiamientoId: financiamientoId,
          monto: valorCuota,
          fecha: data.fecha ? new Date(data.fecha).getTime() : Date.now(),
          tipo: "cuota",
          comprobante: data.comprobante || "",
          tipoPago: data.tipoPago,
          imagenComprobante: data.imagenComprobante || "",
          numeroCuota: cobrosExistentes.length + i + 1,
        });
      }

      // Actualizar estado del financiamiento
      const totalAbonado =
        (cobrosExistentes.length + cuotasAPagar) * valorCuota;
      const montoPendiente = Math.max(0, financiamiento.monto - totalAbonado);

      if (montoPendiente <= 0) {
        await financiamientoDB.actualizar(financiamientoId, {
          estado: "completado",
        });
      } else {
        const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
        const nuevoEstado = cuotasAtrasadas > 0 ? "atrasado" : "activo";
        if (financiamiento.estado !== nuevoEstado) {
          await financiamientoDB.actualizar(financiamientoId, {
            estado: nuevoEstado,
          });
        }
      }
    } catch (error) {
      console.error("Error al procesar pago:", error);
      throw error;
    } finally {
      setAbonando((prev) => ({ ...prev, [financiamientoId]: false }));
      setActualizando(false);
    }
  };

  const imprimirPlanPagos = (financiamientoId: string) => {
    setMostrarImpresion((prev) => ({ ...prev, [financiamientoId]: true }));
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = `Plan de Pagos - ${cliente?.nombre || "Cliente"}`;
      window.print();
      document.title = originalTitle;
    }, 500);
  };

  const cerrarImpresion = (financiamientoId: string) => {
    setMostrarImpresion((prev) => ({ ...prev, [financiamientoId]: false }));
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>
            Cargando información del cliente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='container mx-auto px-4 py-6 sm:py-8'>
        {/* Header mejorado */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <button
              onClick={() => router.back()}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors'
            >
              <span className='text-xl'>←</span>
              <span className='font-medium'>Volver</span>
            </button>
          </div>

          <div className='text-center mb-6 sm:mb-8'>
            <div className='inline-flex items-center gap-3 bg-white rounded-2xl px-4 sm:px-6 py-3 shadow-sm border border-sky-100 mb-4'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-sky-500 rounded-xl flex items-center justify-center'>
                <span className='text-lg sm:text-xl text-white'>👤</span>
              </div>
              <div className='text-left'>
                <h1 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                  Detalle del Cliente
                </h1>
                <p className='text-xs sm:text-sm text-gray-600'>
                  Información detallada del cliente y sus financiamientos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente optimizada */}
        {cliente ? (
          <div className='mb-6 sm:mb-8'>
            <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
              {/* Header del cliente */}
              <div className='bg-gradient-to-r from-slate-700 to-sky-500 px-4 sm:px-8 py-4 sm:py-6'>
                <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4'>
                  <div className='w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0'>
                    {cliente.fotoCedulaUrl ? (
                      <img
                        src={cliente.fotoCedulaUrl}
                        alt='Foto de cédula'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span className='text-2xl sm:text-3xl text-white font-bold'>
                        {cliente.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className='text-white flex-1 text-center sm:text-left'>
                    <h2 className='text-xl sm:text-2xl font-bold mb-2'>
                      {cliente.nombre}
                    </h2>
                    <div className='flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-sky-100'>
                      <span className='flex items-center justify-center sm:justify-start gap-2'>
                        <span>📞</span>
                        {cliente.telefono}
                      </span>
                      {cliente.cedula && (
                        <span className='flex items-center justify-center sm:justify-start gap-2'>
                          <span>🆔</span>
                          {cliente.cedula}
                        </span>
                      )}
                    </div>
                    {cliente.direccion && (
                      <div className='mt-2'>
                        <span className='flex items-center justify-center sm:justify-start gap-2 text-sm text-sky-100'>
                          <span>📍</span>
                          {esEnlaceGoogleMaps(cliente.direccion) ? (
                            <button
                              onClick={() =>
                                window.open(cliente.direccion, "_blank")
                              }
                              className='underline hover:text-white transition-colors'
                            >
                              Ver ubicación en Google Maps
                            </button>
                          ) : (
                            <span className='line-clamp-2'>
                              {cliente.direccion}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional colapsable en mobile */}
              <div className='p-4 sm:p-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
                  {/* Información básica */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                      <span>📋</span>
                      Información del Cliente
                    </h3>

                    <div className='bg-sky-50 rounded-xl p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-600'>
                          Nombre completo:
                        </span>
                        <span className='text-sm font-semibold text-gray-900'>
                          {cliente.nombre}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-600'>
                          Teléfono:
                        </span>
                        <span className='text-sm font-semibold text-gray-900'>
                          {cliente.telefono}
                        </span>
                      </div>

                      {cliente.cedula && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium text-gray-600'>
                            Cédula:
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {cliente.cedula}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Foto de cédula */}
                    {cliente.fotoCedulaUrl && (
                      <div className='space-y-3'>
                        <h4 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                          <span>🆔</span>
                          Documento de Identidad
                        </h4>
                        <div className='bg-sky-50 rounded-xl p-4'>
                          <img
                            src={cliente.fotoCedulaUrl}
                            alt='Cédula del cliente'
                            className='w-full max-w-sm mx-auto rounded-lg shadow-sm border border-gray-200'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mapa */}
                  {cliente.direccion &&
                    esEnlaceGoogleMaps(cliente.direccion) &&
                    (() => {
                      const coordenadas = extraerCoordenadas(cliente.direccion);
                      return coordenadas ? (
                        <div className='space-y-3'>
                          <h4 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                            <span>🗺️</span>
                            Ubicación del Cliente
                          </h4>
                          <div className='bg-sky-50 rounded-xl p-4'>
                            <div className='h-48 sm:h-64 rounded-lg overflow-hidden'>
                              <Minimapa
                                coordenadas={coordenadas}
                                direccionOriginal={cliente.direccion}
                                className='w-full h-full'
                              />
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='mb-8 bg-white rounded-2xl shadow-sm p-6 animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        )}

        {/* Resumen financiero mejorado */}
        <div className='mb-6 sm:mb-8'>
          {actualizando && (
            <div className='bg-white rounded-2xl shadow-sm border border-sky-200 p-4 mb-6'>
              <div className='flex items-center justify-center gap-3'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-sky-600 font-semibold text-sm sm:text-base'>
                  Actualizando datos del financiamiento...
                </span>
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
            <div className='bg-white rounded-2xl shadow-sm border border-red-100 p-4 sm:p-6'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0'>
                  <span className='text-xl sm:text-2xl text-white'>💰</span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-2xl sm:text-3xl font-bold text-red-600 truncate'>
                    ${totalPendiente.toLocaleString()}
                  </p>
                  <p className='text-xs sm:text-sm text-gray-600 font-medium'>
                    Total Pendiente de Cobro
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-amber-100 p-4 sm:p-6'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0'>
                  <span className='text-xl sm:text-2xl text-white'>⏰</span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-2xl sm:text-3xl font-bold text-amber-600 truncate'>
                    ${totalCuotasAtrasadas.toLocaleString()}
                  </p>
                  <p className='text-xs sm:text-sm text-gray-600 font-medium'>
                    Valor de Cuotas Atrasadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de financiamientos optimizada */}
        <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-slate-700 to-sky-500 px-4 sm:px-8 py-4 sm:py-6'>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center'>
                <span className='text-xl sm:text-2xl text-white'>📋</span>
              </div>
              <div className='text-white'>
                <h2 className='text-lg sm:text-xl font-bold mb-1'>
                  Financiamientos del Cliente
                </h2>
                <p className='text-sm sm:text-base text-sky-100'>
                  Historial completo de financiamientos y pagos
                </p>
              </div>
            </div>
          </div>

          <div className='p-4 sm:p-8'>
            {financiamientos.length === 0 ? (
              <div className='text-center py-8 sm:py-12'>
                <div className='w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-3xl sm:text-4xl text-gray-400'>📭</span>
                </div>
                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                  No hay financiamientos activos
                </h3>
                <p className='text-gray-500 text-sm sm:text-lg mb-6'>
                  Este cliente no tiene financiamientos registrados en el
                  sistema.
                </p>
                <Link
                  href='/financiamiento-cuota/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  <span>💰</span>
                  Crear Nuevo Financiamiento
                </Link>
              </div>
            ) : (
              <div className='space-y-6 sm:space-y-8'>
                {financiamientos.map(
                  (financiamiento: FinanciamientoCuota, index: number) => {
                    const productosDelFinanciamiento =
                      getProductosFinanciamiento(financiamiento);
                    const montoTotal = financiamiento.monto;
                    const cobrosValidos: Cobro[] = getCobrosFinanciamiento(
                      financiamiento.id
                    ).filter(
                      (c: Cobro) =>
                        c.tipo === "cuota" && !!c.id && c.id !== "temp"
                    );
                    const abonos = cobrosValidos.reduce(
                      (acc: number, cobro: Cobro) =>
                        acc +
                        (typeof cobro.monto === "number" && !isNaN(cobro.monto)
                          ? cobro.monto
                          : 0),
                      0
                    );
                    const montoPendiente = Math.max(0, montoTotal - abonos);
                    const valorCuota =
                      financiamiento.tipoVenta === "contado"
                        ? 0
                        : Number.isFinite(montoTotal / financiamiento.cuotas) &&
                          montoTotal > 0 &&
                          financiamiento.cuotas > 0
                        ? montoTotal / financiamiento.cuotas
                        : 0.01;
                    const cuotasAtrasadas = calcularCuotasAtrasadas(
                      financiamiento,
                      getCobrosFinanciamiento(financiamiento.id)
                    );
                    const progreso =
                      montoPendiente > 0
                        ? ((montoTotal - montoPendiente) / montoTotal) * 100
                        : 100;

                    const estadoPrincipal =
                      financiamiento.tipoVenta === "contado" ? (
                        <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-sky-100 text-sky-700 rounded-full font-bold text-sm'>
                          <span>💵</span>Pagado
                        </div>
                      ) : cuotasAtrasadas > 0 ? (
                        <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-full font-bold text-sm'>
                          <span>⏰</span>
                          <span className='hidden sm:inline'>Atrasado: </span>
                          {cuotasAtrasadas} cuota
                          {cuotasAtrasadas > 1 ? "s" : ""}
                        </div>
                      ) : (
                        <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm'>
                          <span>✔️</span>Al día
                        </div>
                      );

                    return (
                      <div
                        key={financiamiento.id}
                        className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300'
                      >
                        {/* Header del financiamiento */}
                        <div
                          className={`px-4 sm:px-6 py-3 sm:py-4 ${
                            cuotasAtrasadas > 0
                              ? "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
                              : montoPendiente <= 0
                              ? "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200"
                              : "bg-gradient-to-r from-sky-50 to-sky-100 border-b border-sky-200"
                          }`}
                        >
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='flex items-center gap-3 sm:gap-4'>
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                  cuotasAtrasadas > 0
                                    ? "bg-red-500 text-white"
                                    : montoPendiente <= 0
                                    ? "bg-green-500 text-white"
                                    : "bg-sky-500 text-white"
                                }`}
                              >
                                <span className='text-sm sm:text-lg font-bold'>
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <h3 className='text-base sm:text-lg font-bold text-gray-900 line-clamp-1'>
                                  {getProductosNombres(financiamiento)}
                                </h3>
                                <p className='text-xs sm:text-sm text-gray-600'>
                                  Creado el{" "}
                                  {new Date(
                                    financiamiento.fechaInicio
                                  ).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            </div>
                            {estadoPrincipal}
                          </div>
                        </div>

                        <div className='p-4 sm:p-6'>
                          <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8'>
                            {/* Información del financiamiento */}
                            <div className='space-y-6'>
                              <div>
                                <h4 className='text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                                  <span>📊</span>
                                  Información del Financiamiento
                                </h4>

                                <div className='space-y-3 sm:space-y-4'>
                                  <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                    <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                      Monto total:
                                    </span>
                                    <span className='text-base sm:text-lg font-bold text-gray-900'>
                                      ${montoTotal.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                    <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                      Monto cobrado:
                                    </span>
                                    <span className='text-base sm:text-lg font-bold text-green-600'>
                                      ${abonos.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                    <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                      Pendiente:
                                    </span>
                                    <span
                                      className={`text-base sm:text-lg font-bold ${
                                        montoPendiente > 0
                                          ? "text-red-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      ${montoPendiente.toLocaleString()}
                                    </span>
                                  </div>

                                  {financiamiento.tipoVenta === "cuotas" && (
                                    <>
                                      <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                        <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                          Cuotas:
                                        </span>
                                        <span className='text-base sm:text-lg font-bold text-gray-900'>
                                          {cobrosValidos.length}/
                                          {financiamiento.cuotas}
                                        </span>
                                      </div>

                                      <div className='flex items-center justify-between p-3 bg-sky-50 rounded-xl'>
                                        <span className='text-xs sm:text-sm font-medium text-gray-600'>
                                          Valor por cuota:
                                        </span>
                                        <span className='text-base sm:text-lg font-bold text-gray-900'>
                                          ${valorCuota.toFixed(2)}
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {/* Barra de progreso */}
                                  <div className='p-3 bg-sky-50 rounded-xl'>
                                    <div className='flex justify-between text-xs sm:text-sm font-medium text-gray-600 mb-2'>
                                      <span>Progreso del pago</span>
                                      <span>{progreso.toFixed(1)}%</span>
                                    </div>
                                    <div className='w-full bg-gray-200 rounded-full h-2 sm:h-3'>
                                      <div
                                        className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out ${
                                          progreso >= 100
                                            ? "bg-gradient-to-r from-green-500 to-green-600"
                                            : cuotasAtrasadas > 0
                                            ? "bg-gradient-to-r from-red-500 to-red-600"
                                            : "bg-gradient-to-r from-sky-500 to-sky-600"
                                        }`}
                                        style={{
                                          width: `${Math.min(progreso, 100)}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Acciones */}
                              {montoPendiente > 0 && (
                                <div className='space-y-3'>
                                  <h4 className='text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2'>
                                    <span>⚡</span>
                                    Acciones Rápidas
                                  </h4>

                                  <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3'>
                                    <button
                                      onClick={() => {
                                        setModalPagoCuotaAbierto(
                                          (prev: {
                                            [key: string]: boolean;
                                          }) => ({
                                            ...prev,
                                            [financiamiento.id]: true,
                                          })
                                        );
                                      }}
                                      disabled={abonando[financiamiento.id]}
                                      className='w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    >
                                      <span>💰</span>
                                      <span className='hidden sm:inline'>
                                        Pagar Cuota
                                      </span>
                                      <span className='sm:hidden'>Pagar</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        setMostrarPlanPago((prev) => ({
                                          ...prev,
                                          [financiamiento.id]:
                                            !prev[financiamiento.id],
                                        }))
                                      }
                                      className='w-full bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                    >
                                      <span>📅</span>
                                      <span className='hidden sm:inline'>
                                        {mostrarPlanPago[financiamiento.id]
                                          ? "Ocultar"
                                          : "Ver"}{" "}
                                        Plan de Pagos
                                      </span>
                                      <span className='sm:hidden'>Plan</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        imprimirPlanPagos(financiamiento.id)
                                      }
                                      className='w-full sm:col-span-2 xl:col-span-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 sm:px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                    >
                                      <span>🖨️</span>
                                      <span className='hidden sm:inline'>
                                        Imprimir Plan
                                      </span>
                                      <span className='sm:hidden'>
                                        Imprimir
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Plan de pagos */}
                            {financiamiento.tipoVenta === "cuotas" &&
                              mostrarPlanPago[financiamiento.id] && (
                                <div className='xl:col-span-1'>
                                  <div className='bg-gradient-to-r from-sky-50 to-slate-50 rounded-2xl p-4 sm:p-6 border border-sky-200'>
                                    <h4 className='text-base sm:text-lg font-semibold text-sky-800 mb-4 flex items-center gap-2'>
                                      <span>📅</span>
                                      Plan de Pagos
                                    </h4>
                                    <CuadriculaCuotas
                                      fechaInicio={financiamiento.fechaInicio}
                                      cobros={getCobrosFinanciamiento(
                                        financiamiento.id
                                      )}
                                      valorCuota={valorCuota}
                                    />
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales de pago de cuota */}
      {financiamientos.map((financiamiento: FinanciamientoCuota) => {
        const valorCuota = financiamiento.monto / financiamiento.cuotas;
        const cobrosValidos = getCobrosFinanciamiento(financiamiento.id);
        const abonos = cobrosValidos.reduce(
          (acc, cobro) => acc + cobro.monto,
          0
        );
        const montoPendiente = Math.max(0, financiamiento.monto - abonos);
        const cuotasPendientes = Math.ceil(montoPendiente / valorCuota);
        const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);

        return (
          <ModalPagoCuota
            key={`modal-${financiamiento.id}`}
            isOpen={!!modalPagoCuotaAbierto[financiamiento.id]}
            onClose={() =>
              setModalPagoCuotaAbierto((prev) => ({
                ...prev,
                [financiamiento.id]: false,
              }))
            }
            prestamo={{
              id: financiamiento.id,
              monto: financiamiento.monto,
              cuotas: financiamiento.cuotas,
            }}
            valorCuota={valorCuota}
            cuotasPendientes={cuotasPendientes}
            cuotasAtrasadas={cuotasAtrasadas}
            onPagar={(data) => handlePagarCuota(financiamiento.id, data)}
            cargando={!!abonando[financiamiento.id]}
          />
        );
      })}

      {/* Modales de impresión */}
      {financiamientos.map((financiamiento: FinanciamientoCuota) => (
        <Modal
          key={`print-${financiamiento.id}`}
          isOpen={!!mostrarImpresion[financiamiento.id]}
          onClose={() => cerrarImpresion(financiamiento.id)}
          title={`Imprimir Plan de Pagos - ${cliente?.nombre || "Cliente"}`}
        >
          <div className='print-container'>
            <div className='no-print mb-4 text-center'>
              <p className='text-gray-600 mb-3'>
                Haz clic en "Imprimir" o usa Ctrl+P para imprimir este plan de
                pagos.
              </p>
              <div className='flex gap-2 justify-center'>
                <button
                  onClick={() => window.print()}
                  className='px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition flex items-center gap-2'
                >
                  <span>🖨️</span>
                  Imprimir
                </button>
                <button
                  onClick={() => cerrarImpresion(financiamiento.id)}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
                >
                  Cerrar
                </button>
              </div>
            </div>

            {cliente && (
              <PlanPagosPrint
                prestamo={financiamiento}
                cliente={cliente}
                cobros={getCobrosFinanciamiento(financiamiento.id)}
                valorCuota={financiamiento.monto / financiamiento.cuotas}
                productosNombres={getProductosNombres(financiamiento)}
              />
            )}
          </div>
        </Modal>
      ))}

      {/* Estilos para impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .fixed.inset-0 > div:first-child { display: none !important; }
          .fixed.inset-0 .plan-pagos-print {
            position: static !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
        `,
        }}
      />
    </div>
  );
}
