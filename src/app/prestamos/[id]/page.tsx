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
    <div className='max-w-3xl mx-auto p-4'>
      <button
        onClick={() => router.back()}
        className='mb-4 text-indigo-600 hover:underline'
      >
        ← Volver
      </button>
      <h1 className='text-3xl font-bold mb-6 text-gray-900'>
        Detalle del Cliente
      </h1>
      {cliente ? (
        <div className='mb-8 p-6 bg-white rounded-xl shadow flex flex-col gap-1'>
          <div className='font-bold text-xl text-indigo-700'>
            {cliente.nombre}
          </div>
          <div className='text-gray-600'>
            📞 <span className='font-medium'>Teléfono:</span> {cliente.telefono}
          </div>
          <div className='text-gray-600'>
            🏠 <span className='font-medium'>Dirección:</span>{" "}
            {cliente.direccion}
          </div>
        </div>
      ) : (
        <div className='mb-6'>Cargando información del cliente...</div>
      )}

      {/* Resumen global */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-2 text-gray-800'>
          Resumen global
        </h2>
        <div className='flex flex-wrap gap-6'>
          <div className='bg-indigo-50 border border-indigo-200 rounded-lg px-6 py-4 flex flex-col items-center min-w-[180px]'>
            <span className='text-xs text-gray-500 font-semibold uppercase flex items-center'>
              Monto pendiente total
              <Tooltip text='Suma de todos los montos pendientes de todos los préstamos activos de este cliente.' />
            </span>
            <span className='text-3xl font-bold text-indigo-700'>
              ${totalPendiente.toFixed(2)}
            </span>
          </div>
          <div className='bg-red-50 border border-red-200 rounded-lg px-6 py-4 flex flex-col items-center min-w-[180px]'>
            <span className='text-xs text-gray-500 font-semibold uppercase flex items-center'>
              Cuotas atrasadas totales
              <Tooltip text='Suma del valor de todas las cuotas vencidas y no pagadas de todos los préstamos.' />
            </span>
            <span className='text-3xl font-bold text-red-700'>
              ${totalCuotasAtrasadas.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <h2 className='text-2xl font-semibold mb-4 text-gray-800'>Préstamos</h2>
      {prestamos.length === 0 ? (
        <div className='text-gray-500'>No hay préstamos para este cliente.</div>
      ) : (
        <div className='flex flex-col gap-6'>
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
            const montoTotal = Number.isFinite(precioProducto * 1.5)
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
              Number.isFinite(montoTotal / 15) && montoTotal > 0
                ? montoTotal / 15
                : 0.01;
            const cuotasPendientes =
              valorCuota > 0 ? Math.ceil(montoPendiente / valorCuota) : 0;
            const cuotasAtrasadas = calcularCuotasAtrasadas(prestamo);
            const estadoPrincipal =
              cuotasAtrasadas > 0 ? (
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
                className='p-6 bg-gray-50 rounded-xl shadow border border-gray-200 flex flex-col gap-2'
              >
                <div className='flex flex-wrap gap-4 items-center mb-2'>
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
                    {prestamo.estado}
                  </span>
                </div>
                <div className='flex flex-wrap gap-4 items-center'>
                  <span className='font-semibold text-gray-700'>Producto:</span>
                  <span className='text-gray-900'>
                    {getProductoNombre(prestamo.productoId)}
                  </span>
                </div>
                <div className='flex flex-wrap gap-4 items-center'>
                  <span className='font-semibold text-gray-700'>
                    Monto pendiente:
                  </span>
                  <span className='text-gray-900'>
                    ${montoPendiente.toFixed(2)}
                  </span>
                  <Tooltip text='Lo que falta por pagar de este préstamo.' />
                </div>
                <div className='flex flex-wrap gap-4 items-center'>
                  <span className='font-semibold text-gray-700'>
                    Cuotas atrasadas:
                  </span>
                  <span className='text-red-700 font-bold'>
                    {cuotasAtrasadas}
                  </span>
                  <Tooltip text='Cuotas vencidas y no pagadas de este préstamo.' />
                </div>
                <div className='flex flex-wrap gap-4 items-center'>
                  <span className='font-semibold text-gray-700'>
                    Cuotas pendientes:
                  </span>
                  <span className='text-gray-900'>{cuotasPendientes}</span>
                  <Tooltip text='Cuotas que faltan por pagar para completar el préstamo.' />
                </div>
                <div className='flex flex-wrap gap-4 items-center'>
                  <span className='font-semibold text-gray-700'>
                    Monto total deuda:
                  </span>
                  <span className='text-gray-900'>
                    ${montoTotal.toFixed(2)}
                  </span>
                </div>
                <div className='flex flex-wrap gap-4 items-center'>
                  <span className='font-semibold text-gray-700'>Inicio:</span>
                  <span className='text-gray-900'>
                    {new Date(prestamo.fechaInicio).toLocaleDateString()}
                  </span>
                </div>
                {/* Botón para mostrar/ocultar historial de pagos */}
                <button
                  className='mt-2 text-sm text-indigo-600 hover:underline flex items-center'
                  onClick={() =>
                    setShowPagos((prev: Record<string, boolean>) => ({
                      ...prev,
                      [prestamo.id]: !prev[prestamo.id],
                    }))
                  }
                >
                  {showPagos[prestamo.id]
                    ? "Ocultar historial de pagos"
                    : "Ver historial de pagos"}
                </button>
                {showPagos[prestamo.id] && (
                  <div className='mt-3'>
                    {getCobrosPrestamo(prestamo.id).length === 0 ? (
                      <span className='ml-2 text-gray-500'>Sin pagos</span>
                    ) : (
                      <ul className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                        {getCobrosPrestamo(prestamo.id).map((cobro: Cobro) => (
                          <li
                            key={cobro.id}
                            className='flex items-center gap-3 bg-white rounded shadow-sm px-3 py-2 border border-gray-200'
                          >
                            <span className='text-green-500 text-lg'>✔️</span>
                            <span className='font-semibold text-gray-800'>
                              {new Date(cobro.fecha).toLocaleDateString()}
                            </span>
                            <span className='ml-auto px-2 py-1 rounded bg-green-100 text-green-800 font-bold text-sm'>
                              ${cobro.monto.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {prestamo.estado === "activo" && (
                  <>
                    <button
                      className={`mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-fit`}
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
                        const montoTotal = Number.isFinite(precioProducto * 1.5)
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
                          className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
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
