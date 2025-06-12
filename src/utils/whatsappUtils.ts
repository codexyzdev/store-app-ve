import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadas";

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