"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import { inventarioDB, Producto } from "@/lib/firebase/database";
import { prestamosDB } from "@/lib/firebase/database";
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";

export default function NuevoPrestamoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const [formData, setFormData] = useState({
    cliente: "",
    producto: "",
    monto: "",
    cuotas: "",
    fechaInicio: todayStr,
    descripcion: "",
    tipoVenta: "cuotas", // por defecto cuotas
  });
  const [busquedaProducto, setBusquedaProducto] = useState("");
  // Estados para búsqueda y selección de cliente
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

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
        monto:
          formData.tipoVenta === "contado"
            ? productoSeleccionado.precio.toString()
            : (productoSeleccionado.precio * 1.5).toFixed(2),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoSeleccionado, formData.tipoVenta]);

  // Actualiza formData cuando se selecciona un cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      setFormData((prev) => ({
        ...prev,
        cliente: clienteSeleccionado.id,
      }));
      setBusquedaCliente(clienteSeleccionado.nombre);
    }
  }, [clienteSeleccionado]);

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

      // Parsear fecha de inicio como local (no UTC)
      const [yyyy, mm, dd] = formData.fechaInicio.split("-");
      const fechaInicio = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        0,
        0,
        0,
        0
      ).getTime();

      // Crear el préstamo
      await prestamosDB.crear({
        clienteId: formData.cliente,
        monto: parseFloat(formData.monto),
        cuotas:
          formData.tipoVenta === "contado" ? 0 : parseInt(formData.cuotas, 10),
        fechaInicio: fechaInicio,
        estado: formData.tipoVenta === "contado" ? "completado" : "activo",
        productoId: productoSeleccionado.id,
        tipoVenta: formData.tipoVenta,
        ...(formData.tipoVenta === "contado" ? { pagado: true } : {}),
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

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      cliente.telefono.includes(busquedaCliente) ||
      (cliente.direccion &&
        cliente.direccion.toLowerCase().includes(busquedaCliente.toLowerCase()))
  );

  return (
    <div className='min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-10 border border-gray-100'>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight text-center sm:text-left'>
            Nuevo Préstamo
          </h1>
          <form onSubmit={handleSubmit} className='space-y-6 sm:space-y-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
              {/* Cliente (búsqueda y selección) */}
              <div className='flex flex-col gap-2 order-1'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                  Cliente
                </span>
                <div className='relative'>
                  <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                    <input
                      type='text'
                      id='cliente-busqueda'
                      placeholder='Buscar cliente...'
                      value={busquedaCliente}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setBusquedaCliente(e.target.value);
                        if (
                          clienteSeleccionado &&
                          e.target.value !== clienteSeleccionado.nombre
                        ) {
                          setClienteSeleccionado(null);
                        }
                      }}
                      className='flex-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none'
                      autoComplete='off'
                      required
                    />
                    <button
                      type='button'
                      className='w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm shadow focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap'
                      onClick={() => setModalNuevoCliente(true)}
                    >
                      Nuevo Cliente
                    </button>
                  </div>
                  {/* Lista de clientes filtrados */}
                  {busquedaCliente && !clienteSeleccionado && (
                    <div
                      className='border border-gray-200 rounded-lg bg-white shadow-xl mt-1 max-h-48 overflow-y-auto absolute left-0 right-0 top-full w-full'
                      style={{ zIndex: 1000 }}
                    >
                      {clientesFiltrados.length === 0 && (
                        <div className='p-3 text-gray-400 text-sm text-center'>
                          No hay clientes
                        </div>
                      )}
                      {clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.id}
                          className={`flex items-center justify-between p-3 cursor-pointer transition hover:bg-indigo-100 border-b border-gray-100 last:border-b-0 ${
                            clienteSeleccionado?.id === cliente.id
                              ? "bg-indigo-50"
                              : ""
                          }`}
                          onClick={() => {
                            setClienteSeleccionado(cliente);
                            setBusquedaCliente(cliente.nombre);
                          }}
                        >
                          <div className='flex flex-col min-w-0 flex-1'>
                            <span className='font-semibold text-gray-800 text-sm sm:text-base truncate'>
                              {cliente.nombre}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {cliente.telefono}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Información del cliente seleccionado */}
                {clienteSeleccionado && (
                  <div className='mt-2 p-3 sm:p-4 border border-indigo-100 rounded-lg bg-indigo-50 space-y-2 text-sm'>
                    <div className='font-semibold text-indigo-700 text-base'>
                      {clienteSeleccionado.nombre}
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <span className='text-xs'>📞</span>
                      <span className='text-sm'>
                        {clienteSeleccionado.telefono}
                      </span>
                    </div>
                    <div className='flex items-start gap-2 text-gray-600'>
                      <span className='text-xs mt-0.5'>📍</span>
                      <div className='flex-1 min-w-0'>
                        {clienteSeleccionado.direccion &&
                        clienteSeleccionado.direccion.includes(
                          "google.com/maps"
                        ) ? (
                          <div className='space-y-1'>
                            <div className='text-sm truncate'>
                              Ubicación en Google Maps
                            </div>
                            <a
                              href={clienteSeleccionado.direccion}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition'
                            >
                              Ver en mapa
                              <svg
                                className='w-3 h-3'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                />
                              </svg>
                            </a>
                          </div>
                        ) : (
                          <span className='text-sm break-words'>
                            {clienteSeleccionado.direccion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Producto (búsqueda y selección) */}
              <div className='flex flex-col gap-2 order-2'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                  Producto del inventario
                </span>
                <div className='relative'>
                  <input
                    type='text'
                    id='producto-busqueda'
                    placeholder='Buscar producto...'
                    value={busquedaProducto}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setBusquedaProducto(e.target.value);
                      if (
                        productoSeleccionado &&
                        e.target.value !== productoSeleccionado.nombre
                      ) {
                        setProductoSeleccionado(null);
                      }
                    }}
                    className='block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none'
                    autoComplete='off'
                  />
                  {/* Lista de productos filtrados */}
                  {busquedaProducto && !productoSeleccionado && (
                    <div
                      className='border border-gray-200 rounded-lg bg-white shadow-xl mt-1 max-h-64 overflow-y-auto absolute left-0 right-0 top-full w-full'
                      style={{ zIndex: 999 }}
                    >
                      {productosFiltrados.length === 0 && (
                        <div className='p-3 text-gray-400 text-sm text-center'>
                          No hay productos
                        </div>
                      )}
                      {productosFiltrados.map((producto) => (
                        <div
                          key={producto.id}
                          className={`p-3 cursor-pointer transition hover:bg-indigo-100 border-b border-gray-100 last:border-b-0 ${
                            productoSeleccionado?.id === producto.id
                              ? "bg-indigo-50"
                              : ""
                          }`}
                          onClick={() => {
                            setProductoSeleccionado(producto);
                            setBusquedaProducto(producto.nombre);
                          }}
                        >
                          <div className='flex flex-col space-y-1'>
                            <div className='font-semibold text-gray-800 text-sm sm:text-base truncate'>
                              {producto.nombre}
                            </div>
                            <div className='flex items-center justify-between text-xs text-gray-500'>
                              <div className='flex items-center gap-1'>
                                <span>💰</span>
                                <span>${producto.precio.toFixed(2)}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <span>📦</span>
                                <span>Stock: {producto.stock}</span>
                              </div>
                            </div>
                            {producto.descripcion && (
                              <div className='text-xs text-gray-400 truncate'>
                                {producto.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Información del producto seleccionado */}
                {productoSeleccionado && (
                  <div className='mt-2 p-3 sm:p-4 border border-indigo-100 rounded-lg bg-indigo-50 space-y-2 text-sm'>
                    <div className='font-semibold text-indigo-700 text-base'>
                      {productoSeleccionado.nombre}
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs'>💰</span>
                        <span className='text-sm'>
                          ${productoSeleccionado.precio.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs'>📦</span>
                        <span className='text-sm'>
                          Stock: {productoSeleccionado.stock}
                        </span>
                      </div>
                    </div>
                    {productoSeleccionado.descripcion && (
                      <div className='text-gray-600 text-xs break-words'>
                        {productoSeleccionado.descripcion}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tipo de venta */}
              <div className='flex flex-col gap-2 order-3'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                  Tipo de venta
                </span>
                <select
                  value={formData.tipoVenta}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoVenta: e.target.value as "contado" | "cuotas",
                    })
                  }
                  className='block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none'
                >
                  <option value='cuotas'>A cuotas (precio + 50%)</option>
                  <option value='contado'>Contado (precio al contado)</option>
                </select>
              </div>

              {/* Monto del préstamo */}
              <div className='flex flex-col gap-2 order-4'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                  Monto del préstamo
                </span>
                <div className='relative'>
                  <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm sm:text-base'>
                    $
                  </span>
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
                    className='pl-7 block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none'
                    placeholder='0.00'
                    readOnly={formData.tipoVenta === "contado"}
                  />
                </div>
              </div>

              {/* Cuotas del préstamo */}
              {formData.tipoVenta === "cuotas" && (
                <div className='flex flex-col gap-2 order-5 lg:order-5'>
                  <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                    Cuotas del préstamo
                  </span>
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
                    className='block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none'
                    placeholder='Ej: 12'
                  />
                </div>
              )}

              {/* Fecha de inicio */}
              <div className='flex flex-col gap-2 order-6'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                  Inicio del préstamo
                </span>
                <input
                  type='date'
                  name='fechaInicio'
                  id='fechaInicio'
                  required
                  value={formData.fechaInicio}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                  className='block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none'
                />
              </div>
            </div>

            {/* Descripción - Ancho completo */}
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                Descripción
              </span>
              <textarea
                id='descripcion'
                name='descripcion'
                rows={3}
                value={formData.descripcion}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className='block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none resize-none'
                placeholder='Descripción del préstamo...'
              />
            </div>

            {/* Botones */}
            <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-4 border-t border-gray-100'>
              <button
                type='button'
                onClick={() => router.back()}
                className='flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
                Cancelar
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 sm:h-5 sm:w-5 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                {loading
                  ? "Guardando..."
                  : formData.tipoVenta === "contado"
                  ? "Venta al contado"
                  : "Crear Préstamo"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modal de nuevo cliente fuera del form para evitar forms anidados */}
      <Modal
        isOpen={modalNuevoCliente}
        onClose={() => setModalNuevoCliente(false)}
        title='Nuevo Cliente'
      >
        <NuevoClienteForm
          onClienteCreado={(cliente) => {
            setModalNuevoCliente(false);
            setClientes((prev) => [...prev, cliente]);
            setClienteSeleccionado(cliente);
            setBusquedaCliente(cliente.nombre);
          }}
          onCancel={() => setModalNuevoCliente(false)}
        />
      </Modal>
    </div>
  );
}
