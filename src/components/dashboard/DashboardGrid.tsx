import { DashboardCard } from "./DashboardCard";

import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  UserPlusIcon,
  ListBulletIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

export const DashboardGrid = () => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6'>
      {/* Sección de Cobranza */}
      <DashboardCard
        title='Cobros del día'
        icon={<CalendarDaysIcon className='w-8 h-8' />}
        href='/cobranza'
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
      <DashboardCard
        title='Nuevo Cliente'
        icon={<UserPlusIcon className='w-8 h-8' />}
        href='/clientes/nuevo'
      />

      {/* Sección de Préstamos */}
      <DashboardCard
        title='Préstamos'
        icon={<ListBulletIcon className='w-8 h-8' />}
        href='/prestamos'
      />
      <DashboardCard
        title='Nuevo Préstamo'
        icon={<PlusCircleIcon className='w-8 h-8' />}
        href='/prestamos/nuevo'
      />

      {/* Sección de Inventario */}
      <DashboardCard
        title='Inventario'
        icon={<ArchiveBoxIcon className='w-8 h-8' />}
        href='/inventario'
      />

      {/* Sección de Análisis y Configuración */}
      <DashboardCard
        title='Estadísticas Generales'
        icon={<ChartBarIcon className='w-8 h-8' />}
        href='/estadisticas'
      />
      <DashboardCard
        title='Configuración'
        icon={<Cog6ToothIcon className='w-8 h-8' />}
        href='/configuracion'
      />
    </div>
  );
};
