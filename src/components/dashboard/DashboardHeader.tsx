import { memo } from "react";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DashboardHeader = memo(
  ({
    title = "Dashboard | Sistema de Financiamientos",
    subtitle = "Panel de control principal",
  }: DashboardHeaderProps) => {
    return (
      <header className='mb-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
          {subtitle && <p className='text-gray-600'>{subtitle}</p>}
        </div>
      </header>
    );
  }
);

DashboardHeader.displayName = "DashboardHeader";
