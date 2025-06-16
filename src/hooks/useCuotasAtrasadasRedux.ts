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
import { calcularCuotasAtrasadas } from '@/utils/financiamiento';
import { FinanciamientoConDatos } from './useCuotasAtrasadas';

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
          if (financiamiento.tipoVenta !== 'cuotas' || financiamiento.estado !== 'activo')
            return null;

          const cliente = clientes.find((c) => c.id === financiamiento.clienteId);
          const producto = productos.find((p) => p.id === financiamiento.productoId);
          if (!cliente || !producto) return null;

          const cobrosFin = cobros.filter(
            (c) => c.financiamientoId === financiamiento.id && c.tipo === 'cuota'
          );

          const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
          if (cuotasAtrasadas === 0) return null;

          const valorCuota = Math.round(financiamiento.monto / financiamiento.cuotas);
          const montoAtrasado = valorCuota * cuotasAtrasadas;

          const ultimaCuota = cobrosFin.sort((a, b) => b.fecha - a.fecha)[0] || null;

          // Dias de atraso aproximados
          const fechaInicio = new Date(financiamiento.fechaInicio);
          const hoy = new Date();
          const semanas = Math.floor(
            (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
          );
          const cuotasPagadas = cobrosFin.length;
          const cuotasEsperadas = Math.min(semanas, financiamiento.cuotas);
          const diasAtraso = Math.max(0, (cuotasEsperadas - cuotasPagadas) * 7);

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