import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";

/**
 * Función unificada para calcular cuotas atrasadas
 * Esta función debe ser la ÚNICA fuente de verdad para el cálculo de cuotas atrasadas
 * en toda la aplicación para evitar inconsistencias
 * 
 * LÓGICA CLAVE:
 * - Las cuotas iniciales ocupan las ÚLTIMAS posiciones del plan y no cuentan para el cálculo de atrasos
 * - Solo las cuotas regulares (tipo "cuota") cuentan para el cálculo de cuotas esperadas por tiempo
 * - Los cobros de amortización de capital no afectan el conteo de cuotas pero sí el monto
 * - El total de cuotas regulares = cuotas totales - cuotas iniciales tradicionales
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
  
  // Obtener TODOS los cobros válidos para este financiamiento
  const todosLosCobros = cobros 
    ? cobros.filter(c => 
        c.financiamientoId === financiamiento.id && 
        c.id && c.id !== 'temp' // Excluir cobros temporales
      ) 
    : [];

  // Separar cobros por tipo para cálculo preciso
  const cobrosRegulares = todosLosCobros.filter(c => c.tipo === "cuota");
  
  // NUEVA LÓGICA: Distinguir entre cuotas iniciales tradicionales y amortización de capital
  const cobrosIniciales = todosLosCobros.filter(c => 
    c.tipo === "inicial" && 
    (!c.nota || !c.nota.includes("Amortización de capital"))
  );
  
  // Los cobros de amortización de capital no afectan el conteo de cuotas
  const cobrosAmortizacion = todosLosCobros.filter(c => 
    c.tipo === "inicial" && 
    c.nota && c.nota.includes("Amortización de capital")
  );
  
  // CORRECCIÓN CLAVE: Calcular cuotas regulares máximas
  // Solo las cuotas iniciales tradicionales ocupan las últimas posiciones
  const totalCuotasRegulares = financiamiento.cuotas - cobrosIniciales.length;
  
  // Las cuotas esperadas son las semanas transcurridas desde el inicio
  const cuotasEsperadas = Math.max(0, Math.min(semanasTranscurridas, totalCuotasRegulares));
  
  // Las cuotas pagadas son solo las cuotas regulares (no iniciales ni amortización)
  const cuotasPagadasRegulares = cobrosRegulares.length;
  
  // Las cuotas atrasadas son la diferencia entre esperadas y pagadas
  const cuotasAtrasadas = Math.max(0, cuotasEsperadas - cuotasPagadasRegulares);
  
  return cuotasAtrasadas;
}

/**
 * Función para calcular información completa de un financiamiento
 * Incluye todos los cálculos necesarios de manera consistente
 * ACTUALIZADA para manejar correctamente las cuotas iniciales y amortización de capital
 * 
 * LÓGICA CLAVE PARA AMORTIZACIÓN:
 * - Los cobros de amortización NO cuentan en el progreso del financiamiento
 * - Solo los cobros de tipo "cuota" e "inicial" (cuotas iniciales) cuentan para el progreso
 * - La amortización se muestra como información separada
 */
export function calcularInfoFinanciamiento(financiamiento: FinanciamientoCuota, cobros: Cobro[]) {
  // Obtener TODOS los cobros válidos del financiamiento
  const todosLosCobros = cobros.filter(c => 
    c.financiamientoId === financiamiento.id && 
    c.id && c.id !== 'temp'
  );

  // Calcular valores básicos
  const valorCuota = financiamiento.tipoVenta === 'cuotas' 
    ? Math.round(financiamiento.monto / financiamiento.cuotas)
    : financiamiento.monto;

  // NUEVA LÓGICA: Separar tipos de cobros de manera más precisa
  const cobrosRegulares = todosLosCobros.filter(c => c.tipo === 'cuota');
  
  // Distinguir entre cuotas iniciales tradicionales y amortización de capital
  const cobrosIniciales = todosLosCobros.filter(c => 
    c.tipo === 'inicial' && 
    (!c.nota || !c.nota.includes("Amortización de capital"))
  );
  
  // Los cobros de amortización NO cuentan para el progreso del financiamiento
  const cobrosAmortizacion = todosLosCobros.filter(c => 
    c.tipo === 'inicial' && 
    c.nota && c.nota.includes("Amortización de capital")
  );

  // CORRECCIÓN CRÍTICA: Solo cobros regulares e iniciales cuentan para el progreso
  // La amortización NO cuenta porque es un abono que reduce el monto total
  const cobrosProgreso = [...cobrosRegulares, ...cobrosIniciales];
  const totalCobrado = cobrosProgreso.reduce((sum, cobro) => sum + cobro.monto, 0);
  
  // El monto pendiente es el monto financiado menos los pagos de cuotas
  const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);
  
  // El progreso se calcula solo sobre cuotas pagadas, no sobre amortización
  const progreso = financiamiento.monto > 0 ? (totalCobrado / financiamiento.monto) * 100 : 0;

  // Calcular cuotas usando la función unificada (pasamos TODOS los cobros)
  const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, todosLosCobros);
  
  // CORRECCIÓN CLAVE: Separar conteos
  const cuotasPagadasRegulares = cobrosRegulares.length;
  const cuotasPagadasIniciales = cobrosIniciales.length;
  const montoAmortizacion = cobrosAmortizacion.reduce((sum, cobro) => sum + cobro.monto, 0);
  
  // Para el progreso total: SOLO cuotas pagadas (regulares + iniciales), NO amortización
  const cuotasPagadasTotal = cuotasPagadasRegulares + cuotasPagadasIniciales;
  
  // Para las pendientes: solo las regulares que faltan por pagar
  const totalCuotasRegulares = financiamiento.cuotas - cobrosIniciales.length;
  const cuotasPendientesRegulares = Math.max(0, totalCuotasRegulares - cuotasPagadasRegulares);
  
  // Total pendientes (para mostrar en UI): regulares pendientes
  const cuotasPendientes = cuotasPendientesRegulares;

  return {
    cobrosValidos: cobrosProgreso, // Solo cobros que cuentan para el progreso
    valorCuota,
    totalCobrado, // SOLO cuotas regulares e iniciales, NO amortización
    montoPendiente,
    progreso: Math.min(100, progreso),
    cuotasAtrasadas,
    cuotasPagadas: cuotasPagadasTotal, // SOLO cuotas pagadas (regulares + iniciales)
    cuotasPendientes,
    cobrosRegulares: cobrosRegulares.length,
    cobrosIniciales: cobrosIniciales.length,
    cobrosAmortizacion: cobrosAmortizacion.length,
    montoAmortizacion, // Información separada de amortización
    // Agregar información adicional útil
    totalCuotasRegulares,
    cuotasTotales: financiamiento.cuotas,
    cuotasPagadasRegulares, // Solo las regulares
    cuotasPagadasIniciales, // Solo las iniciales
    // Información detallada de cobros
    tieneAmortizacion: cobrosAmortizacion.length > 0,
    detalleCobros: {
      regulares: cobrosRegulares,
      iniciales: cobrosIniciales,
      amortizacion: cobrosAmortizacion
    }
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