import { memo } from "react";

interface WelcomeHeaderProps {
  displayName?: string;
  role?: string;
}

export const WelcomeHeader = memo(
  ({ displayName, role }: WelcomeHeaderProps) => {
    return (
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          Bienvenido, {displayName}
        </h1>
        <p className='text-gray-600'>
          Dashboard del sistema - Rol:{" "}
          <span className='font-semibold capitalize'>{role}</span>
        </p>
      </div>
    );
  }
);

WelcomeHeader.displayName = "WelcomeHeader";
