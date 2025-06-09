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

interface InventarioStatsProps {
  productos: Producto[];
}

interface StatCard {
  name: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  trend?: string;
  description: string;
}

export function InventarioStats({ productos }: InventarioStatsProps) {
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
      const increment = target / 30; // 30 frames de animación
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 50);
    });
  }, [
    totalProductos,
    totalStock,
    valorInventario,
    productosStockBajo,
    productosSinStock,
    categorias,
  ]);

  const stats: StatCard[] = [
    {
      name: "Total Productos",
      value: (animatedValues.totalProductos || 0).toLocaleString(),
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      description: "Productos registrados en el sistema",
    },
    {
      name: "Stock Total",
      value: (animatedValues.totalStock || 0).toLocaleString(),
      icon: "📊",
      color: "from-green-500 to-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      description: "Unidades totales en inventario",
    },
    {
      name: "Valor Inventario",
      value: `$${(animatedValues.valorInventario || 0).toLocaleString()}`,
      icon: "💰",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      description: "Valor total del inventario",
    },
    {
      name: "Stock Bajo",
      value: (animatedValues.productosStockBajo || 0).toString(),
      icon: "⚠️",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      description: "Productos con stock bajo",
    },
    {
      name: "Sin Stock",
      value: (animatedValues.productosSinStock || 0).toString(),
      icon: "🚫",
      color: "from-red-500 to-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      description: "Productos agotados",
    },
    {
      name: "Categorías",
      value: (animatedValues.categorias || 0).toString(),
      icon: "🏷️",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-200",
      description: "Categorías diferentes",
    },
  ];

  const getHealthStatus = () => {
    const stockIssues = productosStockBajo + productosSinStock;
    if (stockIssues === 0)
      return { status: "Excelente", color: "text-green-600", icon: "🟢" };
    if (stockIssues <= 2)
      return { status: "Bueno", color: "text-yellow-600", icon: "🟡" };
    return { status: "Necesita atención", color: "text-red-600", icon: "🔴" };
  };

  const health = getHealthStatus();

  return (
    <div className='mb-8'>
      {/* Estado general del inventario */}
      <div className='mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Estado del Inventario
            </h3>
            <p className='text-sm text-gray-600'>
              Resumen general del estado actual
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-lg'>{health.icon}</span>
            <span className={`font-medium ${health.color}`}>
              {health.status}
            </span>
          </div>
        </div>

        {/* Barra de progreso del inventario */}
        <div className='space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Productos con stock adecuado</span>
            <span className='font-medium text-gray-900'>
              {totalProductos - productosStockBajo - productosSinStock} de{" "}
              {totalProductos}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out'
              style={{
                width:
                  totalProductos > 0
                    ? `${
                        ((totalProductos -
                          productosStockBajo -
                          productosSinStock) /
                          totalProductos) *
                        100
                      }%`
                    : "0%",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className={`${stat.bgColor} rounded-2xl p-6 border ${stat.borderColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fadeInUp 0.6s ease-out forwards",
            }}
          >
            {/* Efecto de brillo */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>

            <div className='relative'>
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200`}
                  >
                    <span className='text-xl filter drop-shadow-sm'>
                      {stat.icon}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className='space-y-2'>
                <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {stat.name}
                </p>
                <p
                  className={`text-3xl font-bold ${stat.textColor} leading-none`}
                >
                  {stat.value}
                </p>
                <p className='text-xs text-gray-600 leading-relaxed'>
                  {stat.description}
                </p>
              </div>

              {/* Indicador de tendencia (si aplica) */}
              {stat.name === "Stock Bajo" && productosStockBajo > 0 && (
                <div className='mt-3 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full'>
                  <span className='text-xs text-amber-700 font-medium'>
                    Revisar
                  </span>
                </div>
              )}

              {stat.name === "Sin Stock" && productosSinStock > 0 && (
                <div className='mt-3 inline-flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full'>
                  <span className='text-xs text-red-700 font-medium'>
                    Urgente
                  </span>
                </div>
              )}

              {stat.name === "Valor Inventario" && valorInventario > 0 && (
                <div className='mt-3 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full'>
                  <span className='text-xs text-purple-700 font-medium'>
                    Activos
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen rápido */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white'>
          <div className='flex items-center gap-3'>
            <span className='text-3xl'>✅</span>
            <div>
              <p className='text-lg font-bold'>
                {totalProductos - productosStockBajo - productosSinStock}
              </p>
              <p className='text-green-100 text-sm'>Productos OK</p>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white'>
          <div className='flex items-center gap-3'>
            <span className='text-3xl'>⚠️</span>
            <div>
              <p className='text-lg font-bold'>{productosStockBajo}</p>
              <p className='text-amber-100 text-sm'>Stock Bajo</p>
            </div>
          </div>
        </div>

        <div className='bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white'>
          <div className='flex items-center gap-3'>
            <span className='text-3xl'>🚫</span>
            <div>
              <p className='text-lg font-bold'>{productosSinStock}</p>
              <p className='text-red-100 text-sm'>Sin Stock</p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
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
