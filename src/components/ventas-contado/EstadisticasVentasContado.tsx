import React, { useState, useEffect } from "react";

interface EstadisticasVentasContadoProps {
  estadisticas: {
    totalVentas: number;
    montoTotal: number;
    ventasConDescuento: number;
    montoDescuentos: number;
    promedioVenta: number;
    ventasHoy: number;
  };
}

export const EstadisticasVentasContado = ({
  estadisticas,
}: EstadisticasVentasContadoProps) => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {}
  );

  // Animación de números
  useEffect(() => {
    const targets = {
      totalVentas: estadisticas.totalVentas,
      montoTotal: estadisticas.montoTotal,
      ventasConDescuento: estadisticas.ventasConDescuento,
      montoDescuentos: estadisticas.montoDescuentos,
      promedioVenta: estadisticas.promedioVenta,
      ventasHoy: estadisticas.ventasHoy,
    };

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 20; // 20 frames de animación
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 30);
    });
  }, [estadisticas]);

  const porcentajeDescuentos =
    estadisticas.totalVentas > 0
      ? (estadisticas.ventasConDescuento / estadisticas.totalVentas) * 100
      : 0;

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6'>
      <div className='flex items-center gap-4 mb-6'>
        <div className='w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center'>
          <span className='text-white text-xl'>📊</span>
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-900'>
            Estadísticas de Ventas
          </h3>
          <p className='text-sm text-gray-600'>
            Resumen general de todas las ventas al contado
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
        {/* Total de Ventas */}
        <div className='bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-4 border border-sky-200'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-sky-600 text-lg'>🛒</span>
            <span className='text-xs font-medium text-sky-700 uppercase tracking-wide'>
              Total Ventas
            </span>
          </div>
          <div className='text-2xl font-bold text-sky-700'>
            {animatedValues.totalVentas || 0}
          </div>
          <div className='text-xs text-sky-600 mt-1'>Ventas registradas</div>
        </div>

        {/* Monto Total */}
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-green-600 text-lg'>💰</span>
            <span className='text-xs font-medium text-green-700 uppercase tracking-wide'>
              Monto Total
            </span>
          </div>
          <div className='text-2xl font-bold text-green-700'>
            ${(animatedValues.montoTotal || 0).toLocaleString()}
          </div>
          <div className='text-xs text-green-600 mt-1'>Ingresos totales</div>
        </div>

        {/* Ventas con Descuento */}
        <div className='bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-amber-600 text-lg'>🏷️</span>
            <span className='text-xs font-medium text-amber-700 uppercase tracking-wide'>
              Con Descuento
            </span>
          </div>
          <div className='text-2xl font-bold text-amber-700'>
            {animatedValues.ventasConDescuento || 0}
          </div>
          <div className='text-xs text-amber-600 mt-1'>
            {porcentajeDescuentos.toFixed(1)}% del total
          </div>
        </div>

        {/* Descuentos Aplicados */}
        <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-red-600 text-lg'>📉</span>
            <span className='text-xs font-medium text-red-700 uppercase tracking-wide'>
              Descuentos
            </span>
          </div>
          <div className='text-2xl font-bold text-red-700'>
            ${(animatedValues.montoDescuentos || 0).toLocaleString()}
          </div>
          <div className='text-xs text-red-600 mt-1'>Ahorro a clientes</div>
        </div>

        {/* Promedio por Venta */}
        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-purple-600 text-lg'>📈</span>
            <span className='text-xs font-medium text-purple-700 uppercase tracking-wide'>
              Promedio
            </span>
          </div>
          <div className='text-2xl font-bold text-purple-700'>
            ${(animatedValues.promedioVenta || 0).toLocaleString()}
          </div>
          <div className='text-xs text-purple-600 mt-1'>Por venta</div>
        </div>

        {/* Ventas de Hoy */}
        <div className='bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-indigo-600 text-lg'>🎯</span>
            <span className='text-xs font-medium text-indigo-700 uppercase tracking-wide'>
              Hoy
            </span>
          </div>
          <div className='text-2xl font-bold text-indigo-700'>
            {animatedValues.ventasHoy || 0}
          </div>
          <div className='text-xs text-indigo-600 mt-1'>Ventas de hoy</div>
        </div>
      </div>

      {/* Indicadores adicionales */}
      <div className='mt-6 pt-4 border-t border-gray-100'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {/* Barra de progreso para descuentos */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-700'>
                Ventas con Descuento
              </span>
              <span className='text-sm text-gray-600'>
                {porcentajeDescuentos.toFixed(1)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-1000 ease-out'
                style={{ width: `${Math.min(porcentajeDescuentos, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Eficiencia de descuentos */}
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-700'>
                Descuento Promedio
              </span>
              <span className='text-sm text-gray-600'>
                $
                {estadisticas.ventasConDescuento > 0
                  ? Math.round(
                      estadisticas.montoDescuentos /
                        estadisticas.ventasConDescuento
                    )
                  : 0}
              </span>
            </div>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <span>💡</span>
              <span>
                {estadisticas.ventasConDescuento > 0
                  ? `Ahorro promedio por venta con descuento`
                  : "No hay ventas con descuento registradas"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
