import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { inventarioDB, Producto } from '@/lib/firebase/database';

// Estados
interface InventarioState {
  productos: Producto[];
  productosFiltrados: Producto[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterCategory: string;
  filterStock: string;
  sortBy: 'nombre' | 'stock' | 'precio' | 'categoria';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

const initialState: InventarioState = {
  productos: [],
  productosFiltrados: [],
  loading: false,
  error: null,
  searchTerm: '',
  filterCategory: '',
  filterStock: '',
  sortBy: 'nombre',
  sortOrder: 'asc',
  viewMode: 'grid'
};

// Thunks asincrónicos
export const crearProducto = createAsyncThunk(
  'inventario/crearProducto',
  async (datos: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>) => {
    const producto = await inventarioDB.crear(datos);
    return producto;
  }
);

export const actualizarProducto = createAsyncThunk(
  'inventario/actualizarProducto',
  async ({ id, datos }: { id: string; datos: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'> }) => {
    await inventarioDB.actualizar(id, datos);
    return { id, datos };
  }
);

export const eliminarProducto = createAsyncThunk(
  'inventario/eliminarProducto',
  async (id: string) => {
    await inventarioDB.eliminar(id);
    return id;
  }
);

export const cargarProductos = createAsyncThunk(
  'inventario/cargarProductos',
  async () => {
    return new Promise<Producto[]>((resolve) => {
      inventarioDB.suscribir((productos) => {
        resolve(productos);
      });
    });
  }
);

// Función helper para eliminar duplicados por ID
const eliminarDuplicados = (productos: Producto[]): Producto[] => {
  const productosMap = new Map<string, Producto>();
  productos.forEach(producto => {
    productosMap.set(producto.id, producto);
  });
  return Array.from(productosMap.values());
};

// Slice
const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {
    setProductos: (state, action: PayloadAction<Producto[]>) => {
      // Eliminar duplicados antes de guardar
      state.productos = eliminarDuplicados(action.payload);
      inventarioSlice.caseReducers.aplicarFiltros(state);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      inventarioSlice.caseReducers.aplicarFiltros(state);
    },
    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload;
      inventarioSlice.caseReducers.aplicarFiltros(state);
    },
    setFilterStock: (state, action: PayloadAction<string>) => {
      state.filterStock = action.payload;
      inventarioSlice.caseReducers.aplicarFiltros(state);
    },
    setSortBy: (state, action: PayloadAction<'nombre' | 'stock' | 'precio' | 'categoria'>) => {
      state.sortBy = action.payload;
      inventarioSlice.caseReducers.aplicarFiltros(state);
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
      inventarioSlice.caseReducers.aplicarFiltros(state);
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    aplicarFiltros: (state) => {
      // Asegurar que no hay duplicados antes de filtrar
      const productosUnicos = eliminarDuplicados(state.productos);
      
      const filtered = productosUnicos.filter((producto) => {
        const matchesSearch =
          producto.nombre.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          producto.descripcion?.toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesCategory =
          !state.filterCategory || producto.categoria === state.filterCategory;
        const matchesStock =
          !state.filterStock ||
          (state.filterStock === 'bajo' &&
            producto.stock <= (producto.stockMinimo || 5)) ||
          (state.filterStock === 'normal' &&
            producto.stock > (producto.stockMinimo || 5)) ||
          (state.filterStock === 'sin-stock' && producto.stock === 0);

        return matchesSearch && matchesCategory && matchesStock;
      });

      // Ordenar productos
      filtered.sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        switch (state.sortBy) {
          case 'nombre':
            aValue = a.nombre.toLowerCase();
            bValue = b.nombre.toLowerCase();
            break;
          case 'stock':
            aValue = a.stock;
            bValue = b.stock;
            break;
          case 'precio':
            aValue = a.precio;
            bValue = b.precio;
            break;
          case 'categoria':
            aValue = a.categoria.toLowerCase();
            bValue = b.categoria.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      state.productosFiltrados = filtered;
      
      // Actualizar productos con la versión sin duplicados
      if (productosUnicos.length !== state.productos.length) {
        state.productos = productosUnicos;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Crear producto - No agregar aquí porque ya viene de la suscripción
      .addCase(crearProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearProducto.fulfilled, (state) => {
        state.loading = false;
        // No agregar el producto aquí, ya viene de la suscripción de Firebase
      })
      .addCase(crearProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear el producto';
      })
      // Actualizar producto - No actualizar aquí porque ya viene de la suscripción
      .addCase(actualizarProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarProducto.fulfilled, (state) => {
        state.loading = false;
        // No actualizar el producto aquí, ya viene de la suscripción de Firebase
      })
      .addCase(actualizarProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar el producto';
      })
      // Eliminar producto - No eliminar aquí porque ya viene de la suscripción
      .addCase(eliminarProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eliminarProducto.fulfilled, (state) => {
        state.loading = false;
        // No eliminar el producto aquí, ya viene de la suscripción de Firebase
      })
      .addCase(eliminarProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar el producto';
      })
      // Cargar productos
      .addCase(cargarProductos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cargarProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.productos = eliminarDuplicados(action.payload);
        inventarioSlice.caseReducers.aplicarFiltros(state);
      })
      .addCase(cargarProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar los productos';
      });
  }
});

export const {
  setProductos,
  setSearchTerm,
  setFilterCategory,
  setFilterStock,
  setSortBy,
  setSortOrder,
  setViewMode,
  clearError
} = inventarioSlice.actions;

export default inventarioSlice.reducer; 