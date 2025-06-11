import { useState, useEffect, useCallback } from 'react';
import { 
  financiamientoDB, 
  FinanciamientoCuota, 
  cobrosDB, 
  Cobro 
} from '@/lib/firebase/database';
import { calcularCuotasAtrasadas } from '@/utils/financiamiento';

export interface FinanciamientoConDatos extends FinanciamientoCuota {
  cuotasAtrasadas: number;
  montoPendiente: number;
  valorCuota: number;
  progreso: number;
  cobrosValidos: Cobro[];
}

export function useFinanciamientos() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubFinanciamientos = financiamientoDB.suscribir((data) => {
      setFinanciamientos(data);
      setLoading(false);
    });
    
    const unsubCobros = cobrosDB.suscribir 
      ? cobrosDB.suscribir(setCobros)
      : () => {};

    return () => {
      unsubFinanciamientos();
      unsubCobros();
    };
  }, []);

  // Función para obtener cobros de un financiamiento específico
  const getCobrosFinanciamiento = useCallback((financiamientoId: string): Cobro[] => {
    return cobros.filter(
      (c) =>
        c.financiamientoId === financiamientoId &&
        (c.tipo === "cuota" || c.tipo === "inicial")
    );
  }, [cobros]);

  // Función para procesar financiamientos con datos calculados
  const getFinanciamientosConDatos = useCallback((): FinanciamientoConDatos[] => {
    return financiamientos.map((financiamiento) => {
      const cobrosValidos = cobros.filter(
        (c) =>
          c.financiamientoId === financiamiento.id &&
          (c.tipo === "cuota" || c.tipo === "inicial")
      );
      const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobrosValidos);
      const valorCuota = financiamiento.tipoVenta === "contado" 
        ? 0 
        : Math.round(financiamiento.monto / financiamiento.cuotas);
      
      const totalCobrado = cobrosValidos.reduce((acc, cobro) => acc + cobro.monto, 0);
      const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);
      const progreso = montoPendiente > 0 
        ? ((financiamiento.monto - montoPendiente) / financiamiento.monto) * 100 
        : 100;

      return {
        ...financiamiento,
        cuotasAtrasadas,
        montoPendiente,
        valorCuota,
        progreso,
        cobrosValidos
      };
    });
  }, [financiamientos, cobros]);

  // Filtrar financiamientos por estado
  const getFinanciamientosPorEstado = useCallback((estado: string) => {
    const financiamientosConDatos = financiamientos.map((financiamiento) => {
      const cobrosValidos = cobros.filter(
        (c) =>
          c.financiamientoId === financiamiento.id &&
          (c.tipo === "cuota" || c.tipo === "inicial")
      );
      const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobrosValidos);
      const valorCuota = financiamiento.tipoVenta === "contado" 
        ? 0 
        : Math.round(financiamiento.monto / financiamiento.cuotas);
      
      const totalCobrado = cobrosValidos.reduce((acc, cobro) => acc + cobro.monto, 0);
      const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);
      const progreso = montoPendiente > 0 
        ? ((financiamiento.monto - montoPendiente) / financiamiento.monto) * 100 
        : 100;

      return {
        ...financiamiento,
        cuotasAtrasadas,
        montoPendiente,
        valorCuota,
        progreso,
        cobrosValidos
      };
    });
    
    if (estado === 'todos') return financiamientosConDatos;
    if (estado === 'atrasado') {
      return financiamientosConDatos.filter(f => f.cuotasAtrasadas > 0);
    }
    if (estado === 'activo') {
      return financiamientosConDatos.filter(f => 
        f.estado === 'activo' && f.cuotasAtrasadas === 0
      );
    }
    return financiamientosConDatos.filter(f => f.estado === estado);
  }, [financiamientos, cobros]);

  // Estadísticas calculadas
  const getEstadisticas = useCallback(() => {
    const financiamientosConDatos = financiamientos.map((financiamiento) => {
      const cobrosValidos = cobros.filter(
        (c) =>
          c.financiamientoId === financiamiento.id &&
          (c.tipo === "cuota" || c.tipo === "inicial")
      );
      const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobrosValidos);
      const valorCuota = financiamiento.tipoVenta === "contado" 
        ? 0 
        : Math.round(financiamiento.monto / financiamiento.cuotas);
      
      const totalCobrado = cobrosValidos.reduce((acc, cobro) => acc + cobro.monto, 0);
      const montoPendiente = Math.max(0, financiamiento.monto - totalCobrado);

      return {
        ...financiamiento,
        cuotasAtrasadas,
        montoPendiente,
        valorCuota
      };
    });
    
    const financiamientosCuotas = financiamientosConDatos.filter(f => f.tipoVenta === 'cuotas');
    
    const activos = financiamientosCuotas.filter(f => 
      (f.estado === 'activo' || f.estado === 'atrasado') && f.cuotasAtrasadas === 0
    ).length;
    
    const atrasados = financiamientosCuotas.filter(f => f.cuotasAtrasadas > 0).length;
    
    const completados = financiamientosCuotas.filter(f => f.montoPendiente <= 0).length;
    
    const totalPendiente = financiamientosCuotas
      .filter(f => f.estado === 'activo' || f.estado === 'atrasado')
      .reduce((acc, f) => acc + f.montoPendiente, 0);
    
    const totalAtrasado = financiamientosCuotas
      .filter(f => f.cuotasAtrasadas > 0)
      .reduce((acc, f) => acc + (f.valorCuota * f.cuotasAtrasadas), 0);

    return {
      activos,
      atrasados,
      completados,
      totalPendiente,
      totalAtrasado,
      total: financiamientosCuotas.length
    };
  }, [financiamientos, cobros]);

  return {
    financiamientos,
    cobros,
    loading,
    getCobrosFinanciamiento,
    getFinanciamientosConDatos,
    getFinanciamientosPorEstado,
    getEstadisticas
  };
} 