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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Registrar Abono'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {montoInvalido && montoTouched && (
          <div className='p-3 bg-red-50 text-red-700 rounded-lg text-sm'>
            Ingresa un monto válido
          </div>
        )}

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Monto a abonar
          </label>
          {numeroCuota && totalCuotas && (
            <div className='text-sm text-gray-600 mb-2'>
              Cuota {numeroCuota} de {totalCuotas}
            </div>
          )}
          <div className='relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-500 sm:text-sm'>$</span>
            </div>
            <input
              type='number'
              min={cuota}
              step={cuota}
              className='pl-7 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
              value={montoInput}
              onChange={(e) => {
                let value = e.target.value;
                if (/^0+[0-9]+/.test(value)) {
                  value = value.replace(/^0+/, "");
                }
                setMontoInput(Number(value));
                setMontoTouched(true);
              }}
              onBlur={() => setMontoTouched(true)}
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Tipo de pago
          </label>
          <select
            value={formData.tipoPago}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, tipoPago: e.target.value })
            }
            className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
          >
            <option value='efectivo'>Efectivo</option>
            <option value='pago_movil'>Pago Móvil</option>
            <option value='zelle'>Zelle</option>
            <option value='transferencia'>Transferencia Bancaria</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Número de comprobante
          </label>
          <input
            type='text'
            value={formData.comprobante}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, comprobante: e.target.value })
            }
            className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
            placeholder='Ingrese el número de comprobante'
            disabled={formData.tipoPago === "efectivo"}
            required={formData.tipoPago !== "efectivo"}
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Fecha del pago
          </label>
          <input
            type='date'
            value={formData.fecha}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            className='block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Comprobante de pago
          </label>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              disabled={formData.tipoPago === "efectivo"}
            >
              Seleccionar imagen
            </button>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
              disabled={formData.tipoPago === "efectivo"}
              required={formData.tipoPago !== "efectivo"}
            />
            {imagenComprobante && (
              <span className='text-xs text-gray-700'>
                {imagenComprobante.name}
              </span>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-3 mt-6'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={loading || montoInvalido}
            className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? "Procesando..." : "Confirmar abono"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AbonarCuotaForm;
