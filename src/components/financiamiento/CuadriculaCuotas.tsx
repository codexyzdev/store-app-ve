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
  tipo?: "inicial" | "regular";
}

const CuadriculaCuotas: React.FC<CuadriculaCuotasProps> = ({
  fechaInicio,
  cobros,
  valorCuota,
}) => {
  // Separar cobros por tipo
  const cobrosIniciales = cobros.filter((c) => c.tipo === "inicial");
  const cobrosRegulares = cobros.filter((c) => c.tipo === "cuota");

  // Generar las 15 cuotas semanales
  const cuotas: Cuota[] = Array.from({ length: 15 }, (_, i) => {
    // Cuotas regulares empiezan 7 días después de la fecha de inicio
    const fechaTentativa = new Date(fechaInicio);
    fechaTentativa.setDate(fechaTentativa.getDate() + (i + 1) * 7);

    return {
      numero: i + 1,
      fechaTentativa,
      estado: "pendiente",
      tipo: "regular",
    };
  });

  // Marcar cuotas iniciales como pagadas (en las últimas posiciones)
  cobrosIniciales.forEach((cobro) => {
    if (
      cobro.numeroCuota &&
      cobro.numeroCuota >= 1 &&
      cobro.numeroCuota <= 15
    ) {
      const cuotaIndex = cobro.numeroCuota - 1;
      cuotas[cuotaIndex].estado = "pagada";
      cuotas[cuotaIndex].fechaPago = new Date(cobro.fecha);
      cuotas[cuotaIndex].tipo = "inicial";
    }
  });

  // Marcar cuotas regulares como pagadas (desde las primeras posiciones)
  cobrosRegulares.forEach((cobro) => {
    if (
      cobro.numeroCuota &&
      cobro.numeroCuota >= 1 &&
      cobro.numeroCuota <= 15
    ) {
      const cuotaIndex = cobro.numeroCuota - 1;
      cuotas[cuotaIndex].estado = "pagada";
      cuotas[cuotaIndex].fechaPago = new Date(cobro.fecha);
      cuotas[cuotaIndex].tipo = "regular";
    }
  });

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
        Calendario de Pagos
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' style={{ minWidth: 0 }}>
        {cuotas.map((cuota) => (
          <div
            key={cuota.numero}
            className={`p-3 sm:p-4 rounded-xl border flex flex-col gap-1 shadow-sm relative bg-white transition-all duration-200 ${
              cuota.estado === "pagada"
                ? cuota.tipo === "inicial"
                  ? "bg-purple-50 border-purple-200"
                  : "bg-green-50 border-green-200"
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
                    ? cuota.tipo === "inicial"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                style={{ fontSize: 18 }}
                title={
                  cuota.estado === "pagada"
                    ? cuota.tipo === "inicial"
                      ? "Pago Inicial"
                      : "Pagada"
                    : "Pendiente"
                }
              >
                {cuota.estado === "pagada"
                  ? cuota.tipo === "inicial"
                    ? "🎯"
                    : "✅"
                  : "⏳"}
              </span>
            </div>

            {/* Fecha tentativa */}
            <div className='text-xs sm:text-sm text-gray-600 flex items-center gap-1 truncate'>
              <span className='font-medium'>Fecha:</span>
              <span>{formatearFecha(cuota.fechaTentativa)}</span>
            </div>

            {/* Fecha real de pago si existe */}
            {cuota.fechaPago && (
              <div
                className={`flex items-center gap-1 text-xs mt-1 truncate ${
                  cuota.tipo === "inicial"
                    ? "text-purple-700"
                    : "text-green-700"
                }`}
              >
                <span className='font-medium'>
                  {cuota.tipo === "inicial" ? "Inicial:" : "Pagado:"}
                </span>
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
