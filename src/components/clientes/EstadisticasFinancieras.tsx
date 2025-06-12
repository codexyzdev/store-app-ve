"use client";

import { useMemo } from "react";
import {
  useClientesFinancieros,
  ClienteFinanciero,
} from "@/hooks/useClientesFinancieros";
import { useAppSelector } from "@/store/hooks";

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
  const clientes = useAppSelector((state) => state.clientes.clientes);
  const {
    clientesFinancieros,
    loading: loadingFinanciero,
    estadisticasFinancieras,
  } = useClientesFinancieros(clientes);

  // Formatear montos
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calcular métricas adicionales
  const metricas = useMemo(() => {
    if (!clientesFinancieros.length) return null;

    const totalClientes = estadisticasFinancieras.totalClientes;
    const clientesActivos = estadisticasFinancieras.clientesActivos;
    const clientesConAtrasos = estadisticasFinancieras.clientesConAtrasos;
    const clientesAlDia = estadisticasFinancieras.clientesAlDia;

    // Distribución de riesgo
    const distribucionRiesgo = clientesFinancieros.reduce((acc, cliente) => {
      acc[cliente.riesgo] = (acc[cliente.riesgo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Distribución de estado financiero
    const distribucionEstado = clientesFinancieros.reduce((acc, cliente) => {
      acc[cliente.estadoFinanciero] = (acc[cliente.estadoFinanciero] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Clientes con mayor riesgo (crítico y alto)
    const clientesRiesgoAlto = clientesFinancieros.filter(
      (c) => c.riesgo === "critico" || c.riesgo === "alto"
    ).length;

    // Tasa de recuperación
    const tasaRecuperacion =
      totalClientes > 0
        ? ((clientesActivos - clientesConAtrasos) / clientesActivos) * 100
        : 100;

    return {
      totalClientes,
      clientesActivos,
      clientesConAtrasos,
      clientesAlDia,
      clientesRiesgoAlto,
      tasaRecuperacion,
      distribucionRiesgo,
      distribucionEstado,
      porcentajeActivos:
        totalClientes > 0 ? (clientesActivos / totalClientes) * 100 : 0,
      porcentajeConAtrasos:
        clientesActivos > 0 ? (clientesConAtrasos / clientesActivos) * 100 : 0,
      porcentajeAlDia:
        clientesActivos > 0 ? (clientesAlDia / clientesActivos) * 100 : 0,
    };
  }, [clientesFinancieros, estadisticasFinancieras]);

  if (loadingFinanciero || !metricas) {
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
          valor={metricas.totalClientes}
          descripcion='Clientes registrados'
          icono='👥'
          color='bg-blue-500'
          porcentaje={100}
        />

        <EstadisticaCard
          titulo='Clientes Activos'
          valor={metricas.clientesActivos}
          descripcion='Con financiamientos activos'
          icono='💼'
          color='bg-green-500'
          porcentaje={metricas.porcentajeActivos}
          trend='up'
        />

        <EstadisticaCard
          titulo='Clientes con Atrasos'
          valor={metricas.clientesConAtrasos}
          descripcion='Requieren seguimiento'
          icono='⚠️'
          color='bg-red-500'
          porcentaje={metricas.porcentajeConAtrasos}
          trend={metricas.clientesConAtrasos > 0 ? "down" : "neutral"}
        />

        <EstadisticaCard
          titulo='Clientes al Día'
          valor={metricas.clientesAlDia}
          descripcion='Pagos puntuales'
          icono='✅'
          color='bg-emerald-500'
          porcentaje={metricas.porcentajeAlDia}
          trend='up'
        />
      </div>

      {/* Estadísticas financieras */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
        <EstadisticaCard
          titulo='Balance Pendiente'
          valor={formatMoney(estadisticasFinancieras.totalBalancePendiente)}
          descripcion='Total por cobrar'
          icono='💰'
          color='bg-yellow-500'
        />

        <EstadisticaCard
          titulo='Total Financiado'
          valor={formatMoney(estadisticasFinancieras.totalFinanciadoHistorico)}
          descripcion='Histórico de financiamientos'
          icono='📊'
          color='bg-purple-500'
        />

        <EstadisticaCard
          titulo='Tasa de Recuperación'
          valor={`${metricas.tasaRecuperacion.toFixed(1)}%`}
          descripcion='Clientes al día vs total'
          icono='🎯'
          color='bg-indigo-500'
          porcentaje={metricas.tasaRecuperacion}
          trend={
            metricas.tasaRecuperacion > 80
              ? "up"
              : metricas.tasaRecuperacion > 60
              ? "neutral"
              : "down"
          }
        />
      </div>
    </div>
  );
}
