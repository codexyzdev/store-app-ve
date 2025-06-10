import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";

export function calcularCuotasAtrasadas(financiamiento: FinanciamientoCuota, cobros?: Cobro[]): number {
  if (financiamiento.estado !== "activo" && financiamiento.estado !== "atrasado") return 0;
  const fechaInicio = new Date(financiamiento.fechaInicio);
  const hoy = new Date();
  const diferenciaMeses = (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 + (hoy.getMonth() - fechaInicio.getMonth());
  
  let cuotasAtrasadas = 0;
  for (let i = 0; i < financiamiento.cuotas; i++) {
    const mesVencimiento = i;
    if (diferenciaMeses > mesVencimiento) {
      const cuotaPagada = cobros
        ? cobros.some((c) => c.financiamientoId === financiamiento.id && c.tipo === "cuota" && c.numeroCuota === i + 1)
        : false;
      if (!cuotaPagada) {
        cuotasAtrasadas++;
      }
    }
  }
  
  return cuotasAtrasadas;
} 