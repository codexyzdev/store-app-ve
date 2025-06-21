"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import {
  useProductosInfiniteScroll,
  useInfiniteScroll,
} from "@/hooks/useInfiniteScroll";
import {
  BusquedaOptimizada,
  FiltrosAvanzados,
} from "@/components/inventario/BusquedaOptimizada";
import {
  ProductosSkeleton,
  CargandoMasSkeleton,
  EstadoVacioSkeleton,
} from "@/components/inventario/ProductosSkeleton";
import { InventarioCard } from "@/components/inventario/InventarioCard";
import { ProductoModal } from "@/components/inventario/ProductoModal";
import {
  Producto as ProductoType,
  inventarioDB,
} from "@/lib/firebase/database";
import Modal from "@/components/Modal";

type ViewMode = "grid" | "list";

export default function ProductosPage() {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [sortBy, setSortBy] = useState<string>("nombre");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    ProductoType | undefined
  >(undefined);

  // Hook para obtener todos los productos de Firebase
  const { productos: allProductos, loading: loadingFirebase } =
    useProductosRedux();

  // Hook de scroll infinito optimizado
  const {
    productos: productosPaginados,
    isLoading,
    hasMore,
    error,
    loadMore,
    totalCount,
    currentPage,
  } = useProductosInfiniteScroll(allProductos, {
    pageSize: 20,
    searchTerm,
    filterCategory,
    filterStock,
    sortBy,
    sortOrder,
  });

  // Hook para detectar scroll infinito
  const { sentinelRef, isIntersecting } = useInfiniteScroll(loadMore, {
    hasMore,
    isLoading,
    threshold: 0.1,
    rootMargin: "200px 0px",
  });

  // Categorías únicas para filtros
  const categories = useMemo(() => {
    return Array.from(
      new Set(allProductos.map((p) => p.categoria).filter(Boolean))
    );
  }, [allProductos]);

  // Handlers optimizados con useCallback
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilterCategory(category);
  }, []);

  const handleStockChange = useCallback((stock: string) => {
    setFilterStock(stock);
  }, []);

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    },
    [sortBy]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterStock("");
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleEditProduct = useCallback((producto: ProductoType) => {
    setProductoSeleccionado(producto);
    setModalOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await inventarioDB.eliminar(id);
      // El producto se eliminará automáticamente via suscripción de Firebase
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  }, []);

  const handleNewProduct = useCallback(() => {
    setProductoSeleccionado(undefined);
    setModalOpen(true);
  }, []);

  // Loading inicial
  if (loadingFirebase && allProductos.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='mb-8'>
            <div className='h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse' />
            <div className='h-4 bg-gray-200 rounded w-64 animate-pulse' />
          </div>
          <ProductosSkeleton count={12} viewMode={viewMode} />
        </div>
      </div>
    );
  }

  // Estado vacío sin productos
  if (!loadingFirebase && allProductos.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='container mx-auto px-4 py-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              📦 Catálogo de Productos
            </h1>
            <p className='text-gray-600'>
              Gestiona tu inventario de manera eficiente
            </p>
          </div>

          <div className='text-center py-16'>
            <div className='text-6xl mb-4'>📦</div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No hay productos registrados
            </h3>
            <p className='text-gray-600 mb-8'>
              Comienza agregando tu primer producto al inventario
            </p>
            <button
              onClick={handleNewProduct}
              className='inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors'
            >
              <span>➕</span>
              Agregar Primer Producto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <span className='text-2xl'>📦</span>
              Catálogo de Productos
            </h1>
            <p className='text-gray-600'>
              {totalCount > 0 ? (
                <>
                  Mostrando {productosPaginados.length} de {totalCount}{" "}
                  productos
                  {searchTerm && (
                    <span className='ml-1'>
                      para "<span className='font-medium'>{searchTerm}</span>"
                    </span>
                  )}
                </>
              ) : (
                "Gestiona tu inventario de manera eficiente"
              )}
            </p>
          </div>

          <div className='flex items-center gap-3 mt-4 sm:mt-0'>
            {/* Toggle de vista */}
            <div className='flex bg-white rounded-lg p-1 border'>
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title='Vista en cuadrícula'
              >
                <span className='text-lg'>⚏</span>
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title='Vista en lista'
              >
                <span className='text-lg'>☰</span>
              </button>
            </div>

            {/* Botón nuevo producto */}
            <button
              onClick={handleNewProduct}
              className='inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl'
            >
              <span className='text-lg'>➕</span>
              <span className='hidden sm:inline'>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className='space-y-4 mb-8'>
          <BusquedaOptimizada
            onSearch={handleSearch}
            showResultsCount={true}
            resultsCount={totalCount}
            isLoading={isLoading}
          />

          <FiltrosAvanzados
            filterCategory={filterCategory}
            onCategoryChange={handleCategoryChange}
            filterStock={filterStock}
            onStockChange={handleStockChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            categories={categories}
            onClearFilters={handleClearFilters}
            isExpanded={isFiltersExpanded}
            onToggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-4 mb-6'>
            <div className='flex items-center gap-2'>
              <span className='text-red-500 text-lg'>⚠️</span>
              <p className='text-red-700 font-medium'>
                Error al cargar productos
              </p>
            </div>
            <p className='text-red-600 text-sm mt-1'>{error}</p>
          </div>
        )}

        {/* Contenido principal */}
        {productosPaginados.length === 0 && !isLoading ? (
          // Estado vacío con filtros activos
          <div className='text-center py-16'>
            <div className='text-4xl mb-4'>🔍</div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No se encontraron productos
            </h3>
            <p className='text-gray-600 mb-6'>
              {searchTerm || filterCategory || filterStock
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay productos que mostrar"}
            </p>
            {(searchTerm || filterCategory || filterStock) && (
              <button
                onClick={handleClearFilters}
                className='inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
              >
                <span>🗑️</span>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {productosPaginados.map((producto) => (
                <InventarioCard
                  key={producto.id}
                  producto={producto}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Indicador de carga infinita */}
            {hasMore && (
              <div ref={sentinelRef} className='mt-8'>
                {(isLoading || isIntersecting) && <CargandoMasSkeleton />}
              </div>
            )}

            {/* Mensaje de final */}
            {!hasMore && productosPaginados.length > 0 && (
              <div className='text-center py-8'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm'>
                  <span>🎉</span>
                  Has visto todos los productos ({totalCount} en total)
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para nuevo/editar producto */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ProductoModal
          producto={productoSeleccionado}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
