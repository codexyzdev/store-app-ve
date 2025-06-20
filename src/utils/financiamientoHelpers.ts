import { FinanciamientoCuota, Cliente, Producto, Cobro } from "@/lib/firebase/database";
import { calcularCuotasAtrasadas, calcularInfoFinanciamiento as calcularInfoFinanciamientoUtils } from "@/utils/financiamiento";
import { normalizarNumeroControl, esFormatoNumeroControl } from "@/utils/format";

export interface ClienteInfo {
  nombre: string;
  cedula: string;
  telefono: string;
}

export interface FinanciamientoCalculado {
  totalCobrado: number;
  montoPendiente: number;
  cuotasAtrasadas: number;
  valorCuota: number;
  cuotasPagadas: number;
  progreso: number;
  estadoInfo: {
    color: string;
    texto: string;
    icon: string;
  };
  tieneAmortizacion: boolean;
  montoAmortizacion: number;
  cobrosAmortizacion: number;
}

export const getClienteInfo = (clienteId: string, clientes: Cliente[]): ClienteInfo => {
  const cliente = clientes.find((c) => c.id === clienteId);
  return {
    nombre: cliente ? cliente.nombre : "-",
    cedula: cliente ? cliente.cedula : "",
    telefono: cliente ? cliente.telefono : "",
  };
};

export const getProductoNombre = (productoId: string, productos: Producto[]): string => {
  const producto = productos.find((p) => p.id === productoId);
  return producto ? producto.nombre : "Producto no encontrado";
};

export const getCobrosFinanciamiento = (financiamientoId: string, cobros: Cobro[]): Cobro[] => {
  return cobros.filter(
    (c) =>
      c.financiamientoId === financiamientoId &&
      c.id && c.id !== 'temp' // Solo cobros válidos persistidos
  );
};

export const calcularFinanciamiento = (
  financiamiento: FinanciamientoCuota,
  cobros: Cobro[]
): FinanciamientoCalculado => {
  // Usar la función unificada para garantizar consistencia
  const info = calcularInfoFinanciamientoUtils(financiamiento, cobros);

  const estadoInfo =
    info.cuotasAtrasadas > 0
      ? { color: "red", texto: "Atrasado", icon: "⚠️" }
      : info.montoPendiente <= 0
      ? { color: "green", texto: "Completado", icon: "✅" }
      : { color: "blue", texto: "Al día", icon: "💰" };

  return {
    totalCobrado: info.totalCobrado,
    montoPendiente: info.montoPendiente,
    cuotasAtrasadas: info.cuotasAtrasadas,
    valorCuota: info.valorCuota,
    cuotasPagadas: info.cuotasPagadas,
    progreso: info.progreso,
    estadoInfo,
    tieneAmortizacion: info.tieneAmortizacion,
    montoAmortizacion: info.montoAmortizacion,
    cobrosAmortizacion: info.cobrosAmortizacion,
  };
};

// Función para validar consistencia de cálculos
export const validarConsistenciaFinanciamiento = (
  financiamiento: FinanciamientoCuota,
  calculado: FinanciamientoCalculado
): { esConsistente: boolean; errores: string[] } => {
  const errores: string[] = [];

  // Validar que monto total = monto cobrado + monto pendiente
  const sumaCalculada = calculado.totalCobrado + calculado.montoPendiente;
  if (Math.abs(sumaCalculada - financiamiento.monto) > 0.01) {
    errores.push(
      `Inconsistencia en monto: Total=${financiamiento.monto}, Cobrado=${calculado.totalCobrado}, Pendiente=${calculado.montoPendiente}, Suma=${sumaCalculada}`
    );
  }

  // Validar que el valor de cuota sea correcto
  const valorCuotaEsperado = Math.round(financiamiento.monto / financiamiento.cuotas);
  if (calculado.valorCuota !== valorCuotaEsperado) {
    errores.push(
      `Inconsistencia en valor de cuota: Esperado=${valorCuotaEsperado}, Calculado=${calculado.valorCuota}`
    );
  }

  // Validar que el progreso esté entre 0 y 100
  if (calculado.progreso < 0 || calculado.progreso > 100) {
    errores.push(`Progreso fuera de rango: ${calculado.progreso}%`);
  }

  // Validar que el monto pendiente no sea negativo
  if (calculado.montoPendiente < 0) {
    errores.push(`Monto pendiente negativo: ${calculado.montoPendiente}`);
  }

  return {
    esConsistente: errores.length === 0,
    errores,
  };
};

export const filtrarFinanciamientos = (
  financiamientos: FinanciamientoCuota[],
  busqueda: string,
  filtroEstado: string,
  clientes: Cliente[],
  productos: Producto[],
  cobros: Cobro[]
): FinanciamientoCuota[] => {
  return financiamientos.filter((financiamiento) => {
    // Solo mostrar financiamientos a cuotas
    if (financiamiento.tipoVenta !== "cuotas") return false;

    // Filtro por estado
    if (filtroEstado !== "todos") {
      const cuotasAtrasadas = calcularCuotasAtrasadas(
        financiamiento,
        getCobrosFinanciamiento(financiamiento.id, cobros)
      );
      const estadoReal = cuotasAtrasadas > 0 ? "atrasado" : financiamiento.estado;
      if (filtroEstado !== estadoReal) return false;
    }

    // Filtro por búsqueda
    if (busqueda.trim() === "") return true;

    const clienteInfo = getClienteInfo(financiamiento.clienteId, clientes);
    const productoNombre = getProductoNombre(financiamiento.productoId, productos);
    const monto = financiamiento.monto.toFixed(0);
    const numeroControl = financiamiento.numeroControl?.toString() || "";

    const busquedaOriginal = busqueda.trim();
    const searchTerm = busqueda.toLowerCase();
    
    
    // Búsqueda exacta por número de control de financiamiento
    if (esFormatoNumeroControl(busquedaOriginal)) {
      const numeroNormalizado = normalizarNumeroControl(busquedaOriginal);
      return numeroNormalizado !== null && financiamiento.numeroControl === numeroNormalizado;
    }
    
    // Búsqueda general (texto libre)
    return (
      clienteInfo.nombre.toLowerCase().includes(searchTerm) ||
      clienteInfo.cedula.toLowerCase().includes(searchTerm) ||
      clienteInfo.telefono.includes(searchTerm) ||
      monto.includes(searchTerm) ||
      productoNombre.toLowerCase().includes(searchTerm) ||
      numeroControl.includes(searchTerm)
    );
  });
};

export const formatFecha = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getInitials = (nombre: string): string => {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}; 