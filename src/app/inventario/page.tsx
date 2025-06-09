"use client";

import { useState, useEffect } from "react";
import {
  inventarioDB,
  Producto as ProductoType,
} from "@/lib/firebase/database";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CubeIcon,
  TagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { ProductoModal } from "@/components/inventario/ProductoModal";
import { InventarioCard } from "@/components/inventario/InventarioCard";
import { InventarioStats } from "@/components/inventario/InventarioStats";

type ViewMode = "grid" | "list";
type TabType = "productos" | "categorias" | "proveedores" | "movimientos";

export default function InventarioPage() {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    ProductoType | undefined
  >();

  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<TabType>("productos");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [sortBy, setSortBy] = useState<
    "nombre" | "stock" | "precio" | "categoria"
  >("nombre");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const unsubscribe = inventarioDB.suscribir((productos) => {
      setProductos(productos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = productos.filter((producto) => {
      const matchesSearch =
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filterCategory || producto.categoria === filterCategory;
      const matchesStock =
        !filterStock ||
        (filterStock === "bajo" &&
          producto.stock <= (producto.stockMinimo || 5)) ||
        (filterStock === "normal" &&
          producto.stock > (producto.stockMinimo || 5)) ||
        (filterStock === "sin-stock" && producto.stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Ordenar productos
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "nombre":
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
          break;
        case "stock":
          aValue = a.stock;
          bValue = b.stock;
          break;
        case "precio":
          aValue = a.precio;
          bValue = b.precio;
          break;
        case "categoria":
          aValue = a.categoria.toLowerCase();
          bValue = b.categoria.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setProductosFiltrados(filtered);
  }, [productos, searchTerm, filterCategory, filterStock, sortBy, sortOrder]);

  const handleCrearProducto = async (
    datos: Omit<ProductoType, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await inventarioDB.crear(datos);
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el producto"
      );
      throw err;
    }
  };

  const handleEditarProducto = async (
    datos: Omit<ProductoType, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!productoSeleccionado) return;

    try {
      await inventarioDB.actualizar(productoSeleccionado.id, datos);
      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el producto"
      );
      throw err;
    }
  };

  const handleEliminarProducto = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await inventarioDB.eliminar(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el producto"
      );
    }
  };

  const tabs = [
    { id: "productos", name: "Productos", icon: CubeIcon, href: "/inventario" },
    {
      id: "categorias",
      name: "Categorías",
      icon: TagIcon,
      href: "/inventario/categorias",
    },
  ];

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600 font-medium'>
            Cargando inventario...
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
                <ArchiveBoxIcon className='w-8 h-8 text-indigo-600' />
                Inventario
              </h1>
              <p className='mt-2 text-sm text-gray-600'>
                Gestiona tu inventario y categorías
              </p>
            </div>
            <div className='mt-4 sm:mt-0'>
              <button
                className='inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 gap-2'
                onClick={() => {
                  setProductoSeleccionado(undefined);
                  setModalOpen(true);
                }}
              >
                <PlusIcon className='w-5 h-5' />
                Nuevo Producto
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className='mb-8'>
          <div className='border-b border-gray-200 bg-white rounded-t-xl shadow-sm'>
            <nav className='-mb-px flex space-x-8 px-6' aria-label='Tabs'>
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <a
                    key={tab.id}
                    href={tab.href}
                    className={`${
                      isActive
                        ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center gap-2`}
                  >
                    <tab.icon className='w-5 h-5' />
                    {tab.name}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Stats */}
        <InventarioStats productos={productos} />

        {/* Filters and Search */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Buscar productos...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
                />
              </div>
            </div>

            {/* Filters */}
            <div className='flex gap-3'>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              >
                <option value=''>Todas las categorías</option>
                {Array.from(new Set(productos.map((p) => p.categoria))).map(
                  (categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  )
                )}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              >
                <option value=''>Todo el stock</option>
                <option value='bajo'>Stock bajo</option>
                <option value='normal'>Stock normal</option>
                <option value='sin-stock'>Sin stock</option>
              </select>

              {/* View Mode Toggle */}
              <div className='flex bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Squares2X2Icon className='w-5 h-5' />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ListBulletIcon className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className='flex gap-2 mt-4 flex-wrap'>
            <span className='text-sm text-gray-600 py-2'>Ordenar por:</span>
            {[
              { key: "nombre", label: "Nombre" },
              { key: "stock", label: "Stock" },
              { key: "precio", label: "Precio" },
              { key: "categoria", label: "Categoría" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key as typeof sortBy)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortBy === key
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
                {sortBy === key &&
                  (sortOrder === "asc" ? (
                    <ArrowUpIcon className='w-4 h-4' />
                  ) : (
                    <ArrowDownIcon className='w-4 h-4' />
                  ))}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 rounded-xl bg-red-50 border border-red-200 p-4'>
            <div className='flex'>
              <ExclamationTriangleIcon className='h-5 w-5 text-red-400' />
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>Error</h3>
                <div className='mt-2 text-sm text-red-700'>{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Products Content */}
        {productosFiltrados.length === 0 && !loading ? (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
            <ArchiveBoxIcon className='mx-auto h-16 w-16 text-gray-400' />
            <h3 className='mt-4 text-lg font-medium text-gray-900'>
              {searchTerm || filterCategory || filterStock
                ? "No se encontraron productos"
                : "No hay productos en el inventario"}
            </h3>
            <p className='mt-2 text-sm text-gray-500'>
              {searchTerm || filterCategory || filterStock
                ? "Prueba ajustando los filtros de búsqueda"
                : "Comienza agregando tu primer producto al inventario"}
            </p>
            {!searchTerm && !filterCategory && !filterStock && (
              <button
                onClick={() => {
                  setProductoSeleccionado(undefined);
                  setModalOpen(true);
                }}
                className='mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 gap-2'
              >
                <PlusIcon className='w-5 h-5' />
                Agregar Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {productosFiltrados.map((producto) => (
              <InventarioCard
                key={producto.id}
                producto={producto}
                viewMode={viewMode}
                onEdit={() => {
                  setProductoSeleccionado(producto);
                  setModalOpen(true);
                }}
                onDelete={() => handleEliminarProducto(producto.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProductoSeleccionado(undefined);
        }}
        producto={productoSeleccionado}
        onSave={
          productoSeleccionado ? handleEditarProducto : handleCrearProducto
        }
      />
    </div>
  );
}
