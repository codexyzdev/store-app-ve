interface LoadingSkeletonProps {
  itemCount?: number;
  isCardView?: boolean;
}

export function LoadingSkeleton({
  itemCount = 6,
  isCardView = true,
}: LoadingSkeletonProps) {
  if (isCardView) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6'>
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse'
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
              <div className='h-4 bg-gray-200 rounded w-20'></div>
              <div className='h-6 bg-gray-200 rounded-full w-16'></div>
            </div>

            {/* Cliente info */}
            <div className='flex items-center gap-4 mb-4'>
              <div className='w-14 h-14 bg-gray-200 rounded-2xl'></div>
              <div className='flex-1'>
                <div className='h-5 bg-gray-200 rounded mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-24'></div>
              </div>
            </div>

            {/* Producto */}
            <div className='bg-gray-50 rounded-lg p-3 mb-4'>
              <div className='h-4 bg-gray-200 rounded mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
            </div>

            {/* Montos */}
            <div className='grid grid-cols-2 gap-3 mb-4'>
              <div className='bg-blue-50 rounded-lg p-3'>
                <div className='h-3 bg-gray-200 rounded mb-2'></div>
                <div className='h-6 bg-gray-200 rounded w-20'></div>
              </div>
              <div className='bg-red-50 rounded-lg p-3'>
                <div className='h-3 bg-gray-200 rounded mb-2'></div>
                <div className='h-6 bg-gray-200 rounded w-20'></div>
              </div>
            </div>

            {/* Progress bar */}
            <div className='mb-4'>
              <div className='flex justify-between mb-2'>
                <div className='h-4 bg-gray-200 rounded w-24'></div>
                <div className='h-4 bg-gray-200 rounded w-12'></div>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'></div>
            </div>

            {/* Button */}
            <div className='h-12 bg-gray-200 rounded-xl'></div>
          </div>
        ))}
      </div>
    );
  }

  // Lista view
  return (
    <div className='space-y-3 sm:space-y-4'>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className='bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse'
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gray-200 rounded-xl'></div>

            <div className='flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2'>
              <div>
                <div className='h-5 bg-gray-200 rounded mb-1'></div>
                <div className='h-3 bg-gray-200 rounded w-20'></div>
              </div>
              <div>
                <div className='h-4 bg-gray-200 rounded mb-1'></div>
                <div className='h-3 bg-gray-200 rounded w-16'></div>
              </div>
              <div>
                <div className='h-4 bg-gray-200 rounded mb-1'></div>
                <div className='h-3 bg-gray-200 rounded w-12'></div>
              </div>
              <div>
                <div className='h-6 bg-gray-200 rounded-full w-16'></div>
              </div>
            </div>

            <div className='h-8 bg-gray-200 rounded-lg w-24'></div>
          </div>
        </div>
      ))}
    </div>
  );
}
