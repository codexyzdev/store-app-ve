interface ResumenClienteProps {
  nombre: string;
  cedula: string;
}

export default function ResumenCliente({
  nombre,
  cedula,
}: ResumenClienteProps) {
  return (
    <div className='flex items-center gap-3'>
      <div className='w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base'>
        {nombre[0]?.toUpperCase()}
      </div>
      <div>
        <div className='text-indigo-700 font-semibold'>{nombre}</div>
        <div className='text-xs text-gray-500'>C.I.: {cedula}</div>
      </div>
    </div>
  );
}
