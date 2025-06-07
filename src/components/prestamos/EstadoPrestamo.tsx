interface EstadoPrestamoProps {
  totalCuotasVencidas: number;
  tienePrestamosActivos: boolean;
}

export default function EstadoPrestamo({
  totalCuotasVencidas,
  tienePrestamosActivos,
}: EstadoPrestamoProps) {
  if (!tienePrestamosActivos) {
    return (
      <span className='px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800'>
        Sin préstamos activos
      </span>
    );
  }

  if (totalCuotasVencidas > 0) {
    return (
      <span className='px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800'>
        Atrasado ({totalCuotasVencidas} cuota
        {totalCuotasVencidas > 1 ? "s" : ""} vencida
        {totalCuotasVencidas > 1 ? "s" : ""})
      </span>
    );
  }

  return (
    <span className='px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800'>
      Al día
    </span>
  );
}
