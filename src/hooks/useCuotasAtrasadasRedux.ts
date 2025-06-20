import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setLoading,
  setFinanciamientos,
} from '@/store/slices/cuotasAtrasadasSlice';
import {
  financiamientoDB,
  clientesDB,
  inventarioDB,
  cobrosDB,
  FinanciamientoCuota,
  Cliente,
  Producto,
  Cobro,
} from '@/lib/firebase/database';
import { calcularCuotasAtrasadas, calcularMontoAtrasado } from '@/utils/financiamiento';
// Definición de tipos necesarios
export interface FinanciamientoConDatos extends FinanciamientoCuota {
  cliente: Cliente;
  producto: Producto;
  cuotasAtrasadas: number;
  montoAtrasado: number;
  valorCuota: number;
  ultimaCuota: Cobro | null;
  diasAtraso: number;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
}

export interface EstadisticasCobranza {
  totalClientes: number;
  montoTotal: number;
  porSeveridad: {
    baja: number;
    media: number;
    alta: number;
    critica: number;
  };
  casosCriticos: number;
  casosAltoRiesgo: number;
  promedioPorCuota: number;
  promedioAtraso: number;
  totalMontoAtrasado: number;
  totalCuotasAtrasadas: number;
  clientesAfectados: number;
}

export const useCuotasAtrasadasRedux = () => {
  const dispatch = useAppDispatch();

  const state = useAppSelector((s) => s.cuotasAtrasadas);

  useEffect(() => {
    dispatch(setLoading(true));

    let financiamientos: FinanciamientoCuota[] = [];
    let clientes: Cliente[] = [];
    let productos: Producto[] = [];
    let cobros: Cobro[] = [];

    // Función para recalcular y despachar datos
    const recalcular = () => {
      if (!financiamientos.length || !clientes.length || !productos.length) {
        return;
      }

      const resultados: FinanciamientoConDatos[] = financiamientos
        .map((financiamiento) => {
          if (financiamiento.tipoVenta !== 'cuotas' || 
              (financiamiento.estado !== 'activo' && financiamiento.estado !== 'atrasado'))
            return null;

          const cliente = clientes.find((c) => c.id === financiamiento.clienteId);
          const producto = productos.find((p) => p.id === financiamiento.productoId);
          if (!cliente || !producto) return null;

          // Usar función unificada para calcular cuotas atrasadas
          const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
          
          // Debug: Log para identificar financiamientos procesados
          if (process.env.NODE_ENV === 'development') {
            console.log(`[CuotasAtrasadas] Financiamiento ${financiamiento.numeroControl}:`, {
              tipoVenta: financiamiento.tipoVenta,
              estado: financiamiento.estado,
              cuotasAtrasadas,
              clienteNombre: cliente?.nombre,
              productoNombre: producto?.nombre,
            });
          }
          
          if (cuotasAtrasadas === 0) return null;

          // Usar función unificada para calcular monto atrasado
          const valorCuota = Math.round(financiamiento.monto / financiamiento.cuotas);
          const montoAtrasado = calcularMontoAtrasado(financiamiento, cobros);

          // Obtener cobros para historial
          const cobrosFin = cobros.filter(
            (c) => c.financiamientoId === financiamiento.id && (c.tipo === 'cuota' || c.tipo === 'inicial')
          );
          const ultimaCuota = cobrosFin
            .filter(c => c.tipo === 'cuota')
            .sort((a, b) => b.fecha - a.fecha)[0] || null;

          // Calcular días de atraso de manera consistente
          const diasAtraso = cuotasAtrasadas * 7; // Cada cuota atrasada representa 7 días

          // Severidad
          let severidad: 'baja' | 'media' | 'alta' | 'critica' = 'baja';
          if (cuotasAtrasadas >= 8) severidad = 'critica';
          else if (cuotasAtrasadas >= 5) severidad = 'alta';
          else if (cuotasAtrasadas >= 3) severidad = 'media';

          return {
            ...financiamiento,
            cliente,
            producto,
            cuotasAtrasadas,
            montoAtrasado,
            valorCuota,
            ultimaCuota,
            diasAtraso,
            severidad,
          } as FinanciamientoConDatos;
        })
        .filter((i): i is FinanciamientoConDatos => i !== null);

      dispatch(setFinanciamientos(resultados));
    };

    // Subscripciones
    const unsubFin = financiamientoDB.suscribir((data) => {
      financiamientos = data;
      recalcular();
    });

    const unsubCli = clientesDB.suscribir((data) => {
      clientes = data;
      recalcular();
    });

    const unsubProd = inventarioDB.suscribir((data) => {
      productos = data;
      recalcular();
    });

    const unsubCobros = cobrosDB.suscribir((data) => {
      cobros = data;
      recalcular();
    });

    dispatch(setLoading(false));

    return () => {
      unsubFin();
      unsubCli();
      unsubProd();
      unsubCobros();
    };
  }, [dispatch]);

  return state;
} 