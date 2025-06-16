import React, { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

const variantClasses = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
  secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  outline:
    "border border-sky-600 text-sky-600 hover:bg-sky-50 focus:ring-sky-500",
  ghost: "text-sky-600 hover:bg-sky-50 focus:ring-sky-500",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-lg transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "disabled:hover:bg-current",
  ];

  const combinedClasses = [
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (!Icon) return null;

    return (
      <Icon
        className={`${
          size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
        }`}
        aria-hidden='true'
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner
            size='sm'
            color={
              variant === "outline" || variant === "ghost" ? "primary" : "white"
            }
          />
          <span>Cargando...</span>
        </>
      );
    }

    if (Icon && iconPosition === "left") {
      return (
        <>
          {renderIcon()}
          {children}
        </>
      );
    }

    if (Icon && iconPosition === "right") {
      return (
        <>
          {children}
          {renderIcon()}
        </>
      );
    }

    return children;
  };

  return (
    <button
      className={combinedClasses}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
