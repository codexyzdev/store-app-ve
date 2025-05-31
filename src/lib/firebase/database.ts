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
  telefono: string;
  direccion: string;
  createdAt: number;
}

export interface Prestamo {
  id: string;
  clienteId: string;
  monto: number;
  cuotas: number;
  fechaInicio: number;
  estado: 'activo' | 'completado' | 'atrasado';
  productoId: string;
  descripcion?: string;
}

export interface Cobro {
  id: string;
  prestamoId: string;
  monto: number;
  fecha: number;
  tipo: 'cuota' | 'abono';
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
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

// Funciones CRUD para Préstamos
export const prestamosDB = {
  async crear(prestamo: Omit<Prestamo, 'id'>) {
    const prestamosRef = ref(database, 'prestamos');
    const newPrestamoRef = push(prestamosRef);
    const id = newPrestamoRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoPrestamo = { ...prestamo, id };
    await set(newPrestamoRef, nuevoPrestamo);
    return nuevoPrestamo;
  },

  async obtener(id: string) {
    const snapshot = await get(ref(database, `prestamos/${id}`));
    return snapshot.val() as Prestamo;
  },

  async actualizar(id: string, datos: Partial<Prestamo>) {
    await update(ref(database, `prestamos/${id}`), datos);
  },

  async eliminar(id: string) {
    await remove(ref(database, `prestamos/${id}`));
  },

  // Obtener préstamos por cliente
  async obtenerPorCliente(clienteId: string) {
    const prestamosQuery = query(
      ref(database, 'prestamos'),
      orderByChild('clienteId'),
      equalTo(clienteId)
    );
    const snapshot = await get(prestamosQuery);
    return snapshot.val() as Record<string, Prestamo>;
  },

  // Suscripción en tiempo real
  suscribir(callback: (prestamos: Prestamo[]) => void) {
    const prestamosRef = ref(database, 'prestamos');
    onValue(prestamosRef, (snapshot) => {
      const data = snapshot.val();
      const prestamos = data ? Object.values(data) : [];
      callback(prestamos as Prestamo[]);
    });

    return () => off(prestamosRef);
  }
};

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