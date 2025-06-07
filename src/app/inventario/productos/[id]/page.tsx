export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>Detalle del Producto: {id}</h1>
      <p>Aquí se mostrarán los detalles del producto con ID: {id}.</p>
    </div>
  );
}
