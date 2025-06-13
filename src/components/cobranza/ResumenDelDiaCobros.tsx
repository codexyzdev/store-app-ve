import React from "react";
import { Cobro, FinanciamientoCuota } from "@/lib/firebase/database";

interface ResumenDelDiaCobrosProps {
  cobros: Cobro[];
  prestamos: FinanciamientoCuota[];
}

export default function ResumenDelDiaCobros({
  cobros,
  prestamos,
}: ResumenDelDiaCobrosProps) {
  // Total cobrado hoy
  const totalCobrado = cobros.reduce((sum, cobro) => sum + cobro.monto, 0);
  // Cantidad de cobros realizados hoy
  const cantidadCobros = cobros.length;

  // Calcular monto pendiente hoy (solo prestamos activos o atrasados)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let montoPendiente = 0;

  prestamos.forEach((prestamo) => {
    if (prestamo.estado === "activo" || prestamo.estado === "atrasado") {
      // Suponiendo que cada cuota es semanal y la fecha de inicio es fecha base
      const fechaInicio = new Date(prestamo.fechaInicio);
      for (let i = 0; i < prestamo.cuotas; i++) {
        const fechaCuota = new Date(fechaInicio);
        fechaCuota.setDate(fechaInicio.getDate() + i * 7);
        if (fechaCuota.getTime() === hoy.getTime()) {
          // ¿Ya se pagó esta cuota?
          const cobrosPrestamo = cobros.filter(
            (c) => c.financiamientoId === prestamo.id && c.tipo === "cuota"
          );
          if (cobrosPrestamo.length <= i) {
            montoPendiente += prestamo.monto / prestamo.cuotas;
          }
        }
      }
    }
  });

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
      <div className='bg-green-50 p-6 rounded-xl text-center shadow-sm flex flex-col items-center'>
        <span className='text-sm text-green-800 font-medium mb-1'>
          Total cobrado hoy
        </span>
        <span className='text-3xl font-extrabold text-green-600'>
          ${totalCobrado.toFixed(2)}
        </span>
      </div>
      <div className='bg-blue-50 p-6 rounded-xl text-center shadow-sm flex flex-col items-center'>
        <span className='text-sm text-blue-800 font-medium mb-1'>
          Cobros realizados
        </span>
        <span className='text-3xl font-extrabold text-blue-600'>
          {cantidadCobros}
        </span>
      </div>
      <div className='bg-yellow-50 p-6 rounded-xl text-center shadow-sm flex flex-col items-center'>
        <span className='text-sm text-yellow-800 font-medium mb-1'>
          Monto pendiente hoy
        </span>
        <span className='text-3xl font-extrabold text-yellow-600'>
          ${montoPendiente.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
