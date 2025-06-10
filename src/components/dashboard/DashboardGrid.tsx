import { DashboardCard } from "./DashboardCard";
import { FinancialStats } from "./FinancialStats";

export const DashboardGrid = () => {
  return (
    <div className='space-y-8'>
      {/* Estadísticas Financieras */}
      <FinancialStats />
      {/* Sección Principal - Cobranza */}
      <div>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          💰 Cobranza
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <DashboardCard
            title='Gestión de Cobranza'
            icon={<span className='text-4xl'>📅</span>}
            href='/cobranza'
          />
          <DashboardCard
            title='Cuotas atrasadas'
            icon={<span className='text-4xl'>⚠️</span>}
            href='/cobranza'
          />
        </div>
      </div>

      {/* Sección de Gestión */}
      <div>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          👥 Gestión de Clientes y Préstamos
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <DashboardCard
            title='Clientes'
            icon={<span className='text-4xl'>👥</span>}
            href='/clientes'
          />
          <DashboardCard
            title='Préstamos'
            icon={<span className='text-4xl'>💰</span>}
            href='/prestamos'
          />
        </div>
      </div>

      {/* Sección de Inventario y Análisis */}
      <div>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          📊 Inventario y Análisis
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <DashboardCard
            title='Inventario'
            icon={<span className='text-4xl'>📦</span>}
            href='/inventario'
          />
          <DashboardCard
            title='Estadísticas'
            icon={<span className='text-4xl'>📈</span>}
            href='/estadisticas'
          />
        </div>
      </div>
    </div>
  );
};
