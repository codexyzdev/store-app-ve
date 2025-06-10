import Link from "next/link";

export default function FinanciamientoHeader() {
  return (
    <div className='flex items-center justify-between mb-6'>
      <h1 className='text-2xl font-bold'>Financiamiento a Cuota</h1>
      <Link
        href='/financiamiento-cuota/nuevo'
        className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      >
        Nuevo Financiamiento
      </Link>
    </div>
  );
}
