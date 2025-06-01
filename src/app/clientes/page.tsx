"use client";

import { useState, useEffect } from "react";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const unsubscribe = clientesDB.suscribir((clientes) => {
      setClientes(clientes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono.includes(busqueda) ||
      cliente.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;

    try {
      await clientesDB.eliminar(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el cliente"
      );
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <div className='sm:flex sm:items-center sm:justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Clientes</h1>
          <p className='mt-2 text-sm text-gray-700'>
            Lista de todos los clientes registrados en el sistema
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <Link
            href='/clientes/nuevo'
            className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-md'>
          {error}
        </div>
      )}

      <div className='mb-4'>
        <div className='relative rounded-md shadow-sm'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='text'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder='Buscar por nombre, teléfono o dirección...'
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
      </div>

      <div className='bg-white shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200'>
          {clientesFiltrados.map((cliente) => (
            <li key={cliente.id}>
              <div className='px-4 py-4 sm:px-6 hover:bg-indigo-50 transition-colors duration-150 rounded-lg flex items-center justify-between'>
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <div className='w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg'>
                    {cliente.nombre[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className='text-base font-bold text-gray-900'>
                      {cliente.nombre}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {cliente.telefono}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {cliente.direccion}
                    </div>
                  </div>
                </div>
                <div className='ml-4 flex-shrink-0 flex space-x-2'>
                  <Link
                    href={`/clientes/${cliente.id}`}
                    className='inline-flex items-center p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    title='Editar'
                  >
                    <PencilIcon className='h-5 w-5' />
                  </Link>
                  <button
                    onClick={() => handleEliminar(cliente.id)}
                    className='inline-flex items-center p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    title='Eliminar'
                  >
                    <TrashIcon className='h-5 w-5' />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {clientesFiltrados.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-sm'>
            {busqueda
              ? "No se encontraron clientes que coincidan con la búsqueda"
              : "No hay clientes registrados"}
          </p>
        </div>
      )}
    </div>
  );
}
