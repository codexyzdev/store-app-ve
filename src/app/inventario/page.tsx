"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  inventarioDB,
  Producto as ProductoType,
} from "@/lib/firebase/database";
import { ProductoModal } from "@/components/inventario/ProductoModal";
import { InventarioCard } from "@/components/inventario/InventarioCard";
import { InventarioStatsExpanded } from "@/components/inventario/InventarioStatsExpanded";
import { InventarioFilters } from "@/components/inventario/InventarioFilters";
import Modal from "@/components/Modal";
import InventarioPrint from "@/components/inventario/InventarioPrint";
import InventarioHTML from "@/components/inventario/InventarioHTML";
import InventarioPDFViewer from "@/components/inventario/InventarioPDFViewer";
import {
  setProductos,
  setSearchTerm,
  setFilterCategory,
  setFilterStock,
  setSortBy,
  setSortOrder,
  setViewMode,
  eliminarProducto,
  clearError,
} from "@/store/inventarioSlice";

type ViewMode = "grid" | "list";
type TabType = "productos" | "categorias" | "proveedores" | "movimientos";

export default function InventarioPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    productosFiltrados,
    loading,
    error,
    searchTerm,
    filterCategory,
    filterStock,
    sortBy,
    sortOrder,
    viewMode,
    productos,
  } = useSelector((state: RootState) => state.inventario);

  const [modalOpen, setModalOpen] = useState(false);
  const [mostrarImpresion, setMostrarImpresion] = useState(false);
  const [mostrarPDF, setMostrarPDF] = useState(false);
  // Producto seleccionado para editar
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    ProductoType | undefined
  >(undefined);

  // Estados de UI
  const [activeTab, setActiveTab] = useState<TabType>("productos");

  useEffect(() => {
    const unsubscribe = inventarioDB.suscribir((productos) => {
      dispatch(setProductos(productos));
    });

    return unsubscribe;
  }, [dispatch]);

  // Limpiar errores después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleEliminarProducto = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await dispatch(eliminarProducto(id)).unwrap();
    } catch (err) {
      console.error("Error al eliminar producto:", err);
    }
  };

  const tabs = [
    { id: "productos", name: "Productos", icon: "📦", href: "/inventario" },
    {
      id: "categorias",
      name: "Categorías",
      icon: "🏷️",
      href: "/inventario/categorias",
    },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
    } else {
      dispatch(setSortBy(field as typeof sortBy));
      dispatch(setSortOrder("asc"));
    }
  };

  const handleClearFilters = () => {
    dispatch(setSearchTerm(""));
    dispatch(setFilterCategory(""));
    dispatch(setFilterStock(""));
  };

  // Obtener categorías únicas
  const categories = Array.from(
    new Set(productos.map((p: ProductoType) => p.categoria))
  ) as string[];

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto'></div>
          <p className='mt-4 text-gray-600 font-medium'>
            Cargando inventario...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='sm:flex sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent flex items-center gap-3'>
                <span className='text-2xl'>📦</span>
                Inventario
              </h1>
              <p className='mt-2 text-lg text-gray-600'>
                Gestiona tu inventario y categorías
              </p>
            </div>
            <div className='mt-4 sm:mt-0 flex gap-3'>
              {/* Botón imprimir */}
              <button
                className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
                onClick={() => {
                  setMostrarImpresion(true);
                  setTimeout(() => {
                    const originalTitle = document.title;
                    document.title = "Inventario";
                    window.print();
                    document.title = originalTitle;
                  }, 500);
                }}
              >
                <span className='text-xl'>🖨️</span>
                Imprimir
              </button>

              {/* Botón generar PDF */}
              <button
                className='inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
                onClick={() => setMostrarPDF(true)}
              >
                <span className='text-xl'>📄</span>
                Generar PDF
              </button>

              {/* Botón nuevo producto */}
              <button
                className='inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
                onClick={() => {
                  setProductoSeleccionado(undefined);
                  setModalOpen(true);
                }}
              >
                <span className='text-xl'>📦</span>
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
                    <span className='text-xl'>{tab.icon}</span>
                    {tab.name}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Stats */}
        <InventarioStatsExpanded productos={productos} />

        {/* Filtros */}
        <InventarioFilters
          searchTerm={searchTerm}
          onSearchChange={(term) => dispatch(setSearchTerm(term))}
          filterCategory={filterCategory}
          onCategoryChange={(category) => dispatch(setFilterCategory(category))}
          filterStock={filterStock}
          onStockChange={(stock) => dispatch(setFilterStock(stock))}
          categories={categories}
          onClearFilters={handleClearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          viewMode={viewMode}
          onViewModeChange={(mode) => dispatch(setViewMode(mode))}
        />

        {/* Error Message */}
        {error && (
          <div className='mb-6 rounded-xl bg-red-50 border border-red-200 p-4'>
            <div className='flex'>
              <span className='text-red-400 text-xl'>❌</span>
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
            <span className='text-gray-400 text-4xl'>🔍</span>
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
                <span className='text-xl'>📦</span>
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
            {productosFiltrados.map((producto: ProductoType, index: number) => (
              <InventarioCard
                key={`${producto.id}-${index}`}
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
      />

      {/* Modal de impresión */}
      <Modal
        isOpen={mostrarImpresion}
        onClose={() => setMostrarImpresion(false)}
        title='Imprimir Inventario'
      >
        <div className='print-container'>
          <div className='no-print mb-4 text-center'>
            <p className='text-gray-600 mb-3'>
              Haz clic en "Imprimir" o usa Ctrl+P para imprimir este inventario.
            </p>
            <div className='flex gap-2 justify-center'>
              <button
                onClick={() => window.print()}
                className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2'
              >
                <span>🖨️</span>
                Imprimir
              </button>
              <button
                onClick={() => setMostrarImpresion(false)}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
              >
                Cerrar
              </button>
            </div>
          </div>

          <InventarioHTML productos={productosFiltrados} />
        </div>
      </Modal>

      {/* Modal de PDF */}
      <Modal
        isOpen={mostrarPDF}
        onClose={() => setMostrarPDF(false)}
        title='Generar PDF del Inventario'
      >
        <div className='h-96 lg:h-[500px]'>
          <InventarioPDFViewer
            productos={productosFiltrados}
            showViewer={true}
          />
        </div>
      </Modal>

      {/* Estilos para impresión */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            .no-print { display: none !important; }
            .print-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .fixed.inset-0 > div:first-child { display: none !important; }
            .inventario-print {
              position: static !important;
              transform: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              padding: 20px !important;
            }
          }`,
        }}
      />
    </div>
  );
}
