"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import {
  prestamosDB,
  Prestamo,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";
import Modal from "@/components/Modal";
import PrestamoCard from "@/components/prestamos/PrestamoCard";
import CuadriculaCuotas from "@/components/prestamos/CuadriculaCuotas";
import PlanPagosPrint from "@/components/prestamos/PlanPagosPrint";
import { calcularCuotasAtrasadas } from "@/utils/prestamos";
import ClienteCard from "@/components/prestamos/ClienteCard";
import ResumenGlobal from "@/components/prestamos/ResumenGlobal";

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
  const [mostrarImpresion, setMostrarImpresion] = useState<{
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
    return producto ? producto.nombre : "Producto no encontrado";
  };

  const getProductosPrestamo = (prestamo: Prestamo) => {
    if (prestamo.productos && prestamo.productos.length > 0) {
      // Préstamo con múltiples productos
      return prestamo.productos.map((p) => {
        const producto = productos.find((prod) => prod.id === p.productoId);
        return {
          ...p,
          nombre: producto?.nombre || "Producto no encontrado",
          producto: producto,
        };
      });
    } else {
      // Préstamo con un solo producto (compatibilidad)
      const producto = productos.find((p) => p.id === prestamo.productoId);
      return [
        {
          productoId: prestamo.productoId,
          cantidad: 1,
          precioUnitario: producto?.precio || 0,
          subtotal: producto?.precio || 0,
          nombre: producto?.nombre || "Producto no encontrado",
          producto: producto,
        },
      ];
    }
  };

  const getProductosNombres = (prestamo: Prestamo) => {
    const productosDelPrestamo = getProductosPrestamo(prestamo);
    if (productosDelPrestamo.length === 1) {
      return productosDelPrestamo[0].nombre;
    } else {
      return `${productosDelPrestamo.length} productos: ${productosDelPrestamo
        .map((p) => p.nombre)
        .join(", ")}`;
    }
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

  const imprimirPlanPagos = (prestamoId: string) => {
    setMostrarImpresion((prev) => ({
      ...prev,
      [prestamoId]: true,
    }));

    // Esperar un poco para que se renderice la modal y luego imprimir
    setTimeout(() => {
      // Configurar la página para impresión
      const originalTitle = document.title;
      document.title = `Plan de Pagos - ${cliente?.nombre || "Cliente"}`;

      // Imprimir
      window.print();

      // Restaurar el título original
      document.title = originalTitle;
    }, 500);
  };

  const cerrarImpresion = (prestamoId: string) => {
    setMostrarImpresion((prev) => ({
      ...prev,
      [prestamoId]: false,
    }));
  };

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
                const productosDelPrestamo = getProductosPrestamo(prestamo);
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
                        productosDelPrestamo={productosDelPrestamo}
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
                        <div className='flex gap-2 mb-2'>
                          <button
                            onClick={() =>
                              setMostrarPlanPago((prev) => ({
                                ...prev,
                                [prestamo.id]: !prev[prestamo.id],
                              }))
                            }
                            className='flex-1 flex items-center justify-between px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200'
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

                          <button
                            onClick={() => imprimirPlanPagos(prestamo.id)}
                            className='px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 text-green-700 font-medium flex items-center gap-2'
                            title='Imprimir Plan de Pagos'
                          >
                            <svg
                              className='w-5 h-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                              />
                            </svg>
                            <span className='hidden sm:inline'>Imprimir</span>
                          </button>
                        </div>
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

      {/* Modales de impresión para cada préstamo */}
      {prestamos.map((prestamo: Prestamo) => (
        <Modal
          key={`print-${prestamo.id}`}
          isOpen={!!mostrarImpresion[prestamo.id]}
          onClose={() => cerrarImpresion(prestamo.id)}
          title={`Imprimir Plan de Pagos - ${cliente?.nombre || "Cliente"}`}
        >
          <div className='print-container'>
            <div className='no-print mb-4 text-center'>
              <p className='text-gray-600 mb-3'>
                Haz clic en "Imprimir" o usa Ctrl+P para imprimir este plan de
                pagos.
              </p>
              <div className='flex gap-2 justify-center'>
                <button
                  onClick={() => window.print()}
                  className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                    />
                  </svg>
                  Imprimir
                </button>
                <button
                  onClick={() => cerrarImpresion(prestamo.id)}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
                >
                  Cerrar
                </button>
              </div>
            </div>

            {cliente && (
              <PlanPagosPrint
                prestamo={prestamo}
                cliente={cliente}
                cobros={getCobrosPrestamo(prestamo.id)}
                valorCuota={prestamo.monto / prestamo.cuotas}
                productosNombres={getProductosNombres(prestamo)}
              />
            )}
          </div>
        </Modal>
      ))}

      {/* Estilos globales para impresión */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Ocultar elementos del modal en impresión */
          .fixed.inset-0 > div:first-child {
            display: none !important;
          }

          /* Mostrar solo el contenido del plan */
          .fixed.inset-0 .plan-pagos-print {
            position: static !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
