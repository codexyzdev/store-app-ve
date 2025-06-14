import React from "react";
import { Producto as ProductoType } from "@/lib/firebase/database";

interface InventarioHTMLProps {
  productos: ProductoType[];
}

const InventarioHTML: React.FC<InventarioHTMLProps> = ({ productos }) => {
  return (
    <div className='inventario-print w-full'>
      <h2 className='text-center text-xl font-bold mb-4'>Inventario de Productos</h2>
      <table
        className='w-full border border-gray-300 text-sm'
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr className='bg-gray-100'>
            <th className='border px-2 py-1 text-left'>#</th>
            <th className='border px-2 py-1 text-left'>Producto</th>
            <th className='border px-2 py-1 text-left'>Categoría</th>
            <th className='border px-2 py-1 text-right'>Precio</th>
            <th className='border px-2 py-1 text-right'>Stock</th>
            <th className='border px-2 py-1 text-right'>Total</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, idx) => (
            <tr
              key={p.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className='border px-2 py-1'>{idx + 1}</td>
              <td className='border px-2 py-1'>{p.nombre}</td>
              <td className='border px-2 py-1'>{p.categoria}</td>
              <td className='border px-2 py-1 text-right'>
                ${p.precio.toFixed(2)}
              </td>
              <td className='border px-2 py-1 text-right'>{p.stock}</td>
              <td className='border px-2 py-1 text-right'>
                ${(p.precio * p.stock).toFixed(2)}
              </td>
            </tr>
          ))}
          {productos.length > 0 && (
            <tr className='bg-gray-200 font-semibold'>
              <td colSpan={5} className='border px-2 py-1 text-right'>
                Total inventario
              </td>
              <td className='border px-2 py-1 text-right'>
                $
                {productos
                  .reduce((acc, p) => acc + p.precio * p.stock, 0)
                  .toFixed(2)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Resumen adicional */}
      <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-semibold mb-2'>Resumen del Inventario</h3>
        <div className='text-sm text-gray-600 space-y-1'>
          <p>Total de productos: {productos.length}</p>
          <p>Total de unidades en stock: {productos.reduce((acc, p) => acc + p.stock, 0)}</p>
          <p>Valor total del inventario: ${productos.reduce((acc, p) => acc + p.precio * p.stock, 0).toFixed(2)}</p>
          <p>Fecha de generación: {new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
    </div>
  );
};

export default InventarioHTML; 