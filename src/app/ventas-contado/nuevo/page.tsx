"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Producto,
  ProductoFinanciamiento,
  ventasContadoDB,
  VentaContado,
} from "@/lib/firebase/database";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";
import { Cliente } from "@/lib/firebase/database";

export default function NuevaVentaContadoPage() {
  const router = useRouter();

  const { clientes } = useClientesRedux();
  const { productos, actualizarStock } = useProductosRedux();

  const [loading, setLoading] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [productosCarrito, setProductosCarrito] = useState<
    ProductoFinanciamiento[]
  >([]);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [formData, setFormData] = useState({
    cliente: "",
    monto: "",
    fecha: todayStr,
    descripcion: "",
  });

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Recalcular monto
  useEffect(() => {
    const montoTotal = productosCarrito.reduce((acc, p) => acc + p.subtotal, 0);
    setFormData((prev) => ({
      ...prev,
      monto: Math.round(montoTotal).toString(),
    }));
  }, [productosCarrito]);

  // Selección cliente -> set formData.cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      setFormData((prev) => ({ ...prev, cliente: clienteSeleccionado.id }));
      setBusquedaCliente(clienteSeleccionado.nombre);
    }
  }, [clienteSeleccionado]);

  // Helpers
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono.includes(busquedaCliente)
  );
  const getProductoNombre = (id: string) =>
    productos.find((p) => p.id === id)?.nombre || "";

  // Carrito ops
  const agregarProductoCarrito = () => {
    if (!productoSeleccionado) return;
    if (productoSeleccionado.stock < cantidadProducto) {
      alert("Stock insuficiente");
      return;
    }
    const existente = productosCarrito.find(
      (p) => p.productoId === productoSeleccionado.id
    );
    if (existente) {
      setProductosCarrito((prev) =>
        prev.map((p) =>
          p.productoId === productoSeleccionado.id
            ? {
                ...p,
                cantidad: p.cantidad + cantidadProducto,
                subtotal: (p.cantidad + cantidadProducto) * p.precioUnitario,
              }
            : p
        )
      );
    } else {
      setProductosCarrito((prev) => [
        ...prev,
        {
          productoId: productoSeleccionado.id,
          cantidad: cantidadProducto,
          precioUnitario: productoSeleccionado.precio,
          subtotal: cantidadProducto * productoSeleccionado.precio,
        },
      ]);
    }
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidadProducto(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
      alert("Selecciona un cliente");
      return;
    }
    if (productosCarrito.length === 0) {
      alert("Agrega productos");
      return;
    }
    setLoading(true);
    try {
      // Descontar stock
      for (const item of productosCarrito) {
        await actualizarStock(item.productoId, -item.cantidad);
      }
      const [y, m, d] = formData.fecha.split("-");
      const fechaMs = new Date(Number(y), Number(m) - 1, Number(d)).getTime();

      const ventaData: Omit<VentaContado, "id" | "numeroControl"> = {
        clienteId: clienteSeleccionado.id,
        monto: parseFloat(formData.monto),
        fecha: fechaMs,
        productoId: productosCarrito[0].productoId,
        productos: productosCarrito,
        descripcion:
          formData.descripcion ||
          `Venta al contado de ${productosCarrito.length} producto$${
            productosCarrito.length > 1 ? "s" : ""
          }`,
      } as any;

      await ventasContadoDB.crear(ventaData);
      setShowSuccess(true);
      setTimeout(() => router.push("/ventas-contado"), 2000);
    } catch (err) {
      alert("Error al crear venta");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100'>
        <div className='bg-white p-8 rounded-3xl shadow-xl text-center'>
          <h2 className='text-2xl font-bold mb-4 text-gray-800'>
            ¡Venta registrada!
          </h2>
          <p className='text-gray-600 mb-6'>Redirigiendo…</p>
        </div>
      </div>
    );
  }

  const montoTotal = productosCarrito.reduce((acc, p) => acc + p.subtotal, 0);

  /* ---------- UI ------------- */
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      {/* Hero Header */}
      <div className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-14 h-14 bg-gradient-to-br from-slate-700 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg'>
              <span className='text-2xl text-white'>💵</span>
            </div>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-700 to-sky-600 bg-clip-text text-transparent'>
                Nueva Venta al Contado
              </h1>
              <p className='text-sm sm:text-base text-gray-600 max-w-md'>
                Registra rápidamente una venta pagada al contado
              </p>
            </div>
          </div>
          <Link
            href='/ventas-contado'
            className='inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-medium'
          >
            ← Volver a Ventas
          </Link>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Steps indicator */}
        <div className='flex items-center justify-center gap-4 mb-8'>
          <div className='flex items-center gap-2 bg-sky-100 text-sky-600 px-4 py-2 rounded-full text-sm font-medium'>
            <span className='w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
              1
            </span>
            Cliente
          </div>
          <div className='w-8 h-px bg-gray-300 hidden sm:block'></div>
          <div className='flex items-center gap-2 bg-sky-100 text-sky-600 px-4 py-2 rounded-full text-sm font-medium'>
            <span className='w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
              2
            </span>
            Productos
          </div>
          <div className='w-8 h-px bg-gray-300 hidden sm:block'></div>
          <div className='flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium'>
            <span className='w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold'>
              3
            </span>
            Confirmación
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Cliente */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
            <h3 className='font-semibold text-lg mb-4'>1️⃣ Cliente</h3>
            <div className='relative'>
              <input
                type='text'
                placeholder='Buscar cliente...'
                className='w-full px-4 py-3 border rounded-xl'
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  if (clienteSeleccionado) setClienteSeleccionado(null);
                }}
              />
              {busquedaCliente &&
                !clienteSeleccionado &&
                clientesFiltrados.length > 0 && (
                  <div className='absolute bg-white border rounded-xl w-full mt-1 max-h-60 overflow-auto z-20'>
                    {clientesFiltrados.slice(0, 5).map((c) => (
                      <button
                        key={c.id}
                        type='button'
                        className='w-full text-left px-4 py-2 hover:bg-blue-50'
                        onClick={() => {
                          setClienteSeleccionado(c);
                          setBusquedaCliente(c.nombre);
                        }}
                      >
                        {c.nombre} • {c.telefono}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            {clienteSeleccionado && (
              <p className='mt-2 text-green-700 font-medium'>
                Cliente seleccionado: {clienteSeleccionado.nombre}
              </p>
            )}
            <button
              type='button'
              onClick={() => setModalNuevoCliente(true)}
              className='mt-3 px-4 py-2 bg-green-600 text-white rounded-xl'
            >
              + Nuevo Cliente
            </button>
          </div>

          {/* Productos */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'>
            <h3 className='font-semibold text-lg mb-4'>2️⃣ Productos</h3>
            <div className='flex gap-3 mb-4'>
              <input
                type='text'
                placeholder='Buscar producto...'
                className='flex-1 px-4 py-3 border rounded-xl'
                value={busquedaProducto}
                onChange={(e) => {
                  setBusquedaProducto(e.target.value);
                  if (productoSeleccionado) setProductoSeleccionado(null);
                }}
              />
              <input
                type='number'
                min={1}
                className='w-24 px-2 py-3 border rounded-xl'
                value={cantidadProducto}
                onChange={(e) =>
                  setCantidadProducto(
                    Math.max(1, parseInt(e.target.value) || 1)
                  )
                }
              />
              <button
                type='button'
                className='px-4 py-3 bg-blue-600 text-white rounded-xl'
                onClick={agregarProductoCarrito}
              >
                Agregar
              </button>
            </div>
            {busquedaProducto &&
              !productoSeleccionado &&
              productosFiltrados.length > 0 && (
                <div className='border rounded-xl mb-4 max-h-60 overflow-auto'>
                  {productosFiltrados.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type='button'
                      className='w-full text-left px-4 py-2 hover:bg-blue-50'
                      onClick={() => {
                        setProductoSeleccionado(p);
                        setBusquedaProducto(p.nombre);
                      }}
                    >
                      {p.nombre} • ${p.precio} • Stock {p.stock}
                    </button>
                  ))}
                </div>
              )}
            {productosCarrito.length > 0 && (
              <div className='mt-4'>
                {productosCarrito.map((item) => (
                  <div
                    key={item.productoId}
                    className='flex justify-between py-2 border-b'
                  >
                    <span>
                      {getProductoNombre(item.productoId)} x{item.cantidad}
                    </span>
                    <span>${item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
                <div className='flex justify-between font-bold mt-2 text-blue-700'>
                  <span>Total:</span>
                  <span>${montoTotal.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Fecha y descripción */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200 grid gap-6 md:grid-cols-2'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Fecha de Venta
              </label>
              <input
                type='date'
                className='w-full px-4 py-3 border rounded-xl'
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Descripción (opcional)
              </label>
              <textarea
                rows={3}
                className='w-full px-4 py-3 border rounded-xl'
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
            </div>
          </div>

          {/* Botones */}
          <div className='flex gap-3 justify-end'>
            <button
              type='button'
              onClick={() => router.push("/ventas-contado")}
              className='px-6 py-3 border rounded-xl'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={
                loading || !clienteSeleccionado || productosCarrito.length === 0
              }
              className='px-6 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50'
            >
              {loading ? "Procesando…" : "Registrar Venta"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal cliente */}
      <Modal
        isOpen={modalNuevoCliente}
        onClose={() => setModalNuevoCliente(false)}
        title='Nuevo Cliente'
      >
        <NuevoClienteForm
          onCancel={() => setModalNuevoCliente(false)}
          onClienteCreado={(c) => {
            setModalNuevoCliente(false);
            setClienteSeleccionado(c);
            setBusquedaCliente(c.nombre);
          }}
        />
      </Modal>
    </div>
  );
}
