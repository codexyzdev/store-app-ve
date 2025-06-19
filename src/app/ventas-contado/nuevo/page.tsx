"use client";

import { FormEvent } from "react";
import { useNuevaVentaContado } from "@/hooks/useNuevaVentaContado";
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";
import {
  VentaContadoDetailHeader,
  ClienteSelector,
  ProductoSelector,
  ProductoCarrito,
  VentaContadoDetalles,
  VentaContadoSummary,
  VentaContadoActionButtons,
  VentaContadoSuccessScreen,
} from "@/components/ventas-contado";

export default function NuevaVentaContadoPage() {
  const {
    // Estados
    loading,
    showSuccess,
    modalNuevoCliente,
    formData,
    productoSeleccionado,
    productosCarrito,
    busquedaProducto,
    cantidadProducto,
    clienteSeleccionado,
    busquedaCliente,

    // Datos computados
    productosFiltrados,
    clientesFiltrados,
    montoTotal,

    // Funciones de estado
    setModalNuevoCliente,
    setCantidadProducto,

    // Funciones de carrito
    agregarProductoCarrito,
    removerProductoCarrito,
    actualizarCantidadCarrito,

    // Funciones de handlers
    handleSubmit,
    handleClienteCreado,
    handleClienteSeleccionado,
    handleProductoSeleccionado,
    handleBusquedaClienteChange,
    handleBusquedaProductoChange,
    updateFormData,

    // Helpers
    getProductoNombre,

    // Navegación
    router,
  } = useNuevaVentaContado();

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  if (showSuccess) {
    return <VentaContadoSuccessScreen />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-4 sm:py-8'>
        {/* Header */}
        <VentaContadoDetailHeader />

        {/* Contenido principal */}
        <div className='max-w-6xl mx-auto'>
          <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
            {/* Header del formulario */}
            <div className='bg-gradient-to-r from-sky-500 to-indigo-600 px-4 sm:px-8 py-4 sm:py-6'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0'>
                  <span className='text-lg sm:text-2xl text-white'>🛒</span>
                </div>
                <div className='text-white min-w-0'>
                  <h2 className='text-lg sm:text-xl font-bold mb-1'>
                    Información de la Venta
                  </h2>
                  <p className='text-sky-100 text-sm sm:text-base'>
                    Completa todos los campos requeridos
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className='p-4 sm:p-8'>
              <form
                onSubmit={handleFormSubmit}
                className='space-y-6 sm:space-y-8'
              >
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
                  {/* Cliente */}
                  <ClienteSelector
                    busquedaCliente={busquedaCliente}
                    clienteSeleccionado={clienteSeleccionado}
                    clientesFiltrados={clientesFiltrados}
                    onBusquedaChange={handleBusquedaClienteChange}
                    onClienteSeleccionado={handleClienteSeleccionado}
                    onNuevoClienteClick={() => setModalNuevoCliente(true)}
                  />

                  {/* Productos */}
                  <div className='space-y-4'>
                    <ProductoSelector
                      busquedaProducto={busquedaProducto}
                      productoSeleccionado={productoSeleccionado}
                      productosFiltrados={productosFiltrados}
                      cantidadProducto={cantidadProducto}
                      onBusquedaChange={handleBusquedaProductoChange}
                      onProductoSeleccionado={handleProductoSeleccionado}
                      onCantidadChange={setCantidadProducto}
                      onAgregarCarrito={agregarProductoCarrito}
                    />

                    {/* Carrito de productos */}
                    <ProductoCarrito
                      productosCarrito={productosCarrito}
                      getProductoNombre={getProductoNombre}
                      onActualizarCantidad={actualizarCantidadCarrito}
                      onRemoverProducto={removerProductoCarrito}
                    />
                  </div>
                </div>

                {/* Detalles adicionales */}
                <VentaContadoDetalles
                  formData={formData}
                  montoTotal={montoTotal}
                  productosCarrito={productosCarrito}
                  getProductoNombre={getProductoNombre}
                  onFormDataChange={updateFormData}
                />

                {/* Resumen final */}
                <VentaContadoSummary
                  clienteSeleccionado={clienteSeleccionado}
                  productosCarrito={productosCarrito}
                  formData={formData}
                  montoTotal={montoTotal}
                />

                {/* Botones */}
                <VentaContadoActionButtons
                  loading={loading}
                  clienteSeleccionado={clienteSeleccionado}
                  productosCarrito={productosCarrito}
                  onCancelar={() => router.push("/ventas-contado")}
                  onSubmit={handleSubmit}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de nuevo cliente */}
      <Modal
        isOpen={modalNuevoCliente}
        onClose={() => setModalNuevoCliente(false)}
        title='Nuevo Cliente'
      >
        <NuevoClienteForm
          onClienteCreado={handleClienteCreado}
          onCancel={() => setModalNuevoCliente(false)}
        />
      </Modal>
    </div>
  );
}
