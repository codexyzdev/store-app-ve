import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";

export function calcularCuotasAtrasadas(financiamiento: FinanciamientoCuota, cobros?: Cobro[]): number {
  // Solo calcular para financiamientos activos o atrasados de tipo cuotas
  if (
    financiamiento.tipoVenta !== "cuotas" || 
    (financiamiento.estado !== "activo" && financiamiento.estado !== "atrasado")
  ) {
    return 0;
  }

  const fechaInicio = new Date(financiamiento.fechaInicio);
  const hoy = new Date();
  
  // Calcular cuántas semanas han pasado desde el inicio
  const milisegundosPorSemana = 7 * 24 * 60 * 60 * 1000;
  const semanasPasadas = Math.floor((hoy.getTime() - fechaInicio.getTime()) / milisegundosPorSemana);
  
  // Filtrar cobros válidos para este financiamiento (excluir cobros iniciales del cálculo de atrasos)
  const cobrosValidos = cobros 
    ? cobros.filter(c => 
        c.financiamientoId === financiamiento.id && 
        (c.tipo === "cuota" || c.tipo === "inicial") && 
        c.numeroCuota && 
        c.numeroCuota > 0
      ) 
    : [];

  // Separar cobros regulares de iniciales para el cálculo
  const cobrosRegulares = cobrosValidos.filter(c => c.tipo === "cuota");
  const cobrosIniciales = cobrosValidos.filter(c => c.tipo === "inicial");
  
  // Determinar cuántas cuotas deberían estar pagadas a la fecha actual
  // Si han pasado N semanas, deberían estar pagadas N cuotas (mínimo)
  // Pero considerando que las cuotas iniciales ya reducen el plan efectivo
  const cuotasEfectivas = financiamiento.cuotas - cobrosIniciales.length;
  const cuotasQueDeberianEstarPagadas = Math.min(semanasPasadas, cuotasEfectivas);
  
  // Contar cuántas cuotas regulares están realmente pagadas
  const cuotasPagadasRegulares = cobrosRegulares.length;
  
  // Las cuotas atrasadas son la diferencia (solo considerando cuotas regulares)
  const cuotasAtrasadas = Math.max(0, cuotasQueDeberianEstarPagadas - cuotasPagadasRegulares);
  
  return cuotasAtrasadas;
} 