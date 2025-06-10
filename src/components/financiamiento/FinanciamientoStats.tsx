import { useState, useEffect } from "react";
import { calcularCuotasAtrasadas } from "@/utils/financiamiento";

interface FinanciamientoCuota {
  id: string;
  clienteId: string;
  monto: number;
  cuotas: number;
  fechaInicio: number;
  estado: "activo" | "completado" | "atrasado";
  productoId: string;
  tipoVenta: "contado" | "cuotas";
  pagado?: boolean;
  descripcion?: string;
}

interface Cobro {
  id: string;
  financiamientoId: string;
  monto: number;
  fecha: number;
  tipo: "cuota" | "abono" | "inicial";
  numeroCuota?: number;
}

interface FinanciamientoStatsProps {
  financiamientos: FinanciamientoCuota[];
  cobros: Cobro[];
}

export function FinanciamientoStats({
  financiamientos,
  cobros,
}: FinanciamientoStatsProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {}
  );

  // Filtrar solo financiamientos a cuotas para las estadísticas
  const financiamientosCuotas = financiamientos.filter(
    (f) => f.tipoVenta === "cuotas"
  );

  // Función para obtener cobros de un financiamiento específico
  const getCobrosFinanciamiento = (financiamientoId: string) => {
    return cobros.filter(
      (c) =>
        c.financiamientoId === financiamientoId &&
        (c.tipo === "cuota" || c.tipo === "inicial")
    );
  };

  // Calcular estadísticas usando la misma lógica que las tarjetas individuales
  const financiamientosActivosArray = financiamientosCuotas.filter(
    (f) => f.estado === "activo" || f.estado === "atrasado"
  );

  // Separar entre activos y atrasados usando cálculo dinámico
  const financiamientosAtrasadosArray = financiamientosActivosArray.filter(
    (f) => {
      const cuotasAtrasadas = calcularCuotasAtrasadas(
        f,
        getCobrosFinanciamiento(f.id)
      );
      return cuotasAtrasadas > 0;
    }
  );

  const financiamientosActivosReales = financiamientosActivosArray.filter(
    (f) => {
      const cuotasAtrasadas = calcularCuotasAtrasadas(
        f,
        getCobrosFinanciamiento(f.id)
      );
      return cuotasAtrasadas === 0;
    }
  );

  // Calcular completados basado en si el monto está completamente pagado
  const financiamientosCompletadosArray = financiamientosCuotas.filter((f) => {
    const cobrosValidos = getCobrosFinanciamiento(f.id);
    const totalCobrado = cobrosValidos.reduce(
      (acc, cobro) => acc + cobro.monto,
      0
    );
    return totalCobrado >= f.monto;
  });

  const financiamientosActivos = financiamientosActivosReales.length;
  const financiamientosAtrasados = financiamientosAtrasadosArray.length;
  const financiamientosCompletados = financiamientosCompletadosArray.length;

  const montoTotal = financiamientosCuotas.reduce((sum, f) => sum + f.monto, 0);

  // Calcular total cobrado solo para financiamientos a cuotas
  const idsFinanciamientosCuotas = financiamientosCuotas.map((f) => f.id);
  const totalCobrado = cobros
    .filter(
      (c) =>
        idsFinanciamientosCuotas.includes(c.financiamientoId) &&
        (c.tipo === "cuota" || c.tipo === "inicial")
    )
    .reduce((sum, c) => sum + c.monto, 0);

  const montoPendiente = montoTotal - totalCobrado;

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

  const stats = [
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
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
      {stats.map((stat, index) => (
        <div
          key={stat.name}
          className={`${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-200 group`}
          style={{
            animationDelay: `${index * 100}ms`,
            animation: "fadeInUp 0.6s ease-out forwards",
          }}
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
            <div className='text-xs text-gray-600 font-medium'>{stat.name}</div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
