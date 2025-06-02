import React from "react";

export interface ClienteCardProps {
  nombre: string;
  telefono: string;
  direccion: string;
  cedula?: string;
}

const ClienteCard: React.FC<ClienteCardProps> = ({
  nombre,
  telefono,
  direccion,
  cedula,
}) => {
  return (
    <div className='mb-8 p-6 bg-white rounded-xl shadow flex flex-col md:flex-row items-center gap-6'>
      <div className='flex-shrink-0 w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl'>
        {nombre[0]?.toUpperCase()}
      </div>
      <div className='flex-1 w-full'>
        <div className='text-2xl font-bold text-indigo-800 mb-1'>{nombre}</div>
        <div className='flex items-center text-gray-600 mt-1'>
          <span className='mr-2'>📞</span>{" "}
          <span className='font-medium'>Teléfono:</span> {telefono}
        </div>
        <div className='flex items-center text-gray-600 mt-1'>
          <span className='mr-2'>🏠</span>{" "}
          <span className='font-medium'>Dirección:</span> {direccion}
        </div>
        {cedula && (
          <div className='flex items-center text-gray-600 mt-1'>
            <span className='mr-2'>🪪</span>{" "}
            <span className='font-medium'>Cédula:</span> {cedula}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteCard;
