import React from "react";
import { Cliente } from "@/lib/firebase/database";

interface ClientesPrintProps {
  clientes: Cliente[];
}

const ClientesPrint: React.FC<ClientesPrintProps> = ({ clientes }) => {
  return (
    <div className='clientes-print w-full'>
      <h2 className='text-center text-xl font-bold mb-4'>Lista de Clientes</h2>
      <table
        className='w-full border border-gray-300 text-sm'
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr className='bg-gray-100'>
            <th className='border px-2 py-1 text-left'>#</th>
            <th className='border px-2 py-1 text-left'>Nombre</th>
            <th className='border px-2 py-1 text-left'>Control</th>
            <th className='border px-2 py-1 text-left'>Teléfono</th>
            <th className='border px-2 py-1 text-left'>Cédula</th>
            {/* <th className='border px-2 py-1 text-left'>Dirección</th> */}
            <th className='border px-2 py-1 text-left'>Registro</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c, idx) => (
            <tr
              key={c.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className='border px-2 py-1'>{idx + 1}</td>
              <td className='border px-2 py-1'>{c.nombre}</td>
              <td className='border px-2 py-1'>#{c.numeroControl}</td>
              <td className='border px-2 py-1'>{c.telefono}</td>
              <td className='border px-2 py-1'>{c.cedula || "N/A"}</td>
              {/* <td className='border px-2 py-1'>{c.direccion || "N/A"}</td> */}
              <td className='border px-2 py-1'>
                {new Date(c.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesPrint;
