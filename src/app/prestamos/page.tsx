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
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");

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
  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : "-";
  };

  // Obtener el último cobro de tipo 'cuota' para un préstamo
  const getUltimaCuota = (prestamoId: string) => {
    const cobrosPrestamo = cobros
      .filter((c) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a, b) => b.fecha - a.fecha);
    return cobrosPrestamo[0] || null;
  };

  // Determinar si hay alerta de pago pendiente
  const getAlertaPago = (prestamoId: string) => {
    const ultima = getUltimaCuota(prestamoId);
    if (!ultima) return true;
    const ahora = Date.now();
    const dosSemanas = 14 * 24 * 60 * 60 * 1000;
    return ahora - ultima.fecha > dosSemanas;
  };

  const handleAbonarCuota = async (prestamo: Prestamo) => {
    const montoDefault = (prestamo.monto / prestamo.cuotas).toFixed(2);
    const montoStr = prompt(
      `Monto a abonar (cuota sugerida: $${montoDefault}):`,
      montoDefault
    );
    if (!montoStr) return;
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      alert("Monto inválido");
      return;
    }
    try {
      await cobrosDB.crear({
        prestamoId: prestamo.id,
        monto,
        fecha: Date.now(),
        tipo: "cuota",
      });
      // Volver a obtener los cobros más recientes para este préstamo
      const nuevosCobros = [
        ...cobros.filter(
          (c) => c.prestamoId === prestamo.id && c.tipo === "cuota"
        ),
        {
          monto,
          tipo: "cuota",
          fecha: Date.now(),
          prestamoId: prestamo.id,
          id: "temp",
        },
      ];
      const producto = productos.find(
        (prod) => prod.id === prestamo.productoId
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
      const abonos = nuevosCobros.reduce(
        (acc2, cobro) =>
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
      const valorCuota =
        Number.isFinite(montoTotal / 15) && montoTotal > 0
          ? montoTotal / 15
          : 0.01;
      const cuotasPendientes =
        valorCuota > 0 ? Math.ceil(montoPendiente / valorCuota) : 0;
      const nuevasCuotas =
        montoPendiente <= 0 || cuotasPendientes <= 0 ? 0 : prestamo.cuotas - 1;
      const nuevoEstado =
        montoPendiente <= 0 || cuotasPendientes <= 0 || nuevasCuotas <= 0
          ? "completado"
          : prestamo.estado;
      await prestamosDB.actualizar(prestamo.id, {
        cuotas: nuevasCuotas,
        estado: nuevoEstado,
      });
      alert("Abono registrado y cuotas actualizadas");
    } catch (error) {
      alert("Error al registrar el abono");
      console.error(error);
    }
  };

  // Filtrar préstamos por cliente, producto, monto o cédula
  const prestamosFiltrados = prestamos.filter((prestamo) => {
    const clienteNombre = (
      getClienteNombre(prestamo.clienteId) || ""
    ).toLowerCase();
    const clienteCedula = (
      getClienteCedula(prestamo.clienteId) || ""
    ).toLowerCase();
    const productoNombre = (
      getProductoNombre(prestamo.productoId) || ""
    ).toLowerCase();
    const monto = prestamo.monto.toFixed(2);
    return (
      clienteNombre.includes(busqueda.toLowerCase()) ||
      clienteCedula.includes(busqueda.toLowerCase()) ||
      productoNombre.includes(busqueda.toLowerCase()) ||
      monto.includes(busqueda)
    );
  });

  type GrupoPrestamos = {
    clienteId: string;
    nombre: string;
    cedula: string;
    prestamos: Prestamo[];
  };

  const prestamosAgrupados = prestamosFiltrados.reduce(
    (acc: Record<string, GrupoPrestamos>, prestamo: Prestamo) => {
      const clienteId = prestamo.clienteId;
      if (!acc[clienteId]) {
        acc[clienteId] = {
          clienteId,
          nombre: getClienteNombre(clienteId),
          cedula: getClienteCedula(clienteId),
          prestamos: [],
        };
      }
      acc[clienteId].prestamos.push(prestamo);
      return acc;
    },
    {}
  );

  const prestamosAgrupadosArray: GrupoPrestamos[] =
    Object.values(prestamosAgrupados);

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Préstamos</h1>
        <Link
          href='/prestamos/nuevo'
          className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          Nuevo Préstamo
        </Link>
      </div>
      <div className='mb-4'>
        <div className='relative rounded-md shadow-sm'>
          <input
            type='text'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder='Buscar por cliente, cédula, producto o monto...'
            className='block w-full pl-4 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
      </div>
      <Modal
        isOpen={modalNuevoCliente}
        onClose={() => setModalNuevoCliente(false)}
        title='Nuevo Cliente'
      >
        <NuevoClienteForm
          onClienteCreado={(cliente) => {
            setModalNuevoCliente(false);
            setBusqueda(cliente.nombre);
            clientesDB.suscribir(setClientes);
          }}
          onCancel={() => setModalNuevoCliente(false)}
        />
      </Modal>
      {loading ? (
        <div className='flex justify-center items-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
        </div>
      ) : (
        <>
          {/* Tabla para escritorio */}
          <div className='bg-white shadow rounded-lg overflow-x-auto hidden md:block'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Cliente
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Total Préstamos
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Préstamos Activos
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Total Pendiente
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Último Pago
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {prestamosAgrupadosArray.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center py-8 text-gray-400'>
                      No hay préstamos registrados
                    </td>
                  </tr>
                ) : (
                  prestamosAgrupadosArray.map((grupo: GrupoPrestamos) => {
                    // Calcular total pendiente correctamente: monto total - abonos
                    const prestamosPendientes = grupo.prestamos.filter(
                      (p) =>
                        (p.estado === "activo" || p.estado === "atrasado") &&
                        p.cuotas > 0
                    );
                    const prestamosActivos = prestamosPendientes;
                    const totalPendiente = prestamosPendientes.reduce(
                      (sum, p) => {
                        // Buscar producto
                        const producto = productos.find(
                          (prod) => prod.id === p.productoId
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
                        // Sumar abonos/cobros
                        const abonos = cobros
                          .filter(
                            (c) => c.prestamoId === p.id && c.tipo === "cuota"
                          )
                          .reduce(
                            (acc2, cobro) =>
                              acc2 +
                              (typeof cobro.monto === "number" &&
                              !isNaN(cobro.monto)
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
                        return sum + montoPendiente;
                      },
                      0
                    );
                    const ultimoPago = grupo.prestamos.reduce(
                      (ultimo, prestamo) => {
                        const ultimaCuota = getUltimaCuota(prestamo.id);
                        if (!ultimaCuota) return ultimo;
                        return !ultimo || ultimaCuota.fecha > ultimo.fecha
                          ? ultimaCuota
                          : ultimo;
                      },
                      null as Cobro | null
                    );
                    // Estado global: si tiene algún préstamo activo o atrasado, mostrar alerta, si no, mostrar 'Al día'
                    const tieneAlerta = prestamosActivos.length > 0;
                    return (
                      <tr
                        key={grupo.clienteId}
                        className='hover:bg-indigo-50 transition-colors duration-150 cursor-pointer'
                        onClick={() =>
                          (window.location.href = `/prestamos/${grupo.clienteId}`)
                        }
                      >
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base'>
                              {grupo.nombre[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className='text-indigo-700 font-semibold'>
                                {grupo.nombre}
                              </div>
                              <div className='text-xs text-gray-500'>
                                C.I.: {grupo.cedula}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3'>{grupo.prestamos.length}</td>
                        <td className='px-4 py-3'>{prestamosActivos.length}</td>
                        <td className='px-4 py-3'>
                          ${totalPendiente.toFixed(2)}
                        </td>
                        <td className='px-4 py-3'>
                          {ultimoPago
                            ? new Date(ultimoPago.fecha).toLocaleDateString()
                            : "Sin pagos"}
                        </td>
                        <td className='px-4 py-3'>
                          {tieneAlerta ? (
                            <span className='px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800'>
                              Pendiente por pagar
                            </span>
                          ) : (
                            <span className='px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800'>
                              Al día
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para móvil */}
          <div className='md:hidden space-y-4'>
            {prestamosAgrupadosArray.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                No hay préstamos registrados
              </div>
            ) : (
              prestamosAgrupadosArray.map((grupo: GrupoPrestamos) => {
                const prestamosActivos = grupo.prestamos.filter(
                  (p) => p.estado === "activo"
                );
                const totalPendiente = prestamosActivos.reduce((sum, p) => {
                  const cuotaMonto = p.monto / p.cuotas;
                  const cuotasPendientes = p.cuotas;
                  return sum + cuotaMonto * cuotasPendientes;
                }, 0);

                const ultimoPago = grupo.prestamos.reduce(
                  (ultimo, prestamo) => {
                    const ultimaCuota = getUltimaCuota(prestamo.id);
                    if (!ultimaCuota) return ultimo;
                    return !ultimo || ultimaCuota.fecha > ultimo.fecha
                      ? ultimaCuota
                      : ultimo;
                  },
                  null as Cobro | null
                );

                const tieneAlerta = grupo.prestamos.some((p) =>
                  getAlertaPago(p.id)
                );

                return (
                  <div
                    key={grupo.clienteId}
                    className='bg-white shadow rounded-xl p-4 flex flex-col gap-2 border border-gray-100 cursor-pointer'
                    onClick={() =>
                      (window.location.href = `/prestamos/${grupo.clienteId}`)
                    }
                  >
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base'>
                        {grupo.nombre[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className='text-indigo-700 font-semibold'>
                          {grupo.nombre}
                        </span>
                        <span className='ml-2 text-xs text-gray-500'>
                          C.I.: {grupo.cedula}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-4 text-sm'>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Total Préstamos:
                        </span>{" "}
                        {grupo.prestamos.length}
                      </div>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Préstamos Activos:
                        </span>{" "}
                        {prestamosActivos.length}
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-4 text-sm'>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Total Pendiente:
                        </span>{" "}
                        ${totalPendiente.toFixed(2)}
                      </div>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Último Pago:
                        </span>{" "}
                        {ultimoPago
                          ? new Date(ultimoPago.fecha).toLocaleDateString()
                          : "Sin pagos"}
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-4 text-sm'>
                      <div>
                        <span className='font-semibold text-gray-700'>
                          Estado:
                        </span>{" "}
                        {tieneAlerta ? (
                          <span className='px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800'>
                            Pendiente por pagar
                          </span>
                        ) : (
                          <span className='px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800'>
                            Al día
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
