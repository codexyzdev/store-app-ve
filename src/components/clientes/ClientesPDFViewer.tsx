import React from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Cliente } from "@/lib/firebase/database";
import ClientesPrint from "./ClientesPrint";

interface ClientesPDFViewerProps {
  clientes: Cliente[];
  showViewer?: boolean;
}

const ClientesPDFViewer: React.FC<ClientesPDFViewerProps> = ({
  clientes,
  showViewer = true,
}) => {
  const fileName = `clientes_${new Date().toISOString().split("T")[0]}.pdf`;

  return (
    <div className='w-full h-full flex flex-col gap-4'>
      {/* Botón de descarga */}
      <div className='flex justify-center'>
        <PDFDownloadLink
          document={<ClientesPrint clientes={clientes} />}
          fileName={fileName}
          className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2 transition-colors'
        >
          {({ blob, url, loading, error }: any) => (
            <>
              {loading ? (
                <>
                  <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Generando PDF...
                </>
              ) : (
                <>
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  Descargar PDF de Clientes
                </>
              )}
            </>
          )}
        </PDFDownloadLink>
      </div>

      {/* Información adicional */}
      <div className='text-center text-sm text-gray-600'>
        <p>
          Total de clientes:{" "}
          <span className='font-semibold'>{clientes.length}</span>
        </p>
        <p>Archivo: {fileName}</p>
      </div>

      {/* Visor del PDF */}
      {showViewer && (
        <div className='flex-1 min-h-96 border border-gray-300 rounded-lg overflow-hidden'>
          <PDFViewer width='100%' height='100%' showToolbar={true}>
            <ClientesPrint clientes={clientes} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default ClientesPDFViewer;
