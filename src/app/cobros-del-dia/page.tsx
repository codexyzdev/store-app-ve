"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCobrosDelDiaRedux } from "@/hooks/useCobrosDelDiaRedux";
import { useAppDispatch } from "@/store/hooks";
import { setBusqueda, setTipoVista } from "@/store/slices/cobrosDelDiaSlice";
import type { CobroPendienteDetallado } from "@/store/slices/cobrosDelDiaSlice";
import {
  formatearTelefono,
  generarMensajeWhatsAppCobranza,
  generarMensajeWhatsAppCuotaIndividual,
} from "@/utils/whatsappUtils";
import {
  EstadisticasCobrosDelDia,
  FiltrosCobrosDelDia,
  TarjetaCobroPendiente,
  ListaCobrosPendientes,
  CobrosRealizados,
} from "@/components/cobros-del-dia";

// Tipos para la agrupación de clientes
interface ClienteAgrupado {
  clienteId: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  cobros: CobroPendienteDetallado[];
  totalPendiente: number;
  cuotasTotal: number;
  productos: Set<string>;
}

interface ClienteCobrosPendientesProps {
  cliente: ClienteAgrupado;
  onWhatsApp: (telefono: string, cliente: ClienteAgrupado) => void;
  onCobrar: (financiamientoId: string) => void;
}

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

  // Función para enviar WhatsApp a un cliente
  const enviarWhatsApp = (telefono: string, cliente: ClienteAgrupado) => {
    // Validar formato de teléfono antes de enviar
    if (!telefono || telefono.trim() === "") {
      console.warn("Número de teléfono vacío");
      return;
    }

    // Formatear teléfono y generar mensaje
    const telefonoFormateado = formatearTelefono(telefono);
    const mensaje = generarMensajeWhatsAppCobranza(cliente);

    // Abrir WhatsApp
    window.open(
      `https://wa.me/${telefonoFormateado}?text=${mensaje}`,
      "_blank"
    );
  };

  // Función para WhatsApp de cuota individual
  const enviarWhatsAppCuota = (cobro: CobroPendienteDetallado) => {
    // Validar formato de teléfono antes de enviar
    if (!cobro.telefono || cobro.telefono.trim() === "") {
      console.warn("Número de teléfono vacío");
      return;
    }

    // Formatear teléfono y generar mensaje
    const telefonoFormateado = formatearTelefono(cobro.telefono);
    const mensaje = generarMensajeWhatsAppCuotaIndividual(cobro);

    // Abrir WhatsApp
    window.open(
      `https://wa.me/${telefonoFormateado}?text=${mensaje}`,
      "_blank"
    );
  };

  // Función para navegar a cobrar
  const registrarCobro = (financiamientoId: string) => {
    // Validar ID antes de navegar
    if (!financiamientoId || financiamientoId.trim() === "") {
      console.error("ID de financiamiento inválido");
      return;
    }

    // Navegar a la ruta correcta del financiamiento
    router.push(`/financiamiento-cuota/${financiamientoId}`);
  };

  // Manejadores de eventos
  const handleBusquedaChange = (busqueda: string) => {
    dispatch(setBusqueda(busqueda));
  };

  const handleTipoVistaChange = (tipoVista: "tarjetas" | "lista") => {
    dispatch(setTipoVista(tipoVista));
  };

  // Agrupar cobros por cliente para mejor UI - CORREGIDO
  const agruparCobrosPorCliente = (): ClienteAgrupado[] => {
    const clientesMap = new Map<string, ClienteAgrupado>();

    cobrosPendientesFiltrados.forEach((cobro: CobroPendienteDetallado) => {
      const clienteId = cobro.clienteId;

      if (!clientesMap.has(clienteId)) {
        clientesMap.set(clienteId, {
          clienteId,
          nombre: cobro.nombre,
          cedula: cobro.cedula,
          telefono: cobro.telefono,
          direccion: cobro.direccion,
          cobros: [],
          totalPendiente: 0,
          cuotasTotal: 0,
          productos: new Set(),
        });
      }

      const cliente = clientesMap.get(clienteId)!;

      // Evitar duplicar cobros del mismo financiamiento y cuota
      const yaExiste = cliente.cobros.some(
        (c) =>
          c.financiamientoId === cobro.financiamientoId &&
          c.cuota === cobro.cuota
      );

      if (!yaExiste) {
        cliente.cobros.push(cobro);
        cliente.totalPendiente += cobro.monto;
        cliente.cuotasTotal += 1;
        cliente.productos.add(cobro.producto);
      }
    });

    return Array.from(clientesMap.values()).sort(
      (a, b) => b.totalPendiente - a.totalPendiente
    );
  };

  const clientesAgrupados = agruparCobrosPorCliente();

  // Estados de carga y error con mejor UX
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <div className='animate-spin rounded-full h-32 w-32 border-4 border-blue-500 border-t-transparent mb-4'></div>
        <p className='text-gray-600 text-lg'>Cargando cobros del día...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
            <div className='flex items-center mb-4'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h2 className='text-lg font-semibold text-red-600'>
                  Error al cargar datos
                </h2>
                <p className='text-red-700 mt-1'>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors'
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
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
          {/* Cobros Pendientes - Agrupados por Cliente */}
          <div>
            <div className='flex items-center gap-2 mb-6'>
              <h2 className='text-xl font-semibold text-gray-800'>
                🔔 Cobros Pendientes
              </h2>
              <span className='bg-amber-100 text-amber-700 text-sm font-medium px-2.5 py-0.5 rounded-full'>
                {clientesAgrupados.length} clientes
              </span>
              <span className='bg-gray-100 text-gray-600 text-sm font-medium px-2.5 py-0.5 rounded-full'>
                {cobrosPendientesFiltrados.length} cuotas
              </span>
            </div>

            {filters.tipoVista === "tarjetas" ? (
              <div className='space-y-4'>
                {clientesAgrupados.map((cliente: ClienteAgrupado) => (
                  <ClienteCobrosPendientes
                    key={cliente.clienteId}
                    cliente={cliente}
                    onWhatsApp={enviarWhatsApp}
                    onCobrar={registrarCobro}
                  />
                ))}
                {clientesAgrupados.length === 0 && (
                  <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200'>
                    <div className='text-gray-400 mb-4 text-6xl'>🎉</div>
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
                onLlamar={(telefono) => {
                  const cobro = cobrosPendientesFiltrados.find(
                    (c) => c.telefono === telefono
                  );
                  if (cobro) enviarWhatsAppCuota(cobro);
                }}
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
              <span className='bg-emerald-100 text-emerald-700 text-sm font-medium px-2.5 py-0.5 rounded-full'>
                {cobrosAgrupadosFiltrados.length}
              </span>
            </div>

            <CobrosRealizados cobrosAgrupados={cobrosAgrupadosFiltrados} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar cobros agrupados por cliente - SIN DEGRADADO
function ClienteCobrosPendientes({
  cliente,
  onWhatsApp,
  onCobrar,
}: ClienteCobrosPendientesProps) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200'>
      {/* Header del cliente - SIN DEGRADADO */}
      <div className='bg-blue-600 p-5 text-white'>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <h3 className='font-bold text-lg'>{cliente.nombre}</h3>
            <p className='text-blue-100 text-sm'>C.I: {cliente.cedula}</p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-blue-100 text-sm bg-blue-500 px-2 py-1 rounded-full'>
                {cliente.cuotasTotal} cuota
                {cliente.cuotasTotal !== 1 ? "s" : ""} pendiente
                {cliente.cuotasTotal !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className='text-right'>
            <span className='text-2xl font-bold'>
              ${cliente.totalPendiente.toFixed(2)}
            </span>
            <p className='text-blue-100 text-sm'>Total Pendiente</p>
          </div>
        </div>

        {/* Productos */}
        <div className='mt-4 pt-4 border-t border-blue-500'>
          <p className='text-blue-100 text-sm mb-2'>📋 Productos:</p>
          <div className='flex flex-wrap gap-2'>
            {Array.from(cliente.productos)
              .slice(0, 3)
              .map((producto, idx) => (
                <span
                  key={idx}
                  className='bg-blue-500 text-white text-xs px-3 py-1 rounded-full'
                >
                  {producto}
                </span>
              ))}
            {cliente.productos.size > 3 && (
              <span className='bg-blue-500 text-white text-xs px-3 py-1 rounded-full'>
                +{cliente.productos.size - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Botones principales */}
        <div className='flex gap-3 mt-5'>
          {cliente.telefono && (
            <button
              onClick={() => onWhatsApp(cliente.telefono, cliente)}
              className='flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.549 4.090 1.595 5.878L0 24l6.335-1.652c1.746.943 3.71 1.444 5.682 1.444 6.621 0 11.988-5.367 11.988-11.988C23.971 5.367 18.639.001 12.017.001zM12.017 2.22c5.396 0 9.767 4.372 9.767 9.768a9.745 9.745 0 01-2.859 6.909 9.745 9.745 0 01-6.908 2.859c-1.858 0-3.649-.525-5.145-1.516l-.37-.217-3.82.996.996-3.82-.217-.37c-.991-1.496-1.516-3.287-1.516-5.145 0-5.396 4.372-9.768 9.768-9.768zm5.47 12.758c-.068-.205-.249-.327-.519-.57-.271-.244-1.604-.791-1.852-.882-.249-.09-.429-.135-.61.135-.18.271-.701.882-.859 1.063-.158.18-.316.203-.587-.041-.271-.244-1.146-.422-2.182-1.346-.807-.719-1.352-1.606-1.511-1.877-.158-.271-.017-.417.119-.552.122-.122.271-.318.407-.477.135-.158.18-.271.271-.452.09-.18.045-.338-.023-.477-.068-.135-.61-1.470-.837-2.013-.221-.528-.446-.457-.61-.466-.158-.008-.338-.01-.519-.01a.994.994 0 00-.721.338c-.249.271-.948.928-.948 2.262 0 1.334.971 2.622 1.106 2.803.135.18 1.896 2.896 4.591 4.061.642.277 1.143.442 1.534.566.644.204 1.231.175 1.695.106.517-.077 1.604-.656 1.831-1.289.226-.633.226-1.175.158-1.289z' />
              </svg>
              WhatsApp
            </button>
          )}
          <button
            onClick={() => setExpandido(!expandido)}
            className='bg-blue-500 hover:bg-blue-400 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
                expandido ? "rotate-180" : ""
              }`}
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
            {expandido ? "Contraer" : "Ver Cuotas"}
          </button>
        </div>
      </div>

      {/* Información del cliente */}
      <div className='p-5 border-b border-gray-100 bg-gray-50'>
        <div className='space-y-3'>
          <div className='flex items-start gap-3 text-gray-600'>
            <svg
              className='w-5 h-5 text-gray-400 mt-0.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
            <span className='text-sm'>{cliente.direccion}</span>
          </div>
          {cliente.telefono && (
            <div className='flex items-center gap-3 text-gray-600'>
              <svg
                className='w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
              <span className='text-sm font-medium'>{cliente.telefono}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de cobros expandible */}
      {expandido && (
        <div className='border-t border-gray-200'>
          <div className='max-h-96 overflow-y-auto'>
            {cliente.cobros.map((cobro, index) => (
              <div
                key={`${cobro.financiamientoId}-${cobro.cuota}`}
                className={`p-4 ${
                  index < cliente.cobros.length - 1
                    ? "border-b border-gray-100"
                    : ""
                } hover:bg-gray-50 transition-colors`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium'>
                        Cuota #{cobro.cuota}
                      </span>
                      <span className='text-sm text-gray-600'>
                        {cobro.historialPagos}/{cobro.totalCuotas} pagadas
                      </span>
                    </div>
                    <p className='text-sm font-medium text-gray-700 mb-1'>
                      {cobro.producto}
                    </p>
                    {cobro.notas && (
                      <p className='text-xs text-gray-500 italic'>
                        {cobro.notas}
                      </p>
                    )}
                  </div>
                  <div className='text-right flex flex-col items-end gap-2'>
                    <span className='text-lg font-bold text-gray-900'>
                      ${cobro.monto.toFixed(2)}
                    </span>
                    <div className='flex gap-2'>
                      {cobro.telefono && (
                        <button
                          onClick={() => {
                            const telefonoFormateado = formatearTelefono(
                              cobro.telefono
                            );
                            const mensaje =
                              generarMensajeWhatsAppCuotaIndividual(cobro);
                            window.open(
                              `https://wa.me/${telefonoFormateado}?text=${mensaje}`,
                              "_blank"
                            );
                          }}
                          className='bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1'
                        >
                          <svg
                            className='w-3 h-3'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.549 4.090 1.595 5.878L0 24l6.335-1.652c1.746.943 3.71 1.444 5.682 1.444 6.621 0 11.988-5.367 11.988-11.988C23.971 5.367 18.639.001 12.017.001zM12.017 2.22c5.396 0 9.767 4.372 9.767 9.768a9.745 9.745 0 01-2.859 6.909 9.745 9.745 0 01-6.908 2.859c-1.858 0-3.649-.525-5.145-1.516l-.37-.217-3.82.996.996-3.82-.217-.37c-.991-1.496-1.516-3.287-1.516-5.145 0-5.396 4.372-9.768 9.768-9.768zm5.47 12.758c-.068-.205-.249-.327-.519-.57-.271-.244-1.604-.791-1.852-.882-.249-.09-.429-.135-.61.135-.18.271-.701.882-.859 1.063-.158.18-.316.203-.587-.041-.271-.244-1.146-.422-2.182-1.346-.807-.719-1.352-1.606-1.511-1.877-.158-.271-.017-.417.119-.552.122-.122.271-.318.407-.477.135-.158.18-.271.271-.452.09-.18.045-.338-.023-.477-.068-.135-.61-1.470-.837-2.013-.221-.528-.446-.457-.61-.466-.158-.008-.338-.01-.519-.01a.994.994 0 00-.721.338c-.249.271-.948.928-.948 2.262 0 1.334.971 2.622 1.106 2.803.135.18 1.896 2.896 4.591 4.061.642.277 1.143.442 1.534.566.644.204 1.231.175 1.695.106.517-.077 1.604-.656 1.831-1.289.226-.633.226-1.175.158-1.289z' />
                          </svg>
                          WA
                        </button>
                      )}
                      <button
                        onClick={() => onCobrar(cobro.financiamientoId)}
                        className='bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors'
                      >
                        Cobrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
