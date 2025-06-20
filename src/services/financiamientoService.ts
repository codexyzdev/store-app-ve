import { FinanciamientoCuota, Cobro, cobrosDB, financiamientoDB } from '@/lib/firebase/database';

export interface PagoData {
  monto: number;
  tipoPago: string;
  comprobante?: string;
  imagenComprobante?: string;
  fecha?: string;
  nota?: string; // Completamente opcional - puede no existir en el objeto
}

// Función utilitaria para limpiar undefined de objetos antes de enviar a Firebase
function limpiarUndefined(obj: any): any {
  const resultado: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      resultado[key] = obj[key];
    }
  });
  return resultado;
}

export class FinanciamientoService {
  
  // Procesar pago de cuota con manejo de errores mejorado
  static async procesarPagoCuota(
    financiamientoId: string, 
    financiamiento: FinanciamientoCuota,
    data: PagoData,
    cobrosExistentes: Cobro[]
  ): Promise<void> {
    try {
      const valorCuota = Math.round(financiamiento.monto / financiamiento.cuotas);
      const cuotasAPagar = Math.floor(data.monto / valorCuota);

      if (cuotasAPagar === 0) {
        throw new Error('El monto ingresado es menor al valor de una cuota');
      }

      // Separar cobros iniciales de cuotas regulares para numeración correcta
      const cobrosRegulares = cobrosExistentes.filter(c => c.tipo === "cuota");

      // Crear cobros
      for (let i = 0; i < cuotasAPagar; i++) {
        // Construir objeto base sin campos opcionales primero
        const cobroBase = {
          financiamientoId: financiamientoId,
          monto: valorCuota,
          fecha: data.fecha ? 
            // Usar mediodía para evitar problemas de zona horaria
            new Date(data.fecha + 'T12:00:00').getTime() : 
            Date.now(),
          tipo: "cuota" as const,
          comprobante: data.comprobante || "",
          tipoPago: data.tipoPago,
          imagenComprobante: data.imagenComprobante || "",
          numeroCuota: cobrosRegulares.length + i + 1
        };

        // Solo agregar campos opcionales si tienen valor real
        const cobroCompleto: any = { ...cobroBase };
        
        // Agregar nota solo si el campo existe en el objeto y tiene contenido
        if ('nota' in data && data.nota && typeof data.nota === 'string') {
          const notaLimpia = data.nota.trim();
          if (notaLimpia.length > 0) {
            cobroCompleto.nota = notaLimpia;
          }
        }

        console.log('📋 Datos del cobro antes de enviar a Firebase:', cobroCompleto);
        console.log('📋 ¿Tiene propiedad nota?', 'nota' in cobroCompleto);
        console.log('📋 Valor de nota:', cobroCompleto.nota);

        await cobrosDB.crear(cobroCompleto);
      }

      // Actualizar estado del financiamiento
      await this.actualizarEstadoFinanciamiento(financiamientoId, financiamiento, cobrosExistentes, cuotasAPagar);
    } catch (error) {
      console.error("Error al procesar pago:", error);
      
      if (error instanceof Error && error.message.includes("ya está registrado")) {
        throw new Error(`Comprobante duplicado: ${error.message}\n\nSugerencia: Verifica que el número de comprobante no haya sido usado anteriormente.`);
      }
      
      throw error;
    }
  }

  // Actualizar estado del financiamiento basado en pagos
  static async actualizarEstadoFinanciamiento(
    financiamientoId: string,
    financiamiento: FinanciamientoCuota,
    cobrosExistentes: Cobro[],
    cuotasNuevas: number = 0
  ): Promise<void> {
    const valorCuota = Math.round(financiamiento.monto / financiamiento.cuotas);
    const totalAbonado = (cobrosExistentes.length + cuotasNuevas) * valorCuota;
    const montoPendiente = Math.max(0, financiamiento.monto - totalAbonado);

    if (montoPendiente <= 0) {
      await financiamientoDB.actualizar(financiamientoId, {
        estado: "completado",
      });
    } else {
      // Determinar el estado basado en la lógica original del servicio
      const fechaActual = new Date();
      const fechaInicio = new Date(financiamiento.fechaInicio);
      const semanasTranscurridas = Math.floor(
        (fechaActual.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      const cuotasEsperadas = Math.max(0, Math.min(semanasTranscurridas + 1, financiamiento.cuotas));
      const cuotasPagadas = cobrosExistentes.length + cuotasNuevas;
      
      const nuevoEstado = cuotasPagadas < cuotasEsperadas ? "atrasado" : "activo";
      
      if (financiamiento.estado !== nuevoEstado) {
        await financiamientoDB.actualizar(financiamientoId, {
          estado: nuevoEstado,
        });
      }
    }
  }

  // Calcular información detallada de un financiamiento usando función unificada
  static calcularInfoFinanciamiento(
    financiamiento: FinanciamientoCuota, 
    cobros: Cobro[]
  ) {
    // Usar la función unificada para garantizar consistencia
    const { calcularInfoFinanciamiento: calcularInfoFinanciamientoUtils } = require('@/utils/financiamiento');
    const info = calcularInfoFinanciamientoUtils(financiamiento, cobros);

    // Mantener compatibilidad con la interfaz existente del servicio
    const cuotasRegulares = info.cobrosRegulares;
    const cuotasIniciales = info.cobrosIniciales;
    const cuotasPagadas = info.cuotasPagadas;
    const cuotasPendientes = info.cuotasPendientes;

    return {
      cobrosValidos: info.cobrosValidos,
      valorCuota: info.valorCuota,
      totalCobrado: info.totalCobrado,
      montoPendiente: info.montoPendiente,
      cuotasAtrasadas: info.cuotasAtrasadas,
      progreso: info.progreso,
      cuotasPagadas,
      cuotasPendientes,
      cuotasRegulares,
      cuotasIniciales,
      totalCuotas: cuotasRegulares + cuotasIniciales,
      montoAtrasado: info.cuotasAtrasadas * info.valorCuota,
    };
  }

  // Determinar severidad de atraso
  static determinarSeveridad(cuotasAtrasadas: number): 'baja' | 'media' | 'alta' | 'critica' {
    if (cuotasAtrasadas >= 8) return 'critica';
    if (cuotasAtrasadas >= 5) return 'alta';
    if (cuotasAtrasadas >= 3) return 'media';
    return 'baja';
  }

  // Calcular días de atraso aproximados
  static calcularDiasAtraso(
    financiamiento: FinanciamientoCuota, 
    cobrosFinanciamiento: Cobro[]
  ): number {
    const fechaInicio = new Date(financiamiento.fechaInicio);
    const hoy = new Date();
    const semanasPasadas = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    const cuotasPagadas = cobrosFinanciamiento.filter(c => c.tipo === "cuota").length;
    const cuotasQueDeberianEstarPagadas = Math.min(semanasPasadas, financiamiento.cuotas);
    
    return Math.max(0, (cuotasQueDeberianEstarPagadas - cuotasPagadas) * 7);
  }

  // Validar datos de pago
  static validarDatosPago(data: PagoData, valorCuota: number): string[] {
    const errores: string[] = [];

    if (!data.monto || data.monto <= 0) {
      errores.push('El monto debe ser mayor a 0');
    }

    if (data.monto < valorCuota) {
      errores.push(`El monto mínimo es ${valorCuota} (valor de una cuota)`);
    }

    if (!data.tipoPago) {
      errores.push('Debe seleccionar un tipo de pago');
    }

    if (['transferencia', 'pago_movil'].includes(data.tipoPago) && !data.comprobante) {
      errores.push('El comprobante es obligatorio para este tipo de pago');
    }

    return errores;
  }
} 