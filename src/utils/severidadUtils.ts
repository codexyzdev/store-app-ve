export interface SeveridadConfig {
  color: string;
  textColor: string;
  badge: string;
  icon: string;
  texto: string;
}

export function getSeveridadConfig(severidad: string): SeveridadConfig {
  switch (severidad) {
    case "critica":
      return {
        color: "border-red-600 bg-red-50",
        textColor: "text-red-700",
        badge: "bg-red-600 text-white",
        icon: "🚨",
        texto: "CRÍTICO",
      };
    case "alta":
      return {
        color: "border-orange-500 bg-orange-50",
        textColor: "text-orange-700",
        badge: "bg-orange-500 text-white",
        icon: "⚠️",
        texto: "ALTO",
      };
    case "media":
      return {
        color: "border-yellow-500 bg-yellow-50",
        textColor: "text-yellow-700",
        badge: "bg-yellow-500 text-white",
        icon: "⚡",
        texto: "MEDIO",
      };
    default:
      return {
        color: "border-blue-500 bg-blue-50",
        textColor: "text-blue-700",
        badge: "bg-blue-500 text-white",
        icon: "📋",
        texto: "BAJO",
      };
  }
} 