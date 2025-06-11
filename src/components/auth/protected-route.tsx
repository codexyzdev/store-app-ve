"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  allowedRoles?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  allowedRoles = [],
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userProfile, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4' />
          <p className='text-gray-600'>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Verificar roles si están especificados
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userProfile?.role || "")
  ) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg'>
            <h2 className='text-xl font-bold mb-2'>Acceso Denegado</h2>
            <p>Tu rol ({userProfile?.role}) no tiene acceso a esta sección.</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar permisos si están especificados
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg'>
              <h2 className='text-xl font-bold mb-2'>Permisos Insuficientes</h2>
              <p>
                No tienes los permisos necesarios para acceder a esta función.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
