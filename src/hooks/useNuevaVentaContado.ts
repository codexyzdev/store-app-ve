import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Producto,
  ProductoFinanciamiento,
  ventasContadoDB,
  VentaContado,
  Cliente,
} from "@/lib/firebase/database";
import { useClientesRedux } from "@/hooks/useClientesRedux";
import { useProductosRedux } from "@/hooks/useProductosRedux";

interface FormData {
  cliente: string;
  monto: string;
  fecha: string;
  descripcion: string;
}

interface DescuentoData {
  tipo: 'porcentaje' | 'monto';
  valor: number;
  montoDescuento: number;
}

export const useNuevaVentaContado = () => {
  const router = useRouter();
  const { clientes } = useClientesRedux();
  const { productos, actualizarStock } = useProductosRedux();

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);

  // Estados del formulario
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [formData, setFormData] = useState<FormData>({
    cliente: "",
    monto: "",
    fecha: todayStr,
    descripcion: "",
  });

  // Estados de productos
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [productosCarrito, setProductosCarrito] = useState<ProductoFinanciamiento[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);

  // Estados de cliente
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // Estados de descuento
  const [descuentoData, setDescuentoData] = useState<DescuentoData>({
    tipo: 'porcentaje',
    valor: 0,
    montoDescuento: 0,
  });

  // Calcular monto total automáticamente
  useEffect(() => {
    const montoOriginalCalc = productosCarrito.reduce((acc, p) => acc + p.subtotal, 0);
    const montoFinal = montoOriginalCalc - descuentoData.montoDescuento;
    setFormData((prev) => ({
      ...prev,
      monto: Math.round(montoFinal).toString(),
    }));
  }, [productosCarrito, descuentoData.montoDescuento]);

  // Sincronizar cliente seleccionado con formData
  useEffect(() => {
    if (clienteSeleccionado) {
      setFormData((prev) => ({ ...prev, cliente: clienteSeleccionado.id }));
      setBusquedaCliente(clienteSeleccionado.nombre);
    }
  }, [clienteSeleccionado]);

  // Helpers para filtrado
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

  const montoOriginal = productosCarrito.reduce((acc, p) => acc + p.subtotal, 0);
  const montoTotal = montoOriginal - descuentoData.montoDescuento;

  // Funciones del carrito
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
    const existente = productosCarrito.find(
      (p) => p.productoId === productoSeleccionado.id
    );

    if (existente) {
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

  // Función para enviar el formulario
  const handleSubmit = async () => {
    if (!clienteSeleccionado) {
      alert("Selecciona un cliente");
      return;
    }
    if (productosCarrito.length === 0) {
      alert("Agrega productos");
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
        return;
      }
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
          `Venta al contado de ${productosCarrito.length} producto${
            productosCarrito.length > 1 ? "s" : ""
          }`,
        // Campos de descuento
        ...(descuentoData.montoDescuento > 0 && {
          descuentoTipo: descuentoData.tipo,
          descuentoValor: descuentoData.valor,
          montoOriginal: montoOriginal,
          montoDescuento: descuentoData.montoDescuento,
        }),
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

  // Funciones para manejar cambios
  const handleClienteCreado = (cliente: Cliente) => {
    setModalNuevoCliente(false);
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.nombre);
  };

  const handleClienteSeleccionado = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.nombre);
  };

  const handleProductoSeleccionado = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleBusquedaClienteChange = (value: string) => {
    setBusquedaCliente(value);
    if (clienteSeleccionado && value !== clienteSeleccionado.nombre) {
      setClienteSeleccionado(null);
    }
  };

  const handleBusquedaProductoChange = (value: string) => {
    setBusquedaProducto(value);
    if (productoSeleccionado && value !== productoSeleccionado.nombre) {
      setProductoSeleccionado(null);
    }
  };

  const handleDescuentoChange = (descuento: DescuentoData) => {
    setDescuentoData(descuento);
  };

  return {
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
    montoOriginal,
    montoTotal,
    descuentoData,
    
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
    handleDescuentoChange,
    updateFormData,
    
    // Helpers
    getProductoNombre,
    
    // Navegación
    router,
  };
}; 