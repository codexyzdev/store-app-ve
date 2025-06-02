import React from "react";

interface AbonarCuotaFormProps {
  monto: number;
  loading: boolean;
  onChange: (valor: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string;
}

const AbonarCuotaForm: React.FC<AbonarCuotaFormProps> = ({
  monto,
  loading,
  onChange,
  onSubmit,
  error,
}) => {
  return (
    <form
      className='mt-2 flex flex-col sm:flex-row gap-2 items-start w-full max-w-xs'
      onSubmit={onSubmit}
    >
      <input
        type='number'
        min='0.01'
        step='0.01'
        className={`border rounded px-2 py-1 w-full sm:w-32 ${
          error ? "border-red-500" : ""
        }`}
        value={Number.isFinite(monto) ? monto : ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        required
        placeholder='Monto a abonar'
      />
      <button
        type='submit'
        className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed text-base'
        disabled={loading}
      >
        {loading ? "Abonando..." : "Confirmar abono"}
      </button>
      {error && <span className='text-red-500 text-xs mt-1'>{error}</span>}
    </form>
  );
};

export default AbonarCuotaForm;
