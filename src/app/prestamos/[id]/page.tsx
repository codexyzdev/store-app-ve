"use client";

import React, { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  clientesDB,
  Cliente,
  prestamosDB,
  Prestamo,
  cobrosDB,
  Cobro,
  inventarioDB,
  Producto,
} from "@/lib/firebase/database";

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
  const clienteId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

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

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p: Producto) => p.id === id);
    return producto ? producto.nombre : "-";
  };

  const getCobrosPrestamo = (prestamoId: string) =>
    cobros
      .filter((c: Cobro) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a: Cobro, b: Cobro) => b.fecha - a.fecha);

  // Lógica para cuotas atrasadas semanales (máximo 15 cuotas)
  function calcularCuotasAtrasadas(prestamo: Prestamo) {
    if (prestamo.estado !== "activo") return 0;
    const fechaInicio = new Date(prestamo.fechaInicio);
    const hoy = new Date();
    const semanasTranscurridas = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const cuotasEsperadas = Math.min(
      semanasTranscurridas + 1,
      Math.min(prestamo.cuotas, 15)
    );
    const cuotasPagadas = cobros.filter(
      (c: Cobro) => c.prestamoId === prestamo.id && c.tipo === "cuota"
    ).length;
    return Math.max(0, cuotasEsperadas - cuotasPagadas);
  }

  // Calcular totales
  const totalPendiente = prestamos.reduce((acc: number, p: Prestamo) => {
    const producto = productos.find(
      (prod: Producto) => prod.id === p.productoId
    );
    const precioProducto =
      producto && typeof producto.precio === "number" && !isNaN(producto.precio)
        ? producto.precio
        : 0;
    const montoTotal = Number.isFinite(precioProducto * 1.5)
      ? precioProducto * 1.5
      : 0;
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
      Number.isFinite(montoTotal - abonos) ? montoTotal - abonos : 0
    );
    return acc + montoPendiente;
  }, 0);

  const totalCuotasAtrasadas = prestamos.reduce((acc: number, p: Prestamo) => {
    const producto = productos.find(
      (prod: Producto) => prod.id === p.productoId
    );
    const precioProducto =
      producto && typeof producto.precio === "number" && !isNaN(producto.precio)
        ? producto.precio
        : 0;
    const montoTotal = Number.isFinite(precioProducto * 1.5)
      ? precioProducto * 1.5
      : 0;
    const valorCuota =
      Number.isFinite(montoTotal / 15) && montoTotal > 0
        ? montoTotal / 15
        : 0.01;
    const atrasadas = calcularCuotasAtrasadas(p);
    return acc + atrasadas * valorCuota;
  }, 0);

  // Función para abonar cuota
  const abonarCuota = async (prestamo: Prestamo) => {
    if (prestamo.tipoVenta === "contado") {
      alert("No se pueden abonar cuotas en una venta al contado.");
      return;
    }
    setAbonando((prev: { [key: string]: boolean }) => ({
      ...prev,
      [prestamo.id]: true,
    }));
    try {
      const monto = montoAbono[prestamo.id];
      if (!monto || isNaN(monto) || monto <= 0) {
        alert("Por favor ingresa un monto válido");
        setAbonando((prev: { [key: string]: boolean }) => ({
          ...prev,
          [prestamo.id]: false,
        }));
        return;
      }
      await cobrosDB.crear({
        prestamoId: prestamo.id,
        monto: monto,
        fecha: Date.now(),
        tipo: "cuota",
      });
      setMostrarFormularioAbono((prev: { [key: string]: boolean }) => ({
        ...prev,
        [prestamo.id]: false,
      }));
    } catch (e) {
      alert("Error al abonar cuota");
    } finally {
      setAbonando((prev: { [key: string]: boolean }) => ({
        ...prev,
        [prestamo.id]: false,
      }));
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 md:p-8'>
      {/* <button
        onClick={() => router.back()}
        className='mb-6 text-indigo-600 hover:underline flex items-center text-base font-medium px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition'
        aria-label='Volver'
      >
        ← Volver
      </button> */}
      <h1 className='text-3xl font-extrabold mb-8 text-gray-900 tracking-tight leading-tight'>
        Detalle del Cliente
      </h1>
      {cliente ? (
        <div className='mb-8 p-6 bg-white rounded-xl shadow flex flex-col md:flex-row items-center gap-6'>
          <div className='flex-shrink-0 w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl'>
            {cliente.nombre[0]?.toUpperCase()}
          </div>
          <div className='flex-1 w-full'>
            <div className='text-2xl font-bold text-indigo-800 mb-1'>
              {cliente.nombre}
            </div>
            <div className='flex items-center text-gray-600 mt-1'>
              <span className='mr-2'>📞</span>{" "}
              <span className='font-medium'>Teléfono:</span> {cliente.telefono}
            </div>
            <div className='flex items-center text-gray-600 mt-1'>
              <span className='mr-2'>🏠</span>{" "}
              <span className='font-medium'>Dirección:</span>{" "}
              {cliente.direccion}
            </div>
            {cliente.cedula && (
              <div className='flex items-center text-gray-600 mt-1'>
                <span className='mr-2'>🪪</span>{" "}
                <span className='font-medium'>Cédula:</span> {cliente.cedula}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='mb-6'>Cargando información del cliente...</div>
      )}

      {/* Resumen global */}
      <div className='mb-12'>
        <h2 className='text-xl font-bold mb-4 text-gray-800'>Resumen global</h2>
        <div className='flex flex-col sm:flex-row gap-6'>
          <div className='flex-1 bg-indigo-50 border border-indigo-200 rounded-lg px-6 py-4 flex flex-col items-center shadow'>
            <span className='text-xs text-gray-500 font-semibold uppercase flex items-center mb-1'>
              <span className='mr-1'>💰</span> Monto pendiente total
              <Tooltip text='Suma de todos los montos pendientes de todos los préstamos activos de este cliente.' />
            </span>
            <span className='text-3xl font-bold text-indigo-700'>
              ${totalPendiente.toFixed(2)}
            </span>
          </div>
          <div className='flex-1 bg-red-50 border border-red-200 rounded-lg px-6 py-4 flex flex-col items-center shadow'>
            <span className='text-xs text-gray-500 font-semibold uppercase flex items-center mb-1'>
              <span className='mr-1'>⏰</span> Cuotas atrasadas totales
              <Tooltip text='Suma del valor de todas las cuotas vencidas y no pagadas de todos los préstamos.' />
            </span>
            <span className='text-3xl font-bold text-red-700'>
              ${totalCuotasAtrasadas.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <h2 className='text-2xl font-bold mb-6 text-gray-800'>Préstamos</h2>
      {prestamos.length === 0 ? (
        <div className='text-gray-500 text-base'>
          No hay préstamos para este cliente.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {prestamos.map((prestamo: Prestamo) => {
            const producto = productos.find(
              (p: Producto) => p.id === prestamo.productoId
            );
            const precioProducto =
              producto &&
              typeof producto.precio === "number" &&
              !isNaN(producto.precio)
                ? producto.precio
                : 0;
            const montoTotal =
              prestamo.tipoVenta === "contado"
                ? precioProducto
                : Number.isFinite(precioProducto * 1.5)
                ? precioProducto * 1.5
                : 0;
            const abonos = getCobrosPrestamo(prestamo.id).reduce(
              (acc: number, cobro: Cobro) =>
                acc +
                (typeof cobro.monto === "number" && !isNaN(cobro.monto)
                  ? cobro.monto
                  : 0),
              0
            );
            const montoPendiente = Math.max(
              0,
              Number.isFinite(montoTotal - abonos) ? montoTotal - abonos : 0
            );
            const valorCuota =
              prestamo.tipoVenta === "contado"
                ? 0
                : Number.isFinite(montoTotal / 15) && montoTotal > 0
                ? montoTotal / 15
                : 0.01;
            const cuotasPendientes =
              prestamo.tipoVenta === "contado"
                ? 0
                : valorCuota > 0
                ? Math.ceil(montoPendiente / valorCuota)
                : 0;
            const cuotasAtrasadas =
              prestamo.tipoVenta === "contado"
                ? 0
                : calcularCuotasAtrasadas(prestamo);
            const estadoPrincipal =
              prestamo.tipoVenta === "contado" ? (
                <span className='text-blue-700 font-bold text-lg flex items-center'>
                  <span className='mr-1'>💵</span>Pagado
                </span>
              ) : cuotasAtrasadas > 0 ? (
                <span className='text-red-700 font-bold text-lg flex items-center'>
                  <span className='mr-1'>⏰</span>Atrasado: {cuotasAtrasadas}{" "}
                  cuota{cuotasAtrasadas > 1 ? "s" : ""}
                </span>
              ) : (
                <span className='text-green-700 font-bold text-lg flex items-center'>
                  <span className='mr-1'>✔️</span>Al día
                </span>
              );
            return (
              <div
                key={prestamo.id}
                className='p-6 bg-white rounded-2xl shadow border border-gray-200 flex flex-col gap-4 min-h-[220px]'
              >
                <div className='flex flex-wrap gap-2 items-center mb-2'>
                  {estadoPrincipal}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                      prestamo.estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : prestamo.estado === "completado"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {prestamo.tipoVenta === "contado"
                      ? "Contado"
                      : prestamo.estado}
                  </span>
                  <span className='ml-2 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700'>
                    Tipo:{" "}
                    {prestamo.tipoVenta === "contado" ? "Contado" : "Cuotas"}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <span className='font-semibold'>📦 Producto:</span>
                  <span className='text-gray-900'>
                    {getProductoNombre(prestamo.productoId)}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <span className='font-semibold'>💵 Monto total:</span>
                  <span className='text-gray-900'>
                    ${montoTotal.toFixed(2)}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <span className='font-semibold'>📅 Inicio:</span>
                  <span className='text-gray-900'>
                    {new Date(prestamo.fechaInicio).toLocaleDateString()}
                  </span>
                </div>
                {prestamo.tipoVenta === "cuotas" && (
                  <>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <span className='font-semibold'>⏳ Monto pendiente:</span>
                      <span className='text-gray-900'>
                        ${montoPendiente.toFixed(2)}
                      </span>
                      <Tooltip text='Lo que falta por pagar de este préstamo.' />
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <span className='font-semibold'>
                        ⏰ Cuotas atrasadas:
                      </span>
                      <span className='text-red-700 font-bold'>
                        {cuotasAtrasadas}
                      </span>
                      <Tooltip text='Cuotas vencidas y no pagadas de este préstamo.' />
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <span className='font-semibold'>
                        📋 Cuotas pendientes:
                      </span>
                      <span className='text-gray-900'>{cuotasPendientes}</span>
                      <Tooltip text='Cuotas que faltan por pagar para completar el préstamo.' />
                    </div>
                  </>
                )}
                {/* Botón de abonar cuota solo para cuotas y si está activo */}
                {prestamo.tipoVenta === "cuotas" &&
                  prestamo.estado === "activo" && (
                    <>
                      <button
                        className='mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-fit text-base'
                        onClick={() => {
                          // Al mostrar el formulario, poner el valor de la cuota por defecto
                          const producto = productos.find(
                            (p: Producto) => p.id === prestamo.productoId
                          );
                          const precioProducto =
                            producto &&
                            typeof producto.precio === "number" &&
                            !isNaN(producto.precio)
                              ? producto.precio
                              : 0;
                          const montoTotal = Number.isFinite(
                            precioProducto * 1.5
                          )
                            ? precioProducto * 1.5
                            : 0;
                          const valorCuota =
                            Number.isFinite(montoTotal / 15) && montoTotal > 0
                              ? montoTotal / 15
                              : 0.01;
                          setMontoAbono((prev: { [key: string]: number }) => ({
                            ...prev,
                            [prestamo.id]: valorCuota,
                          }));
                          setMostrarFormularioAbono(
                            (prev: { [key: string]: boolean }) => ({
                              ...prev,
                              [prestamo.id]: !prev[prestamo.id],
                            })
                          );
                        }}
                        disabled={abonando[prestamo.id]}
                      >
                        {mostrarFormularioAbono[prestamo.id]
                          ? "Cancelar"
                          : "Abonar cuota"}
                      </button>
                      {mostrarFormularioAbono[prestamo.id] && (
                        <form
                          className='mt-2 flex flex-col sm:flex-row gap-2 items-start'
                          onSubmit={(e: FormEvent<HTMLFormElement>) => {
                            e.preventDefault();
                            abonarCuota(prestamo);
                          }}
                        >
                          <input
                            type='number'
                            min='0.01'
                            step='0.01'
                            className='border rounded px-2 py-1 w-32'
                            value={
                              Number.isFinite(montoAbono[prestamo.id])
                                ? montoAbono[prestamo.id]
                                : ""
                            }
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setMontoAbono(
                                (prev: { [key: string]: number }) => ({
                                  ...prev,
                                  [prestamo.id]: parseFloat(e.target.value),
                                })
                              )
                            }
                            required
                          />
                          <button
                            type='submit'
                            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed text-base'
                            disabled={abonando[prestamo.id]}
                          >
                            {abonando[prestamo.id]
                              ? "Abonando..."
                              : "Confirmar abono"}
                          </button>
                        </form>
                      )}
                    </>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
