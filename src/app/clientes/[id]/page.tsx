export default function ClienteDetallePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>Detalle del Cliente: {params.id}</h1>
      <p>Aquí se mostrarán los detalles del cliente con ID: {params.id}.</p>
    </div>
  );
}
