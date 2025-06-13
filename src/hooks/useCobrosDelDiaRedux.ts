import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setLoading,
  setCobrosDelDia,
  CobroPendienteDetallado,
  GrupoCobros,
} from '@/store/slices/cobrosDelDiaSlice';
import {
  cobrosDB,
  clientesDB,
  financiamientoDB,
  inventarioDB,
  Cobro,
  Cliente,
  FinanciamientoCuota,
  Producto,
} from '@/lib/firebase/database';

export function useCobrosDelDiaRedux() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.cobrosDelDia);

  useEffect(() => {
    dispatch(setLoading(true));

    let cobros: Cobro[] = [];
    let clientes: Cliente[] = [];
    let financiamientos: FinanciamientoCuota[] = [];
    let productos: Producto[] = [];

    // Función para obtener información del cliente
    const getCliente = (id: string) => {
      return clientes.find((c: Cliente) => c.id === id);
    };

    // Función para obtener información del producto
    const getProducto = (id: string) => {
      return productos.find((p: Producto) => p.id === id);
    };

    // Función para contar pagos realizados de un financiamiento
    const contarPagosRealizados = (financiamientoId: string) => {
      return cobros.filter(c => c.financiamientoId === financiamientoId && c.tipo === 'cuota').length;
    };

    // Función para calcular cobros pendientes para hoy con información detallada
    const calcularCobrosPendientes = (): CobroPendienteDetallado[] => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const pendientes: CobroPendienteDetallado[] = [];

      financiamientos.forEach((financiamiento) => {
        if (financiamiento.estado !== "activo" && financiamiento.estado !== "atrasado") return;
        
        const cliente = getCliente(financiamiento.clienteId);
        if (!cliente) return;

        // Obtener producto (manejar tanto financiamientos simples como agrupados)
        let nombreProducto = "";
        if (financiamiento.productos && financiamiento.productos.length > 0) {
          // Financiamiento agrupado
          nombreProducto = financiamiento.productos.map(p => {
            const producto = getProducto(p.productoId);
            return `${producto?.nombre || 'Producto'} (${p.cantidad})`;
          }).join(", ");
        } else if (financiamiento.productoId) {
          // Financiamiento simple
          const producto = getProducto(financiamiento.productoId);
          nombreProducto = producto?.nombre || "Producto";
        }

        const fechaInicio = new Date(financiamiento.fechaInicio);
        const pagosRealizados = contarPagosRealizados(financiamiento.id);
        
        // Verificar si hay cuota pendiente para hoy
        for (let i = 0; i < financiamiento.cuotas; i++) {
          const fechaCuota = new Date(fechaInicio);
          fechaCuota.setDate(fechaInicio.getDate() + i * 7);
          
          if (fechaCuota.getTime() === hoy.getTime()) {
            if (pagosRealizados > i) continue; // Ya pagada
            
            pendientes.push({
              clienteId: financiamiento.clienteId,
              financiamientoId: financiamiento.id,
              nombre: cliente.nombre,
              cedula: cliente.cedula,
              telefono: cliente.telefono,
              direccion: cliente.direccion,
              monto: financiamiento.monto / financiamiento.cuotas,
              cuota: i + 1,
              producto: nombreProducto,
              historialPagos: pagosRealizados,
              totalCuotas: financiamiento.cuotas,
              fechaInicio: fechaInicio,
              notas: financiamiento.descripcion
            });
          }
        }
      });

      return pendientes;
    };

    // Función para agrupar cobros realizados por cliente
    const agruparCobrosRealizados = (cobrosHoy: Cobro[]): GrupoCobros[] => {
      const cobrosAgrupados = cobrosHoy.reduce(
        (acc: Record<string, GrupoCobros>, cobro: Cobro) => {
          const financiamiento = financiamientos.find(
            (f: FinanciamientoCuota) => f.id === cobro.financiamientoId
          );
          
          // Si no encontramos el financiamiento, intentar buscar en préstamos legacy
          if (!financiamiento) {
            console.warn(
              `⚠️ No se encontró financiamiento para cobro ${cobro.id}. Esto puede ser un cobro huérfano o de datos legacy.`
            );
            // Aún así, intentemos mostrar el cobro buscando por prestamoId si existe
            const prestamoLegacy = financiamientos.find(
              (f) => f.id === (cobro as any).prestamoId
            );
            if (prestamoLegacy) {
              const cliente = getCliente(prestamoLegacy.clienteId);
              if (cliente) {
                const clienteId = prestamoLegacy.clienteId;
                if (!acc[clienteId]) {
                  acc[clienteId] = {
                    clienteId,
                    nombre: cliente.nombre,
                    cedula: cliente.cedula,
                    telefono: cliente.telefono,
                    direccion: cliente.direccion,
                    cobros: [],
                    totalCobrado: 0,
                  };
                }
                acc[clienteId].cobros.push(cobro);
                acc[clienteId].totalCobrado += cobro.monto;
              }
            }
            return acc;
          }

          const cliente = getCliente(financiamiento.clienteId);
          if (!cliente) {
            console.warn(
              `⚠️ No se encontró cliente ${financiamiento.clienteId} para financiamiento ${financiamiento.id}`
            );
            return acc;
          }

          const clienteId = financiamiento.clienteId;
          if (!acc[clienteId]) {
            acc[clienteId] = {
              clienteId,
              nombre: cliente.nombre,
              cedula: cliente.cedula,
              telefono: cliente.telefono,
              direccion: cliente.direccion,
              cobros: [],
              totalCobrado: 0,
            };
          }
          acc[clienteId].cobros.push(cobro);
          acc[clienteId].totalCobrado += cobro.monto;
          return acc;
        },
        {}
      );

      return Object.values(cobrosAgrupados);
    };

    // Función para recalcular y despachar datos
    const recalcular = () => {
      if (!clientes.length || !financiamientos.length || !productos.length) {
        return;
      }

      // Filtrar solo los cobros de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);
      const cobrosHoy = cobros.filter((cobro) => {
        const fechaCobro = new Date(cobro.fecha);
        return fechaCobro >= hoy && fechaCobro < manana;
      });

      console.log(
        `📊 Cobros del día encontrados: ${cobrosHoy.length}`,
        cobrosHoy
      );
      console.log(`🔍 Total de cobros en BD: ${cobros.length}`);

      // Debug para verificar estructura de cobros
      cobrosHoy.forEach((cobro, idx) => {
        console.log(`Cobro ${idx + 1}:`, {
          id: cobro.id,
          financiamientoId: cobro.financiamientoId,
          prestamoId: (cobro as any).prestamoId,
          monto: cobro.monto,
          tipo: cobro.tipo,
          fecha: new Date(cobro.fecha).toLocaleDateString(),
          numeroCuota: cobro.numeroCuota,
        });
      });

      const cobrosPendientes = calcularCobrosPendientes();
      const cobrosAgrupados = agruparCobrosRealizados(cobrosHoy);

      dispatch(setCobrosDelDia({
        cobrosHoy,
        cobrosPendientes,
        cobrosAgrupados,
      }));
    };

    // Subscripciones
    const unsubCobros = cobrosDB.suscribir((data) => {
      cobros = data;
      recalcular();
    });

    const unsubClientes = clientesDB.suscribir((data) => {
      clientes = data;
      recalcular();
    });

    const unsubFinanciamientos = financiamientoDB.suscribir((data) => {
      financiamientos = data;
      recalcular();
    });

    const unsubProductos = inventarioDB.suscribir((data) => {
      productos = data;
      recalcular();
    });

    return () => {
      unsubCobros();
      unsubClientes();
      unsubFinanciamientos();
      unsubProductos();
    };
  }, [dispatch]);

  return state;
} 