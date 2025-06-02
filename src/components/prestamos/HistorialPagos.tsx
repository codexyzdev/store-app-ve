import React from "react";

interface HistorialPagosProps {
  pagos: { id: string; fecha: number; monto: number }[];
}

const HistorialPagos: React.FC<HistorialPagosProps> = ({ pagos }) => {
  return (
    <div className='mt-4'>
      <div className='font-semibold text-gray-700 mb-2'>Historial de pagos</div>
      {pagos.length === 0 ? (
        <span className='ml-2 text-gray-500'>Sin pagos</span>
      ) : (
        <div className='w-full overflow-x-auto'>
          <ul className='flex flex-wrap md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 min-w-[320px]'>
            {pagos.map((cobro) => (
              <li
                key={cobro.id}
                className='flex items-center justify-between w-full min-w-[180px] bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-200'
              >
                <div className='flex items-center gap-2'>
                  <span className='text-purple-500 text-xl'>✔️</span>
                  <span className='font-semibold text-gray-800'>
                    {new Date(cobro.fecha).toLocaleDateString()}
                  </span>
                </div>
                <span className='px-3 py-1 rounded bg-green-100 text-green-800 font-bold text-base whitespace-nowrap ml-2'>
                  ${cobro.monto.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistorialPagos;
