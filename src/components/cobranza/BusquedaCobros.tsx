import React from "react";

interface BusquedaCobrosProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
}

export default function BusquedaCobros({
  busqueda,
  onBusquedaChange,
}: BusquedaCobrosProps) {
  return (
    <div className='mb-4'>
      <input
        type='text'
        placeholder='Buscar por nombre o cédula...'
        value={busqueda}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onBusquedaChange(e.target.value)
        }
        className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
      />
    </div>
  );
}
