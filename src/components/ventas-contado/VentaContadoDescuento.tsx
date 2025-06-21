import { ChangeEvent, useState } from "react";

interface VentaContadoDescuentoProps {
  montoOriginal: number;
  onDescuentoChange: (descuento: {
    tipo: "porcentaje" | "monto";
    valor: number;
    montoDescuento: number;
  }) => void;
}

export const VentaContadoDescuento = ({
  montoOriginal,
  onDescuentoChange,
}: VentaContadoDescuentoProps) => {
  const [tipoDescuento, setTipoDescuento] = useState<"porcentaje" | "monto">(
    "porcentaje"
  );
  const [valorDescuento, setValorDescuento] = useState<string>("");
  const [aplicarDescuento, setAplicarDescuento] = useState(false);

  const calcularDescuento = (valor: string, tipo: "porcentaje" | "monto") => {
    const valorNum = parseFloat(valor) || 0;

    if (valorNum <= 0) return 0;

    if (tipo === "porcentaje") {
      if (valorNum > 100) return 0; // No permitir más del 100%
      return (montoOriginal * valorNum) / 100;
    } else {
      if (valorNum > montoOriginal) return montoOriginal; // No permitir descuento mayor al monto
      return valorNum;
    }
  };

  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setValorDescuento(valor);

    if (aplicarDescuento) {
      const montoDescuento = calcularDescuento(valor, tipoDescuento);
      onDescuentoChange({
        tipo: tipoDescuento,
        valor: parseFloat(valor) || 0,
        montoDescuento,
      });
    }
  };

  const handleTipoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nuevoTipo = e.target.value as "porcentaje" | "monto";
    setTipoDescuento(nuevoTipo);

    if (aplicarDescuento && valorDescuento) {
      const montoDescuento = calcularDescuento(valorDescuento, nuevoTipo);
      onDescuentoChange({
        tipo: nuevoTipo,
        valor: parseFloat(valorDescuento) || 0,
        montoDescuento,
      });
    }
  };

  const handleAplicarDescuentoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const aplicar = e.target.checked;
    setAplicarDescuento(aplicar);

    if (aplicar && valorDescuento) {
      const montoDescuento = calcularDescuento(valorDescuento, tipoDescuento);
      onDescuentoChange({
        tipo: tipoDescuento,
        valor: parseFloat(valorDescuento) || 0,
        montoDescuento,
      });
    } else {
      onDescuentoChange({
        tipo: tipoDescuento,
        valor: 0,
        montoDescuento: 0,
      });
    }
  };

  const montoDescuento = aplicarDescuento
    ? calcularDescuento(valorDescuento, tipoDescuento)
    : 0;
  const montoFinal = montoOriginal - montoDescuento;

  if (montoOriginal <= 0) {
    return null;
  }

  return (
    <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center'>
          <span className='text-amber-600 font-bold text-sm sm:text-base'>
            💰
          </span>
        </div>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
          Descuento (Opcional)
        </h3>
      </div>

      {/* Checkbox para aplicar descuento */}
      <div className='flex items-center gap-3 mb-4'>
        <input
          type='checkbox'
          id='aplicar-descuento'
          checked={aplicarDescuento}
          onChange={handleAplicarDescuentoChange}
          className='w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2'
        />
        <label
          htmlFor='aplicar-descuento'
          className='text-sm font-medium text-gray-700 cursor-pointer'
        >
          Aplicar descuento a esta venta
        </label>
      </div>

      {aplicarDescuento && (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Tipo de descuento */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Tipo de Descuento
              </label>
              <select
                value={tipoDescuento}
                onChange={handleTipoChange}
                className='w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base'
              >
                <option value='porcentaje'>Porcentaje (%)</option>
                <option value='monto'>Monto Fijo ($)</option>
              </select>
            </div>

            {/* Valor del descuento */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                {tipoDescuento === "porcentaje"
                  ? "Porcentaje (%)"
                  : "Monto ($)"}
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500'>
                  {tipoDescuento === "porcentaje" ? "%" : "$"}
                </span>
                <input
                  type='number'
                  value={valorDescuento}
                  onChange={handleValorChange}
                  min='0'
                  max={
                    tipoDescuento === "porcentaje"
                      ? "100"
                      : montoOriginal.toString()
                  }
                  step={tipoDescuento === "porcentaje" ? "0.1" : "1"}
                  placeholder={tipoDescuento === "porcentaje" ? "0.0" : "0"}
                  className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm sm:text-base'
                />
              </div>
            </div>
          </div>

          {/* Resumen del descuento */}
          {montoDescuento > 0 && (
            <div className='bg-white rounded-lg p-4 border border-amber-200'>
              <h4 className='font-semibold text-gray-900 mb-3'>
                Resumen del Descuento
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Monto Original:</span>
                  <span className='font-semibold'>
                    ${montoOriginal.toFixed(0)}
                  </span>
                </div>
                <div className='flex justify-between text-amber-600'>
                  <span>Descuento:</span>
                  <span className='font-semibold'>
                    -${montoDescuento.toFixed(0)}
                    {tipoDescuento === "porcentaje" && ` (${valorDescuento}%)`}
                  </span>
                </div>
                <div className='flex justify-between border-t pt-2 text-base font-bold text-gray-900'>
                  <span>Total a Pagar:</span>
                  <span className='text-green-600'>
                    ${montoFinal.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
