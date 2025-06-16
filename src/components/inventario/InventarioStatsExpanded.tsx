import { useState, useEffect } from "react";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo?: number;
  precio: number;
  descripcion?: string;
}

interface InventarioStatsExpandedProps {
  productos: Producto[];
}

export function InventarioStatsExpanded({
  productos,
}: InventarioStatsExpandedProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {}
  );

  const totalProductos = productos.length;
  const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);
  const valorInventario = productos.reduce(
    (sum, p) => sum + p.stock * p.precio,
    0
  );
  const productosStockBajo = productos.filter(
    (p) => p.stock <= (p.stockMinimo || 5) && p.stock > 0
  ).length;
  const productosSinStock = productos.filter((p) => p.stock === 0).length;
  const categorias = new Set(productos.map((p) => p.categoria)).size;

  // Animación de números
  useEffect(() => {
    const targets = {
      totalProductos,
      totalStock,
      valorInventario,
      productosStockBajo,
      productosSinStock,
      categorias,
    };

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 20; // 20 frames de animación más rápida
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 30);
    });
  }, [
    totalProductos,
    totalStock,
    valorInventario,
    productosStockBajo,
    productosSinStock,
    categorias,
  ]);

  const stats = [
    {
      name: "Total Productos",
      value: (animatedValues.totalProductos || 0).toString(),
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      name: "Stock Total",
      value: (animatedValues.totalStock || 0).toString(),
      icon: "✅",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      name: "Valor Inventario",
      value: `$${(animatedValues.valorInventario || 0).toLocaleString()}`,
      icon: "💎",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      name: "Stock Bajo",
      value: (animatedValues.productosStockBajo || 0).toString(),
      icon: "⚠️",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
    {
      name: "Sin Stock",
      value: (animatedValues.productosSinStock || 0).toString(),
      icon: "❌",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    {
      name: "Categorías",
      value: (animatedValues.categorias || 0).toString(),
      icon: "📦",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-200",
    },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
      {stats.map((stat, index) => (
        <div
          key={stat.name}
          className={`${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-200 group`}
          style={{
            animationDelay: `${index * 100}ms`,
            animation: "fadeInUp 0.6s ease-out forwards",
          }}
        >
          <div className='flex flex-col items-center text-center'>
            <div
              className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200`}
            >
              <span className='text-xl text-white'>{stat.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
              {stat.value}
            </div>
            <div className='text-xs text-gray-600 font-medium'>{stat.name}</div>
          </div>
        </div>
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `,
        }}
      />
    </div>
  );
}
