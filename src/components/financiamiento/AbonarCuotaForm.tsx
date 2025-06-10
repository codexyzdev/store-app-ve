"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { subirImagenCliente } from "@/lib/firebase/storage";
import Modal from "@/components/Modal";

interface AbonarCuotaFormProps {
  isOpen: boolean;
  onClose: () => void;
  montoPrestamo: number;
  cuotasTotales: number;
  loading: boolean;
  onSubmit: (data: {
    monto: number;
    tipoPago: string;
    comprobante: string;
    fecha: string;
    imagenComprobante?: string;
  }) => Promise<void>;
  error?: string;
  numeroCuota?: number;
  totalCuotas?: number;
}

const AbonarCuotaForm = ({
  isOpen,
  onClose,
  montoPrestamo,
  cuotasTotales,
  loading,
  onSubmit,
  error,
  numeroCuota,
  totalCuotas,
}: AbonarCuotaFormProps) => {
  const cuota = cuotasTotales > 0 ? montoPrestamo / cuotasTotales : 0;
  const [formData, setFormData] = useState({
    tipoPago: "efectivo",
    comprobante: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [imagenComprobante, setImagenComprobante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [montoInput, setMontoInput] = useState(cuota);
  const [montoTouched, setMontoTouched] = useState(false);

  const limpiarFormulario = () => {
    setFormData({
      tipoPago: "efectivo",
      comprobante: "",
      fecha: new Date().toISOString().split("T")[0],
    });
    setImagenComprobante(null);
    setPreviewUrl(null);
    setMontoInput(cuota);
    setMontoTouched(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (isOpen) setMontoInput(cuota);
  }, [isOpen, cuota]);

  const montoInvalido =
    !montoInput ||
    isNaN(montoInput) ||
    montoInput < cuota ||
    montoInput % cuota !== 0;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMontoTouched(true);
    let imagenUrl: string | undefined = undefined;

    if (formData.tipoPago !== "efectivo") {
      if (!imagenComprobante) {
        alert("Debes adjuntar el comprobante de pago.");
        return;
      }
      try {
        imagenUrl = await subirImagenCliente(
          `comprobantes/${Date.now()}`,
          imagenComprobante
        );
      } catch (err) {
        console.error("Error al subir imagen:", err);
      }
    }

    await onSubmit({
      monto: montoInput,
      ...formData,
      imagenComprobante: imagenUrl,
    });
    limpiarFormulario();
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setImagenComprobante(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const acortarNombreArchivo = (
    nombreArchivo: string,
    maxLength: number = 30
  ) => {
    if (nombreArchivo.length <= maxLength) return nombreArchivo;
    const extension = nombreArchivo.split(".").pop();
    const nombreSinExtension = nombreArchivo.substring(
      0,
      nombreArchivo.lastIndexOf(".")
    );
    const longitudPermitida =
      maxLength - (extension ? extension.length + 4 : 3);
    return `${nombreSinExtension.substring(0, longitudPermitida)}...${
      extension ? `.${extension}` : ""
    }`;
  };

  const removerImagen = () => {
    setImagenComprobante(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCuotasAPagar = () => {
    return Math.round(montoInput / cuota);
  };

  const tiposPago = [
    {
      value: "efectivo",
      label: "💵 Efectivo",
      color: "bg-green-50 text-green-700",
    },
    {
      value: "pago_movil",
      label: "📱 Pago Móvil",
      color: "bg-blue-50 text-blue-700",
    },
    {
      value: "zelle",
      label: "💳 Zelle",
      color: "bg-purple-50 text-purple-700",
    },
    {
      value: "transferencia",
      label: "🏦 Transferencia",
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='💰 Registrar Abono'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Header con información de la cuota */}
        <div className='bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-base font-semibold text-indigo-900'>
                {numeroCuota && totalCuotas
                  ? `Próxima cuota: ${numeroCuota} de ${totalCuotas}`
                  : "Abono de Préstamo"}
              </h3>
              <p className='text-sm text-indigo-600'>
                Valor por cuota:{" "}
                <span className='font-bold'>${cuota.toFixed(0)}</span>
              </p>
              {montoInput > 0 && getCuotasAPagar() > 1 && numeroCuota && (
                <p className='text-xs text-indigo-500 mt-1'>
                  💡 Pagará cuotas {numeroCuota} a{" "}
                  {numeroCuota + getCuotasAPagar() - 1}
                </p>
              )}
            </div>
            <div className='text-right'>
              <div className='text-xl'>📊</div>
            </div>
          </div>
        </div>

        {/* Errores */}
        {montoInvalido && montoTouched && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='text-red-500'>⚠️</span>
              <span>
                El monto debe ser múltiplo del valor de la cuota ($
                {cuota.toFixed(0)})
              </span>
            </div>
          </div>
        )}

        {/* Campo de monto mejorado */}
        <div className='space-y-2'>
          <label className='block text-sm font-semibold text-gray-700'>
            Monto a Abonar <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 text-base font-semibold'>$</span>
            </div>
            <input
              type='number'
              min={cuota}
              step={cuota}
              className='pl-7 w-full px-3 py-2.5 text-base font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
              value={montoInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                let value = e.target.value;
                if (/^0+[0-9]+/.test(value)) {
                  value = value.replace(/^0+/, "");
                }
                setMontoInput(Number(value));
                setMontoTouched(true);
              }}
              onBlur={() => setMontoTouched(true)}
              placeholder='0.00'
            />
          </div>
          {montoInput > 0 && (
            <div className='text-sm text-gray-600'>
              <span className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs'>
                📝 Pagará {getCuotasAPagar()} cuota
                {getCuotasAPagar() > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Tipo de pago mejorado */}
        <div className='space-y-2'>
          <label className='block text-sm font-semibold text-gray-700'>
            Tipo de Pago <span className='text-red-500'>*</span>
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {tiposPago.map((tipo) => (
              <label
                key={tipo.value}
                className={`relative flex items-center justify-center p-2.5 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.tipoPago === tipo.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type='radio'
                  name='tipoPago'
                  value={tipo.value}
                  checked={formData.tipoPago === tipo.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, tipoPago: e.target.value })
                  }
                  className='sr-only'
                />
                <span
                  className={`text-sm font-medium ${
                    formData.tipoPago === tipo.value
                      ? "text-indigo-700"
                      : "text-gray-700"
                  }`}
                >
                  {tipo.label}
                </span>
                {formData.tipoPago === tipo.value && (
                  <div className='absolute top-1 right-1'>
                    <span className='text-indigo-500 text-sm'>✓</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Campos adicionales en grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {/* Número de comprobante */}
          <div className='space-y-2'>
            <label className='block text-sm font-semibold text-gray-700'>
              Número de Comprobante
              {formData.tipoPago !== "efectivo" && (
                <span className='text-red-500'> *</span>
              )}
            </label>
            <input
              type='text'
              value={formData.comprobante}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, comprobante: e.target.value })
              }
              className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500'
              placeholder={
                formData.tipoPago === "efectivo"
                  ? "No requerido"
                  : "Ej: 123456789"
              }
              disabled={formData.tipoPago === "efectivo"}
              required={formData.tipoPago !== "efectivo"}
            />
          </div>

          {/* Fecha del pago */}
          <div className='space-y-2'>
            <label className='block text-sm font-semibold text-gray-700'>
              Fecha del Pago <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              value={formData.fecha}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
            />
          </div>
        </div>

        {/* Sección de comprobante mejorada */}
        {formData.tipoPago !== "efectivo" && (
          <div className='space-y-3'>
            <label className='block text-sm font-semibold text-gray-700'>
              Comprobante de Pago <span className='text-red-500'>*</span>
            </label>

            {!imagenComprobante ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className='w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group'
              >
                <div className='flex flex-col items-center gap-2'>
                  <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors'>
                    <span className='text-lg'>📄</span>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-gray-700 group-hover:text-indigo-700'>
                      Adjuntar comprobante de pago
                    </p>
                    <p className='text-xs text-gray-500'>PNG, JPG hasta 10MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='border border-gray-200 rounded-lg p-3 bg-gray-50'>
                <div className='flex items-center gap-3'>
                  {previewUrl && (
                    <div className='flex-shrink-0'>
                      <img
                        src={previewUrl}
                        alt='Preview del comprobante'
                        className='w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm'
                      />
                    </div>
                  )}

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-green-500 text-sm'>✅</span>
                      <span className='text-sm font-medium text-gray-900'>
                        Comprobante adjunto
                      </span>
                    </div>
                    <p
                      className='text-xs text-gray-600 truncate'
                      title={imagenComprobante.name}
                    >
                      {acortarNombreArchivo(imagenComprobante.name)}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {(imagenComprobante.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='px-2 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors'
                    >
                      Cambiar
                    </button>
                    <button
                      type='button'
                      onClick={removerImagen}
                      className='px-2 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors'
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
              required={formData.tipoPago !== "efectivo"}
            />
          </div>
        )}

        {/* Botones de acción mejorados */}
        <div className='flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200'>
          <button
            type='button'
            onClick={onClose}
            disabled={loading}
            className='flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading || montoInvalido}
            className='flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Procesando...
              </>
            ) : (
              <>
                <span>💰</span>
                Confirmar Abono
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AbonarCuotaForm;
