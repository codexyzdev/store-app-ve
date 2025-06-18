import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando...",
  size = "md",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const containerClasses = fullScreen
    ? "min-h-screen bg-gray-50 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className='text-center'>
        <div
          className={`${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`}
        ></div>
        <p className='text-gray-600 font-medium'>{message}</p>
      </div>
    </div>
  );
};

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
