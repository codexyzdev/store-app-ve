"use client";

import { useEffect, useState } from "react";
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

import ClienteCard from "@/components/prestamos/ClienteCard";
import ResumenGlobal from "@/components/prestamos/ResumenGlobal";
import PrestamoCard from "@/components/prestamos/PrestamoCard";

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
    if (p.tipoVenta !== "cuotas" || p.estado !== "activo") return acc;
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
      <h1 className='text-3xl font-extrabold mb-8 text-gray-900 tracking-tight leading-tight'>
        Detalle del Cliente
      </h1>
      {cliente ? (
        <ClienteCard
          nombre={cliente.nombre}
          telefono={cliente.telefono}
          direccion={cliente.direccion}
          cedula={cliente.cedula}
          fotoCedulaUrl={cliente.fotoCedulaUrl}
        />
      ) : (
        <div className='mb-6'>Cargando información del cliente...</div>
      )}

      {/* Resumen global */}
      <ResumenGlobal
        totalPendiente={totalPendiente}
        totalCuotasAtrasadas={totalCuotasAtrasadas}
      />

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
              <PrestamoCard
                key={prestamo.id}
                prestamo={prestamo}
                producto={producto}
                abonos={abonos}
                montoTotal={montoTotal}
                montoPendiente={montoPendiente}
                valorCuota={valorCuota}
                cuotasPendientes={cuotasPendientes}
                cuotasAtrasadas={cuotasAtrasadas}
                estadoPrincipal={estadoPrincipal}
                mostrarFormularioAbono={!!mostrarFormularioAbono[prestamo.id]}
                abonando={!!abonando[prestamo.id]}
                montoAbono={montoAbono[prestamo.id]}
                onMostrarFormularioAbono={() => {
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
                onChangeMontoAbono={(valor) =>
                  setMontoAbono((prev: { [key: string]: number }) => ({
                    ...prev,
                    [prestamo.id]: valor,
                  }))
                }
                onAbonarCuota={(e) => {
                  e.preventDefault();
                  abonarCuota(prestamo);
                }}
                pagos={getCobrosPrestamo(prestamo.id)}
                Tooltip={Tooltip}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
