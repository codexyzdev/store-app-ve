import { Prestamo, Cobro } from "@/lib/firebase/database";

export function calcularCuotasAtrasadas(prestamo: Prestamo, cobros?: Cobro[]): number {
  if (prestamo.estado !== "activo" && prestamo.estado !== "atrasado") return 0;
  const fechaInicio = new Date(prestamo.fechaInicio);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  let cuotasAtrasadas = 0;
  for (let i = 0; i < prestamo.cuotas; i++) {
    const fechaCuota = new Date(fechaInicio);
    fechaCuota.setDate(fechaInicio.getDate() + i * 7);
    // La primera cuota se considera atrasada desde el mismo día del préstamo
    if (i === 0 ? fechaCuota > hoy : fechaCuota >= hoy) break;
    const pagada = Array.isArray(cobros)
      ? cobros.some((c) => c.prestamoId === prestamo.id && c.tipo === "cuota" && c.numeroCuota === i + 1)
      : false;
    if (!pagada) cuotasAtrasadas++;
  }
  return cuotasAtrasadas;
}