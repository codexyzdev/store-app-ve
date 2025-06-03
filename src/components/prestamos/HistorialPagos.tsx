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
        <div className='w-full max-h-72 overflow-y-auto pr-1'>
          <ul className='flex flex-col gap-3 min-w-[320px]'>
            {pagos.map((cobro) => (
              <li
                key={cobro.id}
                className='flex items-center justify-between w-full min-w-[180px] bg-white rounded-lg shadow border border-gray-100 px-4 py-3 transition-shadow hover:shadow-md hover:border-purple-200 duration-150 mb-1'
              >
                <div className='flex items-center gap-2'>
                  <span className='text-purple-500 text-lg align-middle'>
                    ✔️
                  </span>
                  <span className='font-semibold text-gray-800'>
                    {new Date(cobro.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className='px-3 py-1 rounded bg-green-50 text-green-700 font-bold text-base whitespace-nowrap ml-2 border border-green-100'>
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
