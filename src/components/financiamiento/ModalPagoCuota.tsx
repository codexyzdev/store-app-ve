"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [verificandoComprobante, setVerificandoComprobante] = useState(false);
  const [comprobanteEsDuplicado, setComprobanteEsDuplicado] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  const cuotasAPagar = Math.floor(monto / valorCuota);
  const montoParcial = monto % valorCuota;

  // Calcular qué cuotas específicas se van a pagar
  const siguienteCuota = cuotasPagadas + 1;
  const ultimaCuotaAPagar = cuotasPagadas + cuotasAPagar;

  // Función para verificar comprobante duplicado
  const verificarComprobante = useCallback(
    async (numeroComprobante: string) => {
      if (!numeroComprobante.trim() || tipoPago === "efectivo") {
        setComprobanteEsDuplicado(false);
        setMensajeValidacion("");
        return;
      }

      setVerificandoComprobante(true);
      setMensajeValidacion("🔍 Verificando número de comprobante...");

      try {
        const esDuplicado = await cobrosDB.verificarComprobanteDuplicado(
          numeroComprobante.trim()
        );
        setComprobanteEsDuplicado(esDuplicado);

        if (esDuplicado) {
          setMensajeValidacion(
            `❌ El número "${numeroComprobante}" ya está registrado en el sistema. Por favor, verifica e ingresa un número diferente.`
          );
        } else {
          setMensajeValidacion(`✅ Número de comprobante disponible para usar`);
        }
      } catch (error) {
        console.error("Error al verificar comprobante:", error);
        setComprobanteEsDuplicado(false);
        setMensajeValidacion(
          "⚠️ Error al verificar comprobante. Intenta nuevamente."
        );
      } finally {
        setVerificandoComprobante(false);
      }
    },
    [tipoPago]
  );

  // Verificar comprobante cuando cambie el número o tipo de pago
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tipoPago !== "efectivo" && comprobante.trim()) {
        verificarComprobante(comprobante);
      }
    }, 500); // 500ms debounce - bueno balance entre responsividad y rendimiento

    return () => clearTimeout(timeoutId);
  }, [comprobante, tipoPago, verificarComprobante]);

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
      // Modal se está abriendo - resetear estados
      setComprobanteEsDuplicado(false);
      setMensajeValidacion("");
      setVerificandoComprobante(false);
    } else {
      // Modal se está cerrando - limpiar completamente
      setMonto(valorCuota);
      setComprobante("");
      setImagenComprobante("");
      setFecha(new Date().toISOString().split("T")[0]);
      setNota("");
      setComprobanteEsDuplicado(false);
      setMensajeValidacion("");
      setVerificandoComprobante(false);
      setTipoPago("efectivo");
    }
  }, [isOpen, valorCuota]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenComprobante(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (monto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    if (tipoPago !== "efectivo" && !comprobante.trim()) {
      alert("Debes ingresar el número de comprobante");
      return;
    }

    if (tipoPago !== "efectivo" && !imagenComprobante) {
      alert("Debes adjuntar la imagen del comprobante");
      return;
    }

    // Validar que no sea un comprobante duplicado
    if (tipoPago !== "efectivo" && comprobanteEsDuplicado) {
      alert(
        "❌ El número de comprobante ya está registrado. Por favor, usa un número diferente."
      );
      return;
    }

    // Verificar una vez más si hay validación en progreso
    if (verificandoComprobante) {
      alert("⏳ Esperando validación del comprobante. Intenta nuevamente.");
      return;
    }

    try {
      await onPagar({
        monto,
        tipoPago,
        comprobante: comprobante.trim(),
        imagenComprobante,
        fecha,
        nota: nota.trim() || undefined,
      });

      // Resetear formulario
      setMonto(valorCuota);
      setComprobante("");
      setImagenComprobante("");
      setFecha(new Date().toISOString().split("T")[0]);
      setNota("");
      setComprobanteEsDuplicado(false);
      setMensajeValidacion("");
      onClose();
    } catch (error) {
      console.error("Error al procesar pago:", error);
      // No necesitamos manejar el error aquí, se maneja en el componente padre
    }
  };

  const tiposPago = [
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title=''>
      <div className='max-w-2xl mx-auto'>
        {/* Header del modal */}
        <div className='text-center mb-6'>
          <div className='w-16 h-16 bg-gradient-to-br from-slate-700 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl text-white'>💰</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Registrar Pago de Cuota
          </h2>
          <p className='text-gray-600'>
            Valor de cuota:{" "}
            <span className='font-bold text-sky-600'>
              ${valorCuota.toLocaleString()}
            </span>
          </p>
          <p className='text-sm text-gray-500 mt-1'>
            Cuotas pagadas: {cuotasPagadas} de {prestamo.cuotas}
          </p>
          {cuotasAtrasadas > 0 && (
            <div className='mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium'>
              <span>⚠️</span>
              {cuotasAtrasadas} cuota{cuotasAtrasadas > 1 ? "s" : ""} atrasada
              {cuotasAtrasadas > 1 ? "s" : ""}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Selección rápida de monto */}
          <div className='space-y-3'>
            <label className='block text-sm font-semibold text-gray-900'>
              Selección Rápida
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              <button
                type='button'
                onClick={() => setMonto(valorCuota)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  monto === valorCuota
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-gray-200 hover:border-sky-300"
                }`}
              >
                <div className='font-bold'>${valorCuota.toLocaleString()}</div>
                <div className='text-xs text-gray-600'>
                  Cuota #{siguienteCuota}
                </div>
              </button>

              <button
                type='button'
                onClick={() => setMonto(valorCuota * 2)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  monto === valorCuota * 2
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-gray-200 hover:border-sky-300"
                }`}
              >
                <div className='font-bold'>
                  ${(valorCuota * 2).toLocaleString()}
                </div>
                <div className='text-xs text-gray-600'>
                  Cuotas #{siguienteCuota}-{siguienteCuota + 1}
                </div>
              </button>

              {cuotasAtrasadas > 0 && (
                <button
                  type='button'
                  onClick={() => setMonto(valorCuota * cuotasAtrasadas)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    monto === valorCuota * cuotasAtrasadas
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-red-200 hover:border-red-300"
                  }`}
                >
                  <div className='font-bold'>
                    ${(valorCuota * cuotasAtrasadas).toLocaleString()}
                  </div>
                  <div className='text-xs text-red-600'>
                    {cuotasAtrasadas} cuota{cuotasAtrasadas > 1 ? "s" : ""}{" "}
                    atrasada{cuotasAtrasadas > 1 ? "s" : ""}
                  </div>
                </button>
              )}
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
                onChange={(e) => setMonto(Number(e.target.value))}
                className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-lg font-bold'
                step='0.01'
                min='0.01'
                required
              />
            </div>
            {cuotasAPagar > 0 && (
              <div className='text-sm text-gray-600 bg-sky-50 p-3 rounded-lg'>
                <span className='font-medium'>💡 Este monto cubre:</span>
                <div className='mt-1'>
                  •{" "}
                  {cuotasAPagar === 1 ? (
                    <>Cuota #{siguienteCuota}</>
                  ) : (
                    <>
                      Cuotas #{siguienteCuota} al #{ultimaCuotaAPagar}
                    </>
                  )}
                  {montoParcial > 0 && (
                    <span className='text-amber-600'>
                      {" "}
                      + ${montoParcial.toLocaleString()} de abono parcial
                    </span>
                  )}
                </div>
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
              onChange={(e) => setFecha(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
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
              onChange={(e) => setNota(e.target.value)}
              placeholder='Ej: Cliente reportó pago fallido anterior, situación especial, etc.'
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none'
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
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
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
                    onChange={(e) => setComprobante(e.target.value)}
                    placeholder='Ej: 123456789'
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-colors ${
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
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors'
                      title='Limpiar campo'
                    >
                      ✕
                    </button>
                  )}
                </div>
                {mensajeValidacion && (
                  <div
                    className={`text-sm mt-1 ${
                      comprobanteEsDuplicado ? "text-red-600" : "text-green-600"
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
                          className='ml-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors'
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
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500'
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
              className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors'
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={
                cargando || comprobanteEsDuplicado || verificandoComprobante
              }
              className='flex-1 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {cargando ? (
                <>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Procesando...
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
    </Modal>
  );
}
