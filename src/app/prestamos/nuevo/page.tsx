"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clientesDB, Cliente } from "@/lib/firebase/database";
import { inventarioDB, Producto } from "@/lib/firebase/database";
import { prestamosDB, ProductoPrestamo } from "@/lib/firebase/database";
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";

export default function NuevoPrestamoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [productosCarrito, setProductosCarrito] = useState<ProductoPrestamo[]>(
    []
  );
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
  const [cantidadProducto, setCantidadProducto] = useState(1);
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

  // Calcular monto total basado en productos del carrito
  useEffect(() => {
    const montoTotal = productosCarrito.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
    const montoConRecargo =
      formData.tipoVenta === "contado" ? montoTotal : montoTotal * 1.5;
    setFormData((prev) => ({
      ...prev,
      monto: montoConRecargo.toFixed(2),
    }));
  }, [productosCarrito, formData.tipoVenta]);

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

  const agregarProductoCarrito = () => {
    if (!productoSeleccionado) {
      alert("Selecciona un producto del inventario.");
      return;
    }
    if (productoSeleccionado.stock < cantidadProducto) {
      alert("No hay stock suficiente para esta cantidad.");
      return;
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = productosCarrito.find(
      (p) => p.productoId === productoSeleccionado.id
    );

    if (productoExistente) {
      // Actualizar cantidad del producto existente
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
      // Agregar nuevo producto al carrito
      const nuevoProducto: ProductoPrestamo = {
        productoId: productoSeleccionado.id,
        cantidad: cantidadProducto,
        precioUnitario: productoSeleccionado.precio,
        subtotal: cantidadProducto * productoSeleccionado.precio,
      };
      setProductosCarrito((prev) => [...prev, nuevoProducto]);
    }

    // Limpiar selección
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidadProducto(1);
  };

  const removerProductoCarrito = (productoId: string) => {
    setProductosCarrito((prev) =>
      prev.filter((p) => p.productoId !== productoId)
    );
  };

  const actualizarCantidadCarrito = (
    productoId: string,
    nuevaCantidad: number
  ) => {
    if (nuevaCantidad <= 0) {
      removerProductoCarrito(productoId);
      return;
    }

    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;

    if (nuevaCantidad > producto.stock) {
      alert("No hay stock suficiente para esta cantidad.");
      return;
    }

    setProductosCarrito((prev) =>
      prev.map((p) =>
        p.productoId === productoId
          ? {
              ...p,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * p.precioUnitario,
            }
          : p
      )
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Validar que hay productos en el carrito
    if (productosCarrito.length === 0) {
      alert("Agrega al menos un producto al préstamo.");
      setLoading(false);
      return;
    }

    // Validar stock para todos los productos
    for (const item of productosCarrito) {
      const producto = productos.find((p) => p.id === item.productoId);
      if (!producto || producto.stock < item.cantidad) {
        alert(
          `No hay stock suficiente para ${
            producto?.nombre || "uno de los productos"
          }.`
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Descontar stock de todos los productos
      for (const item of productosCarrito) {
        await inventarioDB.actualizarStock(item.productoId, -item.cantidad);
      }

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

      // Crear el préstamo con múltiples productos
      const prestamoData = {
        clienteId: formData.cliente,
        monto: parseFloat(formData.monto),
        cuotas:
          formData.tipoVenta === "contado" ? 0 : parseInt(formData.cuotas, 10),
        fechaInicio: fechaInicio,
        estado:
          formData.tipoVenta === "contado"
            ? ("completado" as const)
            : ("activo" as const),
        productoId: productosCarrito[0].productoId, // Mantener compatibilidad con el primer producto
        productos: productosCarrito, // Array de productos
        tipoVenta: formData.tipoVenta as "contado" | "cuotas",
        ...(formData.tipoVenta === "contado" ? { pagado: true } : {}),
        descripcion:
          formData.descripcion ||
          `Préstamo de ${productosCarrito.length} producto${
            productosCarrito.length > 1 ? "s" : ""
          }`,
      };

      await prestamosDB.crear(prestamoData);
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

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto?.nombre || "Producto no encontrado";
  };

  const montoTotal = productosCarrito.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  return (
    <div className='min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6 lg:px-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-10 border border-gray-100'>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight text-center sm:text-left'>
            🛒 Nuevo Préstamo
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
                  {busquedaCliente &&
                    !clienteSeleccionado &&
                    clientesFiltrados.length > 0 && (
                      <div className='absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto'>
                        {clientesFiltrados.slice(0, 5).map((cliente) => (
                          <button
                            key={cliente.id}
                            type='button'
                            className='w-full text-left px-4 py-3 hover:bg-indigo-50 transition focus:outline-none focus:bg-indigo-50 border-b border-gray-100 last:border-b-0'
                            onClick={() => {
                              setClienteSeleccionado(cliente);
                              setBusquedaCliente(cliente.nombre);
                            }}
                          >
                            <div className='flex flex-col gap-1'>
                              <span className='font-semibold text-gray-900 text-sm'>
                                {cliente.nombre}
                              </span>
                              <div className='flex flex-wrap gap-2 text-xs text-gray-500'>
                                <span className='flex items-center gap-1'>
                                  📞 {cliente.telefono}
                                </span>
                                {cliente.direccion && (
                                  <span className='flex items-center gap-1'>
                                    📍 {cliente.direccion}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Cliente seleccionado */}
                  {clienteSeleccionado && (
                    <div className='mt-2 p-3 sm:p-4 border border-green-100 rounded-lg bg-green-50 space-y-2 text-sm'>
                      <div className='font-semibold text-green-700 text-base flex items-center gap-2'>
                        ✅ {clienteSeleccionado.nombre}
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs'>📞</span>
                          <span className='text-sm'>
                            {clienteSeleccionado.telefono}
                          </span>
                        </div>
                        {clienteSeleccionado.direccion && (
                          <div className='flex items-center gap-2'>
                            <span className='text-xs'>📍</span>
                            <span className='text-sm'>
                              {clienteSeleccionado.direccion}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos - Nueva sección con carrito */}
              <div className='flex flex-col gap-2 order-2'>
                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                  Productos del Inventario
                </span>

                {/* Búsqueda y selección de producto */}
                <div className='relative'>
                  <div className='flex gap-2'>
                    <input
                      type='text'
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
                      className='flex-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition placeholder:text-gray-400 outline-none'
                      autoComplete='off'
                    />
                  </div>

                  {/* Lista de productos filtrados */}
                  {busquedaProducto &&
                    !productoSeleccionado &&
                    productosFiltrados.length > 0 && (
                      <div className='absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto'>
                        {productosFiltrados.slice(0, 5).map((producto) => (
                          <button
                            key={producto.id}
                            type='button'
                            className='w-full text-left px-4 py-3 hover:bg-indigo-50 transition focus:outline-none focus:bg-indigo-50 border-b border-gray-100 last:border-b-0'
                            onClick={() => {
                              setProductoSeleccionado(producto);
                              setBusquedaProducto(producto.nombre);
                            }}
                          >
                            <div className='flex justify-between items-start'>
                              <div className='flex flex-col gap-1'>
                                <span className='font-semibold text-gray-900 text-sm'>
                                  {producto.nombre}
                                </span>
                                <div className='flex flex-wrap gap-2 text-xs text-gray-500'>
                                  <span className='flex items-center gap-1'>
                                    💰 ${producto.precio.toFixed(2)}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    📦 Stock: {producto.stock}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  producto.stock > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {producto.stock > 0
                                  ? "Disponible"
                                  : "Sin stock"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Producto seleccionado con cantidad */}
                {productoSeleccionado && (
                  <div className='mt-2 p-3 sm:p-4 border border-indigo-100 rounded-lg bg-indigo-50 space-y-3'>
                    <div className='font-semibold text-indigo-700 text-base'>
                      {productoSeleccionado.nombre}
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 text-sm'>
                      <div className='flex items-center gap-2'>
                        <span>
                          💰 ${productoSeleccionado.precio.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span>📦 Stock: {productoSeleccionado.stock}</span>
                      </div>
                    </div>

                    {/* Cantidad y botón agregar */}
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-2'>
                        <label className='text-sm font-medium text-gray-700'>
                          Cantidad:
                        </label>
                        <input
                          type='number'
                          min='1'
                          max={productoSeleccionado.stock}
                          value={cantidadProducto}
                          onChange={(e) =>
                            setCantidadProducto(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className='w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        />
                      </div>
                      <button
                        type='button'
                        onClick={agregarProductoCarrito}
                        disabled={productoSeleccionado.stock < cantidadProducto}
                        className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        Agregar al Préstamo
                      </button>
                    </div>
                  </div>
                )}

                {/* Carrito de productos */}
                {productosCarrito.length > 0 && (
                  <div className='mt-4 p-4 border border-green-200 rounded-lg bg-green-50'>
                    <h3 className='font-semibold text-green-800 mb-3 flex items-center gap-2'>
                      🛒 Productos del Préstamo ({productosCarrito.length})
                    </h3>
                    <div className='space-y-2'>
                      {productosCarrito.map((item) => (
                        <div
                          key={item.productoId}
                          className='flex items-center justify-between bg-white p-3 rounded border'
                        >
                          <div className='flex-1'>
                            <div className='font-medium text-gray-900'>
                              {getProductoNombre(item.productoId)}
                            </div>
                            <div className='text-sm text-gray-600'>
                              ${item.precioUnitario.toFixed(2)} c/u
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2'>
                              <button
                                type='button'
                                onClick={() =>
                                  actualizarCantidadCarrito(
                                    item.productoId,
                                    item.cantidad - 1
                                  )
                                }
                                className='w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold'
                              >
                                -
                              </button>
                              <span className='w-8 text-center text-sm font-medium'>
                                {item.cantidad}
                              </span>
                              <button
                                type='button'
                                onClick={() =>
                                  actualizarCantidadCarrito(
                                    item.productoId,
                                    item.cantidad + 1
                                  )
                                }
                                className='w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold'
                              >
                                +
                              </button>
                            </div>
                            <div className='text-right'>
                              <div className='font-semibold text-gray-900'>
                                ${item.subtotal.toFixed(2)}
                              </div>
                            </div>
                            <button
                              type='button'
                              onClick={() =>
                                removerProductoCarrito(item.productoId)
                              }
                              className='text-red-600 hover:text-red-800 p-1'
                              title='Remover producto'
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className='mt-3 pt-3 border-t border-green-200'>
                      <div className='flex justify-between items-center text-lg font-bold text-green-800'>
                        <span>Total Base:</span>
                        <span>${montoTotal.toFixed(2)}</span>
                      </div>
                    </div>
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
                    readOnly={productosCarrito.length > 0}
                  />
                </div>
                {productosCarrito.length > 0 && (
                  <div className='text-xs text-gray-500'>
                    💡 El monto se calcula automáticamente basado en los
                    productos seleccionados
                    {formData.tipoVenta === "cuotas" &&
                      " (incluye 50% de recargo)"}
                  </div>
                )}
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
                  {formData.cuotas && parseFloat(formData.monto) > 0 && (
                    <div className='text-xs text-gray-500'>
                      💰 Valor por cuota: $
                      {(
                        parseFloat(formData.monto) / parseInt(formData.cuotas)
                      ).toFixed(2)}
                    </div>
                  )}
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
                placeholder={
                  productosCarrito.length > 0
                    ? `Préstamo de ${productosCarrito.length} producto${
                        productosCarrito.length > 1 ? "s" : ""
                      }: ${productosCarrito
                        .map((p) => getProductoNombre(p.productoId))
                        .join(", ")}`
                    : "Descripción del préstamo..."
                }
              />
            </div>

            {/* Resumen final */}
            {productosCarrito.length > 0 && (
              <div className='bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200'>
                <h3 className='text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2'>
                  📋 Resumen del Préstamo
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Productos:</span>
                      <span className='font-semibold'>
                        {productosCarrito.length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Total base:</span>
                      <span className='font-semibold'>
                        ${montoTotal.toFixed(2)}
                      </span>
                    </div>
                    {formData.tipoVenta === "cuotas" && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Recargo (50%):</span>
                        <span className='font-semibold text-orange-600'>
                          +${(montoTotal * 0.5).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Monto final:</span>
                      <span className='font-bold text-lg text-indigo-700'>
                        ${formData.monto}
                      </span>
                    </div>
                    {formData.tipoVenta === "cuotas" && formData.cuotas && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Cuotas:</span>
                        <span className='font-semibold'>
                          {formData.cuotas} de $
                          {(
                            parseFloat(formData.monto) /
                            parseInt(formData.cuotas)
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className='flex flex-col sm:flex-row gap-3 pt-6'>
              <button
                type='button'
                onClick={() => router.push("/prestamos")}
                className='flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 sm:h-5 sm:w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
                Cancelar
              </button>

              <button
                type='submit'
                disabled={loading || productosCarrito.length === 0}
                className='flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Guardando...
                  </>
                ) : (
                  <>
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
                    {formData.tipoVenta === "contado"
                      ? `Venta al contado (${productosCarrito.length} producto${
                          productosCarrito.length > 1 ? "s" : ""
                        })`
                      : `Crear Préstamo (${productosCarrito.length} producto${
                          productosCarrito.length > 1 ? "s" : ""
                        })`}
                  </>
                )}
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
