import React from "react";
import { esEnlaceGoogleMaps, extraerCoordenadas } from "@/utils/maps";
import Minimapa from "@/components/maps/Minimapa";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export interface ClienteCardProps {
  nombre: string;
  telefono: string;
  direccion: string;
  cedula?: string;
  fotoCedulaUrl?: string;
}

function ClienteCard({
  nombre,
  telefono,
  direccion,
  cedula,
  fotoCedulaUrl,
}: ClienteCardProps) {
  const esEnlaceMaps = esEnlaceGoogleMaps(direccion);
  const coordenadas = esEnlaceMaps ? extraerCoordenadas(direccion) : null;

  const abrirEnGoogleMaps = () => {
    if (esEnlaceMaps) {
      window.open(direccion, "_blank");
    }
  };

  // Función para acortar texto largo
  const acortarTexto = (texto: string, maxLength: number = 50) => {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + "...";
  };

  return (
    <div className='mb-4 p-6 bg-white shadow-lg rounded-lg border border-gray-200'>
      <div className='flex flex-col lg:flex-row items-center lg:items-start gap-6'>
        {/* Sección izquierda - Información del cliente */}
        <div className='flex flex-col md:flex-row items-center gap-4 flex-1 w-full lg:w-auto min-w-0'>
          {fotoCedulaUrl ? (
            <img
              src={fotoCedulaUrl}
              alt='Foto de cédula'
              className='w-24 h-24 md:w-28 md:h-28 rounded-full object-cover flex-shrink-0 bg-gray-200'
            />
          ) : (
            <div className='w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-4xl font-bold flex-shrink-0'>
              {nombre[0]?.toUpperCase()}
            </div>
          )}

          <div className='flex flex-col space-y-3 flex-1 w-full min-w-0'>
            <h2 className='text-2xl font-bold text-slate-800 capitalize text-center md:text-left truncate'>
              {nombre}
            </h2>

            <div className='flex items-center text-gray-600 justify-center md:justify-start gap-2'>
              <span className='flex-shrink-0 text-lg'>📞</span>
              <span className='font-medium flex-shrink-0'>Teléfono:</span>
              <span className='truncate'>{telefono}</span>
            </div>

            <div className='flex items-start text-gray-600 justify-center md:justify-start gap-2 min-w-0'>
              <span className='flex-shrink-0 text-lg pt-1'>🏠</span>
              <span className='font-medium flex-shrink-0 pt-1'>Dirección:</span>
              <div className='min-w-0 flex-1'>
                {esEnlaceMaps ? (
                  <button
                    onClick={abrirEnGoogleMaps}
                    className='flex items-center gap-1 text-blue-600 hover:text-blue-700 underline transition-colors max-w-full text-left'
                    title={direccion}
                  >
                    <span className='truncate'>
                      Ver ubicación en Google Maps
                    </span>
                    <ArrowTopRightOnSquareIcon className='w-4 h-4 flex-shrink-0' />
                  </button>
                ) : (
                  <p className='break-words line-clamp-2' title={direccion}>
                    {direccion}
                  </p>
                )}
              </div>
            </div>

            {cedula && (
              <div className='flex items-center text-gray-600 justify-center md:justify-start gap-2'>
                <span className='flex-shrink-0 text-lg'>🪪</span>
                <span className='font-medium flex-shrink-0'>Cédula:</span>
                <span className='truncate'>{cedula}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sección derecha - Minimapa (solo en desktop y si hay coordenadas) */}
        {coordenadas && (
          <div className='hidden lg:block w-[350px] h-[250px] flex-shrink-0 rounded-md overflow-hidden'>
            <Minimapa
              coordenadas={coordenadas}
              direccionOriginal={direccion}
              className='w-full h-full'
            />
          </div>
        )}
      </div>

      {/* Minimapa para móvil (solo si hay coordenadas y está en móvil) */}
      {coordenadas && (
        <div className='block lg:hidden mt-4 w-full h-52 rounded-md overflow-hidden'>
          <Minimapa
            coordenadas={coordenadas}
            direccionOriginal={direccion}
            className='w-full h-full'
          />
        </div>
      )}
    </div>
  );
}

export default ClienteCard;
