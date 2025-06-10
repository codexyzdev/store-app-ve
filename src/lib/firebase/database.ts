import { database } from './config';
import { 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  off,
  DataSnapshot,
  push
} from 'firebase/database';

// Tipos de datos
export interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  createdAt: number;
  fotoCedulaUrl?: string;
}

export interface FinanciamientoCuota {
  id: string;
  clienteId: string;
  monto: number; // Monto fijo al momento de crear el financiamiento. No se modifica si el precio del producto cambia.
  cuotas: number; // 0 si es contado
  fechaInicio: number;
  estado: 'activo' | 'completado' | 'atrasado';
  productoId: string; // Mantener para compatibilidad con financiamientos existentes
  productos?: ProductoFinanciamiento[]; // Array de productos para financiamientos agrupados
  tipoVenta: 'contado' | 'cuotas';
  pagado?: boolean; // solo para contado
  descripcion?: string;
}

// Alias para compatibilidad con código existente
export type Prestamo = FinanciamientoCuota;
export type ProductoPrestamo = ProductoFinanciamiento;

export interface ProductoFinanciamiento {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Cobro {
  id: string;
  financiamientoId: string;
  monto: number;
  fecha: number;
  tipo: 'cuota' | 'abono';
  tipoPago?: string;
  comprobante?: string;
  imagenComprobante?: string;
  numeroCuota?: number;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
  categoria: string;
  createdAt: number;
  updatedAt: number;
}

// Funciones CRUD para Clientes
export const clientesDB = {
  async crear(cliente: Omit<Cliente, 'id'>) {
    const clientesRef = ref(database, 'clientes');
    const newClienteRef = push(clientesRef);
    const id = newClienteRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoCliente = { ...cliente, id };
    await set(newClienteRef, nuevoCliente);
    return nuevoCliente;
  },

  async obtener(id: string) {
    const snapshot = await get(ref(database, `clientes/${id}`));
    return snapshot.val() as Cliente;
  },

  async actualizar(id: string, datos: Partial<Cliente>) {
    await update(ref(database, `clientes/${id}`), datos);
  },

  async eliminar(id: string) {
    await remove(ref(database, `clientes/${id}`));
  },

  // Suscripción en tiempo real
  suscribir(callback: (clientes: Cliente[]) => void) {
    const clientesRef = ref(database, 'clientes');
    onValue(clientesRef, (snapshot) => {
      const data = snapshot.val();
      const clientes = data ? Object.values(data) : [];
      callback(clientes as Cliente[]);
    });

    // Retorna función para cancelar suscripción
    return () => off(clientesRef);
  }
};

// Funciones CRUD para Financiamientos
export const financiamientoDB = {
  async crear(financiamiento: Omit<FinanciamientoCuota, 'id'>) {
    const financiamientosRef = ref(database, 'financiamientos');
    const newFinanciamientoRef = push(financiamientosRef);
    const id = newFinanciamientoRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoFinanciamiento = { ...financiamiento, id };
    await set(newFinanciamientoRef, nuevoFinanciamiento);
    return nuevoFinanciamiento;
  },

  async obtener(id: string) {
    const snapshot = await get(ref(database, `financiamientos/${id}`));
    return snapshot.val() as FinanciamientoCuota;
  },

  async actualizar(id: string, datos: Partial<FinanciamientoCuota>) {
    await update(ref(database, `financiamientos/${id}`), datos);
  },

  async eliminar(id: string) {
    await remove(ref(database, `financiamientos/${id}`));
  },

  // Obtener financiamientos por cliente
  async obtenerPorCliente(clienteId: string) {
    const financiamientosQuery = query(
      ref(database, 'financiamientos'),
      orderByChild('clienteId'),
      equalTo(clienteId)
    );
    const snapshot = await get(financiamientosQuery);
    return snapshot.val() as Record<string, FinanciamientoCuota>;
  },

  // Suscripción en tiempo real
  suscribir(callback: (financiamientos: FinanciamientoCuota[]) => void) {
    const financiamientosRef = ref(database, 'financiamientos');
    onValue(financiamientosRef, (snapshot) => {
      const data = snapshot.val();
      const financiamientos = data ? Object.values(data) : [];
      callback(financiamientos as FinanciamientoCuota[]);
    });

    return () => off(financiamientosRef);
  }
};

// Mantener funciones de préstamos para compatibilidad con datos existentes
export const prestamosDB = financiamientoDB;

// Funciones CRUD para Cobros
export const cobrosDB = {
  async crear(cobro: Omit<Cobro, 'id'>) {
    const cobrosRef = ref(database, 'cobros');
    const newCobroRef = push(cobrosRef);
    const id = newCobroRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoCobro = { ...cobro, id };
    await set(newCobroRef, nuevoCobro);
    return nuevoCobro;
  },

  async obtener(id: string) {
    const snapshot = await get(ref(database, `cobros/${id}`));
    return snapshot.val() as Cobro;
  },

  // Obtener cobros del día
  async obtenerCobrosDelDia() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const timestampHoy = hoy.getTime();

    const cobrosQuery = query(
      ref(database, 'cobros'),
      orderByChild('fecha'),
      equalTo(timestampHoy)
    );
    const snapshot = await get(cobrosQuery);
    return snapshot.val() as Record<string, Cobro>;
  },

  // Suscripción en tiempo real a todos los cobros
  suscribir(callback: (cobros: Cobro[]) => void) {
    const cobrosRef = ref(database, 'cobros');
    onValue(cobrosRef, (snapshot) => {
      const data = snapshot.val();
      const cobros = data ? Object.values(data) : [];
      callback(cobros as Cobro[]);
    });
    return () => off(cobrosRef);
  },

  // Suscripción en tiempo real a cobros del día
  suscribirCobrosDelDia(callback: (cobros: Cobro[]) => void) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const timestampHoy = hoy.getTime();

    const cobrosQuery = query(
      ref(database, 'cobros'),
      orderByChild('fecha'),
      equalTo(timestampHoy)
    );

    onValue(cobrosQuery, (snapshot) => {
      const data = snapshot.val();
      const cobros = data ? Object.values(data) : [];
      callback(cobros as Cobro[]);
    });

    return () => off(cobrosQuery);
  }
};

// Funciones CRUD para Inventario
export const inventarioDB = {
  async crear(producto: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>) {
    const productosRef = ref(database, 'productos');
    const newProductoRef = push(productosRef);
    const id = newProductoRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const timestamp = Date.now();
    const nuevoProducto = { 
      ...producto, 
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await set(newProductoRef, nuevoProducto);
    return nuevoProducto;
  },

  async obtener(id: string) {
    const snapshot = await get(ref(database, `productos/${id}`));
    return snapshot.val() as Producto;
  },

  async actualizar(id: string, datos: Partial<Omit<Producto, 'id' | 'createdAt'>>) {
    const actualizacion = {
      ...datos,
      updatedAt: Date.now()
    };
    await update(ref(database, `productos/${id}`), actualizacion);
  },

  async eliminar(id: string) {
    await remove(ref(database, `productos/${id}`));
  },

  async actualizarStock(id: string, cantidad: number) {
    const producto = await this.obtener(id);
    if (!producto) throw new Error('Producto no encontrado');
    
    const nuevoStock = producto.stock + cantidad;
    if (nuevoStock < 0) throw new Error('Stock no puede ser negativo');
    
    await this.actualizar(id, { stock: nuevoStock });
  },

  // Obtener productos por categoría
  async obtenerPorCategoria(categoria: string) {
    const productosQuery = query(
      ref(database, 'productos'),
      orderByChild('categoria'),
      equalTo(categoria)
    );
    const snapshot = await get(productosQuery);
    return snapshot.val() as Record<string, Producto>;
  },

  // Suscripción en tiempo real
  suscribir(callback: (productos: Producto[]) => void) {
    const productosRef = ref(database, 'productos');
    onValue(productosRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const productos = data ? Object.values(data) : [];
      callback(productos as Producto[]);
    });

    return () => off(productosRef);
  }
}; 