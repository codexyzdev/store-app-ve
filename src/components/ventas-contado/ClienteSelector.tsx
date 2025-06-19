import { ChangeEvent } from "react";
import { Cliente } from "@/lib/firebase/database";

interface ClienteSelectorProps {
  busquedaCliente: string;
  clienteSeleccionado: Cliente | null;
  clientesFiltrados: Cliente[];
  onBusquedaChange: (value: string) => void;
  onClienteSeleccionado: (cliente: Cliente) => void;
  onNuevoClienteClick: () => void;
}

export const ClienteSelector = ({
  busquedaCliente,
  clienteSeleccionado,
  clientesFiltrados,
  onBusquedaChange,
  onClienteSeleccionado,
  onNuevoClienteClick,
}: ClienteSelectorProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 bg-sky-100 rounded-lg flex items-center justify-center'>
          <span className='text-sky-600 font-bold text-sm sm:text-base'>1</span>
        </div>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
          Seleccionar Cliente
        </h3>
      </div>

      <div className='relative'>
        <div className='flex flex-col sm:flex-row gap-3'>
          <input
            type='text'
            placeholder='Buscar cliente por nombre o teléfono...'
            value={busquedaCliente}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onBusquedaChange(e.target.value)
            }
            className='flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm sm:text-base'
            autoComplete='off'
            required
          />
          <button
            type='button'
            className='px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm text-sm sm:text-base whitespace-nowrap'
            onClick={onNuevoClienteClick}
          >
            + Cliente
          </button>
        </div>

        {/* Lista de clientes filtrados */}
        {busquedaCliente &&
          !clienteSeleccionado &&
          clientesFiltrados.length > 0 && (
            <div className='absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
              {clientesFiltrados.slice(0, 5).map((cliente) => (
                <button
                  key={cliente.id}
                  type='button'
                  className='w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl'
                  onClick={() => onClienteSeleccionado(cliente)}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold'>
                      {cliente.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        {cliente.nombre}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {cliente.telefono}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

        {/* Cliente seleccionado */}
        {clienteSeleccionado && (
          <div className='mt-3 p-4 border border-sky-200 rounded-xl bg-sky-50'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold'>
                {clienteSeleccionado.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div className='flex-1'>
                <div className='font-semibold text-sky-900'>
                  {clienteSeleccionado.nombre}
                </div>
                <div className='text-sm text-sky-700'>
                  {clienteSeleccionado.telefono}
                </div>
                {clienteSeleccionado.direccion && (
                  <div className='text-sm text-sky-600'>
                    {clienteSeleccionado.direccion}
                  </div>
                )}
              </div>
              <span className='text-sky-600 text-xl'>✅</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
