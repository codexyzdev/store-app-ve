import React from "react";

interface NavigationButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  ariaLabel: string;
  className?: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  onClick,
  icon: Icon,
  label,
  ariaLabel,
  className = "flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500",
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <Icon
        className='w-5 h-5 text-gray-600 group-hover:text-sky-600'
        aria-hidden='true'
      />
      <span className='font-medium text-sm'>{label}</span>
    </button>
  );
};

export default NavigationButton;
