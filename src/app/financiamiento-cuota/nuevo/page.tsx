"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Producto, ProductoFinanciamiento } from "@/lib/firebase/database";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";
import { useFinanciamientosRedux } from "@/hooks/useFinanciamientosRedux";
import Link from "next/link";
import Modal from "@/components/Modal";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";
import { Cliente } from "@/lib/firebase/database";

export default function NuevoFinanciamientoPage() {
  const router = useRouter();

  // Hooks Redux para datos - ÚNICA FUENTE DE VERDAD
  const { clientes, loading: clientesLoading } = useClientesRedux();
  const {
    productos,
    loading: productosLoading,
    actualizarStock,
  } = useProductosRedux();
  const { crearFinanciamiento, crearCobro } = useFinanciamientosRedux();

  // Estados locales del formulario solamente
  const [loading, setLoading] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [productosCarrito, setProductosCarrito] = useState<
    ProductoFinanciamiento[]
  >([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [formData, setFormData] = useState({
    cliente: "",
    producto: "",
    monto: "",
    cuotas: "15", // siempre 15 cuotas fijas
    fechaInicio: todayStr,
    descripcion: "",
    tipoVenta: "cuotas", // fijo a cuotas
  });
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [cuotasIniciales, setCuotasIniciales] = useState(1);
  // Estados para búsqueda y selección de cliente
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

  // Calcular monto total basado en productos del carrito
  useEffect(() => {
    const montoTotal = productosCarrito.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
    const montoConRecargo = montoTotal * 1.5; // siempre recargo 50%
    setFormData((prev) => ({
      ...prev,
      monto: Math.round(montoConRecargo).toString(),
    }));
  }, [productosCarrito]);

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
      const nuevoProducto: ProductoFinanciamiento = {
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
      alert("Agrega al menos un producto al financiamiento.");
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
      // Descontar stock de todos los productos usando Redux
      for (const item of productosCarrito) {
        await actualizarStock(item.productoId, -item.cantidad);
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

      // ----- Crear financiamiento a cuotas -----
      const financiamientoData = {
        clienteId: formData.cliente,
        monto: parseFloat(formData.monto),
        cuotas: 15,
        fechaInicio: fechaInicio,
        estado: "activo" as const,
        productoId: productosCarrito[0].productoId, // Mantener compatibilidad con el primer producto
        productos: productosCarrito, // Array de productos
        tipoVenta: "cuotas",
        descripcion:
          formData.descripcion ||
          `Financiamiento de ${productosCarrito.length} producto${
            productosCarrito.length > 1 ? "s" : ""
          }`,
      };

      const nuevoFinanciamiento = await crearFinanciamiento(financiamientoData);

      // Si hay cuotas iniciales, crear cobros para las últimas cuotas
      if (cuotasIniciales > 0) {
        const valorCuota = parseFloat(formData.monto) / 15;

        for (let i = 0; i < cuotasIniciales; i++) {
          const numeroCuota = 15 - i; // Últimas cuotas: 15, 14, 13...
          await crearCobro({
            financiamientoId: nuevoFinanciamiento.id,
            monto: Math.round(valorCuota),
            fecha: fechaInicio,
            tipo: "inicial",
            numeroCuota: numeroCuota,
            tipoPago: "efectivo", // Asumimos efectivo para pago inicial
          });
        }
      }
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/financiamiento-cuota");
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        alert("Error: " + error.message);
        console.error(error);
      } else {
        alert(
          "Error desconocido al crear el financiamiento o descontar stock."
        );
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
        cliente.direccion
          .toLowerCase()
          .includes(busquedaCliente.toLowerCase())) ||
      (cliente.cedula && cliente.cedula.includes(busquedaCliente)) ||
      (cliente.numeroControl &&
        cliente.numeroControl.toString().includes(busquedaCliente))
  );

  const getProductoNombre = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    return producto?.nombre || "Producto no encontrado";
  };

  const montoTotal = productosCarrito.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  if (showSuccess) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center'>
        <div className='bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center'>
          <div className='mb-6'>
            <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse'>
              <span className='text-3xl text-white'>✅</span>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              ¡Financiamiento Creado!
            </h2>
            <p className='text-gray-600'>
              El financiamiento ha sido registrado exitosamente en el sistema.
            </p>
          </div>

          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
            <div className='w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
            Redirigiendo a la lista de financiamientos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <Link
              href='/financiamiento-cuota'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors'
            >
              <span className='text-xl'>←</span>
              <span className='font-medium'>Volver a Financiamientos</span>
            </Link>
          </div>

          <div className='text-center mb-8'>
            <div className='inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-blue-100 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>💰</span>
              </div>
              <div className='text-left'>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  Nuevo Financiamiento
                </h1>
                <p className='text-sm text-gray-600'>
                  Crea un nuevo financiamiento o venta
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pasos del proceso */}
        <div className='max-w-6xl mx-auto mb-8'>
          <div className='flex items-center justify-center gap-4 mb-8'>
            <div className='flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                1
              </span>
              Cliente
            </div>
            <div className='w-8 h-px bg-gray-300'></div>
            <div className='flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                2
              </span>
              Productos
            </div>
            <div className='w-8 h-px bg-gray-300'></div>
            <div className='flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                3
              </span>
              Condiciones
            </div>
            <div className='w-8 h-px bg-gray-300'></div>
            <div className='flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                4
              </span>
              Confirmación
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className='max-w-6xl mx-auto'>
          <div className='bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
            {/* Header del formulario */}
            <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center'>
                  <span className='text-2xl text-white'>🛒</span>
                </div>
                <div className='text-white'>
                  <h2 className='text-xl font-bold mb-1'>
                    Información del Financiamiento
                  </h2>
                  <p className='text-blue-100'>
                    Completa todos los campos requeridos
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className='p-8'>
              <form onSubmit={handleSubmit} className='space-y-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Cliente */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <span className='text-blue-600 font-bold'>1</span>
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Seleccionar Cliente
                      </h3>
                    </div>

                    <div className='relative'>
                      <div className='flex gap-3'>
                        <input
                          type='text'
                          placeholder='Buscar cliente por nombre, teléfono o dirección...'
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
                          className='flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                          autoComplete='off'
                          required
                        />
                        <button
                          type='button'
                          className='px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm'
                          onClick={() => setModalNuevoCliente(true)}
                        >
                          + Cliente
                        </button>
                      </div>

                      {/* Lista de clientes filtrados */}
                      {busquedaCliente &&
                        !clienteSeleccionado &&
                        clientesFiltrados.length > 0 && (
                          <div className='absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
                            {clientesFiltrados.slice(0, 5).map((cliente) => (
                              <button
                                key={cliente.id}
                                type='button'
                                className='w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl'
                                onClick={() => {
                                  setClienteSeleccionado(cliente);
                                  setBusquedaCliente(cliente.nombre);
                                }}
                              >
                                <div className='flex items-center gap-3'>
                                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold'>
                                    {cliente.nombre
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </div>
                                  <div>
                                    <div className='font-semibold text-gray-900'>
                                      {cliente.nombre}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                      {cliente.telefono}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                      {/* Cliente seleccionado */}
                      {clienteSeleccionado && (
                        <div className='mt-3 p-4 border border-blue-200 rounded-xl bg-blue-50'>
                          <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold'>
                              {clienteSeleccionado.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className='flex-1'>
                              <div className='font-semibold text-blue-900'>
                                {clienteSeleccionado.nombre}
                              </div>
                              <div className='text-sm text-blue-700'>
                                {clienteSeleccionado.telefono}
                              </div>
                              
                            </div>
                            <span className='text-blue-600 text-xl'>✅</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Productos */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <span className='text-blue-600 font-bold'>2</span>
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Agregar Productos
                      </h3>
                    </div>

                    {/* Búsqueda de productos */}
                    <div className='relative'>
                      <input
                        type='text'
                        placeholder='Buscar producto del inventario...'
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
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                        autoComplete='off'
                      />

                      {/* Lista de productos filtrados */}
                      {busquedaProducto &&
                        !productoSeleccionado &&
                        productosFiltrados.length > 0 && (
                          <div className='absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto'>
                            {productosFiltrados.slice(0, 5).map((producto) => (
                              <button
                                key={producto.id}
                                type='button'
                                className='w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0'
                                onClick={() => {
                                  setProductoSeleccionado(producto);
                                  setBusquedaProducto(producto.nombre);
                                }}
                              >
                                <div className='flex items-center justify-between'>
                                  <div>
                                    <div className='font-semibold text-gray-900'>
                                      {producto.nombre}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                      ${producto.precio.toFixed(0)} • Stock:{" "}
                                      {producto.stock}
                                    </div>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
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

                    {/* Producto seleccionado */}
                    {productoSeleccionado && (
                      <div className='p-4 border border-blue-200 rounded-xl bg-blue-50'>
                        <div className='space-y-3'>
                          <div className='font-semibold text-blue-900'>
                            {productoSeleccionado.nombre}
                          </div>
                          <div className='flex items-center justify-between text-sm'>
                            <span className='text-blue-700'>
                              Precio: ${productoSeleccionado.precio.toFixed(0)}
                            </span>
                            <span className='text-blue-700'>
                              Stock: {productoSeleccionado.stock}
                            </span>
                          </div>

                          <div className='flex items-center gap-3'>
                            <label className='text-sm font-medium text-blue-700'>
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
                              className='w-20 px-2 py-1 border border-blue-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500'
                            />
                            <button
                              type='button'
                              onClick={agregarProductoCarrito}
                              disabled={
                                productoSeleccionado.stock < cantidadProducto
                              }
                              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Carrito de productos */}
                    {productosCarrito.length > 0 && (
                      <div className='p-4 border border-green-200 rounded-xl bg-green-50'>
                        <h4 className='font-semibold text-green-800 mb-3 flex items-center gap-2'>
                          🛒 Productos Agregados ({productosCarrito.length})
                        </h4>
                        <div className='space-y-2'>
                          {productosCarrito.map((item) => (
                            <div
                              key={item.productoId}
                              className='flex items-center justify-between bg-white p-3 rounded-lg border'
                            >
                              <div className='flex-1'>
                                <div className='font-medium text-gray-900'>
                                  {getProductoNombre(item.productoId)}
                                </div>
                                <div className='text-sm text-gray-600'>
                                  ${item.precioUnitario.toFixed(0)} c/u
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
                                    ${item.subtotal.toFixed(0)}
                                  </div>
                                </div>
                                <button
                                  type='button'
                                  onClick={() =>
                                    removerProductoCarrito(item.productoId)
                                  }
                                  className='text-red-600 hover:text-red-800 p-1 text-lg'
                                  title='Remover producto'
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className='mt-4 pt-3 border-t border-green-200'>
                          <div className='flex justify-between items-center text-lg font-bold text-green-800'>
                            <span>Total Base:</span>
                            <span>${montoTotal.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condiciones del financiamiento */}
                {productosCarrito.length > 0 && (
                  <div className='border-t border-gray-200 pt-8'>
                    <div className='flex items-center gap-2 mb-6'>
                      <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <span className='text-blue-600 font-bold'>3</span>
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Condiciones del Financiamiento
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* Monto */}
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                          Monto Final
                        </label>
                        <div className='relative'>
                          <span className='absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500'>
                            $
                          </span>
                          <input
                            type='number'
                            value={formData.monto}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setFormData({
                                ...formData,
                                monto: e.target.value,
                              })
                            }
                            className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50'
                            readOnly
                          />
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          Calculado automáticamente (+50% recargo)
                        </p>
                      </div>

                      {/* Plan de Cuotas */}
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                          Plan de Cuotas
                        </label>
                        <div className='w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600'>
                          15 cuotas semanales (fijo)
                        </div>
                        {parseFloat(formData.monto) > 0 && (
                          <p className='text-xs text-gray-500 mt-1'>
                            Valor por cuota: $
                            {Math.round(
                              parseFloat(formData.monto) / 15
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Cuotas Iniciales */}
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                          Cuotas Iniciales
                        </label>
                        <select
                          value={cuotasIniciales}
                          onChange={(e) =>
                            setCuotasIniciales(parseInt(e.target.value))
                          }
                          className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                        >
                          <option value={1}>1 cuota inicial</option>
                          <option value={2}>2 cuotas iniciales</option>
                          <option value={3}>3 cuotas iniciales</option>
                          <option value={4}>4 cuotas iniciales</option>
                        </select>
                        {cuotasIniciales > 0 &&
                          parseFloat(formData.monto) > 0 && (
                            <div className='mt-2 space-y-1'>
                              <p className='text-xs text-blue-600 font-medium'>
                                💰 Pago inicial: $
                                {Math.round(
                                  (parseFloat(formData.monto) / 15) *
                                    cuotasIniciales
                                ).toLocaleString()}
                              </p>
                              <p className='text-xs text-gray-500'>
                                Se marcarán como pagadas las últimas{" "}
                                {cuotasIniciales} cuota
                                {cuotasIniciales > 1 ? "s" : ""} del plan
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Fecha de inicio */}
                      <div className='md:col-span-3'>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>
                          Fecha de Inicio
                        </label>
                        <input
                          type='date'
                          value={formData.fechaInicio}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFormData({
                              ...formData,
                              fechaInicio: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                          required
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className='mt-6'>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>
                        Descripción (Opcional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.descripcion}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none'
                        placeholder={`Financiamiento de ${
                          productosCarrito.length
                        } producto${
                          productosCarrito.length > 1 ? "s" : ""
                        }: ${productosCarrito
                          .map((p) => getProductoNombre(p.productoId))
                          .join(", ")}`}
                      />
                    </div>
                  </div>
                )}

                {/* Resumen final */}
                {productosCarrito.length > 0 && (
                  <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200'>
                    <h3 className='text-lg font-bold text-blue-900 mb-4 flex items-center gap-2'>
                      📋 Resumen del Financiamiento
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Productos:</span>
                          <span className='font-semibold'>
                            {productosCarrito.length}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Total base:</span>
                          <span className='font-semibold'>
                            ${montoTotal.toFixed(0)}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Recargo (50%):</span>
                          <span className='font-semibold text-orange-600'>
                            +${(montoTotal * 0.5).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Monto final:</span>
                          <span className='font-bold text-lg text-blue-700'>
                            ${formData.monto}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Cuotas:</span>
                          <span className='font-semibold'>
                            15 de $
                            {Math.round(
                              parseFloat(formData.monto) / 15
                            ).toLocaleString()}
                          </span>
                        </div>
                        {cuotasIniciales > 0 && (
                          <div className='flex justify-between'>
                            <span className='text-gray-700'>Pago inicial:</span>
                            <span className='font-semibold text-blue-600'>
                              $
                              {Math.round(
                                (parseFloat(formData.monto) / 15) *
                                  cuotasIniciales
                              ).toLocaleString()}{" "}
                              ({cuotasIniciales} cuota
                              {cuotasIniciales > 1 ? "s" : ""})
                            </span>
                          </div>
                        )}
                        <div className='flex justify-between'>
                          <span className='text-gray-700'>Modalidad:</span>
                          <span className='font-semibold'>
                            15 Cuotas Semanales
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className='flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200'>
                  <button
                    type='button'
                    onClick={() => router.push("/financiamiento-cuota")}
                    disabled={loading}
                    className='flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={loading || productosCarrito.length === 0}
                    className='flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {loading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        {`Crear Financiamiento (${
                          productosCarrito.length
                        } producto${productosCarrito.length > 1 ? "s" : ""})`}
                      </>
                    )}
                  </button>
                </div>
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
          onClienteCreado={(cliente) => {
            setModalNuevoCliente(false);
            // El cliente se agregará automáticamente via Redux
            setClienteSeleccionado(cliente);
            setBusquedaCliente(cliente.nombre);
          }}
          onCancel={() => setModalNuevoCliente(false)}
        />
      </Modal>
    </div>
  );
}
