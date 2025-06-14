import React from "react";
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import { Producto } from "@/lib/firebase/database";
import InventarioPrint from "./InventarioPrint";
import InventarioPDFViewer from "./InventarioPDFViewer";

// Datos de ejemplo para demostrar el funcionamiento
const productosEjemplo: Producto[] = [
  {
    id: "1",
    nombre: "Laptop Dell Inspiron",
    categoria: "Electrónicos",
    precio: 850.0,
    stock: 5,
    descripcion: "Laptop para uso profesional",
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  },
  {
    id: "2",
    nombre: "Mouse Inalámbrico",
    categoria: "Accesorios",
    precio: 25.5,
    stock: 20,
    descripcion: "Mouse ergonómico inalámbrico",
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  },
  {
    id: "3",
    nombre: "Teclado Mecánico",
    categoria: "Accesorios",
    precio: 120.0,
    stock: 8,
    descripcion: "Teclado mecánico RGB",
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  },
];

const EjemploPDF: React.FC = () => {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Ejemplo de Generación de PDF - Inventario
      </h1>

      <div className='grid gap-8'>
        {/* Sección 1: Botón de descarga directa */}
        <div className='bg-white p-6 rounded-lg shadow-lg border'>
          <h2 className='text-xl font-semibold mb-4'>
            1. Descarga directa de PDF
          </h2>
          <p className='text-gray-600 mb-4'>
            Usa este botón para descargar directamente el PDF sin vista previa.
          </p>
          <PDFDownloadLink
            document={<InventarioPrint productos={productosEjemplo} />}
            fileName='inventario-ejemplo.pdf'
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2'
          >
            {({ blob, url, loading, error }) =>
              loading ? "Generando..." : "📄 Descargar PDF"
            }
          </PDFDownloadLink>
        </div>

        {/* Sección 2: Visor con descarga */}
        <div className='bg-white p-6 rounded-lg shadow-lg border'>
          <h2 className='text-xl font-semibold mb-4'>
            2. Visor de PDF con opción de descarga
          </h2>
          <p className='text-gray-600 mb-4'>
            Este componente incluye tanto la vista previa como el botón de
            descarga.
          </p>
          <div className='h-96 border border-gray-300 rounded-lg overflow-hidden'>
            <InventarioPDFViewer
              productos={productosEjemplo}
              showViewer={true}
            />
          </div>
        </div>

        {/* Sección 3: Información técnica */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>📋 Información técnica</h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <h3 className='font-semibold text-green-600 mb-2'>
                Componentes disponibles:
              </h3>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                <li>
                  <code>InventarioPrint</code> - Documento PDF
                </li>
                <li>
                  <code>InventarioPDFViewer</code> - Visor + Descarga
                </li>
                <li>
                  <code>InventarioHTML</code> - Versión HTML para impresión
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold text-blue-600 mb-2'>
                Características del PDF:
              </h3>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                <li>Formato A4 profesional</li>
                <li>Tabla con bordes y estilos</li>
                <li>Resumen estadístico</li>
                <li>Fecha de generación automática</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sección 4: Ejemplo de uso programático */}
        <div className='bg-white p-6 rounded-lg shadow-lg border'>
          <h2 className='text-xl font-semibold mb-4'>
            3. Uso programático (avanzado)
          </h2>
          <p className='text-gray-600 mb-4'>
            También puedes generar el PDF programáticamente y obtener el blob.
          </p>
          <BlobProvider
            document={<InventarioPrint productos={productosEjemplo} />}
          >
            {({ blob, url, loading, error }) => (
              <div className='space-y-2'>
                <div className='text-sm text-gray-600'>
                  Estado: {loading ? "Generando..." : "Listo"}
                </div>
                {url && (
                  <div className='flex gap-2'>
                    <a
                      href={url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm'
                    >
                      👁️ Ver en nueva pestaña
                    </a>
                    <a
                      href={url}
                      download='inventario-blob.pdf'
                      className='bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm'
                    >
                      💾 Descargar via blob
                    </a>
                  </div>
                )}
              </div>
            )}
          </BlobProvider>
        </div>
      </div>
    </div>
  );
};

export default EjemploPDF;
