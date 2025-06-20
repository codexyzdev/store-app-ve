import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";
import { calcularCuotasAtrasadas } from "./financiamiento";

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

  const getTodosLosCobrosFinanciamiento = (financiamientoId: string) =>
    cobros.filter(c => c.financiamientoId === financiamientoId);

  const getCobrosProgreso = (financiamientoId: string) => {
    const todosLosCobros = getTodosLosCobrosFinanciamiento(financiamientoId);
    
    const cobrosRegulares = todosLosCobros.filter(c => c.tipo === "cuota");
    const cobrosIniciales = todosLosCobros.filter(c => 
      c.tipo === "inicial" && 
      (!c.nota || !c.nota.includes("Amortización de capital"))
    );
    
    return [...cobrosRegulares, ...cobrosIniciales];
  };

  const activosArray = financiamientosCuotas.filter(
    (f) => f.estado === "activo" || f.estado === "atrasado"
  );

  const atrasadosArray = activosArray.filter((f) => {
    const cuotasAtrasadas = calcularCuotasAtrasadas(
      f,
      getTodosLosCobrosFinanciamiento(f.id)
    );
    return cuotasAtrasadas > 0;
  });

  const activosReales = activosArray.filter((f) => {
    const cuotasAtrasadas = calcularCuotasAtrasadas(
      f,
      getTodosLosCobrosFinanciamiento(f.id)
    );
    return cuotasAtrasadas === 0;
  });

  const completadosArray = financiamientosCuotas.filter((f) => {
    const totalCobradoItem = getCobrosProgreso(f.id).reduce(
      (acc, c) => acc + c.monto,
      0
    );
    return totalCobradoItem >= f.monto;
  });

  const montoTotal = financiamientosCuotas.reduce((sum, f) => sum + f.monto, 0);

  const idsCuotas = financiamientosCuotas.map((f) => f.id);
  
  const montoRecaudado = idsCuotas.reduce((total, financiamientoId) => {
    return total + getCobrosProgreso(financiamientoId).reduce((sum, c) => sum + c.monto, 0);
  }, 0);

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