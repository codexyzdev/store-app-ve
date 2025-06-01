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

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Reducir cuotas pendientes
      const nuevasCuotas = prestamo.cuotas - 1;
      const nuevoEstado = nuevasCuotas <= 0 ? "completado" : prestamo.estado;
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

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Préstamos</h1>
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
                    Producto
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Monto
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Cuotas
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Inicio
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Estado
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Última cuota pagada
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Alerta
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {prestamosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='text-center py-8 text-gray-400'>
                      No hay préstamos registrados
                    </td>
                  </tr>
                ) : (
                  prestamosFiltrados.map((prestamo) => (
                    <tr
                      key={prestamo.id}
                      className='hover:bg-indigo-50 transition-colors duration-150'
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base'>
                            {getClienteNombre(
                              prestamo.clienteId
                            )[0]?.toUpperCase()}
                          </div>
                          <Link
                            href={`/prestamos/${prestamo.clienteId}`}
                            className='text-indigo-700 font-semibold hover:underline'
                          >
                            {getClienteNombre(prestamo.clienteId)}
                          </Link>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        {getProductoNombre(prestamo.productoId)}
                      </td>
                      <td className='px-4 py-3'>
                        ${prestamo.monto.toFixed(2)}
                      </td>
                      <td className='px-4 py-3'>{prestamo.cuotas}</td>
                      <td className='px-4 py-3'>
                        {new Date(prestamo.fechaInicio).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            prestamo.estado === "activo"
                              ? "bg-green-100 text-green-800"
                              : prestamo.estado === "completado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {prestamo.estado}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        {(() => {
                          const ultima = getUltimaCuota(prestamo.id);
                          return ultima
                            ? new Date(ultima.fecha).toLocaleDateString()
                            : "Sin pagos";
                        })()}
                      </td>
                      <td className='px-4 py-3'>
                        {getAlertaPago(prestamo.id) ? (
                          <span className='px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800'>
                            Pendiente por pagar
                          </span>
                        ) : (
                          <span className='px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800'>
                            Al día
                          </span>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <button
                          className='px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-xs shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                          onClick={() => handleAbonarCuota(prestamo)}
                        >
                          Abonar cuota
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas para móvil */}
          <div className='md:hidden space-y-4'>
            {prestamosFiltrados.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                No hay préstamos registrados
              </div>
            ) : (
              prestamosFiltrados.map((prestamo) => (
                <div
                  key={prestamo.id}
                  className='bg-white shadow rounded-xl p-4 flex flex-col gap-2 border border-gray-100'
                >
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base'>
                      {getClienteNombre(prestamo.clienteId)[0]?.toUpperCase()}
                    </div>
                    <span className='text-indigo-700 font-semibold'>
                      {getClienteNombre(prestamo.clienteId)}
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-4 text-sm'>
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Producto:
                      </span>{" "}
                      {getProductoNombre(prestamo.productoId)}
                    </div>
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Monto:
                      </span>{" "}
                      ${prestamo.monto.toFixed(2)}
                    </div>
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Cuotas:
                      </span>{" "}
                      {prestamo.cuotas}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-4 text-sm'>
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Inicio:
                      </span>{" "}
                      {new Date(prestamo.fechaInicio).toLocaleDateString()}
                    </div>
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Estado:
                      </span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
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
                  </div>
                  <div className='flex flex-wrap gap-4 text-sm'>
                    <div>
                      <span className='font-semibold text-gray-700'>
                        Última cuota:
                      </span>{" "}
                      {(() => {
                        const ultima = getUltimaCuota(prestamo.id);
                        return ultima
                          ? new Date(ultima.fecha).toLocaleDateString()
                          : "Sin pagos";
                      })()}
                    </div>
                    <div>
                      {getAlertaPago(prestamo.id) ? (
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
                  <div className='flex justify-end mt-2'>
                    <button
                      className='px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-xs shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                      onClick={() => handleAbonarCuota(prestamo)}
                    >
                      Abonar cuota
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
