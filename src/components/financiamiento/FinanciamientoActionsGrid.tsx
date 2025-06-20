import { memo } from "react";

interface FinanciamientoActionsGridProps {
  financiamientoId: string;
  montoPendiente: number;
  onPagarCuota: () => void;
  onAbrirCalendario: () => void;
  onAbrirHistorial: () => void;
  onImprimir: () => void;
  cargando?: boolean;
}

export const FinanciamientoActionsGrid = memo(
  ({
    financiamientoId,
    montoPendiente,
    onPagarCuota,
    onAbrirCalendario,
    onAbrirHistorial,
    onImprimir,
    cargando = false,
  }: FinanciamientoActionsGridProps) => {
    const actions = [
      {
        id: "pagar",
        label: "Pagar Cuota",
        icon: "💰",
        onClick: onPagarCuota,
        disabled: montoPendiente <= 0 || cargando,
        className:
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
        description: "Registrar un pago de cuota",
      },
      {
        id: "calendario",
        label: "Calendario",
        icon: "📅",
        onClick: onAbrirCalendario,
        disabled: false,
        className:
          "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white",
        description: "Ver el calendario de pagos",
      },
      {
        id: "historial",
        label: "Historial de Pagos",
        icon: "📋",
        onClick: onAbrirHistorial,
        disabled: false,
        className:
          "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
        description: "Ver historial de pagos",
      },
      {
        id: "carton",
        label: "Cartón de Pagos",
        icon: "📄",
        onClick: onImprimir,
        disabled: false,
        className:
          "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white",
        description: "Ver previa del cartón de pagos en PDF",
      },
    ];

    if (montoPendiente <= 0) {
      return (
        <div className='bg-green-50 rounded-2xl p-6 border border-green-200'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl text-white'>🎉</span>
            </div>
            <h3 className='text-lg font-semibold text-green-800 mb-2'>
              ¡Financiamiento Completado!
            </h3>
            <p className='text-green-600 mb-4'>
              Este financiamiento ha sido pagado completamente.
            </p>
            <div className='flex gap-3 justify-center'>
              <button
                onClick={onAbrirHistorial}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                📋 Ver Historial
              </button>
              <button
                onClick={onImprimir}
                className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
              >
                📄 Ver PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        <h4 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
          <span>⚡</span>
          Acciones Rápidas
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
              group relative overflow-hidden rounded-xl p-4 transition-all duration-300 
              ${action.className}
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              hover:scale-105 hover:shadow-lg
            `}
              title={action.description}
            >
              {/* Efecto de brillo en hover */}
              <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700' />

              <div className='relative flex items-center justify-center gap-3'>
                <span className='text-xl'>{action.icon}</span>
                <span className='font-semibold'>{action.label}</span>
              </div>

              {cargando && action.id === "pagar" && (
                <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

FinanciamientoActionsGrid.displayName = "FinanciamientoActionsGrid";
