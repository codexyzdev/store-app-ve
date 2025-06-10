interface BusquedaPrestamosProps {
  busqueda: string;
  onBusquedaChange: (value: string) => void;
}

export default function BusquedaPrestamos({
  busqueda,
  onBusquedaChange,
}: BusquedaPrestamosProps) {
  return (
    <div className='mb-4'>
      <div className='relative rounded-md shadow-sm'>
        <input
          type='text'
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder='Buscar por cliente, cédula, producto o monto...'
          className='block w-full pl-4 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
        />
      </div>
    </div>
  );
}
