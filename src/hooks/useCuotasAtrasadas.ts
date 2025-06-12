import { useState, useEffect, useMemo } from "react";
import {
  financiamientoDB,
  FinanciamientoCuota,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";
import { calcularCuotasAtrasadas } from "@/utils/financiamiento";

export interface FinanciamientoConDatos extends FinanciamientoCuota {
  cliente: Cliente;
  producto: Producto;
  cuotasAtrasadas: number;
  montoAtrasado: number;
  valorCuota: number;
  ultimaCuota: Cobro | null;
  diasAtraso: number;
  severidad: "baja" | "media" | "alta" | "critica";
}

export interface EstadisticasCobranza {
  totalCuotasAtrasadas: number;
  totalMontoAtrasado: number;
  clientesAfectados: number;
  casosCriticos: number;
  casosAltoRiesgo: number;
  promedioPorCuota: number;
  promedioAtraso: number;
}

export function useCuotasAtrasadas() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [
      financiamientoDB.suscribir((data) => {
        setFinanciamientos(
          data.filter((f) => f.tipoVenta === "cuotas" && f.estado === "activo")
        );
        setLoading(false);
      }),
      clientesDB.suscribir(setClientes),
      inventarioDB.suscribir(setProductos),
      cobrosDB.suscribir(setCobros),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const financiamientosConDatos = useMemo((): FinanciamientoConDatos[] => {
    if (!financiamientos.length || !clientes.length || !productos.length) {
      return [];
    }

    return financiamientos
      .map((financiamiento) => {
        const cliente = clientes.find((c) => c.id === financiamiento.clienteId);
        const producto = productos.find((p) => p.id === financiamiento.productoId);

        if (!cliente || !producto) return null;

        const cobrosFinanciamiento = cobros.filter(
          (c) => c.financiamientoId === financiamiento.id && c.tipo === "cuota"
        );

        const cuotasAtrasadas = calcularCuotasAtrasadas(financiamiento, cobros);
        const valorCuota = Math.round(financiamiento.monto / financiamiento.cuotas);
        const montoAtrasado = valorCuota * cuotasAtrasadas;

        const ultimaCuota =
          cobrosFinanciamiento.sort((a, b) => b.fecha - a.fecha)[0] || null;

        // Calcular días de atraso aproximados
        const fechaInicio = new Date(financiamiento.fechaInicio);
        const hoy = new Date();
        const semanasPasadas = Math.floor(
          (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        const cuotasPagadas = cobrosFinanciamiento.length;
        const cuotasQueDeberianEstarPagadas = Math.min(
          semanasPasadas,
          financiamiento.cuotas
        );
        const diasAtraso = Math.max(
          0,
          (cuotasQueDeberianEstarPagadas - cuotasPagadas) * 7
        );

        // Determinar severidad
        let severidad: "baja" | "media" | "alta" | "critica" = "baja";
        if (cuotasAtrasadas >= 8) severidad = "critica";
        else if (cuotasAtrasadas >= 5) severidad = "alta";
        else if (cuotasAtrasadas >= 3) severidad = "media";

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
      .filter(
        (item): item is FinanciamientoConDatos =>
          item !== null && item.cuotasAtrasadas > 0
      )
      .filter((item, index, array) => 
        array.findIndex(i => i.id === item.id) === index
      );
  }, [financiamientos, clientes, productos, cobros]);

  const estadisticas = useMemo((): EstadisticasCobranza => {
    const totalCuotasAtrasadas = financiamientosConDatos.reduce(
      (acc, item) => acc + item.cuotasAtrasadas,
      0
    );
    const totalMontoAtrasado = financiamientosConDatos.reduce(
      (acc, item) => acc + item.montoAtrasado,
      0
    );
    const clientesAfectados = new Set(
      financiamientosConDatos.map((item) => item.clienteId)
    ).size;
    const casosCriticos = financiamientosConDatos.filter(
      (item) => item.severidad === "critica"
    ).length;
    const casosAltoRiesgo = financiamientosConDatos.filter(
      (item) => item.severidad === "alta"
    ).length;
    const promedioPorCuota = financiamientosConDatos.length > 0
      ? financiamientosConDatos.reduce((acc, item) => acc + item.valorCuota, 0) /
        financiamientosConDatos.length
      : 0;
    const promedioAtraso = financiamientosConDatos.length > 0
      ? Math.round(
          financiamientosConDatos.reduce(
            (acc, item) => acc + item.cuotasAtrasadas,
            0
          ) / financiamientosConDatos.length
        )
      : 0;

    return {
      totalCuotasAtrasadas,
      totalMontoAtrasado,
      clientesAfectados,
      casosCriticos,
      casosAltoRiesgo,
      promedioPorCuota,
      promedioAtraso,
    };
  }, [financiamientosConDatos]);

  return {
    financiamientosConDatos,
    estadisticas,
    loading,
  };
} 