"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import { inventarioDB, Producto } from "@/lib/firebase/database";
import { prestamosDB } from "@/lib/firebase/database";

export default function NuevoPrestamoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    cliente: "",
    producto: "",
    monto: "",
    cuotas: "",
    fechaInicio: "",
    descripcion: "",
  });
  const [busquedaProducto, setBusquedaProducto] = useState("");

  useEffect(() => {
    const unsubscribeClientes = clientesDB.suscribir((clientes) => {
      setClientes(clientes);
    });
    const unsubscribeProductos = inventarioDB.suscribir((productos) => {
      setProductos(productos);
    });
    return () => {
      unsubscribeClientes();
      unsubscribeProductos();
    };
  }, []);

  useEffect(() => {
    if (productoSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        producto: productoSeleccionado.id,
        monto: productoSeleccionado.precio.toString(),
      }));
    }
  }, [productoSeleccionado]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Validar selección de producto y stock
    if (!productoSeleccionado) {
      alert("Selecciona un producto del inventario.");
      setLoading(false);
      return;
    }
    if (productoSeleccionado.stock < 1) {
      alert("No hay stock suficiente para este producto.");
      setLoading(false);
      return;
    }

    try {
      // Descontar stock del producto
      await inventarioDB.actualizarStock(productoSeleccionado.id, -1);

      // Crear el préstamo
      await prestamosDB.crear({
        clienteId: formData.cliente,
        monto: parseFloat(formData.monto),
        cuotas: parseInt(formData.cuotas, 10),
        fechaInicio: new Date(formData.fechaInicio).getTime(),
        estado: "activo",
        productoId: productoSeleccionado.id,
        descripcion: formData.descripcion || "",
      });

      router.push("/prestamos");
    } catch (error) {
      if (error instanceof Error) {
        alert("Error: " + error.message);
        console.error(error);
      } else {
        alert("Error desconocido al crear el préstamo o descontar stock.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>
          Nuevo Préstamo
        </h1>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Cliente */}
            <div>
              <label
                htmlFor='cliente'
                className='block text-sm font-medium text-gray-700'
              >
                Cliente
              </label>
              <select
                id='cliente'
                name='cliente'
                required
                value={formData.cliente}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, cliente: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              >
                <option value=''>Seleccionar cliente</option>
                {clientes.map((cliente: Cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.telefono}
                  </option>
                ))}
              </select>
            </div>
            {/* Producto (búsqueda y selección) */}
            <div>
              <label
                htmlFor='producto'
                className='block text-sm font-medium text-gray-700'
              >
                Producto del inventario
              </label>
              <input
                type='text'
                id='producto-busqueda'
                placeholder='Buscar producto...'
                value={busquedaProducto}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBusquedaProducto(e.target.value)
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                autoComplete='off'
              />
              {busquedaProducto && (
                <div className='border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto z-10 absolute w-full'>
                  {productosFiltrados.length === 0 && (
                    <div className='p-2 text-gray-500 text-sm'>
                      No hay productos
                    </div>
                  )}
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      className={`p-2 cursor-pointer hover:bg-indigo-100 ${
                        productoSeleccionado?.id === producto.id
                          ? "bg-indigo-50"
                          : ""
                      }`}
                      onClick={() => {
                        setProductoSeleccionado(producto);
                        setBusquedaProducto(producto.nombre);
                      }}
                    >
                      <span className='font-medium'>{producto.nombre}</span>{" "}
                      <span className='text-xs text-gray-500'>
                        ({producto.stock})
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* Mostrar info del producto seleccionado */}
              {productoSeleccionado && (
                <div className='mt-2 p-2 border rounded bg-gray-50'>
                  <div className='font-semibold'>
                    {productoSeleccionado.nombre}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Precio: ${productoSeleccionado.precio.toFixed(2)}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Stock disponible: {productoSeleccionado.stock}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {productoSeleccionado.descripcion}
                  </div>
                </div>
              )}
            </div>
            {/* Monto del préstamo */}
            <div>
              <label
                htmlFor='monto'
                className='block text-sm font-medium text-gray-700'
              >
                Monto del préstamo
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <span className='text-gray-500 sm:text-sm'>$</span>
                </div>
                <input
                  type='number'
                  name='monto'
                  id='monto'
                  required
                  min='0'
                  step='0.01'
                  value={formData.monto}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, monto: e.target.value })
                  }
                  className='pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                  placeholder='0.00'
                />
              </div>
            </div>
            {/* Cuotas del préstamo */}
            <div>
              <label
                htmlFor='cuotas'
                className='block text-sm font-medium text-gray-700'
              >
                Cuotas del préstamo
              </label>
              <input
                type='number'
                name='cuotas'
                id='cuotas'
                required
                min='1'
                value={formData.cuotas}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, cuotas: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
                placeholder='Ej: 12'
              />
            </div>
            {/* Fecha de inicio del préstamo */}
            <div>
              <label
                htmlFor='fechaInicio'
                className='block text-sm font-medium text-gray-700'
              >
                Inicio del préstamo
              </label>
              <input
                type='date'
                name='fechaInicio'
                id='fechaInicio'
                required
                value={formData.fechaInicio}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, fechaInicio: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              />
            </div>
          </div>
          {/* Descripción */}
          <div>
            <label
              htmlFor='descripcion'
              className='block text-sm font-medium text-gray-700'
            >
              Descripción
            </label>
            <textarea
              id='descripcion'
              name='descripcion'
              rows={3}
              value={formData.descripcion}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
              placeholder='Descripción del préstamo...'
            />
          </div>
          {/* Botones */}
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => router.back()}
              className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? "Guardando..." : "Crear Préstamo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
