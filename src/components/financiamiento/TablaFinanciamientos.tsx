import {
  FinanciamientoCuota,
  Cliente,
  Producto,
  Cobro,
} from "@/lib/firebase/database";
import ResumenCliente from "./ResumenCliente";
import EstadoPrestamo from "./EstadoPrestamo";

interface GrupoFinanciamientos {
  clienteId: string;
  nombre: string;
  cedula: string;
  financiamientos: FinanciamientoCuota[];
}

interface TablaFinanciamientosProps {
  prestamosAgrupados: GrupoFinanciamientos[];
  productos: Producto[];
  cobros: Cobro[];
  calcularCuotasAtrasadas: (
    fin: FinanciamientoCuota,
    cobros: Cobro[]
  ) => number;
  getUltimaCuota: (financiamientoId: string) => Cobro | null;
}

export default function TablaPrestamos({
  prestamosAgrupados,
  productos,
  cobros,
  calcularCuotasAtrasadas,
  getUltimaCuota,
}: TablaFinanciamientosProps) {
  return (
    <div className='bg-white shadow rounded-lg overflow-x-auto hidden lg:block'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Cliente
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Total Financiamientos
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Financiamientos Activos
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Total Pendiente
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Último Pago
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Próximo Pago
            </th>
            <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
              Estado
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {prestamosAgrupados.length === 0 ? (
            <tr>
              <td colSpan={7} className='text-center py-8 text-gray-400'>
                No hay financiamientos registrados
              </td>
            </tr>
          ) : (
            prestamosAgrupados.map((grupo) => {
              const prestamosPendientes = grupo.financiamientos.filter(
                (p) =>
                  (p.estado === "activo" || p.estado === "atrasado") &&
                  p.cuotas > 0
              );
              const prestamosActivos = prestamosPendientes;
              const totalPendiente = prestamosPendientes.reduce((sum, p) => {
                const abonos = cobros
                  .filter(
                    (c) =>
                      c.financiamientoId === p.id &&
                      (c.tipo === "cuota" || c.tipo === "inicial")
                  )
                  .reduce(
                    (acc2, cobro) =>
                      acc2 +
                      (typeof cobro.monto === "number" && !isNaN(cobro.monto)
                        ? cobro.monto
                        : 0),
                    0
                  );
                const montoPendiente = Math.max(
                  0,
                  Number.isFinite(p.monto - abonos) ? p.monto - abonos : 0
                );
                return sum + montoPendiente;
              }, 0);

              const ultimoPago = grupo.financiamientos.reduce(
                (ultimo, prestamo) => {
                  const ultimaCuota = getUltimaCuota(prestamo.id);
                  if (!ultimaCuota) return ultimo;
                  return !ultimo || ultimaCuota.fecha > ultimo.fecha
                    ? ultimaCuota
                    : ultimo;
                },
                null as Cobro | null
              );

              const totalCuotasVencidas = prestamosPendientes.reduce(
                (sum, p) => sum + calcularCuotasAtrasadas(p, cobros),
                0
              );

              return (
                <tr
                  key={grupo.clienteId}
                  className='hover:bg-indigo-50 transition-colors duration-150 cursor-pointer'
                  onClick={() =>
                    (window.location.href = `/financiamiento-cuota/${grupo.clienteId}`)
                  }
                >
                  <td className='px-4 py-4'>
                    <ResumenCliente
                      nombre={grupo.nombre}
                      cedula={grupo.cedula}
                    />
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>
                    {grupo.financiamientos.length}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>
                    {prestamosActivos.length}
                  </td>
                  <td className='px-4 py-4 text-sm font-semibold text-blue-600'>
                    ${totalPendiente.toFixed(2)}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>
                    {ultimoPago
                      ? new Date(ultimoPago.fecha).toLocaleDateString()
                      : "Sin pagos"}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>
                    {(() => {
                      const prestamosPendientesOrdenados = [
                        ...prestamosPendientes,
                      ].sort((a, b) => b.fechaInicio - a.fechaInicio);
                      const prestamo = prestamosPendientesOrdenados[0];
                      if (!prestamo) return "-";
                      const cuotasAtrasadas = calcularCuotasAtrasadas(
                        prestamo,
                        cobros
                      );
                      if (cuotasAtrasadas > 0) return "¡Ya vencido!";
                      const fechaInicio = new Date(prestamo.fechaInicio);
                      const cobrosPrestamo = cobros
                        .filter(
                          (c) =>
                            c.financiamientoId === prestamo.id &&
                            (c.tipo === "cuota" || c.tipo === "inicial")
                        )
                        .sort((a, b) => b.fecha - a.fecha);
                      let semanasPagadas = cobrosPrestamo.length;
                      let proximaFecha = new Date(fechaInicio);
                      proximaFecha.setDate(
                        proximaFecha.getDate() + semanasPagadas * 7
                      );
                      if (semanasPagadas >= prestamo.cuotas) return "-";
                      return proximaFecha.toLocaleDateString();
                    })()}
                  </td>
                  <td className='px-4 py-4 text-sm'>
                    <EstadoPrestamo
                      totalCuotasVencidas={totalCuotasVencidas}
                      tienePrestamosActivos={prestamosActivos.length > 0}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
