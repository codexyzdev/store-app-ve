"use client";

import React, { Component, ReactNode, ErrorInfo, ComponentType } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Llamar callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En producción, aquí podrías enviar el error a un servicio de monitoreo
    if (process.env.NODE_ENV === "production") {
      // Ejemplo: enviar a servicio de logging
      // logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <div
          className='min-h-[400px] flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg'
          role='alert'
          aria-live='assertive'
        >
          <ExclamationCircleIcon
            className='w-16 h-16 text-red-500 mb-4'
            aria-hidden='true'
          />
          <h2 className='text-2xl font-bold text-red-800 mb-2 text-center'>
            ¡Oops! Algo salió mal
          </h2>
          <p className='text-red-600 mb-6 text-center max-w-md'>
            Ha ocurrido un error inesperado. Por favor, intenta recargar la
            página.
          </p>

          <div className='flex gap-4'>
            <button
              onClick={this.handleRetry}
              className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              aria-label='Reintentar cargar el componente'
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              aria-label='Recargar la página completa'
            >
              Recargar Página
            </button>
          </div>

          {/* Mostrar detalles del error solo en desarrollo */}
          {this.props.showDetails &&
            process.env.NODE_ENV === "development" &&
            this.state.error && (
              <details className='mt-6 w-full max-w-2xl'>
                <summary className='cursor-pointer text-red-700 font-medium mb-2'>
                  Detalles del Error (Solo en desarrollo)
                </summary>
                <div className='bg-red-100 p-4 rounded border text-xs font-mono text-red-900 overflow-auto'>
                  <div className='mb-2'>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className='mb-2'>
                    <strong>Stack:</strong>
                    <pre className='whitespace-pre-wrap'>
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className='whitespace-pre-wrap'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook para usar ErrorBoundary de forma funcional
export const withErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};
