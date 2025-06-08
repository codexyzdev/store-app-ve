import { DashboardCard } from "./DashboardCard";

import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  ListBulletIcon,
  UsersIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

export const DashboardGrid = () => {
  return (
    <div className='space-y-8'>
      {/* Sección Principal - Cobranza */}
      <div>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          💰 Cobranza
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <DashboardCard
            title='Cobros del día'
            icon={<CalendarDaysIcon className='w-10 h-10' />}
            href='/cobranza/cobros-del-dia'
          />
          <DashboardCard
            title='Cuotas atrasadas'
            icon={<ExclamationCircleIcon className='w-10 h-10' />}
            href='/cobranza/cuotas-atrasadas'
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
            icon={<UsersIcon className='w-10 h-10' />}
            href='/clientes'
          />
          <DashboardCard
            title='Préstamos'
            icon={<ListBulletIcon className='w-10 h-10' />}
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
            icon={<ArchiveBoxIcon className='w-10 h-10' />}
            href='/inventario'
          />
          <DashboardCard
            title='Estadísticas'
            icon={<ChartBarIcon className='w-10 h-10' />}
            href='/estadisticas'
          />
        </div>
      </div>
    </div>
  );
};
