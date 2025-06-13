import { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo?: number;
  precio: number;
  descripcion?: string;
  imagenes?: string[];
}

interface InventarioCardProps {
  producto: Producto;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
}

// Modal para ver imágenes
function ImageModal({
  isOpen,
  onClose,
  imagenes,
  productName,
}: {
  isOpen: boolean;
  onClose: () => void;
  imagenes: string[];
  productName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imagenes.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Mínima distancia para considerar un swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && imagenes.length > 1) {
      nextImage();
    }
    if (isRightSwipe && imagenes.length > 1) {
      prevImage();
    }
  };

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowLeft" && imagenes.length > 1) {
        prevImage();
      }
      if (e.key === "ArrowRight" && imagenes.length > 1) {
        nextImage();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, imagenes.length, onClose]);

  if (!isOpen || !imagenes || imagenes.length === 0) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='relative max-w-4xl max-h-full w-full bg-white rounded-xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 truncate'>
            {productName}
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation'
          >
            <span className='text-xl text-gray-500'>✕</span>
          </button>
        </div>

        {/* Imagen principal */}
        <div
          className='relative bg-gray-50'
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className='aspect-video sm:aspect-square lg:aspect-video max-h-96 sm:max-h-[500px] flex items-center justify-center'>
            <img
              src={imagenes[currentIndex]}
              alt={`${productName} - ${currentIndex + 1}`}
              className='max-w-full max-h-full object-contain select-none'
              draggable={false}
            />
          </div>

          {/* Controles de navegación - Solo si hay más de una imagen */}
          {imagenes.length > 1 && (
            <>
              {/* Botones anterior/siguiente */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevImage();
                }}
                className='absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all touch-manipulation z-10'
                style={{ touchAction: "manipulation" }}
              >
                <span className='text-xl text-gray-700'>←</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextImage();
                }}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all touch-manipulation z-10'
                style={{ touchAction: "manipulation" }}
              >
                <span className='text-xl text-gray-700'>→</span>
              </button>

              {/* Contador */}
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm'>
                {currentIndex + 1} / {imagenes.length}
              </div>
            </>
          )}
        </div>

        {/* Miniaturas - Solo si hay más de una imagen */}
        {imagenes.length > 1 && (
          <div className='p-4 border-t border-gray-200'>
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {imagenes.map((imagen, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                    index === currentIndex
                      ? "border-indigo-500 ring-2 ring-indigo-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ touchAction: "manipulation" }}
                >
                  <img
                    src={imagen}
                    alt={`${productName} - miniatura ${index + 1}`}
                    className='w-full h-full object-cover select-none'
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Indicador de swipe en móvil */}
        {imagenes.length > 1 && (
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none sm:hidden'>
            <div className='bg-black/40 text-white px-3 py-1 rounded-full text-xs opacity-0 animate-pulse'>
              ← Desliza para navegar →
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook personalizado para el estado del stock
function useStockStatus(stock: number, stockMinimo?: number) {
  if (stock === 0) {
    return {
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: "🚫",
      label: "Sin stock",
    };
  } else if (stock <= (stockMinimo || 5)) {
    return {
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      icon: "⚠️",
      label: "Stock bajo",
    };
  } else {
    return {
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: "✅",
      label: "Stock normal",
    };
  }
}

// Componente para el badge de stock
function StockBadge({
  stockStatus,
  compact = false,
}: {
  stockStatus: ReturnType<typeof useStockStatus>;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor} border flex-shrink-0`}
    >
      <span>{stockStatus.icon}</span>
      {!compact && (
        <>
          <span className='whitespace-nowrap'>
            Stock {stockStatus.label.toLowerCase()}
          </span>
        </>
      )}
      {compact && (
        <span className='whitespace-nowrap'>{stockStatus.label}</span>
      )}
    </span>
  );
}

// Componente para mostrar imagen del producto
function ProductImage({
  imagenes,
  nombre,
  size = "normal",
  onClick,
}: {
  imagenes?: string[];
  nombre: string;
  size?: "small" | "normal" | "large";
  onClick?: () => void;
}) {
  const sizeClasses = {
    small: "w-12 h-12",
    normal: "w-16 h-16",
    large: "aspect-square",
  };

  const iconSizes = {
    small: "text-lg",
    normal: "text-xl",
    large: "text-3xl",
  };

  const hasImages = imagenes && imagenes.length > 0;
  const isClickable = hasImages && onClick;

  if (!hasImages) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200`}
      >
        <span className={`${iconSizes[size]} text-gray-400`}>📦</span>
      </div>
    );
  }

  return (
    <div
      className={`${
        sizeClasses[size]
      } rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 ${
        isClickable
          ? "cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
          : ""
      }`}
      onClick={onClick}
      title={isClickable ? "Click para ver imágenes" : undefined}
    >
      <img
        src={imagenes[0]}
        alt={nombre}
        className='w-full h-full object-cover'
      />
      {/* Indicador de múltiples imágenes */}
      {imagenes.length > 1 && (
        <div className='absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded'>
          +{imagenes.length - 1}
        </div>
      )}
    </div>
  );
}

// Componente para los botones de acción
function ActionButtons({
  onEdit,
  onDelete,
  compact = false,
}: {
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className='flex items-center gap-1'>
        <button
          onClick={onEdit}
          className='p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
          title='Editar producto'
        >
          <PencilSquareIcon className='w-4 h-4' />
        </button>
        <button
          onClick={onDelete}
          className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
          title='Eliminar producto'
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>
    );
  }

  return (
    <div className='flex gap-2'>
      <button
        onClick={onEdit}
        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors'
      >
        <PencilSquareIcon className='w-4 h-4' />
        <span className='hidden sm:inline'>Editar</span>
      </button>
      <button
        onClick={onDelete}
        className='flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors'
      >
        <TrashIcon className='w-4 h-4' />
        <span className='hidden sm:inline'>Eliminar</span>
      </button>
    </div>
  );
}

// Componente para mostrar estadísticas del producto
function ProductStats({
  stock,
  precio,
  stockStatus,
  layout = "horizontal",
}: {
  stock: number;
  precio: number;
  stockStatus: ReturnType<typeof useStockStatus>;
  layout?: "horizontal" | "grid";
}) {
  const valorTotal = stock * precio;

  if (layout === "grid") {
    return (
      <div className='space-y-3'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-500 mb-1'>Stock</p>
            <p className={`text-lg font-bold ${stockStatus.color}`}>{stock}</p>
          </div>
          <div className='text-center p-3 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-500 mb-1'>Precio</p>
            <p className='text-lg font-bold text-gray-900'>
              ${precio.toLocaleString()}
            </p>
          </div>
        </div>
        <div className='p-3 bg-indigo-50 rounded-lg border border-indigo-100'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-indigo-700'>
              Valor Total
            </span>
            <span className='text-lg font-bold text-indigo-600'>
              ${valorTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-4 text-right'>
      <div className='min-w-[60px]'>
        <p className='text-sm text-gray-500'>Stock</p>
        <p className={`text-lg font-semibold ${stockStatus.color}`}>{stock}</p>
      </div>
      <div className='min-w-[80px]'>
        <p className='text-sm text-gray-500'>Precio</p>
        <p className='text-lg font-semibold text-gray-900'>
          ${precio.toLocaleString()}
        </p>
      </div>
      <div className='min-w-[100px]'>
        <p className='text-sm text-gray-500'>Valor Total</p>
        <p className='text-lg font-semibold text-indigo-600'>
          ${valorTotal.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Vista en lista
function ListView({
  producto,
  stockStatus,
  onEdit,
  onDelete,
  onImageClick,
}: {
  producto: Producto;
  stockStatus: ReturnType<typeof useStockStatus>;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
}) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4 sm:p-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        {/* Información principal */}
        <div className='flex items-start sm:items-center space-x-4 flex-1 min-w-0'>
          <ProductImage
            imagenes={producto.imagenes}
            nombre={producto.nombre}
            size='small'
            onClick={onImageClick}
          />

          <div className='flex-1 min-w-0'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2'>
              <h3
                className='text-base sm:text-lg font-semibold text-gray-900 truncate'
                title={producto.nombre}
              >
                {producto.nombre}
              </h3>
              <StockBadge stockStatus={stockStatus} />
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm'>
              <span className='bg-gray-100 px-2 py-1 rounded-md text-xs font-medium flex-shrink-0'>
                {producto.categoria}
              </span>
              {producto.descripcion && (
                <span
                  className='text-xs sm:text-sm text-gray-500 truncate max-w-xs lg:max-w-md'
                  title={producto.descripcion}
                >
                  {producto.descripcion.length > 80
                    ? producto.descripcion.substring(0, 80) + "..."
                    : producto.descripcion}
                </span>
              )}
            </div>
          </div>

          {/* Stats desktop */}
          <div className='hidden lg:block'>
            <ProductStats
              stock={producto.stock}
              precio={producto.precio}
              stockStatus={stockStatus}
              layout='horizontal'
            />
          </div>
        </div>

        {/* Stats móvil */}
        <div className='lg:hidden grid grid-cols-3 gap-2 text-center'>
          <div className='p-2 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-500'>Stock</p>
            <p className={`text-sm font-bold ${stockStatus.color}`}>
              {producto.stock}
            </p>
          </div>
          <div className='p-2 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-500'>Precio</p>
            <p className='text-sm font-bold text-gray-900'>
              ${producto.precio.toLocaleString()}
            </p>
          </div>
          <div className='p-2 bg-indigo-50 rounded-lg'>
            <p className='text-xs text-indigo-600'>Total</p>
            <p className='text-sm font-bold text-indigo-600'>
              ${(producto.stock * producto.precio).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <ActionButtons onEdit={onEdit} onDelete={onDelete} compact />
      </div>
    </div>
  );
}

// Vista en cuadrícula
function GridView({
  producto,
  stockStatus,
  onEdit,
  onDelete,
  onImageClick,
}: {
  producto: Producto;
  stockStatus: ReturnType<typeof useStockStatus>;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
}) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full'>
      <div className='p-4 lg:p-6 flex flex-col h-full'>
        {/* Header */}
        <div className='flex justify-between items-start mb-4'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <ProductImage
              imagenes={producto.imagenes}
              nombre={producto.nombre}
              size='normal'
              onClick={onImageClick}
            />
          </div>
          <StockBadge stockStatus={stockStatus} />
        </div>

        {/* Título y categoría */}
        <div className='mb-4'>
          <h3
            className='text-lg font-semibold text-gray-900 mb-2 leading-tight min-h-[3rem] overflow-hidden'
            title={producto.nombre}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {producto.nombre}
          </h3>
          <span className='inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium'>
            {producto.categoria}
          </span>
        </div>

        {/* Descripción */}
        {producto.descripcion && (
          <div className='mb-4 h-12 flex-shrink-0'>
            <p
              className='text-sm text-gray-600 leading-tight overflow-hidden'
              title={producto.descripcion}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {producto.descripcion}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className='flex-grow mb-4'>
          <ProductStats
            stock={producto.stock}
            precio={producto.precio}
            stockStatus={stockStatus}
            layout='grid'
          />
        </div>

        {/* Acciones */}
        <div className='mt-auto'>
          <ActionButtons onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

// Componente principal
export function InventarioCard({
  producto,
  viewMode,
  onEdit,
  onDelete,
}: InventarioCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const stockStatus = useStockStatus(producto.stock, producto.stockMinimo);

  const handleImageClick = () => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      setIsImageModalOpen(true);
    }
  };

  if (viewMode === "list") {
    return (
      <>
        <ListView
          producto={producto}
          stockStatus={stockStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onImageClick={handleImageClick}
        />
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imagenes={producto.imagenes || []}
          productName={producto.nombre}
        />
      </>
    );
  }

  return (
    <>
      <GridView
        producto={producto}
        stockStatus={stockStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        onImageClick={handleImageClick}
      />
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imagenes={producto.imagenes || []}
        productName={producto.nombre}
      />
    </>
  );
}
