import React, { useEffect, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { inventarioDB, Producto } from '@/lib/firebase/database'
import { setProductos, clearError } from '@/store/inventarioSlice'
import { useUI } from './useUI'

export const useProductosRedux = () => {
  const dispatch = useAppDispatch()
  const inventarioState = useAppSelector((state) => state.inventario)
  const { showNotification } = useUI()

  // Suscripción a Firebase
  useEffect(() => {
    const unsubscribe = inventarioDB.suscribir((productos) => {
      dispatch(setProductos(productos))
      dispatch(clearError())
    })

    return unsubscribe
  }, [dispatch])

  // Productos filtrados (memoizado para performance)
  const productosFiltrados = useMemo(() => {
    let resultado = [...inventarioState.productos]

    // Filtrar por búsqueda
    if (inventarioState.searchTerm.trim()) {
      const termino = inventarioState.searchTerm.toLowerCase()
      resultado = resultado.filter((producto) =>
        producto.nombre.toLowerCase().includes(termino) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(termino)) ||
        (producto.categoria && producto.categoria.toLowerCase().includes(termino))
      )
    }

    // Filtrar por categoría
    if (inventarioState.filterCategory) {
      resultado = resultado.filter((producto) =>
        producto.categoria === inventarioState.filterCategory
      )
    }

    // Filtrar por stock
    if (inventarioState.filterStock) {
      switch (inventarioState.filterStock) {
        case 'conStock':
          resultado = resultado.filter((producto) => producto.stock > 0)
          break
        case 'sinStock':
          resultado = resultado.filter((producto) => producto.stock === 0)
          break
        case 'stockBajo':
          resultado = resultado.filter((producto) => producto.stock <= (producto.stockMinimo || 5))
          break
      }
    }

    // Ordenar
    resultado.sort((a, b) => {
      let comparison = 0
      
      switch (inventarioState.sortBy) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case 'precio':
          comparison = a.precio - b.precio
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'categoria':
          comparison = a.categoria.localeCompare(b.categoria)
          break
      }

      return inventarioState.sortOrder === 'desc' ? -comparison : comparison
    })

    return resultado
  }, [inventarioState.productos, inventarioState.searchTerm, inventarioState.filterCategory, inventarioState.filterStock, inventarioState.sortBy, inventarioState.sortOrder])

  // Funciones CRUD con notificaciones
  const crearProducto = useCallback(async (productoData: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const nuevoProducto = await inventarioDB.crear(productoData)
      
      // El producto se agregará automáticamente via suscripción de Firebase
      showNotification({
        type: 'success',
        message: `Producto "${nuevoProducto.nombre}" creado exitosamente`
      })
      
      return nuevoProducto
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear producto'
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [showNotification])

  const actualizarProducto = useCallback(async (id: string, datos: Partial<Producto>) => {
    try {
      await inventarioDB.actualizar(id, datos)
      
      showNotification({
        type: 'success',
        message: 'Producto actualizado exitosamente'
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar producto'
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [showNotification])

  const eliminarProducto = useCallback(async (id: string) => {
    try {
      const producto = inventarioState.productos.find(p => p.id === id)
      if (!producto) throw new Error('Producto no encontrado')

      await inventarioDB.eliminar(id)
      
      showNotification({
        type: 'success',
        message: `Producto "${producto.nombre}" eliminado exitosamente`
      })
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar producto'
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [showNotification, inventarioState.productos])

  const actualizarStock = useCallback(async (id: string, cantidad: number) => {
    try {
      await inventarioDB.actualizarStock(id, cantidad)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar stock'
      showNotification({
        type: 'error',
        message: mensaje
      })
      throw error
    }
  }, [showNotification])

  // Funciones de utilidad (memoizadas)
  const getProductoById = useCallback((id: string): Producto | null => {
    return inventarioState.productos.find(p => p.id === id) || null
  }, [inventarioState.productos])

  const getProductoNombre = useCallback((id: string): string => {
    const producto = getProductoById(id)
    return producto ? producto.nombre : 'Producto no encontrado'
  }, [getProductoById])

  const getProductoPrecio = useCallback((id: string): number => {
    const producto = getProductoById(id)
    return producto ? producto.precio : 0
  }, [getProductoById])

  const getProductoStock = useCallback((id: string): number => {
    const producto = getProductoById(id)
    return producto ? producto.stock : 0
  }, [getProductoById])

  // Buscar productos por nombre
  const buscarProductos = useCallback((termino: string): Producto[] => {
    if (!termino.trim()) return inventarioState.productos

    const terminoLower = termino.toLowerCase()
    return inventarioState.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(terminoLower) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoLower)) ||
      (producto.categoria && producto.categoria.toLowerCase().includes(terminoLower))
    )
  }, [inventarioState.productos])

  // Obtener productos con stock bajo
  const getProductosStockBajo = useCallback((limite: number = 5): Producto[] => {
    return inventarioState.productos.filter(producto => producto.stock <= limite)
  }, [inventarioState.productos])

  // Estadísticas de productos
  const getEstadisticas = useCallback(() => {
    const stockBajoProductos = inventarioState.productos.filter(producto => producto.stock <= (producto.stockMinimo || 5))
    const totalValorInventario = inventarioState.productos.reduce((acc, p) => acc + (p.precio * p.stock), 0)
    
    return {
      total: inventarioState.productos.length,
      conStock: inventarioState.productos.filter(p => p.stock > 0).length,
      sinStock: inventarioState.productos.filter(p => p.stock === 0).length,
      stockBajo: stockBajoProductos.length,
      totalValorInventario
    }
  }, [inventarioState.productos])

  return {
    // Estado
    productos: inventarioState.productos,
    productosFiltrados,
    loading: inventarioState.loading,
    error: inventarioState.error,
    searchTerm: inventarioState.searchTerm,
    filterCategory: inventarioState.filterCategory,
    filterStock: inventarioState.filterStock,
    sortBy: inventarioState.sortBy,
    sortOrder: inventarioState.sortOrder,
    viewMode: inventarioState.viewMode,
    
    // Operaciones CRUD
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarStock,
    
    // Utilidades
    getProductoById,
    getProductoNombre,
    getProductoPrecio,
    getProductoStock,
    buscarProductos,
    getProductosStockBajo,
    getEstadisticas,
  }
} 