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
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
      {/* Sección de Cobranza */}
      <DashboardCard
        title='Cobros del día'
        icon={<CalendarDaysIcon className='w-8 h-8' />}
        href='/cobranza/cobros-del-dia'
      />
      <DashboardCard
        title='Cuotas atrasadas'
        icon={<ExclamationCircleIcon className='w-8 h-8' />}
        href='/cobranza/cuotas-atrasadas'
      />

      {/* Sección de Clientes */}
      <DashboardCard
        title='Clientes'
        icon={<UsersIcon className='w-8 h-8' />}
        href='/clientes'
      />
      

      {/* Sección de Préstamos */}
      <DashboardCard
        title='Préstamos'
        icon={<ListBulletIcon className='w-8 h-8' />}
        href='/prestamos'
      />
     

      {/* Sección de Inventario */}
      <DashboardCard
        title='Inventario'
        icon={<ArchiveBoxIcon className='w-8 h-8' />}
        href='/inventario'
      />

      {/* Sección de Análisis y Configuración */}
      <DashboardCard
        title='Estadísticas'
        icon={<ChartBarIcon className='w-8 h-8' />}
        href='/estadisticas'
      />
     
    </div>
  );
};
