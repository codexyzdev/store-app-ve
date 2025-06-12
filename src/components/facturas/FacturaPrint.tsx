import React from "react";
import {
  FinanciamientoCuota,
  Cliente,
  ProductoFinanciamiento,
  Producto,
} from "@/lib/firebase/database";
import { formatNumeroControl } from "@/utils/format";

interface FacturaPrintProps {
  factura: FinanciamientoCuota;
  cliente: Cliente | undefined;
  productosCatalogo: Producto[];
}

const FacturaPrint: React.FC<FacturaPrintProps> = ({
  factura,
  cliente,
  productosCatalogo,
}) => {
  const fechaEmision = new Date(factura.fechaInicio).toLocaleDateString(
    "es-ES",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  const productos: ProductoFinanciamiento[] = factura.productos || [];

  const getNombreProducto = (id: string) => {
    return productosCatalogo.find((p) => p.id === id)?.nombre || id;
  };

  return (
    <div className='factura-print'>
      <h1 className='text-center text-2xl font-bold mb-4'>FACTURA DE VENTA</h1>
      <div className='flex justify-between text-sm mb-4'>
        <div>
          <p>
            <strong>Nº Venta:</strong>{" "}
            {formatNumeroControl(factura.numeroControl, "C")}
          </p>
          <p>
            <strong>Fecha:</strong> {fechaEmision}
          </p>
        </div>
        <div className='text-right'>
          <p>
            <strong>LOS TIBURONES</strong>
          </p>
          <p>Tel: [Tu número]</p>
          <p>Email: alejandrobaez938@gmail.com</p>
        </div>
      </div>

      <div className='border p-4 mb-4'>
        <h2 className='font-semibold mb-2'>Datos del Cliente</h2>
        {cliente ? (
          <>
            <p>
              <strong>Nombre:</strong> {cliente.nombre}
            </p>
            <p>
              <strong>Cédula:</strong> {cliente.cedula}
            </p>
            <p>
              <strong>Teléfono:</strong> {cliente.telefono}
            </p>
            {cliente.direccion && (
              <p>
                <strong>Dirección:</strong> {cliente.direccion}
              </p>
            )}
          </>
        ) : (
          <p>Cliente eliminado</p>
        )}
      </div>

      <table
        className='w-full text-sm border border-gray-300 mb-4'
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr className='bg-gray-100'>
            <th className='border px-2 py-1 text-left'>Cant</th>
            <th className='border px-2 py-1 text-left'>Descripción</th>
            <th className='border px-2 py-1 text-right'>P. Unit</th>
            <th className='border px-2 py-1 text-right'>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className='border px-2 py-1'>{p.cantidad}</td>
              <td className='border px-2 py-1'>
                {getNombreProducto(p.productoId)}
              </td>
              <td className='border px-2 py-1 text-right'>
                ${p.precioUnitario.toFixed(0)}
              </td>
              <td className='border px-2 py-1 text-right'>
                ${p.subtotal.toFixed(0)}
              </td>
            </tr>
          ))}
          <tr className='bg-gray-200 font-semibold'>
            <td colSpan={3} className='border px-2 py-1 text-right'>
              TOTAL
            </td>
            <td className='border px-2 py-1 text-right'>
              ${factura.monto.toFixed(0)}
            </td>
          </tr>
        </tbody>
      </table>

      <p className='text-xs text-center'>Gracias por su compra</p>
    </div>
  );
};

export default FacturaPrint;
