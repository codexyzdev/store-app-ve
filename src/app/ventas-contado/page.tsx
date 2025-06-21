"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatNumeroControl } from "@/utils/format";
import {
  getClienteInfo,
  getProductoNombre,
} from "@/utils/financiamientoHelpers";
import Modal from "@/components/Modal";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import FacturaVentaContadoPDF from "@/components/pdf/FacturaVentaContadoPDF";

import { ventasContadoDB, VentaContado } from "@/lib/firebase/database";

export default function VentasContadoPage() {
  const { clientes } = useClientesRedux();
  const { productos } = useProductosRedux();

  const [ventas, setVentas] = useState<VentaContado[]>([]);
  const [error] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaContado | null>(null);
  const [mostrarPDF, setMostrarPDF] = useState(false);

  // Suscripción tiempo real a ventas al contado
  useEffect(() => {
    const unsub = ventasContadoDB.suscribir((lista) => {
      setVentas(lista);
    });
    return () => unsub();
  }, []);

  // Filtrar ventas
  const term = busqueda.toLowerCase();
  const ventasFiltradas = ventas.filter((v: VentaContado) => {
    const cliente = getClienteInfo(v.clienteId, clientes);

    // Buscar en múltiples productos
    let productosCoinciden = false;
    if (v.productos && v.productos.length > 0) {
      productosCoinciden = v.productos.some((p) => {
        const nombreProducto = getProductoNombre(p.productoId, productos);
        return nombreProducto.toLowerCase().includes(term);
      });
    } else {
      // Fallback para ventas con un solo producto
      const producto = getProductoNombre(v.productoId, productos);
      productosCoinciden = producto.toLowerCase().includes(term);
    }

    return (
      cliente?.nombre.toLowerCase().includes(term) ||
      productosCoinciden ||
      v.numeroControl.toString().includes(term)
    );
  });

  // Mapear items con información adicional
  const items = ventasFiltradas.map((f: VentaContado) => {
    const cliente = getClienteInfo(f.clienteId, clientes);

    // Manejar múltiples productos correctamente
    let productosTexto = "";
    if (f.productos && f.productos.length > 0) {
      // Si tiene array de productos (ventas múltiples)
      productosTexto = f.productos
        .map((p) => {
          const nombreProducto = getProductoNombre(p.productoId, productos);
          return `${nombreProducto} (x${p.cantidad})`;
        })
        .join(", ");
    } else {
      // Fallback para ventas antiguas con un solo producto
      productosTexto = getProductoNombre(f.productoId, productos);
    }

    return { f, cliente, productos: productosTexto };
  });

  const handleVerFactura = (venta: VentaContado) => {
    setVentaSeleccionada(venta);
    setMostrarPDF(true);
  };

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div className='flex items-center gap-4'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
              Ventas al Contado ({items.length})
            </h1>
          </div>

          <Link
            href='/ventas-contado/nuevo'
            className='inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
          >
            <span className='text-xl'>💵</span>
            <span className='hidden sm:inline'>Nueva Venta</span>
            <span className='sm:hidden'>Nueva</span>
          </Link>
        </div>

        {/* Buscador */}
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
              <span className='text-gray-400 text-lg'>🔍</span>
            </div>
            <input
              type='text'
              value={busqueda}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBusqueda(e.target.value)
              }
              placeholder='Buscar por cliente, producto o Nº de venta...'
              className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm'
            />
          </div>
        </div>

        {/* Lista */}
        {items.length === 0 ? (
          <p className='text-gray-600'>No hay ventas al contado registradas.</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {items.map(({ f, cliente, productos }) => (
              <div
                key={f.id}
                className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow duration-200'
                onClick={() => handleVerFactura(f)}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-500'>
                    N° Venta
                  </span>
                  <span className='px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold'>
                    {formatNumeroControl(f.numeroControl, "C")}
                  </span>
                </div>

                <div className='space-y-1'>
                  <p className='font-semibold text-gray-900'>
                    {cliente?.nombre}
                  </p>
                  <p className='text-sm text-gray-600'>{productos}</p>
                </div>

                <div className='flex justify-between items-center mt-auto'>
                  <span className='text-sm text-gray-500'>
                    {f.montoDescuento && f.montoDescuento > 0
                      ? "Total Pagado"
                      : "Monto"}
                  </span>
                  <span className='text-lg font-bold text-gray-900'>
                    ${f.monto.toLocaleString()}
                  </span>
                </div>

                {/* Mostrar información de descuento si existe */}
                {f.montoDescuento && f.montoDescuento > 0 && (
                  <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-gray-600'>Monto Original:</span>
                      <span className='font-semibold'>
                        ${f.montoOriginal?.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-amber-600'>
                      <span>Descuento Aplicado:</span>
                      <span className='font-semibold'>
                        -${f.montoDescuento.toLocaleString()}
                        {f.descuentoTipo === "porcentaje" &&
                          f.descuentoValor &&
                          ` (${f.descuentoValor}%)`}
                      </span>
                    </div>
                  </div>
                )}

                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>Fecha</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {new Date(f.fecha).toLocaleDateString("es-ES")}
                  </span>
                </div>

                <div className='pt-2 border-t border-gray-100'>
                  <div className='flex items-center justify-center gap-2 text-sky-600 text-sm font-medium'>
                    <span>📄</span>
                    <span>Click para ver factura</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal PDF */}
        <Modal
          isOpen={mostrarPDF && !!ventaSeleccionada}
          onClose={() => setMostrarPDF(false)}
          title={`Factura N° ${
            ventaSeleccionada
              ? formatNumeroControl(ventaSeleccionada.numeroControl, "C")
              : ""
          }`}
        >
          {ventaSeleccionada && (
            <div className='space-y-4'>
              {/* Botón de descarga */}
              <div className='flex justify-center mb-4'>
                <PDFDownloadLink
                  document={
                    <FacturaVentaContadoPDF
                      venta={ventaSeleccionada}
                      cliente={
                        clientes.find(
                          (c) => c.id === ventaSeleccionada.clienteId
                        ) || null
                      }
                      productos={productos}
                    />
                  }
                  fileName={`factura-${formatNumeroControl(
                    ventaSeleccionada.numeroControl,
                    "C"
                  )}.pdf`}
                  className='inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg'
                >
                  {({ loading }: { loading: boolean }) => (
                    <>
                      <span>💾</span>
                      {loading
                        ? "Generando..."
                        : `Descargar Factura ${formatNumeroControl(
                            ventaSeleccionada.numeroControl,
                            "C"
                          )}`}
                    </>
                  )}
                </PDFDownloadLink>
              </div>

              {/* Visor PDF */}
              <div
                className='border border-gray-300 rounded-lg overflow-hidden'
                style={{ height: "500px" }}
              >
                <PDFViewer width='100%' height='100%' showToolbar={false}>
                  <FacturaVentaContadoPDF
                    venta={ventaSeleccionada}
                    cliente={
                      clientes.find(
                        (c) => c.id === ventaSeleccionada.clienteId
                      ) || null
                    }
                    productos={productos}
                  />
                </PDFViewer>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
