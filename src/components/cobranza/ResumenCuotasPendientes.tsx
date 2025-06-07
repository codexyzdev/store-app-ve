import React from "react";
import { Prestamo, Producto, Cliente } from "@/lib/firebase/database";
import Link from "next/link";

interface ResumenCuotasPendientesProps {
  prestamos: Prestamo[];
  productos: Producto[];
  clientes: Cliente[];
  cobros: import("@/lib/firebase/database").Cobro[];
}

export default function ResumenCuotasPendientes({
  prestamos,
  productos,
  clientes,
  cobros,
}: ResumenCuotasPendientesProps) {
  // Filtrar préstamos activos
  const prestamosActivos = prestamos.filter(
    (p) => p.estado === "activo" || p.estado === "atrasado"
  );

  // Obtener fecha de hoy y de 7 días adelante
  const hoy = new Date();
  const sieteDiasDespues = new Date();
  sieteDiasDespues.setDate(hoy.getDate() + 7);

  // Filtrar préstamos con cuotas por pagar en los próximos 7 días
  const prestamosConCuotasPendientes = prestamosActivos.filter((prestamo) => {
    const fechaInicio = new Date(prestamo.fechaInicio);
    const semanasTranscurridas = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const proximaCuota = new Date(fechaInicio);
    proximaCuota.setDate(
      fechaInicio.getDate() + (semanasTranscurridas + 1) * 7
    );
    return proximaCuota >= hoy && proximaCuota <= sieteDiasDespues;
  });

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : "N/A";
  };

  const getClienteNombre = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nombre : "N/A";
  };

  return (
    <div className='mb-6'>
      <h2 className='text-lg font-semibold mb-4'>
        Cuotas por Pagar en los Próximos 7 Días
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {prestamosConCuotasPendientes.map((prestamo) => {
          const cobrosPrestamo = cobros.filter(
            (c) => c.prestamoId === prestamo.id && c.tipo === "cuota"
          );
          const cuotaActual = cobrosPrestamo.length + 1;
          const montoCuota = prestamo.monto / prestamo.cuotas;
          const fechaInicio = new Date(prestamo.fechaInicio);
          const proximaCuota = new Date(fechaInicio);
          proximaCuota.setDate(
            fechaInicio.getDate() + cobrosPrestamo.length * 7
          );

          return (
            <Link
              key={prestamo.id}
              href={`/prestamos/${prestamo.clienteId}`}
              className='bg-white p-4 rounded-lg shadow border border-gray-200 block hover:shadow-lg hover:border-indigo-400 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400'
            >
              <div className='flex justify-between items-start mb-2'>
                <div>
                  <h3 className='font-semibold text-gray-900 text-indigo-700 hover:underline'>
                    {getClienteNombre(prestamo.clienteId)}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {getProductoNombre(prestamo.productoId)}
                  </p>
                </div>
                <span className='px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                  ${montoCuota.toFixed(2)}
                </span>
              </div>
              <div className='text-sm text-gray-600'>
                <p>Fecha de pago: {proximaCuota.toLocaleDateString()}</p>
                <p>
                  Cuota {cuotaActual} de {prestamo.cuotas}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {prestamosConCuotasPendientes.length === 0 && (
        <p className='text-gray-500 text-center py-4'>
          No hay cuotas pendientes para los próximos 7 días
        </p>
      )}
    </div>
  );
}
