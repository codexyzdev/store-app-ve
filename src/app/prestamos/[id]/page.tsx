"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import {
  clientesDB,
  Cliente,
  prestamosDB,
  Prestamo,
  cobrosDB,
  Cobro,
  inventarioDB,
  Producto,
} from "@/lib/firebase/database";

import ClienteCard from "@/components/prestamos/ClienteCard";
import ResumenGlobal from "@/components/prestamos/ResumenGlobal";
import PrestamoCard from "@/components/prestamos/PrestamoCard";
import CuadriculaCuotas from "@/components/prestamos/CuadriculaCuotas";
import { calcularCuotasAtrasadas } from "@/utils/prestamos";

// Componente para mostrar tooltips simples
type TooltipProps = { text: string };
const Tooltip: React.FC<TooltipProps> = ({ text }: TooltipProps) => (
  <span className='ml-1 text-xs text-gray-400 cursor-help' title={text}>
    ⓘ
  </span>
);

export default function PrestamosClientePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id as string;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPagos, setShowPagos] = useState<{ [key: string]: boolean }>({});
  const [abonando, setAbonando] = useState<{ [key: string]: boolean }>({});
  const [mostrarFormularioAbono, setMostrarFormularioAbono] = useState<{
    [key: string]: boolean;
  }>({});
  const [montoAbono, setMontoAbono] = useState<{ [key: string]: number }>({});
  const [mostrarPlanPago, setMostrarPlanPago] = useState<{
    [key: string]: boolean;
  }>({});
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [totalCuotasAtrasadas, setTotalCuotasAtrasadas] = useState(0);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (!clienteId) return;
    clientesDB.obtener(clienteId).then(setCliente);
    prestamosDB.suscribir((data) => {
      setPrestamos(data.filter((p) => p.clienteId === clienteId));
      setLoading(false);
    });
    cobrosDB.suscribir(setCobros);
    inventarioDB.suscribir(setProductos);
  }, [clienteId]);

  useEffect(() => {
    // Calcular totales (corregido y reactivo)
    const nuevoTotalPendiente = prestamos.reduce((acc: number, p: Prestamo) => {
      if (
        p.tipoVenta !== "cuotas" ||
        (p.estado !== "activo" && p.estado !== "atrasado")
      )
        return acc;
      const abonos = getCobrosPrestamo(p.id).reduce(
        (acc2: number, cobro: Cobro) =>
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
      return acc + montoPendiente;
    }, 0);

    const nuevoTotalCuotasAtrasadas = prestamos.reduce(
      (acc: number, p: Prestamo) => {
        if (
          p.tipoVenta !== "cuotas" ||
          (p.estado !== "activo" && p.estado !== "atrasado")
        )
          return acc;
        const valorCuota =
          Number.isFinite(p.monto / p.cuotas) && p.monto > 0 && p.cuotas > 0
            ? p.monto / p.cuotas
            : 0.01;
        const atrasadas = calcularCuotasAtrasadas(p, cobros);
        return acc + atrasadas * valorCuota;
      },
      0
    );

    setTotalPendiente(nuevoTotalPendiente);
    setTotalCuotasAtrasadas(nuevoTotalCuotasAtrasadas);
  }, [prestamos, productos, cobros]);

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p: Producto) => p.id === id);
    return producto ? producto.nombre : "-";
  };

  const getCobrosPrestamo = (prestamoId: string) =>
    cobros
      .filter((c: Cobro) => c.prestamoId === prestamoId && c.tipo === "cuota")
      .sort((a: Cobro, b: Cobro) => b.fecha - a.fecha);

  // Desactivar el loader cuando los préstamos cambian (la suscripción se actualiza)
  useEffect(() => {
    if (actualizando) {
      setActualizando(false);
    }
  }, [prestamos, cobros]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto p-4 sm:p-6 md:p-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight leading-tight'>
            Detalle del Cliente
          </h1>
          <p className='mt-2 text-sm text-gray-600'>
            Información detallada del cliente y sus préstamos
          </p>
        </div>

        {cliente ? (
          <div className='mb-8'>
            <ClienteCard
              nombre={cliente.nombre}
              telefono={cliente.telefono}
              direccion={cliente.direccion}
              cedula={cliente.cedula}
              fotoCedulaUrl={cliente.fotoCedulaUrl}
            />
          </div>
        ) : (
          <div className='mb-8 p-6 bg-white rounded-xl shadow-sm animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          </div>
        )}

        {/* Resumen global con diseño mejorado */}
        <div className='mb-8'>
          {actualizando && (
            <div className='flex justify-center items-center mb-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
              <span className='ml-2 text-indigo-600 font-semibold'>
                Actualizando datos...
              </span>
            </div>
          )}
          <ResumenGlobal
            totalPendiente={totalPendiente}
            totalCuotasAtrasadas={totalCuotasAtrasadas}
          />
        </div>

        <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
          <h2 className='text-2xl font-bold mb-6 text-gray-800 flex items-center'>
            <span className='mr-2'>📋</span>
            Préstamos del Cliente
          </h2>

          {prestamos.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 text-6xl mb-4'>📭</div>
              <p className='text-gray-500 text-lg'>
                No hay préstamos activos para este cliente.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {prestamos.map((prestamo: Prestamo) => {
                const producto = productos.find(
                  (p: Producto) => p.id === prestamo.productoId
                );
                const montoTotal = prestamo.monto;
                // Solo cobros válidos para abonos y pagos
                const cobrosValidos: Cobro[] = getCobrosPrestamo(
                  prestamo.id
                ).filter(
                  (c: Cobro) => c.tipo === "cuota" && !!c.id && c.id !== "temp"
                );
                const abonos = cobrosValidos.reduce(
                  (acc: number, cobro: Cobro) =>
                    acc +
                    (typeof cobro.monto === "number" && !isNaN(cobro.monto)
                      ? cobro.monto
                      : 0),
                  0
                );
                const montoPendiente = Math.max(
                  0,
                  Number.isFinite(montoTotal - abonos) ? montoTotal - abonos : 0
                );
                const valorCuota =
                  prestamo.tipoVenta === "contado"
                    ? 0
                    : Number.isFinite(montoTotal / prestamo.cuotas) &&
                      montoTotal > 0 &&
                      prestamo.cuotas > 0
                    ? montoTotal / prestamo.cuotas
                    : 0.01;
                const cuotasPendientes =
                  prestamo.tipoVenta === "contado"
                    ? 0
                    : valorCuota > 0
                    ? Math.max(0, Math.ceil(montoPendiente / valorCuota))
                    : prestamo.cuotas - cobrosValidos.length;
                const cuotasAtrasadas = calcularCuotasAtrasadas(
                  prestamo,
                  getCobrosPrestamo(prestamo.id)
                );

                // Debug temporal
                if (prestamo.tipoVenta === "cuotas") {
                  console.log(`Préstamo ${prestamo.id}:`, {
                    estado: prestamo.estado,
                    montoPendiente,
                    cuotasPendientes,
                    valorCuota,
                    cobrosCount: cobrosValidos.length,
                    totalCuotas: prestamo.cuotas,
                  });
                }

                const estadoPrincipal =
                  prestamo.tipoVenta === "contado" ? (
                    <span className='text-blue-700 font-bold text-lg flex items-center'>
                      <span className='mr-1'>💵</span>Pagado
                    </span>
                  ) : cuotasAtrasadas > 0 ? (
                    <span className='text-red-700 font-bold text-lg flex items-center'>
                      <span className='mr-1'>⏰</span>Atrasado:{" "}
                      {cuotasAtrasadas} cuota{cuotasAtrasadas > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className='text-green-700 font-bold text-lg flex items-center'>
                      <span className='mr-1'>✔️</span>Al día
                    </span>
                  );

                return (
                  <div
                    key={prestamo.id}
                    className='md:col-span-2 flex flex-col md:flex-row gap-6'
                  >
                    <div className='flex-1'>
                      <PrestamoCard
                        prestamo={prestamo}
                        producto={producto}
                        abonos={abonos}
                        montoTotal={montoTotal}
                        montoPendiente={montoPendiente}
                        valorCuota={valorCuota}
                        cuotasPendientes={cuotasPendientes}
                        cuotasAtrasadas={cuotasAtrasadas}
                        estadoPrincipal={estadoPrincipal}
                        mostrarFormularioAbono={
                          !!mostrarFormularioAbono[prestamo.id]
                        }
                        abonando={!!abonando[prestamo.id]}
                        montoAbono={montoAbono[prestamo.id] || 0}
                        onMostrarFormularioAbono={() => {
                          const valorCuota =
                            Number.isFinite(prestamo.monto / prestamo.cuotas) &&
                            prestamo.monto > 0 &&
                            prestamo.cuotas > 0
                              ? prestamo.monto / prestamo.cuotas
                              : 0.01;
                          setMontoAbono((prev: { [key: string]: number }) => ({
                            ...prev,
                            [prestamo.id]: valorCuota,
                          }));
                          setMostrarFormularioAbono(
                            (prev: { [key: string]: boolean }) => ({
                              ...prev,
                              [prestamo.id]: !prev[prestamo.id],
                            })
                          );
                        }}
                        onChangeMontoAbono={(valor) =>
                          setMontoAbono((prev: { [key: string]: number }) => ({
                            ...prev,
                            [prestamo.id]: valor,
                          }))
                        }
                        onAbonarCuota={async (data) => {
                          setAbonando((prev) => ({
                            ...prev,
                            [prestamo.id]: true,
                          }));
                          setActualizando(true);
                          try {
                            if (
                              !data.monto ||
                              isNaN(data.monto) ||
                              data.monto <= 0
                            ) {
                              alert("Por favor ingresa un monto válido");
                              setAbonando((prev) => ({
                                ...prev,
                                [prestamo.id]: false,
                              }));
                              setActualizando(false);
                              return;
                            }
                            if (data.tipoPago !== "efectivo") {
                              if (!data.imagenComprobante) {
                                alert("Debes adjuntar el comprobante de pago.");
                                setAbonando((prev) => ({
                                  ...prev,
                                  [prestamo.id]: false,
                                }));
                                setActualizando(false);
                                return;
                              }
                              if (
                                !data.comprobante ||
                                data.comprobante.trim() === ""
                              ) {
                                alert(
                                  "Debes ingresar el número de comprobante."
                                );
                                setAbonando((prev) => ({
                                  ...prev,
                                  [prestamo.id]: false,
                                }));
                                setActualizando(false);
                                return;
                              }
                            }

                            // Calcular cuántas cuotas se están pagando
                            const valorCuota = prestamo.monto / prestamo.cuotas;
                            const cuotasAPagar = Math.floor(
                              data.monto / valorCuota
                            );

                            // Obtener cobros existentes para saber el número de la próxima cuota
                            const cobrosExistentes = getCobrosPrestamo(
                              prestamo.id
                            ).filter(
                              (c: Cobro) =>
                                c.tipo === "cuota" && !!c.id && c.id !== "temp"
                            );

                            // Crear un cobro por cada cuota pagada
                            for (let i = 0; i < cuotasAPagar; i++) {
                              await cobrosDB.crear({
                                prestamoId: prestamo.id,
                                monto: valorCuota,
                                fecha: (() => {
                                  if (data.fecha) {
                                    const [yyyy, mm, dd] =
                                      data.fecha.split("-");
                                    return new Date(
                                      Number(yyyy),
                                      Number(mm) - 1,
                                      Number(dd),
                                      0,
                                      0,
                                      0,
                                      0
                                    ).getTime();
                                  }
                                  return Date.now();
                                })(),
                                tipo: "cuota",
                                comprobante: data.comprobante || "",
                                tipoPago: data.tipoPago,
                                imagenComprobante: data.imagenComprobante || "",
                                numeroCuota: cobrosExistentes.length + i + 1,
                              });
                            }

                            // Recalcular el estado del préstamo
                            const todosCobros = [...cobrosExistentes];
                            // Simular los nuevos cobros para el cálculo
                            for (let i = 0; i < cuotasAPagar; i++) {
                              todosCobros.push({
                                id: `temp-${i}`,
                                prestamoId: prestamo.id,
                                monto: valorCuota,
                                fecha: Date.now(),
                                tipo: "cuota",
                                numeroCuota: cobrosExistentes.length + i + 1,
                              } as Cobro);
                            }

                            const totalAbonado = todosCobros.reduce(
                              (acc: number, cobro: Cobro) => acc + cobro.monto,
                              0
                            );
                            const montoPendiente = Math.max(
                              0,
                              prestamo.monto - totalAbonado
                            );
                            const cuotasPendientes = Math.ceil(
                              montoPendiente / valorCuota
                            );

                            // Actualizar el estado del préstamo
                            if (montoPendiente <= 0 || cuotasPendientes <= 0) {
                              await prestamosDB.actualizar(prestamo.id, {
                                estado: "completado",
                              });
                            } else {
                              // Mantener el estado actual si aún hay cuotas pendientes
                              // Solo cambiar si es necesario actualizar las cuotas atrasadas
                              const cuotasAtrasadas = calcularCuotasAtrasadas(
                                prestamo,
                                todosCobros
                              );
                              if (
                                cuotasAtrasadas > 0 &&
                                prestamo.estado !== "atrasado"
                              ) {
                                await prestamosDB.actualizar(prestamo.id, {
                                  estado: "atrasado",
                                });
                              } else if (
                                cuotasAtrasadas === 0 &&
                                prestamo.estado === "atrasado"
                              ) {
                                await prestamosDB.actualizar(prestamo.id, {
                                  estado: "activo",
                                });
                              }
                              // Si no hay cambios necesarios en el estado, no actualizar nada
                            }

                            setMostrarFormularioAbono((prev) => ({
                              ...prev,
                              [prestamo.id]: false,
                            }));
                          } catch (e) {
                            console.error("Error al abonar cuota:", e);
                            alert("Error al abonar cuota");
                            setActualizando(false);
                          } finally {
                            setAbonando((prev) => ({
                              ...prev,
                              [prestamo.id]: false,
                            }));
                          }
                        }}
                        pagos={getCobrosPrestamo(prestamo.id)}
                        Tooltip={Tooltip}
                      />
                    </div>
                    {prestamo.tipoVenta === "cuotas" && (
                      <div className='flex-1 flex flex-col'>
                        <button
                          onClick={() =>
                            setMostrarPlanPago((prev) => ({
                              ...prev,
                              [prestamo.id]: !prev[prestamo.id],
                            }))
                          }
                          className='w-full flex items-center justify-between px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 mb-2'
                        >
                          <span className='font-medium text-indigo-700'>
                            {mostrarPlanPago[prestamo.id]
                              ? "Ocultar"
                              : "Mostrar"}{" "}
                            Plan de Pago
                          </span>
                          <svg
                            className={`w-5 h-5 text-indigo-600 transform transition-transform duration-200 ${
                              mostrarPlanPago[prestamo.id] ? "rotate-180" : ""
                            }`}
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        </button>
                        {mostrarPlanPago[prestamo.id] && (
                          <div className='bg-gray-50 rounded-xl p-4 shadow-sm transform transition-all duration-300'>
                            <CuadriculaCuotas
                              fechaInicio={prestamo.fechaInicio}
                              cobros={getCobrosPrestamo(prestamo.id)}
                              valorCuota={valorCuota}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
