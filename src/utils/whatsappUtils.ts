import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadas";
import type { CobroPendienteDetallado } from "@/store/slices/cobrosDelDiaSlice";

export function formatearTelefono(telefono: string): string {
  const numeroLimpio = telefono.replace(/\D/g, "");
  return numeroLimpio.startsWith("58") ? numeroLimpio : `58${numeroLimpio}`;
}

export function generarMensajeWhatsApp(item: FinanciamientoConDatos): string {
  return encodeURIComponent(
    `Hola ${item.cliente.nombre}, espero que te encuentres bien.

Te escribo desde Los Tiburones para recordarte que tienes ${
      item.cuotasAtrasadas
    } cuota${item.cuotasAtrasadas > 1 ? "s" : ""} atrasada${
      item.cuotasAtrasadas > 1 ? "s" : ""
    } de tu financiamiento #F-${
      item.numeroControl
    } por un monto de $${item.montoAtrasado.toFixed(2)}.

📋 Detalles:
• Producto: ${item.producto.nombre}
• Valor por cuota: $${item.valorCuota.toFixed(2)}
• Cuotas atrasadas: ${item.cuotasAtrasadas}

¿Podrías ponerte al día con los pagos? Estoy aquí para ayudarte con cualquier duda o acordar un plan de pago.

Gracias por tu atención.
Los Tiburones 🦈`
  );
}

// Nueva función para cobros del día
export function generarMensajeWhatsAppCobranza(cliente: { 
  nombre: string; 
  cuotasTotal: number; 
  totalPendiente: number;
  productos: Set<string>;
}): string {
  const productosTexto = Array.from(cliente.productos).join(", ");
  
  return encodeURIComponent(
    `Hola ${cliente.nombre}, ¡Buenos días! 

Te escribo desde Los Tiburones para recordarte que tienes ${
      cliente.cuotasTotal
    } cuota${cliente.cuotasTotal > 1 ? "s" : ""} programada${
      cliente.cuotasTotal > 1 ? "s" : ""
    } para hoy por un total de $${cliente.totalPendiente.toFixed(2)}.

💳 Productos financiados:
${productosTexto}

¿Podrías realizar el pago hoy? Puedes hacerlo por:
• Transferencia bancaria
• Pago móvil
• Efectivo

¡Gracias por mantenerte al día con tus pagos!
Los Tiburones 🦈`
  );
}

// Función para cobros individuales
export function generarMensajeWhatsAppCuotaIndividual(cobro: CobroPendienteDetallado): string {
  return encodeURIComponent(
    `Hola ${cobro.nombre}, ¡Buenos días! 

Te escribo desde Los Tiburones para recordarte que tienes la cuota #${cobro.cuota} programada para hoy.

📋 Detalles:
• Producto: ${cobro.producto}
• Monto: $${cobro.monto.toFixed(2)}
• Progreso: ${cobro.historialPagos}/${cobro.totalCuotas} cuotas pagadas

¿Podrías realizar el pago hoy? Estoy aquí para ayudarte con cualquier duda.

¡Gracias por tu responsabilidad!
Los Tiburones 🦈`
  );
} 