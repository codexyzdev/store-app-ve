import { memo } from "react";

interface DevelopmentDemoProps {
  showNotification: (notification: {
    type: "success" | "error" | "warning" | "info";
    message: string;
  }) => void;
}

export const DevelopmentDemo = memo(
  ({ showNotification }: DevelopmentDemoProps) => {
    const handleNotificationDemo = (
      type: "success" | "error" | "warning" | "info"
    ) => {
      const messages = {
        success: "¡Operación exitosa!",
        error: "Error en la operación",
        warning: "Advertencia importante",
        info: "Información relevante",
      };

      showNotification({
        type,
        message: messages[type],
      });
    };

    return (
      <div className='mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200'>
        <h3 className='text-lg font-semibold text-blue-800 mb-4'>
          🚀 Funcionalidades Redux Implementadas
        </h3>

        {/* Demo de notificaciones */}
        <div className='mb-6'>
          <h4 className='text-md font-medium text-blue-700 mb-3'>
            Sistema de Notificaciones Globales
          </h4>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => handleNotificationDemo("success")}
              className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
            >
              Éxito
            </button>
            <button
              onClick={() => handleNotificationDemo("error")}
              className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
            >
              Error
            </button>
            <button
              onClick={() => handleNotificationDemo("warning")}
              className='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors'
            >
              Advertencia
            </button>
            <button
              onClick={() => handleNotificationDemo("info")}
              className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              Info
            </button>
          </div>
        </div>

        {/* Estado actual de Redux */}
        <div>
          <h4 className='text-md font-medium text-blue-700 mb-3'>
            Estado Actual de Redux
          </h4>
          <div className='flex flex-wrap gap-3'>
            <a
              href='/clientes'
              className='inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
            >
              👥 Clientes Redux (Principal)
            </a>
            <span className='px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg'>
              ✅ Filtros avanzados
            </span>
            <span className='px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg'>
              ✅ Estadísticas en tiempo real
            </span>
            <span className='px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg'>
              ✅ Estado sincronizado
            </span>
            <span className='px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg'>
              🔄 Migración completa
            </span>
          </div>
        </div>
      </div>
    );
  }
);

DevelopmentDemo.displayName = "DevelopmentDemo";
