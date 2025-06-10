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
  push,
  runTransaction
} from 'firebase/database';

// Tipos de datos
export interface Cliente {
  id: string;
  numeroControl: number;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  createdAt: number;
  fotoCedulaUrl?: string;
}

export interface FinanciamientoCuota {
  id: string;
  numeroControl: number;
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
  tipo: 'cuota' | 'abono' | 'inicial';
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
  imagenes?: string[]; // URLs de las imágenes del producto (opcional)
  createdAt: number;
  updatedAt: number;
}



// Funciones CRUD para Clientes
export const clientesDB = {
  async crear(cliente: Omit<Cliente, 'id' | 'numeroControl'>) {
    // Verificar que la cédula sea única
    const esUnica = await verificarCedulaUnica(cliente.cedula);
    if (!esUnica) {
      throw new Error(`Ya existe un cliente con la cédula ${cliente.cedula}`);
    }

    // Obtener siguiente número de control
    const numeroControl = await contadoresDB.obtenerSiguiente('clientes');
    
    const clientesRef = ref(database, 'clientes');
    const newClienteRef = push(clientesRef);
    const id = newClienteRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoCliente = { ...cliente, id, numeroControl };
    await set(newClienteRef, nuevoCliente);
    return nuevoCliente;
  },

  async obtener(id: string) {
    const snapshot = await get(ref(database, `clientes/${id}`));
    return snapshot.val() as Cliente;
  },

  async actualizar(id: string, datos: Partial<Cliente>) {
    // Si se está actualizando la cédula, verificar que sea única
    if (datos.cedula) {
      const esUnica = await verificarCedulaUnica(datos.cedula, id);
      if (!esUnica) {
        throw new Error(`Ya existe un cliente con la cédula ${datos.cedula}`);
      }
    }
    
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
  async crear(financiamiento: Omit<FinanciamientoCuota, 'id' | 'numeroControl'>) {
    // Obtener siguiente número de control
    const numeroControl = await contadoresDB.obtenerSiguiente('financiamientos');
    
    const financiamientosRef = ref(database, 'financiamientos');
    const newFinanciamientoRef = push(financiamientosRef);
    const id = newFinanciamientoRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoFinanciamiento = { ...financiamiento, id, numeroControl };
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
    console.log(`🔍 Iniciando creación de cobro con comprobante: "${cobro.comprobante}"`);
    
    // Validar comprobante duplicado inmediatamente antes de crear
    if (cobro.tipoPago && cobro.tipoPago !== 'efectivo' && cobro.comprobante && cobro.comprobante.trim()) {
      console.log(`🔍 Validando comprobante "${cobro.comprobante}" antes de crear...`);
      
      // Hacer una verificación final
      const esDuplicado = await this.verificarComprobanteDuplicado(cobro.comprobante.trim());
      
      if (esDuplicado) {
        console.log(`❌ DUPLICADO DETECTADO: "${cobro.comprobante}"`);
        throw new Error(`El número de comprobante "${cobro.comprobante}" ya está registrado en el sistema`);
      }
      
      console.log(`✅ Comprobante "${cobro.comprobante}" validado como único, procediendo a crear...`);
    }

    const cobrosRef = ref(database, 'cobros');
    const newCobroRef = push(cobrosRef);
    const id = newCobroRef.key;
    if (!id) throw new Error('Error al generar ID');
    
    const nuevoCobro = { ...cobro, id };
    await set(newCobroRef, nuevoCobro);
    
    console.log(`✅ Cobro creado exitosamente con ID: ${id}`);
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
  },

  // Exponer la función de verificación de comprobantes duplicados
  async verificarComprobanteDuplicado(numeroComprobante: string): Promise<boolean> {
    try {
      // Normalizar el número de comprobante (solo trim, sin toLowerCase para números)
      const comprobanteNormalizado = numeroComprobante.trim();
      
      if (!comprobanteNormalizado) {
        return false; // Comprobante vacío no puede ser duplicado
      }
      
      const cobrosRef = ref(database, 'cobros');
      const snapshot = await get(cobrosRef);
      
      if (!snapshot.exists()) {
        console.log(`Verificación comprobante "${numeroComprobante}": DISPONIBLE (no hay cobros)`);
        return false; // No hay cobros, no puede ser duplicado
      }
      
      const todosLosCobros = snapshot.val() as Record<string, Cobro>;
      
      // Buscar si algún cobro tiene el mismo comprobante
      const cobrosConComprobante = Object.values(todosLosCobros).filter(
        cobro => {
          // Verificar que el cobro tenga comprobante y no sea efectivo
          if (!cobro.comprobante || cobro.tipoPago === 'efectivo') {
            return false;
          }
          
          // Normalizar y comparar (exacto, case-sensitive para números)
          const comprobanteExistente = cobro.comprobante.trim();
          return comprobanteExistente === comprobanteNormalizado;
        }
      );
      
      const resultado = cobrosConComprobante.length > 0;
      
      // Log detallado para debugging
      if (resultado) {
        console.log(`Verificación comprobante "${numeroComprobante}": DUPLICADO`);
        console.log(`Encontrados ${cobrosConComprobante.length} cobros con este comprobante:`, 
          cobrosConComprobante.map(c => ({ id: c.id, comprobante: c.comprobante, tipoPago: c.tipoPago }))
        );
      } else {
        console.log(`Verificación comprobante "${numeroComprobante}": DISPONIBLE`);
      }
      
      return resultado;
    } catch (error) {
      console.error('Error al verificar comprobante duplicado:', error);
      // En caso de error, ser conservador y retornar false para no bloquear
      return false;
    }
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

// Funciones para manejar contadores autoincrement
export const contadoresDB = {
  async obtenerSiguiente(entidad: 'clientes' | 'financiamientos'): Promise<number> {
    const contadorRef = ref(database, `contadores/${entidad}`);
    
    try {
      const resultado = await runTransaction(contadorRef, (valorActual) => {
        // Si no existe el contador, empezar en 1
        const nuevoValor = (valorActual || 0) + 1;
        return nuevoValor;
      });
      
      return resultado.snapshot.val();
    } catch (error) {
      console.error('Error al obtener siguiente número de control:', error);
      throw new Error('Error al generar número de control');
    }
  }
};

// Función para verificar unicidad de cédula
async function verificarCedulaUnica(cedula: string, idExcluir?: string): Promise<boolean> {
  try {
    // Obtener todos los clientes y filtrar en el cliente
    const snapshot = await get(ref(database, 'clientes'));
    
    if (!snapshot.exists()) {
      return true; // No hay clientes, la cédula es única
    }
    
    const todosLosClientes = snapshot.val() as Record<string, Cliente>;
    
    // Buscar si algún cliente tiene la misma cédula
    const clientesConCedula = Object.values(todosLosClientes).filter(
      cliente => cliente.cedula === cedula
    );
    
    // Si estamos editando un cliente, excluirlo de la verificación
    if (idExcluir) {
      const clientesFiltrados = clientesConCedula.filter(
        cliente => cliente.id !== idExcluir
      );
      return clientesFiltrados.length === 0;
    }
    
    return clientesConCedula.length === 0; // Retorna true si no hay clientes con esa cédula
  } catch (error) {
    console.error('Error al verificar unicidad de cédula:', error);
    // En caso de error, permitir la operación para no bloquear la funcionalidad
    return true;
  }
} 