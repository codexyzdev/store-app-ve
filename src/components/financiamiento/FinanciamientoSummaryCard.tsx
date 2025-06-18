import { memo } from "react";

interface FinanciamientoInfo {
  valorCuota: number;
  totalCobrado: number;
  montoPendiente: number;
  cuotasAtrasadas: number;
  cuotasPagadas: number;
  cuotasTotales: number;
  progreso: number;
  montoTotal: number;
}

interface FinanciamientoSummaryCardProps {
  financiamientoInfo: FinanciamientoInfo;
  productoNombre: string;
  fechaInicio: number;
  index: number;
}

export const FinanciamientoSummaryCard = memo(
  ({
    financiamientoInfo,
    productoNombre,
    fechaInicio,
    index,
  }: FinanciamientoSummaryCardProps) => {
    const {
      valorCuota,
      totalCobrado,
      montoPendiente,
      cuotasAtrasadas,
      cuotasPagadas,
      cuotasTotales,
      progreso,
      montoTotal,
    } = financiamientoInfo;

    const getStatusColor = () => {
      if (cuotasAtrasadas > 0) return "red";
      if (montoPendiente <= 0) return "green";
      return "blue";
    };

    const statusColor = getStatusColor();
    const statusColors = {
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "⚠️",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "✅",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "📋",
      },
    };

    const colors = statusColors[statusColor];

    return (
      <div className='border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white'>
        {/* Header del financiamiento */}
        <div className={`px-6 py-4 ${colors.bg} ${colors.border} border-b`}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                  statusColor === "red"
                    ? "bg-red-500"
                    : statusColor === "green"
                    ? "bg-green-500"
                    : "bg-blue-500"
                } text-white`}
              >
                <span className='text-lg font-bold'>#{index + 1}</span>
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 line-clamp-1'>
                  {productoNombre}
                </h3>
                <p className='text-sm text-gray-600'>
                  Creado el {new Date(fechaInicio).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
            >
              {colors.icon}{" "}
              {cuotasAtrasadas > 0
                ? "Atrasado"
                : montoPendiente <= 0
                ? "Completado"
                : "Activo"}
            </div>
          </div>
        </div>

        {/* Contenido del resumen */}
        <div className='p-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            {/* Monto total */}
            <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-blue-600'>💰</span>
                <span className='text-xs font-medium text-blue-600 uppercase tracking-wide'>
                  Total
                </span>
              </div>
              <span className='text-xl font-bold text-blue-900'>
                ${montoTotal.toLocaleString()}
              </span>
            </div>

            {/* Monto cobrado */}
            <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-green-600'>✅</span>
                <span className='text-xs font-medium text-green-600 uppercase tracking-wide'>
                  Cobrado
                </span>
              </div>
              <span className='text-xl font-bold text-green-900'>
                ${totalCobrado.toLocaleString()}
              </span>
            </div>

            {/* Pendiente */}
            <div
              className={`${
                montoPendiente > 0
                  ? "bg-red-50 border-red-100"
                  : "bg-green-50 border-green-100"
              } rounded-xl p-4 border`}
            >
              <div className='flex items-center gap-2 mb-2'>
                <span
                  className={
                    montoPendiente > 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {montoPendiente > 0 ? "⏳" : "🎉"}
                </span>
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${
                    montoPendiente > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Pendiente
                </span>
              </div>
              <span
                className={`text-xl font-bold ${
                  montoPendiente > 0 ? "text-red-900" : "text-green-900"
                }`}
              >
                ${montoPendiente.toLocaleString()}
              </span>
            </div>

            {/* Valor cuota */}
            <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-purple-600'>📅</span>
                <span className='text-xs font-medium text-purple-600 uppercase tracking-wide'>
                  Por Cuota
                </span>
              </div>
              <span className='text-xl font-bold text-purple-900'>
                ${valorCuota.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Información de cuotas */}
          <div className='bg-gray-50 rounded-xl '>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm font-medium text-gray-700'>
                Progreso de Cuotas
              </span>
              <span className='text-sm font-bold text-gray-900'>
                {cuotasPagadas}/{cuotasTotales} ({progreso.toFixed(1)}%)
              </span>
            </div>

            {/* Barra de progreso mejorada */}
            <div className='w-full bg-gray-200 rounded-full h-3 mb-3'>
              <div
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  progreso >= 100
                    ? "bg-green-500"
                    : cuotasAtrasadas > 0
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(progreso, 100)}%` }}
              />
            </div>

            {/* Indicadores de estado */}
            <div className='flex items-center justify-between text-xs'>
              <span className='text-gray-600'>Pagadas: {cuotasPagadas}</span>
              <span className='text-gray-600'>
                Pendientes: {cuotasTotales - cuotasPagadas}
              </span>
              {cuotasAtrasadas > 0 && (
                <span className='text-red-600 font-semibold'>
                  Atrasadas: {cuotasAtrasadas}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FinanciamientoSummaryCard.displayName = "FinanciamientoSummaryCard";
