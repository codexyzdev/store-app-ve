"use client";

import { useMemo } from "react";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useFinanciamientosRedux } from "@/hooks/useFinanciamientosRedux";

interface EstadisticaCardProps {
  titulo: string;
  valor: string | number;
  descripcion: string;
  icono: string;
  color: string;
  porcentaje?: number;
  trend?: "up" | "down" | "neutral";
}

function EstadisticaCard({
  titulo,
  valor,
  descripcion,
  icono,
  color,
  porcentaje,
  trend,
}: EstadisticaCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200`}
    >
      <div className='flex items-center justify-between mb-4'>
        <div
          className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}
        >
          <span className='text-xl'>{icono}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️"}
          </div>
        )}
      </div>
      <div className='space-y-2'>
        <h3 className='text-sm font-medium text-gray-600'>{titulo}</h3>
        <p className='text-2xl font-bold text-gray-900'>{valor}</p>
        <p className='text-sm text-gray-500'>{descripcion}</p>
        {porcentaje !== undefined && (
          <div className='flex items-center gap-2'>
            <div className='flex-1 bg-gray-200 rounded-full h-2'>
              <div
                className={`h-2 rounded-full ${color
                  .replace("bg-", "bg-")
                  .replace("-500", "-600")}`}
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
              ></div>
            </div>
            <span className='text-xs text-gray-600'>
              {porcentaje.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function EstadisticasFinancieras() {
  // Hooks Redux optimizados
  const { clientes, loading: clientesLoading } = useClientesRedux();
  const {
    financiamientos,
    cobros,
    loading: financiamientosLoading,
  } = useFinanciamientosRedux();

  // Calcular información financiera usando datos de Redux
  const estadisticasFinancieras = useMemo(() => {
    if (!clientes.length || !financiamientos.length) {
      return {
        totalClientes: clientes.length,
        clientesActivos: 0,
        clientesConAtrasos: 0,
        clientesAlDia: 0,
        clientesNuevos: clientes.length,
        totalBalancePendiente: 0,
        totalFinanciadoHistorico: 0,
        promedioAtrasos: 0,
      };
    }

    const clientesConFinanciamiento = clientes.map((cliente) => {
      const financiamientosCliente = financiamientos.filter(
        (f) => f.clienteId === cliente.id
      );
      const totalFinanciado = financiamientosCliente.reduce(
        (sum, f) => sum + f.monto,
        0
      );
      const financiamientosActivos = financiamientosCliente.filter(
        (f) => f.estado === "activo" || f.estado === "atrasado"
      ).length;

      // Calcular balance pendiente y cuotas atrasadas
      let balancePendiente = 0;
      let cuotasAtrasadasTotal = 0;

      financiamientosCliente.forEach((financiamiento) => {
        const cobrosFinanciamiento = cobros.filter(
          (c) =>
            c.financiamientoId === financiamiento.id &&
            (c.tipo === "cuota" || c.tipo === "inicial")
        );

        const totalCobrado = cobrosFinanciamiento.reduce(
          (sum, c) => sum + c.monto,
          0
        );
        const pendiente = Math.max(0, financiamiento.monto - totalCobrado);
        balancePendiente += pendiente;

        if (financiamiento.tipoVenta === "cuotas" && pendiente > 0) {
          // Calcular cuotas atrasadas básico
          const fechaActual = Date.now();
          const fechaInicio = financiamiento.fechaInicio;
          const semanasTranscurridas = Math.floor(
            (fechaActual - fechaInicio) / (1000 * 60 * 60 * 24 * 7)
          );
          const cuotasEsperadas = Math.max(
            0,
            Math.min(semanasTranscurridas, financiamiento.cuotas)
          );
          const cuotasPagadas = cobrosFinanciamiento.length;
          const cuotasAtrasadas = Math.max(0, cuotasEsperadas - cuotasPagadas);
          cuotasAtrasadasTotal += cuotasAtrasadas;
        }
      });

      return {
        ...cliente,
        totalFinanciado,
        financiamientosActivos,
        balancePendiente,
        cuotasAtrasadas: cuotasAtrasadasTotal,
        historialCompleto: totalFinanciado > 0,
      };
    });

    const clientesActivos = clientesConFinanciamiento.filter(
      (c) => c.financiamientosActivos > 0
    ).length;
    const clientesConAtrasos = clientesConFinanciamiento.filter(
      (c) => c.cuotasAtrasadas > 0
    ).length;
    const clientesAlDia = clientesConFinanciamiento.filter(
      (c) => c.financiamientosActivos > 0 && c.cuotasAtrasadas === 0
    ).length;
    const clientesNuevos = clientesConFinanciamiento.filter(
      (c) => !c.historialCompleto
    ).length;
    const totalBalancePendiente = clientesConFinanciamiento.reduce(
      (sum, c) => sum + c.balancePendiente,
      0
    );
    const totalFinanciadoHistorico = clientesConFinanciamiento.reduce(
      (sum, c) => sum + c.totalFinanciado,
      0
    );
    const promedioAtrasos =
      clientesConAtrasos > 0
        ? clientesConFinanciamiento.reduce(
            (sum, c) => sum + c.cuotasAtrasadas,
            0
          ) / clientesConAtrasos
        : 0;

    return {
      totalClientes: clientes.length,
      clientesActivos,
      clientesConAtrasos,
      clientesAlDia,
      clientesNuevos,
      totalBalancePendiente,
      totalFinanciadoHistorico,
      promedioAtrasos,
    };
  }, [clientes, financiamientos, cobros]);

  if (clientesLoading || financiamientosLoading || !estadisticasFinancieras) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='bg-white rounded-2xl p-6 shadow-sm border animate-pulse'
          >
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gray-200 rounded-xl'></div>
              <div className='flex-1'>
                <div className='h-4 bg-gray-200 rounded mb-2'></div>
                <div className='h-6 bg-gray-200 rounded'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='mb-8'>
      {/* Estadísticas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        <EstadisticaCard
          titulo='Total Clientes'
          valor={estadisticasFinancieras.totalClientes}
          descripcion='Clientes registrados'
          icono='👥'
          color='bg-blue-500'
          porcentaje={100}
        />

        <EstadisticaCard
          titulo='Clientes Activos'
          valor={estadisticasFinancieras.clientesActivos}
          descripcion='Con financiamientos activos'
          icono='💼'
          color='bg-green-500'
          porcentaje={
            estadisticasFinancieras.clientesActivos > 0
              ? (estadisticasFinancieras.clientesActivos /
                  estadisticasFinancieras.totalClientes) *
                100
              : 0
          }
          trend='up'
        />

        <EstadisticaCard
          titulo='Clientes con Atrasos'
          valor={estadisticasFinancieras.clientesConAtrasos}
          descripcion='Requieren seguimiento'
          icono='⚠️'
          color='bg-red-500'
          porcentaje={
            estadisticasFinancieras.clientesConAtrasos > 0
              ? (estadisticasFinancieras.clientesConAtrasos /
                  estadisticasFinancieras.clientesActivos) *
                100
              : 0
          }
          trend={
            estadisticasFinancieras.clientesConAtrasos > 0 ? "down" : "neutral"
          }
        />

        <EstadisticaCard
          titulo='Clientes al Día'
          valor={estadisticasFinancieras.clientesAlDia}
          descripcion='Pagos puntuales'
          icono='✅'
          color='bg-emerald-500'
          porcentaje={
            estadisticasFinancieras.clientesAlDia > 0
              ? (estadisticasFinancieras.clientesAlDia /
                  estadisticasFinancieras.clientesActivos) *
                100
              : 0
          }
          trend='up'
        />
      </div>

      {/* Estadísticas financieras */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
        <EstadisticaCard
          titulo='Balance Pendiente'
          valor={estadisticasFinancieras.totalBalancePendiente}
          descripcion='Total por cobrar'
          icono='💰'
          color='bg-yellow-500'
        />

        <EstadisticaCard
          titulo='Total Financiado'
          valor={estadisticasFinancieras.totalFinanciadoHistorico}
          descripcion='Histórico de financiamientos'
          icono='📊'
          color='bg-purple-500'
        />

        <EstadisticaCard
          titulo='Tasa de Recuperación'
          valor={estadisticasFinancieras.promedioAtrasos.toFixed(1)}
          descripcion='Promedio de atrasos'
          icono='🎯'
          color='bg-indigo-500'
          porcentaje={
            estadisticasFinancieras.promedioAtrasos > 0
              ? (estadisticasFinancieras.promedioAtrasos /
                  estadisticasFinancieras.clientesActivos) *
                100
              : 0
          }
          trend={
            estadisticasFinancieras.promedioAtrasos > 0 ? "down" : "neutral"
          }
        />
      </div>
    </div>
  );
}
