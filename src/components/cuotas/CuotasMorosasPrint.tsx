import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadasRedux";
import CuotasMorosasPDF from "./CuotasMorosasPDF";

interface CuotasMorosasPrintProps {
  financiamientos: FinanciamientoConDatos[];
}

const CuotasMorosasPrint: React.FC<CuotasMorosasPrintProps> = ({
  financiamientos,
}) => {
  const morosos = financiamientos.filter((f) => f.cuotasAtrasadas >= 2);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      const doc = <CuotasMorosasPDF financiamientos={financiamientos} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clientes-morosos-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className='cuotas-morosas-print w-full'>
      {/* Botón de descarga */}
      <div className='no-print flex justify-end mb-6'>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isGeneratingPDF ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Generando...
            </>
          ) : (
            <>
              <span>📄</span>
              Descargar PDF
            </>
          )}
        </button>
      </div>

      {/* Título para impresión */}
      <h2 className='print-only text-center text-xl font-bold mb-4 hidden'>
        Clientes Morosos
      </h2>

      {/* Contenedor con scroll horizontal solo en móviles */}
      <div className='overflow-x-auto sm:overflow-x-visible'>
        <table
          className='w-full border border-gray-300 text-xs'
          style={{ borderCollapse: "collapse", minWidth: "600px" }}
        >
          <thead>
            <tr className='bg-gray-100'>
              <th className='border px-1 py-1 text-left text-xs'>#</th>
              <th className='border px-2 py-1 text-left text-xs'>Cliente</th>
              <th className='border px-2 py-1 text-left text-xs'>Teléfono</th>
              <th className='border px-2 py-1 text-right text-xs'>
                Cuotas Atrasadas
              </th>
              <th className='border px-2 py-1 text-right text-xs'>
                Monto Atrasado
              </th>
              <th className='border px-2 py-1 text-left text-xs'>Severidad</th>
              <th className='border px-2 py-1 text-left text-xs'>
                Último Pago
              </th>
            </tr>
          </thead>
          <tbody>
            {morosos.map((m, idx) => (
              <tr
                key={m.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className='border px-1 py-1 text-xs text-center'>
                  {idx + 1}
                </td>
                <td className='border px-2 py-1 text-xs'>{m.cliente.nombre}</td>
                <td className='border px-2 py-1 text-xs'>
                  {m.cliente.telefono}
                </td>
                <td className='border px-2 py-1 text-right text-xs'>
                  {m.cuotasAtrasadas}
                </td>
                <td className='border px-2 py-1 text-right text-xs'>
                  ${m.montoAtrasado.toFixed(2)}
                </td>
                <td className='border px-2 py-1 text-xs'>
                  {m.severidad.toUpperCase()}
                </td>
                <td className='border px-2 py-1 text-xs'>
                  {m.ultimaCuota
                    ? new Date(m.ultimaCuota.fecha).toLocaleDateString("es-ES")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen para previsualización HTML */}
      <div className='mt-6 p-4 bg-gray-50 rounded-lg border'>
        <h3 className='font-semibold text-gray-900 mb-3'>📊 Resumen</h3>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
          <div>
            <span className='text-gray-600'>Total clientes morosos:</span>
            <span className='ml-2 font-semibold text-red-600'>
              {morosos.length}
            </span>
          </div>
          <div>
            <span className='text-gray-600'>Monto total atrasado:</span>
            <span className='ml-2 font-semibold text-red-600'>
              ${morosos.reduce((sum, m) => sum + m.montoAtrasado, 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className='text-gray-600'>Cuotas atrasadas:</span>
            <span className='ml-2 font-semibold text-red-600'>
              {morosos.reduce((sum, m) => sum + m.cuotasAtrasadas, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className='no-print mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
        <p className='text-sm text-blue-800'>
          <span className='font-semibold'>💡 Nota:</span>
          El PDF se genera en formato A6 (105x148mm) optimizado para impresión
          compacta. La previsualización HTML muestra el contenido completo para
          revisión.
        </p>
      </div>
    </div>
  );
};

export default CuotasMorosasPrint;
