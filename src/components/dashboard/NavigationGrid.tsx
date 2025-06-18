import { memo } from "react";
import { NavigationCard } from "./NavigationCard";

interface NavigationGridProps {
  canManageInventory: boolean;
  canViewReports: boolean;
  canManageCollections: boolean;
}

export const NavigationGrid = memo(
  ({
    canManageInventory,
    canViewReports,
    canManageCollections,
  }: NavigationGridProps) => {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Tarjetas siempre visibles */}
        <NavigationCard
          title='Clientes'
          description='Gestionar clientes'
          href='/clientes'
          icon='👥'
          colorScheme='blue'
        />

        <NavigationCard
          title='Financiamientos'
          description='Gestionar financiamientos'
          href='/financiamiento-cuota'
          icon='💰'
          colorScheme='green'
        />

        <NavigationCard
          title='Transacciones'
          description='Movimientos históricos'
          href='/transacciones'
          icon='🔄'
          colorScheme='indigo'
        />

        {/* Tarjetas condicionales */}
        {canManageCollections && (
          <>
            <NavigationCard
              title='Cobros del Día'
              description='Gestionar cobros diarios'
              href='/cobros-del-dia'
              icon='📅'
              colorScheme='orange'
            />

            <NavigationCard
              title='Cuotas Atrasadas'
              description='Gestionar cuotas vencidas'
              href='/cuotas-atrasadas'
              icon='⚠️'
              colorScheme='red'
            />
          </>
        )}

        {canManageInventory && (
          <NavigationCard
            title='Inventario'
            description='Gestionar productos'
            href='/inventario'
            icon='📦'
            colorScheme='purple'
          />
        )}

        {canViewReports && (
          <NavigationCard
            title='Estadísticas'
            description='Ver reportes'
            href='/estadisticas'
            icon='📈'
            colorScheme='red'
          />
        )}
      </div>
    );
  }
);

NavigationGrid.displayName = "NavigationGrid";
