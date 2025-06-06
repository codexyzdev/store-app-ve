"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  prestamosDB,
  Prestamo,
  clientesDB,
  Cliente,
  inventarioDB,
  Producto,
  cobrosDB,
  Cobro,
} from "@/lib/firebase/database";

export default function DetallePrestamoPage() {
  const params = useParams();
  const router = useRouter();
  const prestamoId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prestamoId) return;
    prestamosDB.obtener(prestamoId).then((p) => {
      setPrestamo(p);
      if (p) {
        clientesDB.obtener(p.clienteId).then(setCliente);
        inventarioDB.obtener(p.productoId).then(setProducto);
      }
      setLoading(false);
    });
    cobrosDB.suscribir((allCobros) => {
      setCobros(allCobros.filter((c) => c.prestamoId === prestamoId));
    });
  }, [prestamoId]);

  if (loading || !prestamo) {
    return (
      <div className='flex justify-center items-center min-h-[300px]'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <button
        className='mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200'
        onClick={() => router.back()}
      >
        ← Volver
      </button>
      <h1 className='text-2xl font-bold mb-2'>Detalle del Préstamo</h1>
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Cliente</h2>
        <p>
          <span className='font-medium'>Nombre:</span> {cliente?.nombre || "-"}
        </p>
        <p>
          <span className='font-medium'>Cédula:</span> {cliente?.cedula || "-"}
        </p>
        <p>
          <span className='font-medium'>Teléfono:</span>{" "}
          {cliente?.telefono || "-"}
        </p>
      </div>
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Producto</h2>
        <p>
          <span className='font-medium'>Nombre:</span> {producto?.nombre || "-"}
        </p>
        <p>
          <span className='font-medium'>Precio:</span> $
          {producto?.precio?.toFixed(2) || "-"}
        </p>
      </div>
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Préstamo</h2>
        <p>
          <span className='font-medium'>Monto:</span> $
          {prestamo.monto.toFixed(2)}
        </p>
        <p>
          <span className='font-medium'>Cuotas:</span> {prestamo.cuotas}
        </p>
        <p>
          <span className='font-medium'>Estado:</span> {prestamo.estado}
        </p>
        <p>
          <span className='font-medium'>Fecha de inicio:</span>{" "}
          {new Date(prestamo.fechaInicio).toLocaleDateString()}
        </p>
        <p>
          <span className='font-medium'>Tipo de venta:</span>{" "}
          {prestamo.tipoVenta}
        </p>
        {prestamo.descripcion && (
          <p>
            <span className='font-medium'>Descripción:</span>{" "}
            {prestamo.descripcion}
          </p>
        )}
      </div>
      <div className='bg-white rounded-lg shadow p-4'>
        <h2 className='text-lg font-semibold mb-2'>Pagos realizados</h2>
        {cobros.length === 0 ? (
          <p className='text-gray-500'>
            No hay pagos registrados para este préstamo.
          </p>
        ) : (
          <ul className='divide-y divide-gray-200'>
            {cobros
              .sort((a, b) => b.fecha - a.fecha)
              .map((cobro) => (
                <li
                  key={cobro.id}
                  className='py-2 flex justify-between items-center'
                >
                  <span>{new Date(cobro.fecha).toLocaleDateString()}</span>
                  <span className='font-semibold text-indigo-700'>
                    ${cobro.monto.toFixed(2)}
                  </span>
                  <span className='text-xs text-gray-500'>{cobro.tipo}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
