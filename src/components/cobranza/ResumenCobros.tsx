interface ResumenCobrosProps {
  totalCobros: number;
  montoTotal: number;
}

export default function ResumenCobros({
  totalCobros,
  montoTotal,
}: ResumenCobrosProps) {
  return (
    <div className='flex flex-wrap gap-4 mb-6'>
      <div className='flex-1 min-w-[220px] bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center shadow'>
        <span className='text-xs text-blue-700 font-semibold'>
          Total Cobros
        </span>
        <span className='text-2xl font-bold text-blue-700 mt-1'>
          {totalCobros}
        </span>
      </div>
      <div className='flex-1 min-w-[220px] bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center shadow'>
        <span className='text-xs text-green-700 font-semibold'>
          Monto Total
        </span>
        <span className='text-2xl font-bold text-green-700 mt-1'>
          ${montoTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
