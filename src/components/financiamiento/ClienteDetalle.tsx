import { useState } from "react";
import { Cliente } from "@/lib/firebase/database";
import { esEnlaceGoogleMaps, extraerCoordenadas } from "@/utils/maps";
import Minimapa from "@/components/maps/Minimapa";

interface ClienteDetalleProps {
  cliente: Cliente;
}

export default function ClienteDetalle({ cliente }: ClienteDetalleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Verificar si hay contenido adicional para mostrar
  const tieneContenidoAdicional =
    cliente.fotoCedulaUrl ||
    (cliente.direccion &&
      esEnlaceGoogleMaps(cliente.direccion) &&
      extraerCoordenadas(cliente.direccion));

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
      {/* Header del cliente - Siempre visible con botón de expansión */}
      <div
        className='bg-gradient-to-r from-slate-700 to-sky-500 px-4 sm:px-8 py-4 sm:py-6 cursor-pointer hover:from-slate-800 hover:to-sky-600 transition-all duration-300'
        onClick={toggleAccordion}
        role='button'
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${
          isExpanded ? "Ocultar" : "Mostrar"
        } detalles del cliente ${cliente.nombre}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleAccordion();
          }
        }}
      >
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4'>
          <div className='w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0'>
            {cliente.fotoCedulaUrl ? (
              <img
                src={cliente.fotoCedulaUrl}
                alt='Foto de cédula'
                className='w-full h-full object-cover'
              />
            ) : (
              <span className='text-2xl sm:text-3xl text-white font-bold'>
                {cliente.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className='text-white flex-1 text-center sm:text-left'>
            <div className='flex items-center justify-center sm:justify-between mb-2'>
              <h2 className='text-xl sm:text-2xl font-bold'>
                {cliente.nombre}
              </h2>

              {/* Indicador de expansión */}
              <div className='ml-4 sm:ml-0'>
                <div
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full bg-white/20 
                  transition-transform duration-300 hover:bg-white/30
                  ${isExpanded ? "rotate-180" : "rotate-0"}
                `}
                >
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Información básica - Siempre visible */}
            <div className='flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-sky-100'>
              <span className='flex items-center justify-center sm:justify-start gap-2'>
                <span>📞</span>
                {cliente.telefono}
              </span>
              {cliente.cedula && (
                <span className='flex items-center justify-center sm:justify-start gap-2'>
                  <span>🆔</span>
                  {cliente.cedula}
                </span>
              )}
            </div>

            {/* Dirección básica - Siempre visible */}
            {cliente.direccion && (
              <div className='mt-2'>
                <span className='flex items-center justify-center sm:justify-start gap-2 text-sm text-sky-100'>
                  <span>📍</span>
                  {esEnlaceGoogleMaps(cliente.direccion) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que se cierre/abra el acordeón
                        window.open(cliente.direccion, "_blank");
                      }}
                      className='underline hover:text-white transition-colors'
                    >
                      Ver ubicación en Google Maps
                    </button>
                  ) : (
                    <span className='line-clamp-2'>{cliente.direccion}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido expandible - Solo mostrar si hay contenido adicional */}
      {tieneContenidoAdicional && (
        <div
          className={`
            transition-all duration-500 ease-in-out overflow-hidden
            ${
              isExpanded
                ? "max-h-screen opacity-100 p-4 sm:p-8"
                : "max-h-0 opacity-0 p-0"
            }
          `}
        >
          <div
            className={`
            transition-transform duration-500 ease-in-out
            ${isExpanded ? "translate-y-0" : "-translate-y-4"}
          `}
          >
            {/* Foto de cédula y mapa */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
              {/* Foto de cédula */}
              {cliente.fotoCedulaUrl && (
                <div className='space-y-3'>
                  <h4 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                    <span>🆔</span>
                    Documento de Identidad
                  </h4>
                  <div className='bg-sky-50 rounded-xl p-4 transform transition-all duration-500 hover:scale-105'>
                    <img
                      src={cliente.fotoCedulaUrl}
                      alt='Cédula del cliente'
                      className='w-full max-w-sm mx-auto rounded-lg shadow-sm border border-gray-200'
                    />
                  </div>
                </div>
              )}

              {/* Mapa */}
              {cliente.direccion &&
                esEnlaceGoogleMaps(cliente.direccion) &&
                (() => {
                  const coordenadas = extraerCoordenadas(cliente.direccion);
                  return coordenadas ? (
                    <div className='space-y-3'>
                      <h4 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                        <span>🗺️</span>
                        Ubicación del Cliente
                      </h4>
                      <div className='bg-sky-50 rounded-xl p-4 transform transition-all duration-500 hover:scale-105'>
                        <div className='h-48 sm:h-64 rounded-lg overflow-hidden'>
                          <Minimapa
                            coordenadas={coordenadas}
                            direccionOriginal={cliente.direccion}
                            className='w-full h-full'
                          />
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
            </div>

            {/* Separador decorativo */}
            <div className='mt-6 flex items-center justify-center'>
              <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
              <span className='px-4 text-xs text-gray-400 bg-gray-50 rounded-full'>
                Información detallada
              </span>
              <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
            </div>
          </div>
        </div>
      )}

      {/* Borde inferior animado - Solo mostrar cuando está expandido */}
      {isExpanded && (
        <div className='h-1 bg-gradient-to-r from-slate-700 to-sky-500 transition-all duration-500 opacity-100'></div>
      )}
    </div>
  );
}
