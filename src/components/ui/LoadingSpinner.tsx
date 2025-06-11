interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "white" | "blue" | "gray";
  text?: string;
  centered?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const colorClasses = {
  white: "border-white border-t-transparent",
  blue: "border-blue-500 border-t-transparent",
  gray: "border-gray-300 border-t-transparent",
};

export function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
  centered = false,
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <>
      <div
        className={`
          animate-spin rounded-full border-2 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
      />
      {text && (
        <p
          className={`mt-2 text-sm font-medium ${
            color === "white" ? "text-white" : "text-gray-600"
          }`}
        >
          {text}
        </p>
      )}
    </>
  );

  if (centered) {
    return (
      <div className='flex flex-col items-center justify-center'>
        {spinnerContent}
      </div>
    );
  }

  return <div className='flex flex-col items-center'>{spinnerContent}</div>;
}

// Componente específico para páginas completas
export function PageLoadingSpinner({
  text = "Cargando...",
}: {
  text?: string;
}) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 flex flex-col items-center justify-center'>
      <LoadingSpinner size='lg' color='blue' text={text} centered />
    </div>
  );
}

// Componente para cards o secciones
export function CardLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className='flex items-center justify-center min-h-[200px]'>
      <LoadingSpinner size='md' color='gray' text={text} centered />
    </div>
  );
}
