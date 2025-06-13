import { FinanciamientoCuota, Producto, Cobro } from "@/lib/firebase/database";
import ResumenCliente from "./ResumenCliente";
import EstadoPrestamo from "./EstadoPrestamo";

interface GrupoFinanciamientos {
  clienteId: string;
  nombre: string;
  cedula: string;
  financiamientos: FinanciamientoCuota[];
}

interface ListaFinanciamientosProps {
  prestamosAgrupados: GrupoFinanciamientos[];
  productos: Producto[];
  cobros: Cobro[];
  calcularCuotasAtrasadas: (
    fin: FinanciamientoCuota,
    cobros: Cobro[]
  ) => number;
  getUltimaCuota: (financiamientoId: string) => Cobro | null;
}

export default function ListaPrestamos({
  prestamosAgrupados,
  productos,
  cobros,
  calcularCuotasAtrasadas,
  getUltimaCuota,
}: ListaFinanciamientosProps) {
  return (
    <div className='lg:hidden space-y-4'>
      {prestamosAgrupados.length === 0 ? (
        <div className='text-center py-8 text-gray-400'>
          No hay financiamientos registrados
        </div>
      ) : (
        prestamosAgrupados.map((grupo) => {
          const prestamosPendientes = grupo.financiamientos.filter(
            (p) =>
              (p.estado === "activo" || p.estado === "atrasado") && p.cuotas > 0
          );
          const prestamosActivos = prestamosPendientes;
          const totalCuotasVencidas = prestamosPendientes.reduce(
            (sum, p) => sum + calcularCuotasAtrasadas(p, cobros),
            0
          );

          return (
            <div
              key={grupo.clienteId}
              className='bg-white shadow-md rounded-xl p-4 sm:p-5 flex flex-col gap-3 border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.99]'
              onClick={() =>
                (window.location.href = `/financiamiento-cuota/${grupo.clienteId}`)
              }
            >
              <div className='flex items-center gap-3 mb-1'>
                <ResumenCliente nombre={grupo.nombre} cedula={grupo.cedula} />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                <div className='flex justify-between sm:flex-col sm:justify-start'>
                  <span className='font-semibold text-gray-700'>
                    Total Financiamientos:
                  </span>
                  <span className='text-gray-900 font-medium'>
                    {grupo.financiamientos.length}
                  </span>
                </div>
                <div className='flex justify-between sm:flex-col sm:justify-start'>
                  <span className='font-semibold text-gray-700'>
                    Financiamientos Activos:
                  </span>
                  <span className='text-gray-900 font-medium'>
                    {prestamosActivos.length}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                <div className='flex justify-between sm:flex-col sm:justify-start'>
                  <span className='font-semibold text-gray-700'>
                    Total Pendiente:
                  </span>
                  <span className='text-blue-600 font-bold text-base'>
                    $
                    {prestamosPendientes
                      .reduce((sum, p) => {
                        const abonos = cobros
                          .filter(
                            (c) =>
                              c.financiamientoId === p.id &&
                              (c.tipo === "cuota" || c.tipo === "inicial")
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
                          Number.isFinite(p.monto - abonos)
                            ? p.monto - abonos
                            : 0
                        );
                        return sum + montoPendiente;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between sm:flex-col sm:justify-start'>
                  <span className='font-semibold text-gray-700'>
                    Último Pago:
                  </span>
                  <span className='text-gray-900 font-medium'>
                    {(() => {
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
                      return ultimoPago
                        ? new Date(ultimoPago.fecha).toLocaleDateString()
                        : "Sin pagos";
                    })()}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3'>
                <div className='flex justify-between sm:flex-col sm:justify-start'>
                  <span className='font-semibold text-gray-700'>
                    Próximo Pago:
                  </span>
                  <span className='text-gray-900 font-medium'>
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
                  </span>
                </div>
                <div className='flex justify-between sm:flex-col sm:justify-start'>
                  <span className='font-semibold text-gray-700'>Estado:</span>
                  <div className='text-right sm:text-left'>
                    <EstadoPrestamo
                      totalCuotasVencidas={totalCuotasVencidas}
                      tienePrestamosActivos={prestamosActivos.length > 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
