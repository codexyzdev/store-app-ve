import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";

// Función helper para debugging cobros
export function debugCobrosFinanciamiento(financiamientoId: string, cobros?: Cobro[]) {
  if (!cobros) return { totalCobros: 0, cobrosEsteFinanciamiento: 0, cobrosValidos: 0 };
  
  const cobrosEsteFinanciamiento = cobros.filter(c => c.financiamientoId === financiamientoId);
  const cobrosValidosCuota = cobrosEsteFinanciamiento.filter(c => 
    c.tipo === "cuota" && c.numeroCuota && c.numeroCuota > 0
  );
  
  console.log(`🔍 Debug cobros para financiamiento ${financiamientoId}:`, {
    totalCobrosEnSistema: cobros.length,
    cobrosEsteFinanciamiento: cobrosEsteFinanciamiento.length,
    cobrosValidosCuota: cobrosValidosCuota.length,
    detalleCobros: cobrosValidosCuota.map(c => ({
      id: c.id,
      numeroCuota: c.numeroCuota,
      monto: c.monto,
      fecha: new Date(c.fecha).toLocaleDateString(),
      tipo: c.tipo
    }))
  });
  
  return {
    totalCobros: cobros.length,
    cobrosEsteFinanciamiento: cobrosEsteFinanciamiento.length,
    cobrosValidos: cobrosValidosCuota.length
  };
}

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
  
  // Filtrar cobros válidos para este financiamiento
  const cobrosValidos = cobros 
    ? cobros.filter(c => 
        c.financiamientoId === financiamiento.id && 
        c.tipo === "cuota" && 
        c.numeroCuota && 
        c.numeroCuota > 0
      ) 
    : [];
  
  // Determinar cuántas cuotas deberían estar pagadas a la fecha actual
  // Si han pasado N semanas, deberían estar pagadas N cuotas (mínimo)
  const cuotasQueDeberianEstarPagadas = Math.min(semanasPasadas, financiamiento.cuotas);
  
  // Contar cuántas cuotas están realmente pagadas
  const cuotasPagadas = cobrosValidos.length;
  
  // Las cuotas atrasadas son la diferencia
  const cuotasAtrasadas = Math.max(0, cuotasQueDeberianEstarPagadas - cuotasPagadas);
  
  // DEBUG: Log temporal para verificar cálculos
  if (financiamiento.id && (cuotasAtrasadas > 0 || semanasPasadas > 0)) {
    console.log(`🐛 DEBUG Financiamiento ${financiamiento.id}:`, {
      fechaInicio: fechaInicio.toLocaleDateString(),
      fechaActual: hoy.toLocaleDateString(),
      semanasPasadas,
      cuotasQueDeberianEstarPagadas,
      cuotasPagadas,
      cuotasAtrasadas,
      totalCobros: cobros?.length || 0,
      cobrosValidosParaEsteFinanciamiento: cobrosValidos.length
    });
  }
  
  return cuotasAtrasadas;
} 