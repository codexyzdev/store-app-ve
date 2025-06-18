import { memo, ReactNode } from "react";

interface FinanciamientosListContainerProps {
  children: ReactNode;
  totalFinanciamientos: number;
  clienteNombre?: string;
}

export const FinanciamientosListContainer = memo(
  ({
    children,
    totalFinanciamientos,
    clienteNombre,
  }: FinanciamientosListContainerProps) => {
    return (
      <div className='bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden'>
        {/* Header del contenedor */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6'>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg'>
              <span className='text-2xl text-white'>📋</span>
            </div>
            <div className='text-white'>
              <h2 className='text-xl font-bold mb-1'>
                Financiamientos del Cliente
              </h2>
              <p className='text-blue-100'>
                {totalFinanciamientos === 0
                  ? "Sin financiamientos registrados"
                  : `${totalFinanciamientos} financiamiento${
                      totalFinanciamientos > 1 ? "s" : ""
                    } registrado${totalFinanciamientos > 1 ? "s" : ""}`}
                {clienteNombre && ` para ${clienteNombre}`}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className='p-8'>{children}</div>
      </div>
    );
  }
);

FinanciamientosListContainer.displayName = "FinanciamientosListContainer";
