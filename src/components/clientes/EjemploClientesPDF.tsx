import React from "react";
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import { Cliente } from "@/lib/firebase/database";
import ClientesPrint from "./ClientesPrint";
import ClientesPDFViewer from "./ClientesPDFViewer";

// Datos de ejemplo para demostrar el funcionamiento
const clientesEjemplo: Cliente[] = [
  {
    id: "1",
    numeroControl: 1001,
    nombre: "María Elena Rodríguez",
    cedula: "0801-1985-12345",
    telefono: "9876-5432",
    direccion: "Col. Centro, Tegucigalpa",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // Hace 30 días
  },
  {
    id: "2",
    numeroControl: 1002,
    nombre: "Carlos Alberto Martínez",
    cedula: "0801-1990-67890",
    telefono: "8765-4321",
    direccion: "Col. Las Flores, San Pedro Sula",
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // Hace 15 días
  },
  {
    id: "3",
    numeroControl: 1003,
    nombre: "Ana Sofía López",
    cedula: "",
    telefono: "7654-3210",
    direccion: "Barrio El Centro, La Ceiba",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // Hace 7 días
  },
  {
    id: "4",
    numeroControl: 1004,
    nombre: "Juan Pablo Hernández",
    cedula: "0801-1988-11111",
    telefono: "",
    direccion: "Col. Nueva Esperanza, Choloma",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // Hace 2 días
  },
];

const EjemploClientesPDF: React.FC = () => {
  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Ejemplo de Generación de PDF - Lista de Clientes
      </h1>

      <div className='grid gap-8'>
        {/* Sección 1: Botón de descarga directa */}
        <div className='bg-white p-6 rounded-lg shadow-lg border'>
          <h2 className='text-xl font-semibold mb-4'>
            1. Descarga directa de PDF
          </h2>
          <p className='text-gray-600 mb-4'>
            Usa este botón para descargar directamente el PDF de clientes sin
            vista previa.
          </p>
          <PDFDownloadLink
            document={<ClientesPrint clientes={clientesEjemplo} />}
            fileName='clientes-ejemplo.pdf'
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2'
          >
            {({ blob, url, loading, error }) =>
              loading ? "Generando..." : "📄 Descargar PDF de Clientes"
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
            <ClientesPDFViewer clientes={clientesEjemplo} showViewer={true} />
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
                  <code>ClientesPrint</code> - Documento PDF
                </li>
                <li>
                  <code>ClientesPDFViewer</code> - Visor + Descarga
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold text-blue-600 mb-2'>
                Características del PDF:
              </h3>
              <ul className='list-disc list-inside space-y-1 text-gray-700'>
                <li>Formato A4 profesional</li>
                <li>Tabla con información completa</li>
                <li>Resumen estadístico de clientes</li>
                <li>Fecha de generación automática</li>
                <li>Pie de página con numeración</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sección 4: Estadísticas de ejemplo */}
        <div className='bg-sky-50 p-6 rounded-lg border border-sky-200'>
          <h2 className='text-xl font-semibold mb-4 text-sky-800'>
            📊 Datos de ejemplo
          </h2>
          <div className='grid md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-sky-600'>
                {clientesEjemplo.length}
              </div>
              <div className='text-sm text-sky-700'>Total Clientes</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {clientesEjemplo.filter((c) => c.cedula).length}
              </div>
              <div className='text-sm text-green-700'>Con Cédula</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {clientesEjemplo.filter((c) => c.telefono).length}
              </div>
              <div className='text-sm text-purple-700'>Con Teléfono</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {clientesEjemplo.filter((c) => c.direccion).length}
              </div>
              <div className='text-sm text-orange-700'>Con Dirección</div>
            </div>
          </div>
        </div>

        {/* Sección 5: Ejemplo de uso programático */}
        <div className='bg-white p-6 rounded-lg shadow-lg border'>
          <h2 className='text-xl font-semibold mb-4'>
            3. Uso programático (avanzado)
          </h2>
          <p className='text-gray-600 mb-4'>
            También puedes generar el PDF programáticamente y obtener el blob.
          </p>
          <BlobProvider document={<ClientesPrint clientes={clientesEjemplo} />}>
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
                      download='clientes-blob.pdf'
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

export default EjemploClientesPDF;
