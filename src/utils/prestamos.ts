import { Prestamo, Cobro } from "@/lib/firebase/database";

export function calcularCuotasAtrasadas(prestamo: Prestamo, cobros?: Cobro[]): number {
  if (prestamo.estado !== "activo" && prestamo.estado !== "atrasado") return 0;
  const fechaInicio = new Date(prestamo.fechaInicio);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const semanasTranscurridas = Math.floor(
    (hoy.getTime() - fechaInicio.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const cuotasEsperadas = Math.min(
    semanasTranscurridas + 1,
    prestamo.cuotas
  );
  const cuotasPagadas = Array.isArray(cobros)
    ? cobros.filter((c) => c.prestamoId === prestamo.id && c.tipo === "cuota").length
    : 0;
  return Math.max(0, cuotasEsperadas - cuotasPagadas);
}