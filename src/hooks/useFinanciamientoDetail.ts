import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { FinanciamientoCuota, Cliente } from "@/lib/firebase/database";
import { useFinanciamientosRedux } from "./useFinanciamientosRedux";
import { useClientesRedux } from "./useClientesRedux";
import { useProductosRedux } from "./useProductosRedux";
import { useModalStates } from "./useModalStates";
import { FinanciamientoService, PagoData } from "@/services/financiamientoService";

export const useFinanciamientoDetail = () => {
  const params = useParams();
  const clienteId = params.id as string;

  // Hooks Redux
  const {
    financiamientos,
    loading: financiamientosLoading,
    getCobrosFinanciamiento,
    calcularInfoFinanciamiento,
  } = useFinanciamientosRedux();

  const { loading: clientesLoading, getClienteById } = useClientesRedux();
  const { getProductoNombre } = useProductosRedux();

  // Hook para modales
  const modals = useModalStates();

  // Estados locales
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [financiamientosCliente, setFinanciamientosCliente] = useState<FinanciamientoCuota[]>([]);
  const [abonando, setAbonando] = useState<{ [key: string]: boolean }>({});
  const [actualizando, setActualizando] = useState(false);

  // Cargar datos del cliente
  useEffect(() => {
    if (!clienteId) return;

    const clienteEncontrado = getClienteById(clienteId);
    setCliente(clienteEncontrado);

    const financiamientosDelCliente = financiamientos.filter(
      (f) => f.clienteId === clienteId && f.tipoVenta === "cuotas"
    );
    setFinanciamientosCliente(financiamientosDelCliente);
  }, [clienteId, financiamientos, getClienteById]);

  // Calcular totales
  const totales = useMemo(() => {
    const totalPendiente = financiamientosCliente.reduce((acc, f) => {
      if (f.estado !== "activo" && f.estado !== "atrasado") return acc;
      const info = calcularInfoFinanciamiento(f);
      return acc + info.montoPendiente;
    }, 0);

    const totalCuotasAtrasadas = financiamientosCliente.reduce((acc, f) => {
      if (f.estado !== "activo" && f.estado !== "atrasado") return acc;
      const info = calcularInfoFinanciamiento(f);
      return acc + info.valorCuota * info.cuotasAtrasadas;
    }, 0);

    return { totalPendiente, totalCuotasAtrasadas };
  }, [financiamientosCliente, calcularInfoFinanciamiento]);

  // Función para obtener nombres de productos
  const getProductosNombres = useCallback((financiamiento: FinanciamientoCuota) => {
    if (financiamiento.productos && financiamiento.productos.length > 0) {
      const nombres = financiamiento.productos.map((p) =>
        getProductoNombre(p.productoId)
      );
      return nombres.length === 1
        ? nombres[0]
        : `${nombres.length} productos: ${nombres.join(", ")}`;
    }
    return getProductoNombre(financiamiento.productoId);
  }, [getProductoNombre]);

  // Función para pagar cuota
  const handlePagarCuota = useCallback(async (financiamientoId: string, data: PagoData) => {
    const financiamiento = financiamientosCliente.find((f) => f.id === financiamientoId);
    if (!financiamiento) return;

    setAbonando((prev) => ({ ...prev, [financiamientoId]: true }));
    setActualizando(true);

    try {
      const cobrosExistentes = getCobrosFinanciamiento(financiamientoId).filter(
        (c) => (c.tipo === "cuota" || c.tipo === "inicial") && !!c.id && c.id !== "temp"
      );

      await FinanciamientoService.procesarPagoCuota(
        financiamientoId,
        financiamiento,
        data,
        cobrosExistentes
      );
    } catch (error) {
      console.error("Error al procesar pago:", error);
      
      if (error instanceof Error) {
        alert(`❌ Error al procesar el pago: ${error.message}`);
      } else {
        alert("❌ Error desconocido al procesar el pago. Por favor, verifica los datos e intenta nuevamente.");
      }
    } finally {
      setAbonando((prev) => ({ ...prev, [financiamientoId]: false }));
      setActualizando(false);
    }
  }, [financiamientosCliente, getCobrosFinanciamiento]);

  // Función para imprimir plan de pagos
  const imprimirPlanPagos = useCallback((financiamientoId: string) => {
    modals.openModal(`impresion-${financiamientoId}`);
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = `Plan de Pagos - ${cliente?.nombre || "Cliente"}`;
      window.print();
      document.title = originalTitle;
    }, 500);
  }, [modals, cliente?.nombre]);

  // Estado de carga
  const isLoading = financiamientosLoading || clientesLoading;

  return {
    // Datos
    cliente,
    financiamientosCliente,
    totales,
    
    // Estados
    isLoading,
    abonando,
    actualizando,
    
    // Funciones
    getProductosNombres,
    handlePagarCuota,
    imprimirPlanPagos,
    getCobrosFinanciamiento,
    calcularInfoFinanciamiento,
    
    // Modales
    modals,
    
    // ID del cliente
    clienteId
  };
}; 