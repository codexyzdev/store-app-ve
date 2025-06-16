import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorClasses = {
  primary: "border-sky-500",
  white: "border-white",
  gray: "border-gray-500",
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  text,
  className = "",
  fullScreen = false,
}) => {
  const spinnerElement = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        role='status'
        aria-hidden='true'
      />
      {text && (
        <p
          className={`mt-2 text-sm font-medium ${
            color === "white" ? "text-white" : "text-gray-700"
          }`}
          aria-live='polite'
        >
          {text}
        </p>
      )}
      <span className='sr-only'>Cargando...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'
        role='status'
        aria-live='polite'
        aria-label='Cargando contenido'
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;

// Componente específico para páginas completas
export const PageLoadingSpinner = ({
  text = "Cargando...",
}: {
  text?: string;
}) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 flex flex-col items-center justify-center'>
      <LoadingSpinner size='lg' color='primary' text={text} />
    </div>
  );
};

// Componente para cards o secciones
export const CardLoadingSpinner = ({ text }: { text?: string }) => {
  return (
    <div className='flex items-center justify-center min-h-[200px]'>
      <LoadingSpinner size='md' color='gray' text={text} />
    </div>
  );
};
