"use client";

import { Cobro } from "@/lib/firebase/database";

interface ListaNotasProps {
  cobros: Cobro[];
  className?: string;
}

export default function ListaNotas({
  cobros,
  className = "",
}: ListaNotasProps) {
  const cobrosConNotas = cobros.filter(
    (cobro) => cobro.nota && cobro.nota.trim()
  );

  if (cobrosConNotas.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
        <span className='text-2xl mb-2 block'>📝</span>
        <p className='text-gray-500 text-sm'>No hay notas registradas</p>
      </div>
    );
  }

  const formatearFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "cuota":
        return "💰 Cuota";
      case "inicial":
        return "🎯 Pago Inicial";
      case "abono":
        return "📊 Abono";
      default:
        return "💰 Pago";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
        <span>📝</span>
        Notas ({cobrosConNotas.length})
      </h4>

      <div className='space-y-2 max-h-60 overflow-y-auto'>
        {cobrosConNotas
          .sort((a, b) => b.fecha - a.fecha) // Más recientes primero
          .map((cobro, index) => (
            <div
              key={`${cobro.id}-${index}`}
              className='bg-white border border-gray-200 rounded-lg p-3 text-sm'
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-medium'>
                    {getTipoLabel(cobro.tipo)}
                  </span>
                  {cobro.numeroCuota && (
                    <span className='text-xs text-gray-500'>
                      Cuota #{cobro.numeroCuota}
                    </span>
                  )}
                </div>
                <span className='text-xs text-gray-400'>
                  {formatearFecha(cobro.fecha)}
                </span>
              </div>

              <p className='text-gray-700 leading-relaxed'>{cobro.nota}</p>

              {cobro.comprobante && (
                <div className='mt-2 pt-2 border-t border-gray-100'>
                  <span className='text-xs text-gray-500'>
                    Comprobante: {cobro.comprobante}
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
