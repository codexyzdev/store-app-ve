"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
import Modal from "@/components/Modal";
import PrestamoCard from "@/components/prestamos/PrestamoCard";
import CuadriculaCuotas from "@/components/prestamos/CuadriculaCuotas";
import PlanPagosPrint from "@/components/prestamos/PlanPagosPrint";
import { calcularCuotasAtrasadas } from "@/utils/prestamos";
import ClienteCard from "@/components/prestamos/ClienteCard";
import ResumenGlobal from "@/components/prestamos/ResumenGlobal";
import { esEnlaceGoogleMaps, extraerCoordenadas } from "@/utils/maps";
import Minimapa from "@/components/maps/Minimapa";

// Componente para mostrar tooltips simples
type TooltipProps = { text: string };
const Tooltip: React.FC<TooltipProps> = ({ text }: TooltipProps) => (
  <span className='ml-1 text-xs text-gray-400 cursor-help' title={text}>
    ⓘ
  </span>
);

export default function PrestamosClientePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPagos, setShowPagos] = useState<{ [key: string]: boolean }>({});
  const [abonando, setAbonando] = useState<{ [key: string]: boolean }>({});
  const [mostrarFormularioAbono, setMostrarFormularioAbono] = useState<{
    [key: string]: boolean;
  }>({});
  const [montoAbono, setMontoAbono] = useState<{ [key: string]: number }>({});
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
    prestamosDB.suscribir((data) => {
      setPrestamos(data.filter((p) => p.clienteId === clienteId));
      setLoading(false);
    });
    cobrosDB.suscribir(setCobros);
    inventarioDB.suscribir(setProductos);
  }, [clienteId]);

  useEffect(() => {
    // Calcular totales (corregido y reactivo)
    const nuevoTotalPendiente = prestamos.reduce((acc: number, p: Prestamo) => {
      if (
        p.tipoVenta !== "cuotas" ||
        (p.estado !== "activo" && p.estado !== "atrasado")
      )
        return acc;
      const abonos = getCobrosPrestamo(p.id).reduce(
        (acc2: number, cobro: Cobro) =>
          acc2 +
          (typeof cobro.monto === "number" && !isNaN(cobro.monto)
            ? cobro.monto
            : 0),
        0
      );
      const montoPendiente = Math.max(
        0,
        Number.isFinite(p.monto - abonos) ? p.monto - abonos : 0
      );
      return acc + montoPendiente;
    }, 0);

    const nuevoTotalCuotasAtrasadas = prestamos.reduce(
      (acc: number, p: Prestamo) => {
        if (
          p.tipoVenta !== "cuotas" ||
          (p.estado !== "activo" && p.estado !== "atrasado")
        )
          return acc;
        const valorCuota =
          Number.isFinite(p.monto / p.cuotas) && p.monto > 0 && p.cuotas > 0
            ? p.monto / p.cuotas
            : 0.01;
        const atrasadas = calcularCuotasAtrasadas(p, cobros);
        return acc + atrasadas * valorCuota;
      },
      0
    );

    setTotalPendiente(nuevoTotalPendiente);
    setTotalCuotasAtrasadas(nuevoTotalCuotasAtrasadas);
  }, [prestamos, productos, cobros]);

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p: Producto) => p.id === id);
    return producto ? producto.nombre : "Producto no encontrado";
  };

  const getProductosPrestamo = (prestamo: Prestamo) => {
    if (prestamo.productos && prestamo.productos.length > 0) {
      // Préstamo con múltiples productos
      return prestamo.productos.map((p) => {
        const producto = productos.find((prod) => prod.id === p.productoId);
        return {
          ...p,
          nombre: producto?.nombre || "Producto no encontrado",
          producto: producto,
        };
      });
    } else {
      // Préstamo con un solo producto (compatibilidad)
      const producto = productos.find((p) => p.id === prestamo.productoId);
      return [
        {
          productoId: prestamo.productoId,
          cantidad: 1,
          precioUnitario: producto?.precio || 0,
          subtotal: producto?.precio || 0,
          nombre: producto?.nombre || "Producto no encontrado",
          producto: producto,
        },
      ];
    }
  };

  const getProductosNombres = (prestamo: Prestamo) => {
    const productosDelPrestamo = getProductosPrestamo(prestamo);
    if (productosDelPrestamo.length === 1) {
      return productosDelPrestamo[0].nombre;
    } else {
      return `${productosDelPrestamo.length} productos: ${productosDelPrestamo
        .map((p) => p.nombre)
        .join(", ")}`;
    }
  };

  const getCobrosPrestamo = (prestamoId: string) =>
    cobros
      .filter((c: Cobro) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a: Cobro, b: Cobro) => b.fecha - a.fecha);

  // Desactivar el loader cuando los préstamos cambian (la suscripción se actualiza)
  useEffect(() => {
    if (actualizando) {
      setActualizando(false);
    }
  }, [prestamos, cobros]);

  const imprimirPlanPagos = (prestamoId: string) => {
    setMostrarImpresion((prev) => ({
      ...prev,
      [prestamoId]: true,
    }));

    // Esperar un poco para que se renderice la modal y luego imprimir
    setTimeout(() => {
      // Configurar la página para impresión
      const originalTitle = document.title;
      document.title = `Plan de Pagos - ${cliente?.nombre || "Cliente"}`;

      // Imprimir
      window.print();

      // Restaurar el título original
      document.title = originalTitle;
    }, 500);
  };

  const cerrarImpresion = (prestamoId: string) => {
    setMostrarImpresion((prev) => ({
      ...prev,
      [prestamoId]: false,
    }));
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header con navegación */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <button
              onClick={() => router.back()}
              className='inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors'
            >
              <span className='text-xl'>←</span>
              <span className='font-medium'>Volver</span>
            </button>
          </div>

          <div className='text-center mb-8'>
            <div className='inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-blue-100 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>👤</span>
              </div>
              <div className='text-left'>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  Detalle del Cliente
                </h1>
                <p className='text-sm text-gray-600'>
                  Información detallada del cliente y sus préstamos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente mejorada */}
        {cliente ? (
          <div className='mb-8'>
            <div className='bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
              {/* Header del cliente */}
              <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden'>
                    {cliente.fotoCedulaUrl ? (
                      <img
                        src={cliente.fotoCedulaUrl}
                        alt='Foto de cédula'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span className='text-3xl text-white font-bold'>
                        {cliente.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className='text-white flex-1'>
                    <h2 className='text-2xl font-bold mb-1'>
                      {cliente.nombre}
                    </h2>
                    <div className='flex flex-wrap gap-4 text-blue-100'>
                      <span className='flex items-center gap-2'>
                        <span>📞</span>
                        {cliente.telefono}
                      </span>
                      {cliente.direccion && (
                        <span className='flex items-center gap-2'>
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
                            <span className='line-clamp-1'>
                              {cliente.direccion}
                            </span>
                          )}
                        </span>
                      )}
                      {cliente.cedula && (
                        <span className='flex items-center gap-2'>
                          <span>🆔</span>
                          {cliente.cedula}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional del cliente */}
              <div className='p-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Información básica */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                      <span>📋</span>
                      Información del Cliente
                    </h3>

                    <div className='bg-gray-50 rounded-xl p-4 space-y-3'>
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

                      {cliente.direccion && (
                        <div className='space-y-2'>
                          <span className='text-sm font-medium text-gray-600'>
                            Dirección:
                          </span>
                          {esEnlaceGoogleMaps(cliente.direccion) ? (
                            <button
                              onClick={() =>
                                window.open(cliente.direccion, "_blank")
                              }
                              className='text-sm text-blue-600 hover:text-blue-700 underline transition-colors block text-left'
                            >
                              Ver ubicación en Google Maps
                            </button>
                          ) : (
                            <p className='text-sm text-gray-900 leading-relaxed'>
                              {cliente.direccion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Foto de cédula ampliada */}
                    {cliente.fotoCedulaUrl && (
                      <div className='space-y-3'>
                        <h4 className='text-md font-semibold text-gray-900 flex items-center gap-2'>
                          <span>🆔</span>
                          Documento de Identidad
                        </h4>
                        <div className='bg-gray-50 rounded-xl p-4'>
                          <img
                            src={cliente.fotoCedulaUrl}
                            alt='Cédula del cliente'
                            className='w-full max-w-sm mx-auto rounded-lg shadow-sm border border-gray-200'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mapa de ubicación */}
                  {cliente.direccion &&
                    esEnlaceGoogleMaps(cliente.direccion) &&
                    (() => {
                      const coordenadas = extraerCoordenadas(cliente.direccion);
                      return coordenadas ? (
                        <div className='space-y-3'>
                          <h4 className='text-md font-semibold text-gray-900 flex items-center gap-2'>
                            <span>🗺️</span>
                            Ubicación del Cliente
                          </h4>
                          <div className='bg-gray-50 rounded-xl p-4'>
                            <div className='h-64 rounded-lg overflow-hidden'>
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

        {/* Resumen global mejorado */}
        <div className='mb-8'>
          {actualizando && (
            <div className='bg-white rounded-2xl shadow-sm border border-blue-200 p-4 mb-6'>
              <div className='flex items-center justify-center gap-3'>
                <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-blue-600 font-semibold'>
                  Actualizando datos del préstamo...
                </span>
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Total pendiente */}
            <div className='bg-white rounded-2xl shadow-sm border border-red-100 p-6'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg'>
                  <span className='text-2xl text-white'>💰</span>
                </div>
                <div className='flex-1'>
                  <p className='text-3xl font-bold text-red-600'>
                    ${totalPendiente.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-600 font-medium'>
                    Total Pendiente de Cobro
                  </p>
                  <p className='text-xs text-gray-500'>
                    Monto total que debe el cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Cuotas atrasadas */}
            <div className='bg-white rounded-2xl shadow-sm border border-amber-100 p-6'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg'>
                  <span className='text-2xl text-white'>⏰</span>
                </div>
                <div className='flex-1'>
                  <p className='text-3xl font-bold text-amber-600'>
                    ${totalCuotasAtrasadas.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-600 font-medium'>
                    Valor de Cuotas Atrasadas
                  </p>
                  <p className='text-xs text-gray-500'>
                    Cuotas vencidas pendientes de pago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de préstamos mejorada */}
        <div className='bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center'>
                <span className='text-2xl text-white'>📋</span>
              </div>
              <div className='text-white'>
                <h2 className='text-xl font-bold mb-1'>
                  Préstamos del Cliente
                </h2>
                <p className='text-blue-100'>
                  Historial completo de préstamos y pagos
                </p>
              </div>
            </div>
          </div>

          <div className='p-8'>
            {prestamos.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <span className='text-4xl text-gray-400'>📭</span>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No hay préstamos activos
                </h3>
                <p className='text-gray-500 text-lg mb-6'>
                  Este cliente no tiene préstamos registrados en el sistema.
                </p>
                <Link
                  href='/prestamos/nuevo'
                  className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200'
                >
                  <span>💰</span>
                  Crear Nuevo Préstamo
                </Link>
              </div>
            ) : (
              <div className='space-y-8'>
                {prestamos.map((prestamo: Prestamo) => {
                  const producto = productos.find(
                    (p: Producto) => p.id === prestamo.productoId
                  );
                  const productosDelPrestamo = getProductosPrestamo(prestamo);
                  const montoTotal = prestamo.monto;
                  // Solo cobros válidos para abonos y pagos
                  const cobrosValidos: Cobro[] = getCobrosPrestamo(
                    prestamo.id
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
                  const montoPendiente = Math.max(
                    0,
                    Number.isFinite(montoTotal - abonos)
                      ? montoTotal - abonos
                      : 0
                  );
                  const valorCuota =
                    prestamo.tipoVenta === "contado"
                      ? 0
                      : Number.isFinite(montoTotal / prestamo.cuotas) &&
                        montoTotal > 0 &&
                        prestamo.cuotas > 0
                      ? montoTotal / prestamo.cuotas
                      : 0.01;
                  const cuotasPendientes =
                    prestamo.tipoVenta === "contado"
                      ? 0
                      : valorCuota > 0
                      ? Math.max(0, Math.ceil(montoPendiente / valorCuota))
                      : prestamo.cuotas - cobrosValidos.length;
                  const cuotasAtrasadas = calcularCuotasAtrasadas(
                    prestamo,
                    getCobrosPrestamo(prestamo.id)
                  );

                  const progreso =
                    montoPendiente > 0
                      ? ((montoTotal - montoPendiente) / montoTotal) * 100
                      : 100;

                  const estadoPrincipal =
                    prestamo.tipoVenta === "contado" ? (
                      <div className='inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold'>
                        <span>💵</span>Pagado
                      </div>
                    ) : cuotasAtrasadas > 0 ? (
                      <div className='inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-bold'>
                        <span>⏰</span>Atrasado: {cuotasAtrasadas} cuota
                        {cuotasAtrasadas > 1 ? "s" : ""}
                      </div>
                    ) : (
                      <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold'>
                        <span>✔️</span>Al día
                      </div>
                    );

                  return (
                    <div
                      key={prestamo.id}
                      className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300'
                    >
                      {/* Header del préstamo */}
                      <div
                        className={`px-6 py-4 ${
                          cuotasAtrasadas > 0
                            ? "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
                            : montoPendiente <= 0
                            ? "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200"
                            : "bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200"
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                cuotasAtrasadas > 0
                                  ? "bg-red-500 text-white"
                                  : montoPendiente <= 0
                                  ? "bg-green-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              <span className='text-xl font-bold'>
                                #{prestamos.indexOf(prestamo) + 1}
                              </span>
                            </div>
                            <div>
                              <h3 className='text-lg font-bold text-gray-900'>
                                {getProductosNombres(prestamo)}
                              </h3>
                              <p className='text-sm text-gray-600'>
                                Creado el{" "}
                                {new Date(
                                  prestamo.fechaInicio
                                ).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>
                          {estadoPrincipal}
                        </div>
                      </div>

                      <div className='p-6'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                          {/* Información del préstamo */}
                          <div className='space-y-6'>
                            <div>
                              <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                                <span>📊</span>
                                Información del Préstamo
                              </h4>

                              <div className='space-y-4'>
                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                  <span className='text-sm font-medium text-gray-600'>
                                    Monto total:
                                  </span>
                                  <span className='text-lg font-bold text-gray-900'>
                                    ${montoTotal.toLocaleString()}
                                  </span>
                                </div>

                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                  <span className='text-sm font-medium text-gray-600'>
                                    Monto cobrado:
                                  </span>
                                  <span className='text-lg font-bold text-green-600'>
                                    ${abonos.toLocaleString()}
                                  </span>
                                </div>

                                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                  <span className='text-sm font-medium text-gray-600'>
                                    Pendiente:
                                  </span>
                                  <span
                                    className={`text-lg font-bold ${
                                      montoPendiente > 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    ${montoPendiente.toLocaleString()}
                                  </span>
                                </div>

                                {prestamo.tipoVenta === "cuotas" && (
                                  <>
                                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                      <span className='text-sm font-medium text-gray-600'>
                                        Cuotas:
                                      </span>
                                      <span className='text-lg font-bold text-gray-900'>
                                        {cobrosValidos.length}/{prestamo.cuotas}
                                      </span>
                                    </div>

                                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                                      <span className='text-sm font-medium text-gray-600'>
                                        Valor por cuota:
                                      </span>
                                      <span className='text-lg font-bold text-gray-900'>
                                        ${valorCuota.toFixed(2)}
                                      </span>
                                    </div>
                                  </>
                                )}

                                {/* Barra de progreso */}
                                <div className='p-3 bg-gray-50 rounded-xl'>
                                  <div className='flex justify-between text-sm font-medium text-gray-600 mb-2'>
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
                                <h4 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                                  <span>⚡</span>
                                  Acciones Rápidas
                                </h4>

                                <button
                                  onClick={() => {
                                    const valorCuota =
                                      Number.isFinite(
                                        prestamo.monto / prestamo.cuotas
                                      ) &&
                                      prestamo.monto > 0 &&
                                      prestamo.cuotas > 0
                                        ? prestamo.monto / prestamo.cuotas
                                        : 0.01;
                                    setMontoAbono(
                                      (prev: { [key: string]: number }) => ({
                                        ...prev,
                                        [prestamo.id]: valorCuota,
                                      })
                                    );
                                    setMostrarFormularioAbono(
                                      (prev: { [key: string]: boolean }) => ({
                                        ...prev,
                                        [prestamo.id]: !prev[prestamo.id],
                                      })
                                    );
                                  }}
                                  disabled={abonando[prestamo.id]}
                                  className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                >
                                  <span>💰</span>
                                  {mostrarFormularioAbono[prestamo.id]
                                    ? "Cancelar Abono"
                                    : "Abonar Cuota"}
                                </button>

                                <button
                                  onClick={() =>
                                    setMostrarPlanPago((prev) => ({
                                      ...prev,
                                      [prestamo.id]: !prev[prestamo.id],
                                    }))
                                  }
                                  className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                >
                                  <span>📅</span>
                                  {mostrarPlanPago[prestamo.id]
                                    ? "Ocultar"
                                    : "Ver"}{" "}
                                  Plan de Pagos
                                </button>

                                <button
                                  onClick={() => imprimirPlanPagos(prestamo.id)}
                                  className='w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2'
                                >
                                  <span>🖨️</span>
                                  Imprimir Plan
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Formulario de abono */}
                          {mostrarFormularioAbono[prestamo.id] && (
                            <div className='lg:col-span-2'>
                              <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200'>
                                <h4 className='text-lg font-semibold text-green-800 mb-4 flex items-center gap-2'>
                                  <span>💳</span>
                                  Registrar Pago de Cuota
                                </h4>

                                <PrestamoCard
                                  prestamo={prestamo}
                                  producto={producto}
                                  productosDelPrestamo={productosDelPrestamo}
                                  abonos={abonos}
                                  montoTotal={montoTotal}
                                  montoPendiente={montoPendiente}
                                  valorCuota={valorCuota}
                                  cuotasPendientes={cuotasPendientes}
                                  cuotasAtrasadas={cuotasAtrasadas}
                                  estadoPrincipal={estadoPrincipal}
                                  mostrarFormularioAbono={true}
                                  abonando={!!abonando[prestamo.id]}
                                  montoAbono={montoAbono[prestamo.id] || 0}
                                  onMostrarFormularioAbono={() => {
                                    setMostrarFormularioAbono(
                                      (prev: { [key: string]: boolean }) => ({
                                        ...prev,
                                        [prestamo.id]: false,
                                      })
                                    );
                                  }}
                                  onChangeMontoAbono={(valor) =>
                                    setMontoAbono(
                                      (prev: { [key: string]: number }) => ({
                                        ...prev,
                                        [prestamo.id]: valor,
                                      })
                                    )
                                  }
                                  onAbonarCuota={async (data) => {
                                    setAbonando((prev) => ({
                                      ...prev,
                                      [prestamo.id]: true,
                                    }));
                                    setActualizando(true);
                                    try {
                                      if (
                                        !data.monto ||
                                        isNaN(data.monto) ||
                                        data.monto <= 0
                                      ) {
                                        alert(
                                          "Por favor ingresa un monto válido"
                                        );
                                        setAbonando((prev) => ({
                                          ...prev,
                                          [prestamo.id]: false,
                                        }));
                                        setActualizando(false);
                                        return;
                                      }
                                      if (data.tipoPago !== "efectivo") {
                                        if (!data.imagenComprobante) {
                                          alert(
                                            "Debes adjuntar el comprobante de pago."
                                          );
                                          setAbonando((prev) => ({
                                            ...prev,
                                            [prestamo.id]: false,
                                          }));
                                          setActualizando(false);
                                          return;
                                        }
                                        if (
                                          !data.comprobante ||
                                          data.comprobante.trim() === ""
                                        ) {
                                          alert(
                                            "Debes ingresar el número de comprobante."
                                          );
                                          setAbonando((prev) => ({
                                            ...prev,
                                            [prestamo.id]: false,
                                          }));
                                          setActualizando(false);
                                          return;
                                        }
                                      }

                                      // Calcular cuántas cuotas se están pagando
                                      const valorCuota =
                                        prestamo.monto / prestamo.cuotas;
                                      const cuotasAPagar = Math.floor(
                                        data.monto / valorCuota
                                      );

                                      // Obtener cobros existentes para saber el número de la próxima cuota
                                      const cobrosExistentes =
                                        getCobrosPrestamo(prestamo.id).filter(
                                          (c: Cobro) =>
                                            c.tipo === "cuota" &&
                                            !!c.id &&
                                            c.id !== "temp"
                                        );

                                      // Crear un cobro por cada cuota pagada
                                      for (let i = 0; i < cuotasAPagar; i++) {
                                        await cobrosDB.crear({
                                          prestamoId: prestamo.id,
                                          monto: valorCuota,
                                          fecha: (() => {
                                            if (data.fecha) {
                                              const [yyyy, mm, dd] =
                                                data.fecha.split("-");
                                              return new Date(
                                                Number(yyyy),
                                                Number(mm) - 1,
                                                Number(dd),
                                                0,
                                                0,
                                                0,
                                                0
                                              ).getTime();
                                            }
                                            return Date.now();
                                          })(),
                                          tipo: "cuota",
                                          comprobante: data.comprobante || "",
                                          tipoPago: data.tipoPago,
                                          imagenComprobante:
                                            data.imagenComprobante || "",
                                          numeroCuota:
                                            cobrosExistentes.length + i + 1,
                                        });
                                      }

                                      // Recalcular el estado del préstamo
                                      const todosCobros = [...cobrosExistentes];
                                      // Simular los nuevos cobros para el cálculo
                                      for (let i = 0; i < cuotasAPagar; i++) {
                                        todosCobros.push({
                                          id: `temp-${i}`,
                                          prestamoId: prestamo.id,
                                          monto: valorCuota,
                                          fecha: Date.now(),
                                          tipo: "cuota",
                                          numeroCuota:
                                            cobrosExistentes.length + i + 1,
                                        } as Cobro);
                                      }

                                      const totalAbonado = todosCobros.reduce(
                                        (acc: number, cobro: Cobro) =>
                                          acc + cobro.monto,
                                        0
                                      );
                                      const montoPendiente = Math.max(
                                        0,
                                        prestamo.monto - totalAbonado
                                      );
                                      const cuotasPendientes = Math.ceil(
                                        montoPendiente / valorCuota
                                      );

                                      // Actualizar el estado del préstamo
                                      if (
                                        montoPendiente <= 0 ||
                                        cuotasPendientes <= 0
                                      ) {
                                        await prestamosDB.actualizar(
                                          prestamo.id,
                                          {
                                            estado: "completado",
                                          }
                                        );
                                      } else {
                                        // Mantener el estado actual si aún hay cuotas pendientes
                                        // Solo cambiar si es necesario actualizar las cuotas atrasadas
                                        const cuotasAtrasadas =
                                          calcularCuotasAtrasadas(
                                            prestamo,
                                            todosCobros
                                          );
                                        if (
                                          cuotasAtrasadas > 0 &&
                                          prestamo.estado !== "atrasado"
                                        ) {
                                          await prestamosDB.actualizar(
                                            prestamo.id,
                                            {
                                              estado: "atrasado",
                                            }
                                          );
                                        } else if (
                                          cuotasAtrasadas === 0 &&
                                          prestamo.estado === "atrasado"
                                        ) {
                                          await prestamosDB.actualizar(
                                            prestamo.id,
                                            {
                                              estado: "activo",
                                            }
                                          );
                                        }
                                        // Si no hay cambios necesarios en el estado, no actualizar nada
                                      }

                                      setMostrarFormularioAbono((prev) => ({
                                        ...prev,
                                        [prestamo.id]: false,
                                      }));
                                    } catch (e) {
                                      console.error(
                                        "Error al abonar cuota:",
                                        e
                                      );
                                      alert("Error al abonar cuota");
                                      setActualizando(false);
                                    } finally {
                                      setAbonando((prev) => ({
                                        ...prev,
                                        [prestamo.id]: false,
                                      }));
                                    }
                                  }}
                                  pagos={getCobrosPrestamo(prestamo.id)}
                                  Tooltip={Tooltip}
                                />
                              </div>
                            </div>
                          )}

                          {/* Plan de pagos */}
                          {prestamo.tipoVenta === "cuotas" &&
                            mostrarPlanPago[prestamo.id] && (
                              <div className='lg:col-span-2'>
                                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200'>
                                  <h4 className='text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2'>
                                    <span>📅</span>
                                    Plan de Pagos
                                  </h4>
                                  <CuadriculaCuotas
                                    fechaInicio={prestamo.fechaInicio}
                                    cobros={getCobrosPrestamo(prestamo.id)}
                                    valorCuota={valorCuota}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales de impresión para cada préstamo */}
      {prestamos.map((prestamo: Prestamo) => (
        <Modal
          key={`print-${prestamo.id}`}
          isOpen={!!mostrarImpresion[prestamo.id]}
          onClose={() => cerrarImpresion(prestamo.id)}
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
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                    />
                  </svg>
                  Imprimir
                </button>
                <button
                  onClick={() => cerrarImpresion(prestamo.id)}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
                >
                  Cerrar
                </button>
              </div>
            </div>

            {cliente && (
              <PlanPagosPrint
                prestamo={prestamo}
                cliente={cliente}
                cobros={getCobrosPrestamo(prestamo.id)}
                valorCuota={prestamo.monto / prestamo.cuotas}
                productosNombres={getProductosNombres(prestamo)}
              />
            )}
          </div>
        </Modal>
      ))}

      {/* Estilos globales para impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print {
            display: none !important;
          }

          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Ocultar elementos del modal en impresión */
          .fixed.inset-0 > div:first-child {
            display: none !important;
          }

          /* Mostrar solo el contenido del plan */
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
