import { FinanciamientoCuota, Cobro, cobrosDB, financiamientoDB } from '@/lib/firebase/database';
import { calcularCuotasAtrasadas } from '@/utils/financiamiento';

export interface PagoData {
  monto: number;
  tipoPago: string;
  comprobante?: string;
  imagenComprobante?: string;
  fecha?: string;
  nota?: string;
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
        await cobrosDB.crear({
          financiamientoId: financiamientoId,
          monto: valorCuota,
          fecha: data.fecha ? new Date(data.fecha).getTime() : Date.now(),
          tipo: "cuota",
          comprobante: data.comprobante || "",
          tipoPago: data.tipoPago,
          imagenComprobante: data.imagenComprobante || "",
          numeroCuota: cobrosRegulares.length + i + 1,
          nota: data.nota
        });
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
      const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobrosExistentes);
      const nuevoEstado = cuotasAtrasadas > 0 ? "atrasado" : "activo";
      
      if (financiamiento.estado !== nuevoEstado) {
        await financiamientoDB.actualizar(financiamientoId, {
          estado: nuevoEstado,
        });
      }
    }
  }

  // Calcular información detallada de un financiamiento
  static calcularInfoFinanciamiento(
    financiamiento: FinanciamientoCuota, 
    cobros: Cobro[]
  ) {
    const cobrosValidos = cobros.filter(
      c => c.financiamientoId === financiamiento.id && 
           (c.tipo === "cuota" || c.tipo === "inicial") &&
           c.id && c.id !== "temp"
    );

    const valorCuota = financiamiento.tipoVenta === "contado" 
      ? 0 
      : Math.round(financiamiento.monto / financiamiento.cuotas);

    const totalCobrado = cobrosValidos.reduce((acc, cobro) => 
      acc + (typeof cobro.monto === "number" && !isNaN(cobro.monto) ? cobro.monto : 0), 0
    );

    const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);
    const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobrosValidos);
    const progreso = montoPendiente > 0 
      ? ((financiamiento.monto - montoPendiente) / financiamiento.monto) * 100 
      : 100;

    const cuotasPagadas = cobrosValidos.filter(c => c.tipo === "cuota").length;
    const cuotasPendientes = Math.max(0, financiamiento.cuotas - cuotasPagadas);

    return {
      cobrosValidos,
      valorCuota,
      totalCobrado,
      montoPendiente,
      cuotasAtrasadas,
      progreso,
      cuotasPagadas,
      cuotasPendientes
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