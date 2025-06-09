"use client";

import { useState, useEffect } from "react";
import { inventarioDB, Producto } from "@/lib/firebase/database";

interface CategoriaStats {
  nombre: string;
  productos: number;
  stockTotal: number;
  valorTotal: number;
}

export default function CategoriasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<string | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  useEffect(() => {
    const unsubscribe = inventarioDB.suscribir((productos) => {
      setProductos(productos);
      calcularEstadisticasCategorias(productos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calcularEstadisticasCategorias = (productos: Producto[]) => {
    const categoriasMap = new Map<string, CategoriaStats>();

    productos.forEach((producto) => {
      const categoria = producto.categoria;
      if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, {
          nombre: categoria,
          productos: 0,
          stockTotal: 0,
          valorTotal: 0,
        });
      }

      const stats = categoriasMap.get(categoria)!;
      stats.productos += 1;
      stats.stockTotal += producto.stock;
      stats.valorTotal += producto.stock * producto.precio;
    });

    setCategorias(
      Array.from(categoriasMap.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
    );
  };

  const handleAgregarCategoria = () => {
    // En un caso real, aquí crearías una categoría en la base de datos
    // Por ahora solo simularemos
    setModalOpen(false);
    setNuevaCategoria("");
  };

  const handleEliminarCategoria = (categoria: string) => {
    const productosEnCategoria = productos.filter(
      (p) => p.categoria === categoria
    );
    if (productosEnCategoria.length > 0) {
      alert(
        `No se puede eliminar la categoría "${categoria}" porque tiene ${productosEnCategoria.length} productos asociados.`
      );
      return;
    }

    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la categoría "${categoria}"?`
      )
    ) {
      // Aquí eliminarías la categoría de la base de datos
      console.log(`Eliminando categoría: ${categoria}`);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600 font-medium'>
            Cargando categorías...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='sm:flex sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
                📁 Categorías de Inventario
              </h1>
              <p className='mt-2 text-sm text-gray-600'>
                Gestiona las categorías de productos y visualiza estadísticas
              </p>
            </div>
            <div className='mt-4 sm:mt-0'>
              <button
                onClick={() => setModalOpen(true)}
                className='inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 gap-2'
              >
                ➕ Nueva Categoría
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center'>
                  <span className='text-indigo-600 font-bold text-lg'>📁</span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Total Categorías
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {categorias.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center'>
                  <span className='text-green-600 font-bold text-lg'>📦</span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Total Productos
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {productos.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <span className='text-blue-600 font-bold text-lg'>📊</span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Stock Total</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {categorias
                    .reduce((sum, cat) => sum + cat.stockTotal, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <span className='text-purple-600 font-bold text-sm'>💰</span>
                </div>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>Valor Total</p>
                <p className='text-2xl font-bold text-gray-900'>
                  $
                  {categorias
                    .reduce((sum, cat) => sum + cat.valorTotal, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de categorías */}
        <div className='bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-medium text-gray-900'>
              Categorías Registradas
            </h3>
          </div>

          {categorias.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='text-6xl mb-4'>📁</div>
              <h3 className='mt-4 text-lg font-medium text-gray-900'>
                No hay categorías
              </h3>
              <p className='mt-2 text-sm text-gray-500'>
                Las categorías se crean automáticamente al agregar productos
              </p>
            </div>
          ) : (
            <div className='overflow-hidden'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
                {categorias.map((categoria) => (
                  <div
                    key={categoria.nombre}
                    className='bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center'>
                        <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center'>
                          <span className='text-indigo-600 text-lg'>📁</span>
                        </div>
                        <div className='ml-3'>
                          <h4 className='text-lg font-semibold text-gray-900'>
                            {categoria.nombre}
                          </h4>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => {
                            setEditingCategoria(categoria.nombre);
                            setNuevaCategoria(categoria.nombre);
                            setModalOpen(true);
                          }}
                          className='p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                          title='Editar categoría'
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleEliminarCategoria(categoria.nombre)
                          }
                          className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                          title='Eliminar categoría'
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-4 text-center'>
                      <div>
                        <p className='text-2xl font-bold text-indigo-600'>
                          {categoria.productos}
                        </p>
                        <p className='text-xs text-gray-500'>Productos</p>
                      </div>
                      <div>
                        <p className='text-2xl font-bold text-green-600'>
                          {categoria.stockTotal}
                        </p>
                        <p className='text-xs text-gray-500'>Stock</p>
                      </div>
                      <div>
                        <p className='text-2xl font-bold text-purple-600'>
                          ${categoria.valorTotal.toLocaleString()}
                        </p>
                        <p className='text-xs text-gray-500'>Valor</p>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <a
                        href={`/inventario?categoria=${encodeURIComponent(
                          categoria.nombre
                        )}`}
                        className='w-full inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors'
                      >
                        Ver productos
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar/editar categoría */}
      {modalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
            </h3>
            <div className='mb-4'>
              <label
                htmlFor='categoria'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Nombre de la categoría
              </label>
              <input
                id='categoria'
                type='text'
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='Ej: Electrónicos, Ropa, etc.'
              />
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingCategoria(null);
                  setNuevaCategoria("");
                }}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarCategoria}
                disabled={!nuevaCategoria.trim()}
                className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {editingCategoria ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
