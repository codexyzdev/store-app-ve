import React from "react";
import { FinanciamientoConDatos } from "@/hooks/useCuotasAtrasadasRedux";

interface CuotasMorosasPrintProps {
  financiamientos: FinanciamientoConDatos[];
}

const CuotasMorosasPrint: React.FC<CuotasMorosasPrintProps> = ({
  financiamientos,
}) => {
  const morosos = financiamientos.filter((f) => f.cuotasAtrasadas >= 2);

  return (
    <div className='cuotas-morosas-print w-full'>
      <h2 className='text-center text-xl font-bold mb-4'>Clientes Morosos</h2>
      <table
        className='w-full border border-gray-300 text-sm'
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr className='bg-gray-100'>
            <th className='border px-2 py-1 text-left'>#</th>
            <th className='border px-2 py-1 text-left'>Cliente</th>
            <th className='border px-2 py-1 text-left'>Teléfono</th>
            <th className='border px-2 py-1 text-right'>Cuotas Atrasadas</th>
            <th className='border px-2 py-1 text-right'>Monto Atrasado</th>
            <th className='border px-2 py-1 text-left'>Severidad</th>
            <th className='border px-2 py-1 text-left'>Último Pago</th>
          </tr>
        </thead>
        <tbody>
          {morosos.map((m, idx) => (
            <tr
              key={m.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className='border px-2 py-1'>{idx + 1}</td>
              <td className='border px-2 py-1'>{m.cliente.nombre}</td>
              <td className='border px-2 py-1'>{m.cliente.telefono}</td>
              <td className='border px-2 py-1 text-right'>
                {m.cuotasAtrasadas}
              </td>
              <td className='border px-2 py-1 text-right'>
                ${m.montoAtrasado.toFixed(2)}
              </td>
              <td className='border px-2 py-1'>{m.severidad.toUpperCase()}</td>
              <td className='border px-2 py-1'>
                {m.ultimaCuota
                  ? new Date(m.ultimaCuota.fecha).toLocaleDateString("es-ES")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CuotasMorosasPrint;
