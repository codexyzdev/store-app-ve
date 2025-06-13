"use client";

import { useRouter } from "next/navigation";
import { useCobrosDelDiaRedux } from "@/hooks/useCobrosDelDiaRedux";
import { useAppDispatch } from "@/store/hooks";
import { setBusqueda, setTipoVista } from "@/store/slices/cobrosDelDiaSlice";
import {
  EstadisticasCobrosDelDia,
  FiltrosCobrosDelDia,
  TarjetaCobroPendiente,
  ListaCobrosPendientes,
  CobrosRealizados,
} from "@/components/cobros-del-dia";

export default function CobrosDelDiaPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    estadisticas,
    filters,
    cobrosPendientesFiltrados,
    cobrosAgrupadosFiltrados,
    loading,
    error,
  } = useCobrosDelDiaRedux();

  // Función para llamar a un cliente
  const llamarCliente = (telefono: string) => {
    window.open(`tel:${telefono}`, "_self");
  };

  // Función para navegar a cobrar
  const registrarCobro = (financiamientoId: string) => {
    router.push(`/financiamiento/${financiamientoId}/cobrar`);
  };

  // Manejadores de eventos
  const handleBusquedaChange = (busqueda: string) => {
    dispatch(setBusqueda(busqueda));
  };

  const handleTipoVistaChange = (tipoVista: "tarjetas" | "lista") => {
    dispatch(setTipoVista(tipoVista));
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 bg-red-50 rounded-lg'>
        <h2 className='text-lg font-semibold text-red-600 mb-2'>Error</h2>
        <p className='text-red-700'>{error}</p>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          📅 Cobros del Día
        </h1>
        <p className='text-gray-600'>
          Gestiona todos los cobros programados para hoy
        </p>
      </div>

      {/* Estadísticas */}
      <div className='mb-8'>
        <EstadisticasCobrosDelDia estadisticas={estadisticas} />
      </div>

      {/* Filtros */}
      <div className='mb-8'>
        <FiltrosCobrosDelDia
          filters={filters}
          onBusquedaChange={handleBusquedaChange}
          onTipoVistaChange={handleTipoVistaChange}
        />
      </div>

      {/* Contenido principal */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Cobros Pendientes */}
        <div>
          <div className='flex items-center gap-2 mb-6'>
            <h2 className='text-xl font-semibold text-gray-800'>
              🔔 Cobros Pendientes
            </h2>
            <span className='bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full'>
              {cobrosPendientesFiltrados.length}
            </span>
          </div>

          {filters.tipoVista === "tarjetas" ? (
            <div className='grid gap-4'>
              {cobrosPendientesFiltrados.map((cobro) => (
                <TarjetaCobroPendiente
                  key={`${cobro.financiamientoId}-${cobro.cuota}`}
                  cobro={cobro}
                  onLlamar={llamarCliente}
                  onCobrar={registrarCobro}
                />
              ))}
              {cobrosPendientesFiltrados.length === 0 && (
                <div className='text-center py-12 bg-white rounded-lg shadow'>
                  <div className='text-gray-400 mb-4'>🎉</div>
                  <h3 className='text-lg font-semibold text-gray-600 mb-2'>
                    ¡Excelente trabajo!
                  </h3>
                  <p className='text-gray-500'>
                    No hay cobros pendientes para hoy
                  </p>
                </div>
              )}
            </div>
          ) : (
            <ListaCobrosPendientes
              cobros={cobrosPendientesFiltrados}
              onLlamar={llamarCliente}
              onCobrar={registrarCobro}
            />
          )}
        </div>

        {/* Cobros Realizados */}
        <div>
          <div className='flex items-center gap-2 mb-6'>
            <h2 className='text-xl font-semibold text-gray-800'>
              ✅ Cobros Realizados
            </h2>
            <span className='bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full'>
              {cobrosAgrupadosFiltrados.length}
            </span>
          </div>

          <CobrosRealizados cobrosAgrupados={cobrosAgrupadosFiltrados} />
        </div>
      </div>
    </div>
  );
}
