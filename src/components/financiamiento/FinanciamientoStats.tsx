import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FinanciamientoCuota, Cobro } from "@/lib/firebase/database";
import { FinanciamientosEstadisticas } from "@/store/slices/financiamientosSlice";
import {
  calcularEstadisticasFinanciamientos,
  FinanciamientoStatsResult,
} from "@/utils/financiamientoStats";

interface FinanciamientoStatsProps {
  financiamientos: FinanciamientoCuota[];
  cobros: Cobro[];
  estadisticasRedux?: FinanciamientosEstadisticas;
}

export function FinanciamientoStats({
  financiamientos,
  cobros,
  estadisticasRedux,
}: FinanciamientoStatsProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {}
  );

  const valores: FinanciamientoStatsResult = useMemo(() => {
    if (estadisticasRedux) {
      return {
        activos: estadisticasRedux.activos,
        atrasados: estadisticasRedux.atrasados,
        completados: estadisticasRedux.completados,
        montoTotal: estadisticasRedux.montoTotal,
        montoRecaudado: estadisticasRedux.montoRecaudado,
        montoPendiente: estadisticasRedux.montoPendiente,
      };
    }
    return calcularEstadisticasFinanciamientos(financiamientos, cobros);
  }, [estadisticasRedux, financiamientos, cobros]);

  const {
    activos: financiamientosActivos,
    atrasados: financiamientosAtrasados,
    completados: financiamientosCompletados,
    montoTotal,
    montoPendiente,
    montoRecaudado: totalCobrado,
  } = valores;

  // Animación de números
  useEffect(() => {
    const targets = {
      financiamientosActivos,
      financiamientosAtrasados,
      financiamientosCompletados,
      montoTotal,
      totalCobrado,
      montoPendiente,
    };

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 20;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 30);
    });
  }, [
    financiamientosActivos,
    financiamientosAtrasados,
    financiamientosCompletados,
    montoTotal,
    totalCobrado,
    montoPendiente,
  ]);

  interface StatItem {
    name: string;
    value: string;
    icon: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }

  const stats: StatItem[] = useMemo(
    () => [
      {
        name: "Financiamientos Activos",
        value: (animatedValues.financiamientosActivos || 0).toString(),
        icon: "💰",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
        borderColor: "border-blue-200",
      },
      {
        name: "Financiamientos Atrasados",
        value: (animatedValues.financiamientosAtrasados || 0).toString(),
        icon: "⚠️",
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        borderColor: "border-red-200",
      },
      {
        name: "Completados",
        value: (animatedValues.financiamientosCompletados || 0).toString(),
        icon: "✅",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        textColor: "text-green-600",
        borderColor: "border-green-200",
      },
      {
        name: "Monto Total",
        value: `$${(animatedValues.montoTotal || 0).toLocaleString()}`,
        icon: "💎",
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        borderColor: "border-purple-200",
      },
      {
        name: "Total Cobrado",
        value: `$${(animatedValues.totalCobrado || 0).toLocaleString()}`,
        icon: "💚",
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-200",
      },
      {
        name: "Monto Pendiente",
        value: `$${(animatedValues.montoPendiente || 0).toLocaleString()}`,
        icon: "⏳",
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        borderColor: "border-orange-200",
      },
    ],
    [animatedValues]
  );

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
      {stats.map((stat: StatItem, index: number) =>
        stat.name === "Completados" ? (
          <Link
            key={stat.name}
            href='/financiamiento-cuota/completados'
            className={`${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-200 group animate-fadeInUp`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className='flex flex-col items-center text-center'>
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <span className='text-xl text-white'>{stat.icon}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className='text-xs text-gray-600 font-medium'>
                {stat.name}
              </div>
            </div>
          </Link>
        ) : (
          <div
            key={stat.name}
            className={`${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-200 group animate-fadeInUp`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className='flex flex-col items-center text-center'>
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <span className='text-xl text-white'>{stat.icon}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </div>
              <div className='text-xs text-gray-600 font-medium'>
                {stat.name}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
