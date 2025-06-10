"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";

interface HistorialPagosProps {
  pagos: {
    id: string;
    fecha: number;
    monto: number;
    tipoPago?: string;
    comprobante?: string;
    imagenComprobante?: string;
    tipo?: string;
    numeroCuota?: number;
  }[];
  valorCuota?: number;
  titulo?: string;
}

interface ComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagenUrl: string;
  comprobante: string;
  pago: any | null;
}

const ComprobanteModal: React.FC<ComprobanteModalProps> = ({
  isOpen,
  onClose,
  imagenUrl,
  comprobante,
  pago,
}) => {
  // Verificar que pago existe antes de renderizar
  if (!pago) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title=''>
      <div className='max-w-4xl mx-auto'>
        {/* Header del modal */}
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl text-white'>📄</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Comprobante de Pago
          </h2>
          <p className='text-gray-600'>
            {comprobante && `Referencia: ${comprobante}`}
          </p>
        </div>

        {/* Información del pago */}
        <div className='bg-gray-50 rounded-xl p-4 mb-6'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm'>
            <div className='text-center'>
              <p className='text-gray-600 font-medium'>Fecha</p>
              <p className='font-bold text-gray-900'>
                {pago.fecha
                  ? new Date(pago.fecha).toLocaleDateString("es-ES")
                  : "-"}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-gray-600 font-medium'>Monto</p>
              <p className='font-bold text-green-600'>
                ${(pago.monto || 0).toFixed(0)}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-gray-600 font-medium'>Método</p>
              <p className='font-bold text-gray-900'>
                {getTipoPagoLabel(pago.tipoPago)}
              </p>
            </div>
            {pago.numeroCuota && (
              <div className='text-center'>
                <p className='text-gray-600 font-medium'>Cuota</p>
                <p className='font-bold text-indigo-600'>#{pago.numeroCuota}</p>
              </div>
            )}
          </div>
        </div>

        {/* Imagen del comprobante */}
        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
          <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
              <span>🖼️</span>
              Imagen del Comprobante
            </h3>
          </div>
          <div className='p-4'>
            <div className='relative'>
              <img
                src={imagenUrl}
                alt='Comprobante de pago'
                className='w-full h-auto rounded-lg shadow-lg max-h-96 object-contain mx-auto'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.png";
                }}
              />

              {/* Botón para ver en tamaño completo */}
              <button
                onClick={() => window.open(imagenUrl, "_blank")}
                className='absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors'
                title='Ver en tamaño completo'
              >
                <span className='text-lg'>🔍</span>
              </button>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className='flex gap-3 mt-6'>
          <button
            onClick={() => window.open(imagenUrl, "_blank")}
            className='flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
          >
            <span>🔗</span>
            Abrir Original
          </button>
          <button
            onClick={onClose}
            className='flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-400 transition-colors'
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

const tiposPago = [
  { value: "", label: "📊 Todos los métodos", icon: "📊" },
  { value: "efectivo", label: "💵 Efectivo", icon: "💵" },
  { value: "transferencia", label: "🏦 Transferencia", icon: "🏦" },
  { value: "pago_movil", label: "📱 Pago Móvil", icon: "📱" },
  { value: "deposito", label: "🏧 Depósito", icon: "🏧" },
  { value: "zelle", label: "💳 Zelle", icon: "💳" },
  { value: "otro", label: "💳 Otro", icon: "💳" },
];

const getTipoPagoLabel = (tipoPago?: string) => {
  const tipo = tiposPago.find((t) => t.value === tipoPago);
  return tipo ? tipo.label : "💳 No especificado";
};

const getTipoPagoIcon = (tipoPago?: string) => {
  const tipo = tiposPago.find((t) => t.value === tipoPago);
  return tipo ? tipo.icon : "💳";
};

const HistorialPagos: React.FC<HistorialPagosProps> = ({
  pagos,
  valorCuota = 0,
  titulo = "Historial de Pagos",
}) => {
  const [filtroTipoPago, setFiltroTipoPago] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [vistaDetallada, setVistaDetallada] = useState(true);
  const [comprobanteModal, setComprobanteModal] = useState<{
    isOpen: boolean;
    imagenUrl: string;
    comprobante: string;
    pago: any;
  }>({
    isOpen: false,
    imagenUrl: "",
    comprobante: "",
    pago: null,
  });

  // Filtrar y ordenar pagos (más recientes primero)
  const pagosFiltrados = pagos
    .filter((p) => {
      const coincideTipo = filtroTipoPago
        ? p.tipoPago === filtroTipoPago
        : true;
      const coincideFecha = filtroFecha
        ? new Date(p.fecha).toISOString().split("T")[0] === filtroFecha
        : true;
      return coincideTipo && coincideFecha;
    })
    .sort((a, b) => b.fecha - a.fecha); // Más recientes primero

  const totalPagado = pagosFiltrados.reduce((sum, p) => sum + p.monto, 0);
  const totalCuotas = pagosFiltrados.length;

  // Función para descargar CSV
  const descargarCSV = () => {
    const encabezados = [
      "Fecha",
      "Cuota",
      "Monto",
      "Método de Pago",
      "Comprobante",
      "Tipo",
    ];

    const filas = pagosFiltrados.map((p) => [
      new Date(p.fecha).toLocaleDateString("es-ES"),
      p.numeroCuota || "-",
      p.monto.toFixed(0),
      getTipoPagoLabel(p.tipoPago)
        .replace(/[📊💵🏦📱🏧💳]/g, "")
        .trim(),
      p.comprobante || "-",
      p.tipo || "cuota",
    ]);

    const csvContent = [encabezados, ...filas]
      .map((fila) => fila.map((celda) => `"${celda}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `historial_pagos_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const abrirComprobanteModal = (pago: any) => {
    if (pago.imagenComprobante) {
      setComprobanteModal({
        isOpen: true,
        imagenUrl: pago.imagenComprobante,
        comprobante: pago.comprobante || "",
        pago: pago,
      });
    }
  };

  const formatearFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatearFechaCompleta = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (pagos.length === 0) {
    return (
      <div className='bg-white rounded-2xl border border-gray-200 p-8 text-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <span className='text-2xl text-gray-400'>📭</span>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Sin Historial de Pagos
        </h3>
        <p className='text-gray-600'>
          No se han registrado pagos para este financiamiento.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center'>
              <span className='text-white text-lg'>📋</span>
            </div>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>{titulo}</h3>
              <p className='text-sm text-gray-600'>
                {totalCuotas} pago{totalCuotas !== 1 ? "s" : ""} • $
                {totalPagado.toFixed(0)} total
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {/* Toggle vista */}
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => setVistaDetallada(true)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  vistaDetallada
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 Detalle
              </button>
              <button
                onClick={() => setVistaDetallada(false)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  !vistaDetallada
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📊 Compacto
              </button>
            </div>

            {/* Descargar CSV */}
            <button
              onClick={descargarCSV}
              className='px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center gap-1'
              title='Descargar historial'
            >
              <span>📥</span>
              <span className='hidden sm:inline'>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className='p-4 sm:p-6 border-b border-gray-200 bg-gray-50'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Método de Pago
            </label>
            <select
              value={filtroTipoPago}
              onChange={(e) => setFiltroTipoPago(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            >
              {tiposPago.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Fecha Específica
            </label>
            <input
              type='date'
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
            />
          </div>

          <div className='flex items-end'>
            <button
              onClick={() => {
                setFiltroTipoPago("");
                setFiltroFecha("");
              }}
              className='w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium'
            >
              🔄 Limpiar Filtros
            </button>
          </div>
        </div>

        {(filtroTipoPago || filtroFecha) && (
          <div className='mt-3 text-sm text-gray-600'>
            Mostrando {pagosFiltrados.length} de {pagos.length} pagos
          </div>
        )}
      </div>

      {/* Lista de pagos */}
      <div className='p-4 sm:p-6'>
        {pagosFiltrados.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-xl text-gray-400'>🔍</span>
            </div>
            <h4 className='text-lg font-semibold text-gray-900 mb-2'>
              No se encontraron pagos
            </h4>
            <p className='text-gray-600'>
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        ) : vistaDetallada ? (
          /* Vista detallada */
          <div className='space-y-4'>
            {pagosFiltrados.map((pago, index) => (
              <div
                key={pago.id}
                className='bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-200'
              >
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  {/* Información principal */}
                  <div className='lg:col-span-2'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                          <span className='text-white text-lg'>✅</span>
                        </div>
                        <div>
                          <h4 className='text-lg font-bold text-gray-900'>
                            {pago.numeroCuota
                              ? `${
                                  pago.tipo === "inicial" ? "Inicial" : "Cuota"
                                } #${pago.numeroCuota}`
                              : "Pago"}
                          </h4>
                          <p className='text-sm text-gray-600'>
                            {formatearFechaCompleta(pago.fecha)}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-2xl font-bold text-green-600'>
                          ${pago.monto.toFixed(0)}
                        </p>
                        {valorCuota > 0 && (
                          <p className='text-sm text-gray-600'>
                            {(pago.monto / valorCuota).toFixed(1)} cuota
                            {pago.monto / valorCuota > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                      <div className='bg-blue-50 rounded-lg p-3'>
                        <p className='text-blue-600 font-medium mb-1'>
                          Método de Pago
                        </p>
                        <p className='font-semibold text-gray-900 flex items-center gap-2'>
                          <span>{getTipoPagoIcon(pago.tipoPago)}</span>
                          {getTipoPagoLabel(pago.tipoPago)
                            .replace(/[📊💵🏦📱🏧💳]/g, "")
                            .trim()}
                        </p>
                      </div>

                      {pago.comprobante && (
                        <div className='bg-amber-50 rounded-lg p-3'>
                          <p className='text-amber-600 font-medium mb-1'>
                            Comprobante
                          </p>
                          <p className='font-semibold text-gray-900 font-mono'>
                            {pago.comprobante}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comprobante de pago */}
                  {pago.imagenComprobante && (
                    <div className='lg:col-span-1'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <p className='text-gray-600 font-medium mb-3 text-sm'>
                          Comprobante
                        </p>
                        <div className='relative group'>
                          <img
                            src={pago.imagenComprobante}
                            alt='Comprobante'
                            className='w-full h-32 object-cover rounded-lg shadow-sm cursor-pointer group-hover:shadow-md transition-shadow'
                            onClick={() => abrirComprobanteModal(pago)}
                          />
                          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center'>
                            <button
                              onClick={() => abrirComprobanteModal(pago)}
                              className='opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-lg font-medium text-sm transition-all shadow-lg'
                            >
                              🔍 Ver Completo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vista compacta */
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-2 font-semibold text-gray-900'>
                    Cuota
                  </th>
                  <th className='text-left py-3 px-2 font-semibold text-gray-900'>
                    Fecha
                  </th>
                  <th className='text-left py-3 px-2 font-semibold text-gray-900'>
                    Monto
                  </th>
                  <th className='text-left py-3 px-2 font-semibold text-gray-900'>
                    Método
                  </th>
                  <th className='text-left py-3 px-2 font-semibold text-gray-900'>
                    Comprobante
                  </th>
                  <th className='text-center py-3 px-2 font-semibold text-gray-900'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((pago) => (
                  <tr
                    key={pago.id}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='py-3 px-2'>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          pago.tipo === "inicial"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {pago.tipo === "inicial" ? "🎯" : "✅"}
                        {pago.numeroCuota
                          ? `${
                              pago.tipo === "inicial" ? "Inicial" : "Cuota"
                            } #${pago.numeroCuota}`
                          : "Pago"}
                      </span>
                    </td>
                    <td className='py-3 px-2 text-gray-900 font-medium'>
                      {formatearFecha(pago.fecha)}
                    </td>
                    <td className='py-3 px-2'>
                      <span className='font-bold text-green-600'>
                        ${pago.monto.toFixed(0)}
                      </span>
                    </td>
                    <td className='py-3 px-2'>
                      <span className='inline-flex items-center gap-1 text-xs'>
                        {getTipoPagoIcon(pago.tipoPago)}
                        {getTipoPagoLabel(pago.tipoPago)
                          .replace(/[📊💵🏦📱🏧💳]/g, "")
                          .trim()}
                      </span>
                    </td>
                    <td className='py-3 px-2'>
                      {pago.comprobante ? (
                        <span className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>
                          {pago.comprobante}
                        </span>
                      ) : (
                        <span className='text-gray-400 text-xs'>-</span>
                      )}
                    </td>
                    <td className='py-3 px-2 text-center'>
                      {pago.imagenComprobante ? (
                        <button
                          onClick={() => abrirComprobanteModal(pago)}
                          className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium'
                        >
                          🔍 Ver
                        </button>
                      ) : (
                        <span className='text-gray-400 text-xs'>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de comprobante */}
      <ComprobanteModal
        isOpen={comprobanteModal.isOpen}
        onClose={() =>
          setComprobanteModal((prev) => ({ ...prev, isOpen: false }))
        }
        imagenUrl={comprobanteModal.imagenUrl}
        comprobante={comprobanteModal.comprobante}
        pago={comprobanteModal.pago}
      />
    </div>
  );
};

export default HistorialPagos;
