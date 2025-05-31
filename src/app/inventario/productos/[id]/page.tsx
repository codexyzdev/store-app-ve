export default function ProductoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>Detalle del Producto: {params.id}</h1>
      <p>Aquí se mostrarán los detalles del producto con ID: {params.id}.</p>
    </div>
  );
}
