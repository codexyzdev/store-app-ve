export default function EstadisticasPage() {
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>Estadísticas</h1>
      <p>Aquí se mostrarán los reportes y estadísticas del sistema.</p>

      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <div className='border rounded p-4 shadow-sm'>
          <h2 className='text-lg font-semibold'>Ventas Mensuales</h2>
          <p>Gráfico de ventas por mes.</p>
        </div>

        <div className='border rounded p-4 shadow-sm'>
          <h2 className='text-lg font-semibold'>Productos Más Vendidos</h2>
          <p>Listado de productos populares.</p>
        </div>

        <div className='border rounded p-4 shadow-sm'>
          <h2 className='text-lg font-semibold'>Estado de Préstamos</h2>
          <p>Resumen de préstamos activos y vencidos.</p>
        </div>
      </div>
    </div>
  );
}
