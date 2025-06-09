import React, { useState } from "react";
import {
  Coordenadas,
  generarUrlOpenStreetMap,
  formatearCoordenadas,
} from "@/utils/maps";

interface MinimapaProps {
  coordenadas: Coordenadas;
  direccionOriginal: string;
  className?: string;
}

const Minimapa: React.FC<MinimapaProps> = ({
  coordenadas,
  direccionOriginal,
  className = "",
}) => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const urlMapa = generarUrlOpenStreetMap(coordenadas);

  const handleMapaError = () => {
    setError(true);
    setCargando(false);
  };

  const handleMapaCargado = () => {
    setCargando(false);
    setError(false);
  };

  const abrirEnGoogleMaps = () => {
    window.open(direccionOriginal, "_blank");
  };

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 ${className}`}
    >
      {/* Header del mapa */}
      <div className='absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-3 py-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-blue-600'>📍</span>
            <span className='text-xs font-medium text-gray-700'>
              {formatearCoordenadas(coordenadas)}
            </span>
          </div>
          <button
            onClick={abrirEnGoogleMaps}
            className='flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors'
            title='Abrir en Google Maps'
          >
            <span>🔗</span>
            <span className='hidden sm:inline'>Abrir</span>
          </button>
        </div>
      </div>

      {/* Loader */}
      {cargando && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
          <div className='flex flex-col items-center gap-2'>
            <div className='animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent'></div>
            <span className='text-xs text-gray-500'>Cargando mapa...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
          <div className='flex flex-col items-center gap-2 p-4 text-center'>
            <span className='text-2xl text-gray-400'>📍</span>
            <span className='text-xs text-gray-500'>
              No se pudo cargar el mapa
            </span>
            <button
              onClick={abrirEnGoogleMaps}
              className='text-xs text-blue-600 hover:text-blue-700 underline'
            >
              Ver en Google Maps
            </button>
          </div>
        </div>
      )}

      {/* iframe del mapa */}
      {!error && (
        <iframe
          src={urlMapa}
          width='100%'
          height='100%'
          style={{ border: 0 }}
          allowFullScreen
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          className='absolute inset-0'
          onLoad={handleMapaCargado}
          onError={handleMapaError}
        />
      )}

      {/* Overlay para click - redirige a Google Maps */}
      <div
        className='absolute inset-0 cursor-pointer z-5 bg-transparent'
        onClick={abrirEnGoogleMaps}
        title='Hacer clic para abrir en Google Maps'
      />
    </div>
  );
};

export default Minimapa;
