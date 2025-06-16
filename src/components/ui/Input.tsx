import React, { forwardRef, InputHTMLAttributes, ComponentType } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  rightIcon?: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  variant?: "default" | "filled" | "borderless";
  inputSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantClasses = {
  default:
    "border border-gray-300 bg-white focus:border-sky-500 focus:ring-sky-500",
  filled:
    "border border-gray-300 bg-gray-50 focus:border-sky-500 focus:ring-sky-500 focus:bg-white",
  borderless: "border-0 bg-gray-50 focus:ring-sky-500 focus:bg-white",
};

const sizeClasses = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3 text-base",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      variant = "default",
      inputSize = "md",
      fullWidth = false,
      className = "",
      id,
      required,
      ...props
    }: InputProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    // Generar ID único si no se proporciona
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;

    const hasError = !!error;
    const hasIcons = LeftIcon || RightIcon;

    const baseClasses = [
      "rounded-lg transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "placeholder:text-gray-400",
    ];

    const conditionalClasses = [
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : variantClasses[variant as keyof typeof variantClasses],
      sizeClasses[inputSize as keyof typeof sizeClasses],
      fullWidth ? "w-full" : "",
      hasIcons ? "pl-10" : "", // Espacio para íconos
      className,
    ];

    const combinedClasses = [...baseClasses, ...conditionalClasses]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-2 ${
              hasError ? "text-red-700" : "text-gray-700"
            }`}
          >
            {label}
            {required && (
              <span className='text-red-500 ml-1' aria-label='Campo requerido'>
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className='relative'>
          {/* Left Icon */}
          {LeftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <LeftIcon
                className={`h-5 w-5 ${
                  hasError ? "text-red-400" : "text-gray-400"
                }`}
                aria-hidden='true'
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={combinedClasses}
            aria-invalid={hasError}
            aria-describedby={
              [errorId, helpId].filter(Boolean).join(" ") || undefined
            }
            required={required}
            {...props}
          />

          {/* Right Icon */}
          {RightIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <RightIcon
                className={`h-5 w-5 ${
                  hasError ? "text-red-400" : "text-gray-400"
                }`}
                aria-hidden='true'
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className='mt-2 text-sm text-red-600'
            role='alert'
            aria-live='polite'
          >
            {error}
          </p>
        )}

        {/* Help Text */}
        {helpText && !error && (
          <p id={helpId} className='mt-2 text-sm text-gray-500'>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
