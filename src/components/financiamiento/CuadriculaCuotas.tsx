import React from "react";
import { Cobro } from "@/lib/firebase/database";

interface CuadriculaCuotasProps {
  fechaInicio: number;
  cobros: Cobro[];
  valorCuota: number;
}

interface Cuota {
  numero: number;
  fechaTentativa: Date;
  estado: "pagada" | "pendiente";
  fechaPago?: Date;
}

const CuadriculaCuotas: React.FC<CuadriculaCuotasProps> = ({
  fechaInicio,
  cobros,
  valorCuota,
}) => {
  // Ordenar cobros por fecha ascendente
  const cobrosOrdenados = [...cobros].sort((a, b) => a.fecha - b.fecha);

  // Generar las 15 cuotas semanales
  const cuotas: Cuota[] = Array.from({ length: 15 }, (_, i) => {
    const fechaTentativa = new Date(fechaInicio);
    fechaTentativa.setDate(fechaTentativa.getDate() + i * 7);
    return {
      numero: i + 1,
      fechaTentativa,
      estado: "pendiente",
    };
  });

  // Asignar cobros a cuotas en orden
  let cuotaIndex = 0;
  for (const cobro of cobrosOrdenados) {
    let montoRestante = cobro.monto;
    while (montoRestante >= valorCuota - 0.01 && cuotaIndex < cuotas.length) {
      if (cuotas[cuotaIndex].estado === "pendiente") {
        cuotas[cuotaIndex].estado = "pagada";
        cuotas[cuotaIndex].fechaPago = new Date(cobro.fecha);
        montoRestante -= valorCuota;
      }
      cuotaIndex++;
    }
  }

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className='bg-white rounded-xl shadow-lg p-4 sm:p-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
        Plan de Pagos Semanales
      </h3>
      <div className='grid grid-cols-2' style={{ minWidth: 0 }}>
        {cuotas.map((cuota) => (
          <div
            key={cuota.numero}
            className={`p-3 sm:p-4 rounded-xl border flex flex-col gap-1 shadow-sm relative bg-white transition-all duration-200 ${
              cuota.estado === "pagada"
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
            style={{ minWidth: 0 }}
          >
            <div className='flex items-center justify-between mb-1'>
              <span className='font-semibold text-gray-700 text-base truncate'>
                Semana {cuota.numero}
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                  cuota.estado === "pagada"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                style={{ fontSize: 18 }}
                title={cuota.estado === "pagada" ? "Pagada" : "Pendiente"}
              >
                {cuota.estado === "pagada" ? "✅" : "⏳"}
              </span>
            </div>
            <div className='text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate'>
              <span className='font-medium'>Fecha:</span>
              <span>{formatearFecha(cuota.fechaTentativa)}</span>
            </div>
            {cuota.fechaPago && (
              <div className='flex items-center gap-1 text-green-700 text-xs mt-1 truncate'>
                <span className='font-medium'>Pagado:</span>
                <span>{formatearFecha(cuota.fechaPago)}</span>
              </div>
            )}
            <div className='font-bold text-gray-800 text-base mt-2 truncate'>
              ${Math.round(valorCuota).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuadriculaCuotas;
