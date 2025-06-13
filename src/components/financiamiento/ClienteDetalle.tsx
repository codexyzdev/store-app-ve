import { Cliente } from "@/lib/firebase/database";
import { esEnlaceGoogleMaps, extraerCoordenadas } from "@/utils/maps";
import Minimapa from "@/components/maps/Minimapa";

interface ClienteDetalleProps {
  cliente: Cliente;
}

export default function ClienteDetalle({ cliente }: ClienteDetalleProps) {
  return (
    <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
      {/* Header del cliente */}
      <div className='bg-gradient-to-r from-slate-700 to-sky-500 px-4 sm:px-8 py-4 sm:py-6'>
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
            <h2 className='text-xl sm:text-2xl font-bold mb-2'>
              {cliente.nombre}
            </h2>
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
            {cliente.direccion && (
              <div className='mt-2'>
                <span className='flex items-center justify-center sm:justify-start gap-2 text-sm text-sky-100'>
                  <span>📍</span>
                  {esEnlaceGoogleMaps(cliente.direccion) ? (
                    <button
                      onClick={() => window.open(cliente.direccion, "_blank")}
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

      {/* Información adicional - Solo mostrar si hay contenido */}
      {(cliente.fotoCedulaUrl ||
        (cliente.direccion &&
          esEnlaceGoogleMaps(cliente.direccion) &&
          extraerCoordenadas(cliente.direccion))) && (
        <div className='p-4 sm:p-8'>
          {/* Foto de cédula y mapa */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
            {/* Foto de cédula */}
            {cliente.fotoCedulaUrl && (
              <div className='space-y-3'>
                <h4 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                  <span>🆔</span>
                  Documento de Identidad
                </h4>
                <div className='bg-sky-50 rounded-xl p-4'>
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
                    <div className='bg-sky-50 rounded-xl p-4'>
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
        </div>
      )}
    </div>
  );
}
