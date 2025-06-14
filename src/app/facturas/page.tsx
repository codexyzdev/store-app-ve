"use client";

import React, { useState, useEffect } from "react";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import {
  financiamientoDB,
  FinanciamientoCuota,
  ProductoFinanciamiento,
} from "@/lib/firebase/database";
import { formatNumeroControl } from "@/utils/format";
import Modal from "@/components/Modal";
import FacturaPrint from "@/components/facturas/FacturaPrint";

export default function FacturasPage() {
  const { clientes } = useClientesRedux();
  const { productos } = useProductosRedux();
  const [facturas, setFacturas] = useState<FinanciamientoCuota[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<FinanciamientoCuota | null>(null);
  const [mostrarImpresion, setMostrarImpresion] = useState(false);

  // Suscripción a todos los financiamientos para construir la lista de facturas
  useEffect(() => {
    const unsubscribe = financiamientoDB.suscribir((financiamientos) => {
      // 1) Ventas al contado 2) Financiamientos a cuotas que ya se completaron
      const listaFacturas = financiamientos.filter(
        (f) => f.tipoVenta === "contado" || f.estado === "completado"
      );
      setFacturas(listaFacturas);
    });
    return unsubscribe;
  }, []);

  const q = busqueda.trim().toLowerCase();
  const facturasFiltradas = !q
    ? facturas
    : facturas.filter((f: FinanciamientoCuota) => {
        const cliente = getCliente(f.clienteId);
        return (
          f.numeroControl.toString().includes(q) ||
          (cliente?.nombre.toLowerCase() || "").includes(q)
        );
      });

  const getCliente = (id: string) => clientes.find((c) => c.id === id);
  const getNombreProducto = (id: string) =>
    productos.find((p) => p.id === id)?.nombre || id;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-emerald-100 flex flex-col items-center py-12 px-4'>
      <h1 className='text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent'>
        Facturas de Contado
      </h1>

      <div className='w-full max-w-xl mb-10'>
        <div className='relative'>
          <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
            🔍
          </span>
          <input
            type='number'
            placeholder='Buscar por Nº de venta al contado…'
            value={busqueda}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBusqueda(e.target.value)
            }
            className='w-full pl-10 pr-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg'
          />
        </div>
      </div>

      {facturasFiltradas.length === 0 ? (
        <p className='text-gray-600'>No se encontraron facturas.</p>
      ) : (
        <div className='w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6'>
          {facturasFiltradas.map((f: FinanciamientoCuota) => {
            const cliente = getCliente(f.clienteId);
            return (
              <div
                key={f.id}
                className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between'
              >
                <div>
                  <h3 className='text-lg font-semibold text-emerald-700 mb-2 flex items-center gap-2'>
                    <span>💵</span>{" "}
                    {f.tipoVenta === "contado"
                      ? `Venta ${formatNumeroControl(f.numeroControl, "C")}`
                      : `Financiamiento ${formatNumeroControl(
                          f.numeroControl,
                          "F"
                        )}`}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {new Date(f.fechaInicio).toLocaleDateString("es-ES")}
                  </p>
                  {cliente && (
                    <p className='mt-2 text-gray-800 font-medium'>
                      {cliente.nombre}
                    </p>
                  )}
                  <p className='mt-1 text-gray-500'>
                    Monto: ${f.monto.toFixed(0)}
                  </p>
                  <p className='mt-1 text-gray-500 text-sm'>
                    {f.productos && f.productos.length > 0
                      ? f.productos
                          .map(
                            (p: ProductoFinanciamiento) =>
                              `${getNombreProducto(p.productoId)} x${
                                p.cantidad
                              }`
                          )
                          .join(", ")
                      : getNombreProducto(f.productoId)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setFacturaSeleccionada(f);
                    setMostrarImpresion(true);
                  }}
                  className='mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-colors flex items-center gap-2 justify-center'
                >
                  🖨️ Imprimir
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal impresión */}
      <Modal
        isOpen={mostrarImpresion && !!facturaSeleccionada}
        onClose={() => setMostrarImpresion(false)}
        title='Imprimir Factura'
      >
        {facturaSeleccionada && (
          <div className='print-container'>
            <div className='no-print mb-4 text-center'>
              <p className='text-gray-600 mb-3'>Presiona Imprimir o Ctrl+P.</p>
              <button
                onClick={() => window.print()}
                className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition mb-4 flex items-center gap-2 mx-auto'
              >
                🖨️ Imprimir
              </button>
            </div>
            <FacturaPrint
              factura={facturaSeleccionada}
              cliente={getCliente(facturaSeleccionada.clienteId)}
              productosCatalogo={productos}
            />
          </div>
        )}
      </Modal>

      {/* Estilos impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            .no-print { display: none !important; }
            .print-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .fixed.inset-0 > div:first-child { display: none !important; }
            .factura-print {
              position: static !important;
              transform: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 20px !important;
            }
          }`,
        }}
      />
    </div>
  );
}
