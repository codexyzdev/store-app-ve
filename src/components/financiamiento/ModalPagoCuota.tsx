"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { cobrosDB } from "@/lib/firebase/database";

interface ModalPagoCuotaProps {
  isOpen: boolean;
  onClose: () => void;
  prestamo: {
    id: string;
    monto: number;
    cuotas: number;
  };
  valorCuota: number;
  cuotasPendientes: number;
  cuotasAtrasadas: number;
  cuotasPagadas?: number;
  onPagar: (data: {
    monto: number;
    tipoPago: string;
    comprobante?: string;
    imagenComprobante?: string;
    fecha?: string;
    nota?: string;
  }) => Promise<void>;
  cargando?: boolean;
}

interface TipoPago {
  id: string;
  nombre: string;
  descripcion: string;
}

interface ErrorState {
  mostrar: boolean;
  mensaje: string;
  tipo: "error" | "warning" | "success";
}

export default function ModalPagoCuota({
  isOpen,
  onClose,
  prestamo,
  valorCuota,
  cuotasPendientes,
  cuotasAtrasadas,
  cuotasPagadas = 0,
  onPagar,
  cargando = false,
}: ModalPagoCuotaProps) {
  const [tipoPago, setTipoPago] = useState<string>("efectivo");
  const [monto, setMonto] = useState<number>(valorCuota);
  const [comprobante, setComprobante] = useState<string>("");
  const [imagenComprobante, setImagenComprobante] = useState<string>("");
  const [fecha, setFecha] = useState<string>(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

  // Estados de validación
  const [verificandoComprobante, setVerificandoComprobante] = useState(false);
  const [comprobanteEsDuplicado, setComprobanteEsDuplicado] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  // Estados de UI
  const [error, setError] = useState<ErrorState>({
    mostrar: false,
    mensaje: "",
    tipo: "error",
  });
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // Cálculos mejorados para el pago
  const cuotasAPagar = monto > 0 ? Math.floor(monto / valorCuota) : 0;
  const montoParcial = monto > 0 ? Number((monto % valorCuota).toFixed(2)) : 0;
  const siguienteCuota = cuotasPagadas + 1;
  const ultimaCuotaAPagar = cuotasPagadas + cuotasAPagar;

  // Validar que no se excedan las cuotas pendientes
  const cuotasDisponibles = cuotasPendientes;
  const esPagoValido = cuotasAPagar <= cuotasDisponibles;

  // Helper function para mostrar errores
  const mostrarError = (
    mensaje: string,
    tipo: ErrorState["tipo"] = "error"
  ) => {
    setError({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setError((prev) => ({ ...prev, mostrar: false }));
    }, 8000);
  };

  // Helper function para resetear formulario
  const resetearFormulario = () => {
    setMonto(valorCuota);
    setComprobante("");
    setImagenComprobante("");
    setFecha(() => {
      const hoy = new Date();
      return hoy.toISOString().split("T")[0];
    });
    setNota("");
    setComprobanteEsDuplicado(false);
    setMensajeValidacion("");
    setVerificandoComprobante(false);
    setTipoPago("efectivo");
    setError({ mostrar: false, mensaje: "", tipo: "error" });
    setProcesandoPago(false);
    setPagoExitoso(false);
  };

  // Verificar comprobante con debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (tipoPago !== "efectivo" && comprobante.trim()) {
        // Lógica de verificación movida aquí para evitar dependencias circulares
        setVerificandoComprobante(true);
        setMensajeValidacion("🔍 Verificando número de comprobante...");

        try {
          const esDuplicado = await cobrosDB.verificarComprobanteDuplicado(
            comprobante.trim()
          );
          setComprobanteEsDuplicado(esDuplicado);

          if (esDuplicado) {
            setMensajeValidacion(
              `❌ El número "${comprobante}" ya está registrado en el sistema. Por favor, verifica e ingresa un número diferente.`
            );
            mostrarError(
              `🚫 Comprobante duplicado: El número "${comprobante}" ya está registrado. Debes usar un número diferente.`,
              "error"
            );
          } else {
            setMensajeValidacion(
              `✅ Número de comprobante disponible para usar`
            );
          }
        } catch (error) {
          console.error("Error al verificar comprobante:", error);
          setComprobanteEsDuplicado(false);
          setMensajeValidacion(
            "⚠️ Error al verificar comprobante. Intenta nuevamente."
          );
          mostrarError(
            "Error al verificar comprobante. Intenta nuevamente.",
            "warning"
          );
        } finally {
          setVerificandoComprobante(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [comprobante, tipoPago]);

  // Limpiar validación cuando cambie a efectivo
  useEffect(() => {
    if (tipoPago === "efectivo") {
      setComprobanteEsDuplicado(false);
      setMensajeValidacion("");
      setVerificandoComprobante(false);
    }
  }, [tipoPago]);

  // Limpiar estado cuando se abra/cierre el modal
  useEffect(() => {
    if (isOpen) {
      setComprobanteEsDuplicado(false);
      setMensajeValidacion("");
      setVerificandoComprobante(false);
      setError({ mostrar: false, mensaje: "", tipo: "error" });
      setProcesandoPago(false);
      setPagoExitoso(false);
    } else {
      // Reset manual cuando se cierra el modal
      setMonto(valorCuota);
      setComprobante("");
      setImagenComprobante("");
      setFecha(() => {
        const hoy = new Date();
        return hoy.toISOString().split("T")[0];
      });
      setNota("");
      setComprobanteEsDuplicado(false);
      setMensajeValidacion("");
      setVerificandoComprobante(false);
      setTipoPago("efectivo");
      setError({ mostrar: false, mensaje: "", tipo: "error" });
      setProcesandoPago(false);
      setPagoExitoso(false);
    }
  }, [isOpen, valorCuota]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        mostrarError("La imagen no puede ser mayor a 5MB", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagenComprobante(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = (): boolean => {
    if (monto <= 0) {
      mostrarError("El monto debe ser mayor a 0");
      return false;
    }

    // Validar que no se excedan las cuotas disponibles
    if (!esPagoValido) {
      mostrarError(
        `❌ El monto excede las cuotas disponibles. Solo puedes pagar hasta ${cuotasDisponibles} cuota${
          cuotasDisponibles > 1 ? "s" : ""
        } (máximo $${(valorCuota * cuotasDisponibles).toLocaleString()})`
      );
      return false;
    }

    // Validar que el monto no sea excesivamente grande (más del doble del total pendiente)
    const montoMaximoRecomendado = valorCuota * cuotasDisponibles * 1.1; // 10% de tolerancia
    if (monto > montoMaximoRecomendado) {
      mostrarError(
        `⚠️ El monto parece muy alto. ¿Estás seguro de que deseas pagar $${monto.toLocaleString()}? El total pendiente es de $${(
          valorCuota * cuotasDisponibles
        ).toLocaleString()}`,
        "warning"
      );
      return false;
    }

    if (tipoPago !== "efectivo" && !comprobante.trim()) {
      mostrarError("Debes ingresar el número de comprobante");
      return false;
    }

    if (tipoPago !== "efectivo" && !imagenComprobante) {
      mostrarError("Debes adjuntar la imagen del comprobante");
      return false;
    }

    if (tipoPago !== "efectivo" && comprobanteEsDuplicado) {
      mostrarError(
        `🚫 COMPROBANTE DUPLICADO: El número "${comprobante}" ya está registrado en el sistema. Debes usar un número diferente.`,
        "error"
      );
      return false;
    }

    if (verificandoComprobante) {
      mostrarError(
        "⏳ Esperando validación del comprobante. Intenta nuevamente.",
        "warning"
      );
      return false;
    }

    if (
      tipoPago !== "efectivo" &&
      comprobante.trim() &&
      !mensajeValidacion.includes("✅")
    ) {
      mostrarError(
        "⏳ El comprobante aún no ha sido validado. Espera un momento e intenta nuevamente.",
        "warning"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Evitar múltiples envíos
    if (procesandoPago || pagoExitoso) {
      console.log("🚫 Pago ya en progreso o completado");
      return;
    }

    console.log("🔥 INICIANDO VALIDACIÓN DE PAGO");

    // VALIDACIÓN CRÍTICA 1: Verificar formulario básico
    if (!validarFormulario()) {
      console.error("❌ VALIDACIÓN FALLÓ: Formulario inválido");
      return;
    }

    // VALIDACIÓN CRÍTICA 2: Re-verificar comprobante duplicado JUSTO antes del envío
    if (tipoPago !== "efectivo" && comprobante.trim()) {
      setProcesandoPago(true); // Activar loading inmediatamente

      try {
        console.log("🔍 VERIFICACIÓN FINAL: Comprobante", comprobante.trim());
        const esDuplicadoFinal = await cobrosDB.verificarComprobanteDuplicado(
          comprobante.trim()
        );

        if (esDuplicadoFinal) {
          console.error(
            "❌ BLOQUEO CRÍTICO: Comprobante duplicado detectado en verificación final"
          );
          setComprobanteEsDuplicado(true);
          setMensajeValidacion(
            `❌ COMPROBANTE DUPLICADO: "${comprobante.trim()}" ya existe en el sistema`
          );
          mostrarError(
            `🚫 PAGO BLOQUEADO: El comprobante "${comprobante.trim()}" ya está registrado. El pago NO se procesará.`,
            "error"
          );
          setProcesandoPago(false);
          return;
        }
        console.log("✅ VERIFICACIÓN FINAL: Comprobante disponible");
      } catch (error) {
        console.error("❌ ERROR EN VERIFICACIÓN FINAL:", error);
        mostrarError(
          "❌ Error al verificar comprobante. Pago bloqueado por seguridad.",
          "error"
        );
        setProcesandoPago(false);
        return;
      }
    } else {
      setProcesandoPago(true); // Activar loading para pagos en efectivo también
    }

    // VALIDACIÓN CRÍTICA 3: Estado final antes del envío
    if (comprobanteEsDuplicado) {
      console.error("❌ BLOQUEO: Estado de comprobante duplicado activo");
      mostrarError(
        "🚫 PAGO BLOQUEADO: Comprobante duplicado detectado. El pago NO se procesará.",
        "error"
      );
      setProcesandoPago(false);
      return;
    }

    if (verificandoComprobante) {
      console.error("❌ BLOQUEO: Verificación en progreso");
      mostrarError(
        "⏳ PAGO BLOQUEADO: Verificación en progreso. Espera un momento.",
        "warning"
      );
      setProcesandoPago(false);
      return;
    }

    console.log("🚀 INICIANDO PROCESAMIENTO: Todas las validaciones pasaron");

    try {
      const pagoDataBase = {
        monto,
        tipoPago,
        comprobante: comprobante.trim(),
        imagenComprobante,
        fecha,
      };

      const notaLimpia = nota.trim();
      const pagoData =
        notaLimpia.length > 0
          ? { ...pagoDataBase, nota: notaLimpia }
          : pagoDataBase;

      console.log("📤 ENVIANDO PAGO:", pagoData);
      await onPagar(pagoData);

      console.log("✅ PAGO EXITOSO");
      setPagoExitoso(true);
      mostrarError("✅ Pago registrado exitosamente", "success");

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        resetearFormulario();
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("❌ ERROR AL PROCESAR PAGO:", error);
      setProcesandoPago(false);

      // Manejo específico de errores de comprobante duplicado
      if (
        error?.message?.includes("comprobante") ||
        error?.message?.includes("duplicado")
      ) {
        setComprobanteEsDuplicado(true);
        setMensajeValidacion(`❌ ${error.message}`);
        mostrarError(`❌ PAGO RECHAZADO: ${error.message}`, "error");
      } else {
        mostrarError(
          "❌ Error al procesar el pago. Intenta nuevamente.",
          "error"
        );
      }
    }
  };

  const tiposPago: TipoPago[] = [
    { id: "efectivo", nombre: "💵 Efectivo", descripcion: "Pago en efectivo" },
    {
      id: "transferencia",
      nombre: "🏦 Transferencia",
      descripcion: "Transferencia bancaria",
    },
    {
      id: "pago_movil",
      nombre: "📱 Pago Móvil",
      descripcion: "Pago móvil interbancario",
    },
    { id: "deposito", nombre: "🏧 Depósito", descripcion: "Depósito bancario" },
    { id: "otro", nombre: "💳 Otro", descripcion: "Otro método de pago" },
  ];

  // Si el pago fue exitoso, mostrar pantalla de confirmación
  if (pagoExitoso) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        title=''
        children={
          <div className='max-w-md mx-auto text-center py-8'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <span className='text-4xl'>✅</span>
            </div>
            <h2 className='text-2xl font-bold text-green-700 mb-4'>
              ¡Pago Registrado!
            </h2>
            <p className='text-gray-600 mb-6'>
              El pago se ha registrado exitosamente en el sistema.
            </p>
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
              <span className='text-green-600'>Cerrando...</span>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=''
      children={
        <div className='max-w-2xl mx-auto'>
          {/* Notificación de Error/Éxito */}
          {error.mostrar && (
            <div
              className={`mb-4 p-4 rounded-xl border-l-4 ${
                error.tipo === "error"
                  ? "bg-red-50 border-red-500 text-red-700"
                  : error.tipo === "warning"
                  ? "bg-yellow-50 border-yellow-500 text-yellow-700"
                  : "bg-green-50 border-green-500 text-green-700"
              }`}
            >
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{error.mensaje}</span>
                <button
                  onClick={() =>
                    setError((prev) => ({ ...prev, mostrar: false }))
                  }
                  className='text-current hover:opacity-70'
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Header del modal */}
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-gradient-to-br from-slate-700 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl text-white'>💰</span>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Registrar Pago de Cuota
            </h2>

            {cuotasAtrasadas > 0 && (
              <div className='mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium'>
                <span>⚠️</span>
                {cuotasAtrasadas} cuota{cuotasAtrasadas > 1 ? "s" : ""} atrasada
                {cuotasAtrasadas > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Información sobre pagos */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm'>
              <div className='flex items-start gap-2'>
                <span className='text-blue-600'>💡</span>
                <div className='text-blue-800'>
                  <strong>Pago de múltiples cuotas:</strong> Para pagar varias
                  cuotas, ingresa el monto total manualmente. El sistema
                  calculará automáticamente cuántas cuotas cubre tu pago.
                </div>
              </div>
            </div>

            {/* Monto personalizado */}
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-900'>
                Monto a Pagar
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold'>
                  $
                </span>
                <input
                  type='number'
                  value={monto}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMonto(Number(e.target.value))
                  }
                  disabled={procesandoPago}
                  className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-lg font-bold disabled:opacity-50 disabled:bg-gray-50'
                  step='0.01'
                  min='0.01'
                  required
                />
              </div>
              {/* Información del cálculo del pago */}
              {monto > 0 && (
                <div
                  className={`text-sm p-3 rounded-lg border ${
                    !esPagoValido
                      ? "bg-red-50 border-red-200 text-red-800"
                      : cuotasAPagar > 0
                      ? "bg-sky-50 border-sky-200 text-sky-800"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  {!esPagoValido ? (
                    <div className='flex items-start gap-2'>
                      <span>❌</span>
                      <div>
                        <strong>Monto excesivo:</strong> Solo puedes pagar hasta{" "}
                        {cuotasDisponibles} cuota
                        {cuotasDisponibles > 1 ? "s" : ""}
                        (máximo $
                        {(valorCuota * cuotasDisponibles).toLocaleString()})
                      </div>
                    </div>
                  ) : cuotasAPagar > 0 ? (
                    <div className='flex items-start gap-2'>
                      <span>💡</span>
                      <div>
                        <strong>Este pago cubre:</strong>
                        <div className='mt-1'>
                          •{" "}
                          {cuotasAPagar === 1 ? (
                            <>Cuota #{siguienteCuota} completa</>
                          ) : (
                            <>
                              {cuotasAPagar} cuotas (#{siguienteCuota} al #
                              {ultimaCuotaAPagar})
                            </>
                          )}
                          {montoParcial > 0 && (
                            <span className='text-amber-600'>
                              <br />• ${montoParcial.toLocaleString()} de abono
                              adicional para la cuota #{ultimaCuotaAPagar + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-start gap-2'>
                      <span>⚠️</span>
                      <div>
                        <strong>Pago parcial:</strong> El monto es menor a una
                        cuota completa (${valorCuota.toLocaleString()})
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fecha del pago */}
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-900'>
                Fecha del Pago
              </label>
              <input
                type='date'
                value={fecha}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFecha(e.target.value)
                }
                disabled={procesandoPago}
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:bg-gray-50'
                required
              />
            </div>

            {/* Nota del pago (opcional) */}
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-900 flex items-center gap-2'>
                <span>📝</span>
                Nota (Opcional)
              </label>
              <textarea
                value={nota}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNota(e.target.value)
                }
                disabled={procesandoPago}
                placeholder='Ej: Cliente reportó pago fallido anterior, situación especial, etc.'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none disabled:opacity-50 disabled:bg-gray-50'
                rows={3}
                maxLength={500}
              />
              <div className='text-xs text-gray-500 flex justify-between'>
                <span>
                  Útil para recordar situaciones especiales o fallos de pago
                </span>
                <span>{nota.length}/500</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className='space-y-3'>
              <label className='block text-sm font-semibold text-gray-900'>
                Método de Pago
              </label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {tiposPago.map((tipo) => (
                  <button
                    key={tipo.id}
                    type='button'
                    onClick={() => setTipoPago(tipo.id)}
                    disabled={procesandoPago}
                    className={`p-4 rounded-xl border-2 transition-all text-left disabled:opacity-50 ${
                      tipoPago === tipo.id
                        ? "border-sky-500 bg-sky-50"
                        : "border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    <div className='font-bold text-gray-900'>{tipo.nombre}</div>
                    <div className='text-sm text-gray-600'>
                      {tipo.descripcion}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos adicionales para pagos no efectivo */}
            {tipoPago !== "efectivo" && (
              <div className='space-y-4 p-4 bg-amber-50 rounded-xl border border-amber-200'>
                <h4 className='font-semibold text-amber-800 flex items-center gap-2'>
                  <span>📋</span>
                  Información del Comprobante
                </h4>

                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-900'>
                    Número de Comprobante/Referencia
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      value={comprobante}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setComprobante(e.target.value)
                      }
                      disabled={procesandoPago}
                      placeholder='Ej: 123456789'
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-colors disabled:opacity-50 disabled:bg-gray-50 ${
                        comprobanteEsDuplicado
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                          : mensajeValidacion.includes("✅")
                          ? "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50"
                          : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                      }`}
                      required
                    />
                    {verificandoComprobante && (
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                        <div className='w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
                      </div>
                    )}
                    {comprobanteEsDuplicado && (
                      <button
                        type='button'
                        onClick={() => {
                          setComprobante("");
                          setComprobanteEsDuplicado(false);
                          setMensajeValidacion("");
                        }}
                        disabled={procesandoPago}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors disabled:opacity-50'
                        title='Limpiar campo'
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {mensajeValidacion && (
                    <div
                      className={`text-sm mt-1 ${
                        comprobanteEsDuplicado
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span>{mensajeValidacion}</span>
                        {comprobanteEsDuplicado && (
                          <button
                            type='button'
                            onClick={() => {
                              setComprobante("");
                              setComprobanteEsDuplicado(false);
                              setMensajeValidacion("");
                            }}
                            disabled={procesandoPago}
                            className='ml-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors disabled:opacity-50'
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-900'>
                    Foto del Comprobante
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImagenChange}
                    disabled={procesandoPago}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:bg-gray-50'
                    required
                  />
                  {imagenComprobante && (
                    <div className='mt-2'>
                      <img
                        src={imagenComprobante}
                        alt='Comprobante'
                        className='max-w-xs rounded-lg shadow-sm'
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                disabled={procesandoPago}
                className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={
                  procesandoPago ||
                  cargando ||
                  comprobanteEsDuplicado ||
                  verificandoComprobante ||
                  (tipoPago !== "efectivo" &&
                    comprobante.trim() &&
                    !mensajeValidacion.includes("✅"))
                }
                className='flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {procesandoPago ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <span>💰</span>
                    Registrar Pago
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      }
    />
  );
}
