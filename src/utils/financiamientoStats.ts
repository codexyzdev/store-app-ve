import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";
import { calcularCuotasAtrasadas } from "@/utils/financiamiento";

export interface FinanciamientoStatsResult {
  activos: number;
  atrasados: number;
  completados: number;
  montoTotal: number;
  montoPendiente: number;
  montoRecaudado: number;
}

export function calcularEstadisticasFinanciamientos(
  financiamientos: FinanciamientoCuota[],
  cobros: Cobro[]
): FinanciamientoStatsResult {
  const financiamientosCuotas = financiamientos.filter(
    (f) => f.tipoVenta === "cuotas"
  );

  const getCobrosFinanciamiento = (financiamientoId: string) =>
    cobros.filter(
      (c) =>
        c.financiamientoId === financiamientoId &&
        (c.tipo === "cuota" || c.tipo === "inicial")
    );

  const activosArray = financiamientosCuotas.filter(
    (f) => f.estado === "activo" || f.estado === "atrasado"
  );

  const atrasadosArray = activosArray.filter((f) => {
    const cuotasAtrasadas = calcularCuotasAtrasadas(
      f,
      getCobrosFinanciamiento(f.id)
    );
    return cuotasAtrasadas > 0;
  });

  const activosReales = activosArray.filter((f) => {
    const cuotasAtrasadas = calcularCuotasAtrasadas(
      f,
      getCobrosFinanciamiento(f.id)
    );
    return cuotasAtrasadas === 0;
  });

  const completadosArray = financiamientosCuotas.filter((f) => {
    const totalCobradoItem = getCobrosFinanciamiento(f.id).reduce(
      (acc, c) => acc + c.monto,
      0
    );
    return totalCobradoItem >= f.monto;
  });

  const montoTotal = financiamientosCuotas.reduce((sum, f) => sum + f.monto, 0);

  const idsCuotas = financiamientosCuotas.map((f) => f.id);
  const montoRecaudado = cobros
    .filter(
      (c) =>
        idsCuotas.includes(c.financiamientoId) &&
        (c.tipo === "cuota" || c.tipo === "inicial")
    )
    .reduce((sum, c) => sum + c.monto, 0);

  const montoPendiente = montoTotal - montoRecaudado;

  return {
    activos: activosReales.length,
    atrasados: atrasadosArray.length,
    completados: completadosArray.length,
    montoTotal,
    montoPendiente,
    montoRecaudado,
  };
} 