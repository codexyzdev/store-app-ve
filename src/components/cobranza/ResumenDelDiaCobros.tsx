import React from "react";
import { Cobro, Prestamo } from "@/lib/firebase/database";

interface ResumenDelDiaCobrosProps {
  cobros: Cobro[];
  prestamos: Prestamo[];
}

export default function ResumenDelDiaCobros({
  cobros,
  prestamos,
}: ResumenDelDiaCobrosProps) {
  // Total cobrado hoy
  const totalCobrado = cobros.reduce((sum, cobro) => sum + cobro.monto, 0);
  // Cantidad de cobros realizados hoy
  const cantidadCobros = cobros.length;

  // Calcular cuotas atrasadas y monto pendiente
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let cuotasAtrasadas = 0;
  let montoPendiente = 0;

  prestamos.forEach((prestamo) => {
    if (prestamo.estado !== "activo" && prestamo.estado !== "atrasado") return;
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
    const atrasadas = Math.max(0, cuotasEsperadas - cuotasPagadas);
    cuotasAtrasadas += atrasadas;
    montoPendiente += atrasadas * (prestamo.monto / prestamo.cuotas);
  });

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
      <div className='bg-green-50 p-4 rounded-lg text-center'>
        <div className='text-sm text-green-800 font-medium'>
          Total cobrado hoy
        </div>
        <div className='text-2xl font-bold text-green-600'>
          ${totalCobrado.toFixed(2)}
        </div>
      </div>
      <div className='bg-blue-50 p-4 rounded-lg text-center'>
        <div className='text-sm text-blue-800 font-medium'>
          Cobros realizados
        </div>
        <div className='text-2xl font-bold text-blue-600'>{cantidadCobros}</div>
      </div>
      <div className='bg-yellow-50 p-4 rounded-lg text-center'>
        <div className='text-sm text-yellow-800 font-medium'>
          Monto pendiente hoy
        </div>
        <div className='text-2xl font-bold text-yellow-600'>
          ${montoPendiente.toFixed(2)}
        </div>
      </div>
      <div className='bg-red-50 p-4 rounded-lg text-center'>
        <div className='text-sm text-red-800 font-medium'>Cuotas atrasadas</div>
        <div className='text-2xl font-bold text-red-600'>{cuotasAtrasadas}</div>
      </div>
    </div>
  );
}
