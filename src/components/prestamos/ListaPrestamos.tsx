import { Prestamo, Producto, Cobro } from "@/lib/firebase/database";
import ResumenCliente from "./ResumenCliente";
import EstadoPrestamo from "./EstadoPrestamo";

interface GrupoPrestamos {
  clienteId: string;
  nombre: string;
  cedula: string;
  prestamos: Prestamo[];
}

interface ListaPrestamosProps {
  prestamosAgrupados: GrupoPrestamos[];
  productos: Producto[];
  cobros: Cobro[];
  calcularCuotasAtrasadas: (prestamo: Prestamo) => number;
  getUltimaCuota: (prestamoId: string) => Cobro | null;
}

export default function ListaPrestamos({
  prestamosAgrupados,
  productos,
  cobros,
  calcularCuotasAtrasadas,
  getUltimaCuota,
}: ListaPrestamosProps) {
  return (
    <div className='md:hidden space-y-4'>
      {prestamosAgrupados.length === 0 ? (
        <div className='text-center py-8 text-gray-400'>
          No hay préstamos registrados
        </div>
      ) : (
        prestamosAgrupados.map((grupo) => {
          const prestamosPendientes = grupo.prestamos.filter(
            (p) =>
              (p.estado === "activo" || p.estado === "atrasado") && p.cuotas > 0
          );
          const prestamosActivos = prestamosPendientes;
          const totalCuotasVencidas = prestamosPendientes.reduce(
            (sum, p) => sum + calcularCuotasAtrasadas(p),
            0
          );

          return (
            <div
              key={grupo.clienteId}
              className='bg-white shadow rounded-xl p-4 flex flex-col gap-2 border border-gray-100 cursor-pointer'
              onClick={() =>
                (window.location.href = `/prestamos/${grupo.clienteId}`)
              }
            >
              <div className='flex items-center gap-3 mb-2'>
                <ResumenCliente nombre={grupo.nombre} cedula={grupo.cedula} />
              </div>
              <div className='flex flex-wrap gap-4 text-sm'>
                <div>
                  <span className='font-semibold text-gray-700'>
                    Total Préstamos:
                  </span>{" "}
                  {grupo.prestamos.length}
                </div>
                <div>
                  <span className='font-semibold text-gray-700'>
                    Préstamos Activos:
                  </span>{" "}
                  {prestamosActivos.length}
                </div>
              </div>
              <div className='flex flex-wrap gap-4 text-sm'>
                <div>
                  <span className='font-semibold text-gray-700'>
                    Total Pendiente:
                  </span>{" "}
                  $
                  {prestamosPendientes
                    .reduce((sum, p) => {
                      const abonos = cobros
                        .filter(
                          (c) => c.prestamoId === p.id && c.tipo === "cuota"
                        )
                        .reduce(
                          (acc2, cobro) =>
                            acc2 +
                            (typeof cobro.monto === "number" &&
                            !isNaN(cobro.monto)
                              ? cobro.monto
                              : 0),
                          0
                        );
                      const montoPendiente = Math.max(
                        0,
                        Number.isFinite(p.monto - abonos) ? p.monto - abonos : 0
                      );
                      return sum + montoPendiente;
                    }, 0)
                    .toFixed(2)}
                </div>
                <div>
                  <span className='font-semibold text-gray-700'>
                    Último Pago:
                  </span>{" "}
                  {(() => {
                    const ultimoPago = grupo.prestamos.reduce(
                      (ultimo, prestamo) => {
                        const ultimaCuota = getUltimaCuota(prestamo.id);
                        if (!ultimaCuota) return ultimo;
                        return !ultimo || ultimaCuota.fecha > ultimo.fecha
                          ? ultimaCuota
                          : ultimo;
                      },
                      null as Cobro | null
                    );
                    return ultimoPago
                      ? new Date(ultimoPago.fecha).toLocaleDateString()
                      : "Sin pagos";
                  })()}
                </div>
              </div>
              <div className='flex flex-wrap gap-4 text-sm'>
                <div>
                  <span className='font-semibold text-gray-700'>
                    Próximo Pago:
                  </span>{" "}
                  {(() => {
                    const prestamosPendientesOrdenados = [
                      ...prestamosPendientes,
                    ].sort((a, b) => b.fechaInicio - a.fechaInicio);
                    const prestamo = prestamosPendientesOrdenados[0];
                    if (!prestamo) return "-";
                    const cuotasAtrasadas = calcularCuotasAtrasadas(prestamo);
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
                </div>
              </div>
              <div className='flex flex-wrap gap-4 text-sm'>
                <div>
                  <span className='font-semibold text-gray-700'>Estado:</span>{" "}
                  <EstadoPrestamo
                    totalCuotasVencidas={totalCuotasVencidas}
                    tienePrestamosActivos={prestamosActivos.length > 0}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
