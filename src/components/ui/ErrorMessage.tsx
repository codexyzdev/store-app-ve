interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 ${className}`}
    >
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl'>⚠️</span>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Error al cargar datos
            </h3>
            <p className='text-gray-600 mb-6'>{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className='inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors'
              >
                <span className='text-sm'>🔄</span>
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
