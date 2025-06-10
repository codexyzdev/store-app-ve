import React, { useState } from "react";

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
}

const tiposPago = [
  { value: "", label: "Todos" },
  { value: "efectivo", label: "Efectivo" },
  { value: "pago_movil", label: "Pago Móvil" },
  { value: "zelle", label: "Zelle" },
  { value: "transferencia", label: "Transferencia Bancaria" },
];

const HistorialPagos: React.FC<HistorialPagosProps> = ({ pagos }) => {
  const [filtroTipoPago, setFiltroTipoPago] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const pagosFiltrados = pagos.filter((p) => {
    const coincideTipo = filtroTipoPago ? p.tipoPago === filtroTipoPago : true;
    const coincideFecha = filtroFecha
      ? new Date(p.fecha).toISOString().split("T")[0] === filtroFecha
      : true;
    return coincideTipo && coincideFecha;
  });

  // Descargar como Excel (CSV simple)
  const descargarExcel = () => {
    const encabezado = [
      "Fecha",
      "Monto",
      "Tipo de pago",
      "Comprobante",
      "Tipo",
      "Imagen comprobante",
    ];
    const filas = pagosFiltrados.map((p) => [
      new Date(p.fecha).toLocaleDateString("es-ES"),
      p.monto,
      p.tipoPago || "-",
      p.comprobante || "-",
      p.tipo || "-",
      p.imagenComprobante || "-",
    ]);
    const csv = [encabezado, ...filas]
      .map((fila) => fila.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial_pagos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='mt-4'>
      <div className='font-semibold text-gray-700 mb-2 flex items-center justify-between'>
        <span>Historial de pagos</span>
        <button
          onClick={descargarExcel}
          className='text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition ml-2'
        >
          Descargar Excel
        </button>
      </div>
      <div className='flex gap-3 mb-3 flex-wrap'>
        <select
          value={filtroTipoPago}
          onChange={(e) => setFiltroTipoPago(e.target.value)}
          className='rounded border px-2 py-1 text-sm'
        >
          {tiposPago.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type='date'
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className='rounded border px-2 py-1 text-sm'
        />
      </div>
      {pagosFiltrados.length === 0 ? (
        <span className='ml-2 text-gray-500'>Sin pagos</span>
      ) : (
        <div className='w-full max-h-72 overflow-y-auto pr-1'>
          <ul className='flex flex-col gap-3 min-w-[320px]'>
            {pagosFiltrados.map((cobro) => (
              <li
                key={cobro.id}
                className='flex flex-col md:flex-row md:items-center justify-between w-full min-w-[180px] bg-white rounded-lg shadow border border-gray-100 px-4 py-3 transition-shadow hover:shadow-md hover:border-purple-200 duration-150 mb-1 gap-2'
              >
                <div className='flex items-center gap-2 min-w-[120px]'>
                  <span className='text-purple-500 text-lg align-middle'>
                    ✔️
                  </span>
                  <span className='font-semibold text-gray-800'>
                    {new Date(cobro.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    {cobro.numeroCuota && (
                      <span className='ml-2 text-xs text-indigo-600 font-semibold'>
                        (Cuota {cobro.numeroCuota})
                      </span>
                    )}
                  </span>
                </div>
                <span className='px-3 py-1 rounded bg-green-50 text-green-700 font-bold text-base whitespace-nowrap ml-2 border border-green-100'>
                  ${cobro.monto.toFixed(2)}
                </span>
                <span className='text-xs text-gray-700 bg-gray-100 rounded px-2 py-1 border border-gray-200'>
                  {cobro.tipoPago
                    ? tiposPago.find((t) => t.value === cobro.tipoPago)?.label
                    : "-"}
                </span>
                <span className='text-xs text-gray-700 bg-gray-50 rounded px-2 py-1 border border-gray-100'>
                  {cobro.comprobante || "-"}
                </span>
                <span className='text-xs text-gray-700 bg-gray-50 rounded px-2 py-1 border border-gray-100'>
                  {cobro.tipo || "-"}
                </span>
                {cobro.imagenComprobante && (
                  <a
                    href={cobro.imagenComprobante}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-blue-600 underline ml-2'
                  >
                    Ver imagen
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistorialPagos;
