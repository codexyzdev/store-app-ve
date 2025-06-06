import React from "react";
import { Prestamo, Cobro } from "@/lib/firebase/database";

interface ResumenCobrosPendientesProps {
  prestamos: Prestamo[];
  cobros: Cobro[];
}

export default function ResumenCobrosPendientes({
  prestamos,
  cobros,
}: ResumenCobrosPendientesProps) {
  // Obtener la fecha de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Filtrar préstamos activos
  const prestamosActivos = prestamos.filter(
    (p) => p.estado === "activo" || p.estado === "atrasado"
  );

  // Calcular cuotas pendientes y atrasadas
  const cuotasPendientes = prestamosActivos.map((prestamo) => {
    const fechaInicio = new Date(prestamo.fechaInicio);
    const semanasTranscurridas = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const cuotasEsperadas = Math.min(
      semanasTranscurridas + 1,
      Math.min(prestamo.cuotas, 15)
    );
    const cuotasPagadas = cobros.filter(
      (c) => c.prestamoId === prestamo.id && c.tipo === "cuota"
    ).length;
    const cuotasAtrasadas = Math.max(0, cuotasEsperadas - cuotasPagadas);

    return {
      prestamoId: prestamo.id,
      clienteId: prestamo.clienteId,
      cuotasAtrasadas,
      montoCuota: prestamo.monto / prestamo.cuotas,
    };
  });

  // Agrupar por cliente
  const resumenPorCliente = cuotasPendientes.reduce((acc, item) => {
    if (!acc[item.clienteId]) {
      acc[item.clienteId] = {
        clienteId: item.clienteId,
        cuotasAtrasadas: 0,
        montoPendiente: 0,
      };
    }
    acc[item.clienteId].cuotasAtrasadas += item.cuotasAtrasadas;
    acc[item.clienteId].montoPendiente +=
      item.cuotasAtrasadas * item.montoCuota;
    return acc;
  }, {} as Record<string, { clienteId: string; cuotasAtrasadas: number; montoPendiente: number }>);

  const totalCuotasAtrasadas = Object.values(resumenPorCliente).reduce(
    (sum, item) => sum + item.cuotasAtrasadas,
    0
  );

  const totalMontoPendiente = Object.values(resumenPorCliente).reduce(
    (sum, item) => sum + item.montoPendiente,
    0
  );

  return (
    <div className='bg-white shadow rounded-lg p-4 mb-6'>
      <h2 className='text-lg font-semibold mb-4'>Cobros Pendientes del Día</h2>
      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-red-50 p-4 rounded-lg'>
          <h3 className='text-sm font-medium text-red-800'>Cuotas Atrasadas</h3>
          <p className='text-2xl font-bold text-red-600'>
            {totalCuotasAtrasadas}
          </p>
        </div>
        <div className='bg-yellow-50 p-4 rounded-lg'>
          <h3 className='text-sm font-medium text-yellow-800'>
            Monto Pendiente
          </h3>
          <p className='text-2xl font-bold text-yellow-600'>
            ${totalMontoPendiente.toFixed(2)}
          </p>
        </div>
      </div>
      <div className='mt-4'>
        <h3 className='text-sm font-medium text-gray-700 mb-2'>
          Detalle por Cliente
        </h3>
        <div className='space-y-2'>
          {Object.values(resumenPorCliente)
            .filter((item) => item.cuotasAtrasadas > 0)
            .map((item) => (
              <div
                key={item.clienteId}
                className='flex justify-between items-center p-2 bg-gray-50 rounded'
              >
                <span className='text-sm text-gray-600'>
                  {item.cuotasAtrasadas} cuotas atrasadas
                </span>
                <span className='text-sm font-medium text-gray-900'>
                  ${item.montoPendiente.toFixed(2)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
