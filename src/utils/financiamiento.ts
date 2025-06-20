import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";

/**
 * Función unificada para calcular cuotas atrasadas
 * Esta función debe ser la ÚNICA fuente de verdad para el cálculo de cuotas atrasadas
 * en toda la aplicación para evitar inconsistencias
 * 
 * LÓGICA CLAVE:
 * - Las cuotas iniciales ocupan las ÚLTIMAS posiciones del plan y no cuentan para el cálculo de atrasos
 * - Solo las cuotas regulares (tipo "cuota") cuentan para el cálculo de cuotas esperadas por tiempo
 * - El total de cuotas regulares = cuotas totales - cuotas iniciales
 */
export function calcularCuotasAtrasadas(financiamiento: FinanciamientoCuota, cobros?: Cobro[]): number {
  // Solo calcular para financiamientos de tipo cuotas
  if (financiamiento.tipoVenta !== "cuotas") {
    return 0;
  }

  // Solo calcular para financiamientos activos o atrasados
  if (financiamiento.estado !== "activo" && financiamiento.estado !== "atrasado") {
    return 0;
  }

  const fechaInicio = new Date(financiamiento.fechaInicio);
  const hoy = new Date();
  
  // Calcular semanas transcurridas desde el inicio
  const milisegundosPorSemana = 7 * 24 * 60 * 60 * 1000;
  const semanasTranscurridas = Math.floor((hoy.getTime() - fechaInicio.getTime()) / milisegundosPorSemana);
  
  // Filtrar cobros válidos para este financiamiento
  const cobrosValidos = cobros 
    ? cobros.filter(c => 
        c.financiamientoId === financiamiento.id && 
        (c.tipo === "cuota" || c.tipo === "inicial") &&
        c.id && c.id !== 'temp' // Excluir cobros temporales
      ) 
    : [];

  // Separar cobros por tipo para cálculo preciso
  const cobrosRegulares = cobrosValidos.filter(c => c.tipo === "cuota");
  const cobrosIniciales = cobrosValidos.filter(c => c.tipo === "inicial");
  
  // CORRECCIÓN CLAVE: Calcular cuotas regulares máximas
  // Las cuotas iniciales ocupan las últimas posiciones, por lo que reducen el total de cuotas regulares
  const totalCuotasRegulares = financiamiento.cuotas - cobrosIniciales.length;
  
  // Las cuotas esperadas son las semanas transcurridas desde el inicio
  // CORREGIDO: Solo semanasTranscurridas, sin +1, para coincidir con el plan de pagos visual
  const cuotasEsperadas = Math.max(0, Math.min(semanasTranscurridas, totalCuotasRegulares));
  
  // Las cuotas pagadas son solo las cuotas regulares (no iniciales)
  const cuotasPagadasRegulares = cobrosRegulares.length;
  
  // Las cuotas atrasadas son la diferencia entre esperadas y pagadas
  const cuotasAtrasadas = Math.max(0, cuotasEsperadas - cuotasPagadasRegulares);
  
  return cuotasAtrasadas;
}

/**
 * Función para calcular información completa de un financiamiento
 * Incluye todos los cálculos necesarios de manera consistente
 * CORRIGIDA para manejar correctamente las cuotas iniciales
 */
export function calcularInfoFinanciamiento(financiamiento: FinanciamientoCuota, cobros: Cobro[]) {
  // Obtener cobros válidos del financiamiento
  const cobrosValidos = cobros.filter(c => 
    c.financiamientoId === financiamiento.id && 
    (c.tipo === 'cuota' || c.tipo === 'inicial') && 
    c.id && c.id !== 'temp'
  );

  // Calcular valores básicos
  const valorCuota = financiamiento.tipoVenta === 'cuotas' 
    ? Math.round(financiamiento.monto / financiamiento.cuotas)
    : financiamiento.monto;

  const totalCobrado = cobrosValidos.reduce((sum, cobro) => sum + cobro.monto, 0);
  const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);
  const progreso = financiamiento.monto > 0 ? (totalCobrado / financiamiento.monto) * 100 : 0;

  // Calcular cuotas usando la función unificada
  const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
  
  // Separar tipos de cobros para conteo preciso
  const cobrosRegulares = cobrosValidos.filter(c => c.tipo === 'cuota');
  const cobrosIniciales = cobrosValidos.filter(c => c.tipo === 'inicial');
  
  // CORRECCIÓN CLAVE: Separar conteos
  const cuotasPagadasRegulares = cobrosRegulares.length;
  const cuotasPagadasIniciales = cobrosIniciales.length;
  
  // Para el progreso total: TODAS las cuotas pagadas (regulares + iniciales)
  const cuotasPagadasTotal = cuotasPagadasRegulares + cuotasPagadasIniciales;
  
  // Para las pendientes: solo las regulares que faltan por pagar
  const totalCuotasRegulares = financiamiento.cuotas - cobrosIniciales.length;
  const cuotasPendientesRegulares = Math.max(0, totalCuotasRegulares - cuotasPagadasRegulares);
  
  // Total pendientes (para mostrar en UI): regulares pendientes
  const cuotasPendientes = cuotasPendientesRegulares;

  return {
    cobrosValidos,
    valorCuota,
    totalCobrado,
    montoPendiente,
    progreso: Math.min(100, progreso),
    cuotasAtrasadas,
    cuotasPagadas: cuotasPagadasTotal, // TODAS las cuotas pagadas (regulares + iniciales)
    cuotasPendientes,
    cobrosRegulares: cobrosRegulares.length,
    cobrosIniciales: cobrosIniciales.length,
    // Agregar información adicional útil
    totalCuotasRegulares,
    cuotasTotales: financiamiento.cuotas,
    cuotasPagadasRegulares, // Solo las regulares
    cuotasPagadasIniciales, // Solo las iniciales
  };
}

/**
 * Función para calcular el monto atrasado
 */
export function calcularMontoAtrasado(financiamiento: FinanciamientoCuota, cobros: Cobro[]): number {
  const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
  const valorCuota = Math.round(financiamiento.monto / financiamiento.cuotas);
  return cuotasAtrasadas * valorCuota;
}

/**
 * Función para determinar el estado de un financiamiento
 */
export function determinarEstadoFinanciamiento(financiamiento: FinanciamientoCuota, cobros: Cobro[]): 'activo' | 'atrasado' | 'completado' {
  if (financiamiento.tipoVenta === 'contado') {
    return 'completado';
  }

  const info = calcularInfoFinanciamiento(financiamiento, cobros);
  
  // Si está completamente pagado
  if (info.montoPendiente <= 0) {
    return 'completado';
  }

  // Si tiene cuotas atrasadas
  if (info.cuotasAtrasadas > 0) {
    return 'atrasado';
  }

  // En cualquier otro caso está activo
  return 'activo';
} 