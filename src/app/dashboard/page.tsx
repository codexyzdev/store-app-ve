"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const {
    userProfile,
    canManageInventory,
    canViewReports,
    canManageCollections,
  } = useAuth();

  return (
    <ProtectedRoute>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Bienvenido, {userProfile?.displayName}
          </h1>
          <p className='text-gray-600'>
            Dashboard del sistema - Rol:{" "}
            <span className='font-semibold capitalize'>
              {userProfile?.role}
            </span>
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Tarjeta siempre visible - Clientes */}
          <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Clientes
                </h3>
                <p className='text-gray-600'>Gestionar clientes</p>
              </div>
              <div className='text-3xl text-blue-500'>👥</div>
            </div>
            <a
              href='/clientes'
              className='mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium'
            >
              Ver clientes →
            </a>
          </div>

          {/* Tarjeta siempre visible - Financiamientos */}
          <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Financiamientos
                </h3>
                <p className='text-gray-600'>Gestionar financiamientos</p>
              </div>
              <div className='text-3xl text-green-500'>💰</div>
            </div>
            <a
              href='/financiamiento-cuota'
              className='mt-4 inline-flex items-center text-green-600 hover:text-green-800 font-medium'
            >
              Ver financiamientos →
            </a>
          </div>

          {/* Tarjeta condicional - Cobranza */}
          {canManageCollections && (
            <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Cobranza
                  </h3>
                  <p className='text-gray-600'>Gestionar cobros</p>
                </div>
                <div className='text-3xl text-orange-500'>📊</div>
              </div>
              <a
                href='/cobranza'
                className='mt-4 inline-flex items-center text-orange-600 hover:text-orange-800 font-medium'
              >
                Ver cobranza →
              </a>
            </div>
          )}

          {/* Tarjeta condicional - Inventario */}
          {canManageInventory && (
            <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Inventario
                  </h3>
                  <p className='text-gray-600'>Gestionar productos</p>
                </div>
                <div className='text-3xl text-purple-500'>📦</div>
              </div>
              <a
                href='/inventario'
                className='mt-4 inline-flex items-center text-purple-600 hover:text-purple-800 font-medium'
              >
                Ver inventario →
              </a>
            </div>
          )}

          {/* Tarjeta condicional - Estadísticas */}
          {canViewReports && (
            <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Estadísticas
                  </h3>
                  <p className='text-gray-600'>Ver reportes</p>
                </div>
                <div className='text-3xl text-red-500'>📈</div>
              </div>
              <a
                href='/estadisticas'
                className='mt-4 inline-flex items-center text-red-600 hover:text-red-800 font-medium'
              >
                Ver estadísticas →
              </a>
            </div>
          )}
        </div>

        {/* Información del usuario */}
        <div className='mt-8 bg-gray-50 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Información de tu cuenta
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <span className='text-sm font-medium text-gray-600'>Email:</span>
              <p className='text-gray-800'>{userProfile?.email}</p>
            </div>
            <div>
              <span className='text-sm font-medium text-gray-600'>Rol:</span>
              <p className='text-gray-800 capitalize'>{userProfile?.role}</p>
            </div>
            <div>
              <span className='text-sm font-medium text-gray-600'>
                Último acceso:
              </span>
              <p className='text-gray-800'>
                {userProfile?.lastLogin
                  ? new Date(userProfile.lastLogin).toLocaleString("es-ES")
                  : "Nunca"}
              </p>
            </div>
            <div>
              <span className='text-sm font-medium text-gray-600'>Estado:</span>
              <p className='text-green-600 font-semibold'>Activo</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
