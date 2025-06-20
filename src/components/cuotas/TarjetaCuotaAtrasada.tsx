import React from "react";
import Link from "next/link";
import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadasRedux";
import { getSeveridadConfig } from "@/utils/severidadUtils";
import {
  formatearTelefono,
  generarMensajeWhatsApp,
} from "@/utils/whatsappUtils";
import { formatNumeroControl, formatearCedula } from "@/utils/format";

interface TarjetaCuotaAtrasadaProps {
  item: FinanciamientoConDatos;
  index: number;
}

export const TarjetaCuotaAtrasada: React.FC<TarjetaCuotaAtrasadaProps> = ({
  item,
  index,
}) => {
  const config = getSeveridadConfig(item.severidad);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 ${config.color} overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      {/* Header de la tarjeta */}
      <div className={`px-4 sm:px-6 py-3 sm:py-4 ${config.color} border-b`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0'>
              <span className='text-xl sm:text-2xl'>{config.icon}</span>
            </div>
            <div className='min-w-0 flex-1'>
              <h3
                className={`font-bold text-base sm:text-xl ${config.textColor} truncate`}
              >
                {item.cliente.nombre}
              </h3>
              <p
                className={`text-xs flex flex-col  sm:text-sm opacity-80 ${config.textColor} truncate`}
              >
                <span>
                  Cliente #
                  {formatNumeroControl(item.cliente.numeroControl, "C")}
                </span>
                
                <span>C.I. {formatearCedula(item.cliente.cedula)}</span>
              </p>
            </div>
          </div>
          <span
            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${config.badge} flex-shrink-0 ml-2`}
          >
            {config.texto}
          </span>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className='p-4 sm:p-6 space-y-3 sm:space-y-4'>
        {/* Información del producto */}
        <div className='flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-xl'>
          <span className='text-gray-500 text-lg sm:text-xl flex-shrink-0'>
            🏷️
          </span>
          <div className='min-w-0 flex-1'>
            <p className='font-semibold text-gray-900 text-sm sm:text-base truncate'>
              {item.producto.nombre}
            </p>
            <p className='text-xs sm:text-sm text-gray-500'>
              Financiamiento #{formatNumeroControl(item.numeroControl, "F")}
            </p>
          </div>
        </div>

        {/* Métricas principales */}
        <div className='grid grid-cols-2 gap-2 sm:gap-4'>
          <div className='text-center p-2 flex flex-col justify-center gap-2 bg-red-50 rounded-xl border border-red-200'>
            <div className='text-xl sm:text-2xl font-bold text-red-600'>
              {item.cuotasAtrasadas}
            </div>
            <div className='text-xs sm:text-sm text-red-700 font-medium'>
              Cuotas Atrasadas
            </div>
          </div>
          <div className='text-center p-2 flex flex-col justify-center gap-2 bg-orange-50 rounded-xl border border-orange-200'>
            <div className='text-xl sm:text-2xl font-bold text-orange-600'>
              ${item.montoAtrasado.toFixed(2)}
            </div>
            <div className='text-xs sm:text-sm text-orange-700 font-medium'>
              Monto Atrasado
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className='space-y-2 sm:space-y-3 text-xs sm:text-sm'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-600'>Valor por cuota:</span>
            <span className='font-semibold'>${item.valorCuota.toFixed(2)}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-600'>Días aprox. de atraso:</span>
            <span className='font-semibold text-red-600'>
              ~{item.diasAtraso} días
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-600'>Última cuota pagada:</span>
            <span className='font-semibold'>
              {item.ultimaCuota
                ? new Date(item.ultimaCuota.fecha).toLocaleDateString()
                : "Sin pagos"}
            </span>
          </div>
          {item.cliente.telefono && (
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Teléfono:</span>
              <span className='font-semibold'>{item.cliente.telefono}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200'>
          <Link
            href={`/financiamiento-cuota/${item.clienteId}`}
            className='flex-1 bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base'
          >
            <span>👁️</span>
            <span>Ver Detalles</span>
          </Link>
          {item.cliente.telefono && (
            <a
              href={`https://wa.me/${formatearTelefono(
                item.cliente.telefono
              )}?text=${generarMensajeWhatsApp(item)}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex-1 bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors text-center flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base'
            >
              <span>📱</span>
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
