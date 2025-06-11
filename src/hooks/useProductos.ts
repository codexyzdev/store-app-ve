import { useState, useEffect, useCallback } from 'react';
import { inventarioDB, Producto } from '@/lib/firebase/database';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = inventarioDB.suscribir((data) => {
      setProductos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Funciones auxiliares reutilizables con useCallback
  const getProductoById = useCallback((id: string): Producto | null => {
    return productos.find((p) => p.id === id) || null;
  }, [productos]);

  const getProductoNombre = useCallback((id: string): string => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : "Producto no encontrado";
  }, [productos]);

  const getProductoPrecio = useCallback((id: string): number => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.precio : 0;
  }, [productos]);

  const getProductoStock = useCallback((id: string): number => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.stock : 0;
  }, [productos]);

  // Buscar productos por nombre
  const buscarProductos = useCallback((termino: string): Producto[] => {
    if (!termino.trim()) return productos;

    const terminoLower = termino.toLowerCase();
    return productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(terminoLower) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoLower)) ||
      (producto.categoria && producto.categoria.toLowerCase().includes(terminoLower))
    );
  }, [productos]);

  // Obtener productos con stock bajo
  const getProductosStockBajo = useCallback((limite: number = 5): Producto[] => {
    return productos.filter(producto => producto.stock <= limite);
  }, [productos]);

  // Obtener productos más vendidos (requiere pasar financiamientos)
  const getProductosMasVendidos = useCallback((financiamientos?: any[]) => {
    if (!financiamientos) return [];

    const ventasPorProducto = financiamientos.reduce((acc, f) => {
      const productoId = f.productoId;
      acc[productoId] = (acc[productoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return productos
      .map(producto => ({
        ...producto,
        ventas: ventasPorProducto[producto.id] || 0
      }))
      .sort((a, b) => b.ventas - a.ventas);
  }, [productos]);

  // Estadísticas de productos
  const getEstadisticas = useCallback(() => {
    const stockBajoProductos = productos.filter(producto => producto.stock <= 5);
    const totalValorInventario = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);
    
    return {
      total: productos.length,
      conStock: productos.filter(p => p.stock > 0).length,
      sinStock: productos.filter(p => p.stock === 0).length,
      stockBajo: stockBajoProductos.length,
      totalValorInventario
    };
  }, [productos]);

  return {
    productos,
    loading,
    getProductoById,
    getProductoNombre,
    getProductoPrecio,
    getProductoStock,
    buscarProductos,
    getProductosStockBajo,
    getProductosMasVendidos,
    getEstadisticas
  };
} 