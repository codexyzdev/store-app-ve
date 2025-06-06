import { Prestamo, Cliente, Producto, Cobro } from "@/lib/firebase/database";
import ResumenCliente from "./ResumenCliente";
import EstadoPrestamo from "./EstadoPrestamo";

interface GrupoPrestamos {
  clienteId: string;
  nombre: string;
  cedula: string;
  prestamos: Prestamo[];
}

interface TablaPrestamosProps {
  prestamosAgrupados: GrupoPrestamos[];
  productos: Producto[];
  cobros: Cobro[];
  calcularCuotasAtrasadas: (prestamo: Prestamo, cobros: Cobro[]) => number;
  getUltimaCuota: (prestamoId: string) => Cobro | null;
}

export default function TablaPrestamos({
  prestamosAgrupados,
  productos,
  cobros,
  calcularCuotasAtrasadas,
  getUltimaCuota,
}: TablaPrestamosProps) {
  return (
    <div className='bg-white shadow rounded-lg overflow-x-auto hidden md:block'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Cliente
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Total Préstamos
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Préstamos Activos
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Total Pendiente
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Último Pago
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Próximo Pago
            </th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
              Estado
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {prestamosAgrupados.length === 0 ? (
            <tr>
              <td colSpan={7} className='text-center py-8 text-gray-400'>
                No hay préstamos registrados
              </td>
            </tr>
          ) : (
            prestamosAgrupados.map((grupo) => {
              const prestamosPendientes = grupo.prestamos.filter(
                (p) =>
                  (p.estado === "activo" || p.estado === "atrasado") &&
                  p.cuotas > 0
              );
              const prestamosActivos = prestamosPendientes;
              const totalPendiente = prestamosPendientes.reduce((sum, p) => {
                const producto = productos.find(
                  (prod) => prod.id === p.productoId
                );
                const precioProducto =
                  producto &&
                  typeof producto.precio === "number" &&
                  !isNaN(producto.precio)
                    ? producto.precio
                    : 0;
                const montoTotal = Number.isFinite(precioProducto * 1.5)
                  ? precioProducto * 1.5
                  : 0;
                const abonos = cobros
                  .filter((c) => c.prestamoId === p.id && c.tipo === "cuota")
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
                  Number.isFinite(montoTotal - abonos) ? montoTotal - abonos : 0
                );
                return sum + montoPendiente;
              }, 0);

              const ultimoPago = grupo.prestamos.reduce((ultimo, prestamo) => {
                const ultimaCuota = getUltimaCuota(prestamo.id);
                if (!ultimaCuota) return ultimo;
                return !ultimo || ultimaCuota.fecha > ultimo.fecha
                  ? ultimaCuota
                  : ultimo;
              }, null as Cobro | null);

              const totalCuotasVencidas = prestamosPendientes.reduce(
                (sum, p) => sum + calcularCuotasAtrasadas(p, cobros),
                0
              );

              return (
                <tr
                  key={grupo.clienteId}
                  className='hover:bg-indigo-50 transition-colors duration-150 cursor-pointer'
                  onClick={() =>
                    (window.location.href = `/prestamos/${grupo.clienteId}`)
                  }
                >
                  <td className='px-4 py-3'>
                    <ResumenCliente
                      nombre={grupo.nombre}
                      cedula={grupo.cedula}
                    />
                  </td>
                  <td className='px-4 py-3'>{grupo.prestamos.length}</td>
                  <td className='px-4 py-3'>{prestamosActivos.length}</td>
                  <td className='px-4 py-3'>${totalPendiente.toFixed(2)}</td>
                  <td className='px-4 py-3'>
                    {ultimoPago
                      ? new Date(ultimoPago.fecha).toLocaleDateString()
                      : "Sin pagos"}
                  </td>
                  <td className='px-4 py-3'>
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
                            c.prestamoId === prestamo.id && c.tipo === "cuota"
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
                  <td className='px-4 py-3'>
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
