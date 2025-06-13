"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useUI } from "@/hooks/useUI";

export default function DashboardPage() {
  const {
    userProfile,
    canManageInventory,
    canViewReports,
    canManageCollections,
  } = useAuth();

  const { showNotification } = useUI();

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

          {/* Tarjeta condicional - Cobros del Día */}
          {canManageCollections && (
            <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Cobros del Día
                  </h3>
                  <p className='text-gray-600'>Gestionar cobros diarios</p>
                </div>
                <div className='text-3xl text-orange-500'>📅</div>
              </div>
              <a
                href='/cobros-del-dia'
                className='mt-4 inline-flex items-center text-orange-600 hover:text-orange-800 font-medium'
              >
                Ver cobros del día →
              </a>
            </div>
          )}

          {/* Tarjeta condicional - Cuotas Atrasadas */}
          {canManageCollections && (
            <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Cuotas Atrasadas
                  </h3>
                  <p className='text-gray-600'>Gestionar cuotas vencidas</p>
                </div>
                <div className='text-3xl text-red-500'>⚠️</div>
              </div>
              <a
                href='/cuotas-atrasadas'
                className='mt-4 inline-flex items-center text-red-600 hover:text-red-800 font-medium'
              >
                Ver cuotas atrasadas →
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

          {/* Tarjeta siempre visible - Facturas */}
          <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-emerald-500'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Facturas
                </h3>
                <p className='text-gray-600'>Ventas al contado</p>
              </div>
              <div className='text-3xl text-emerald-500'>🧾</div>
            </div>
            <a
              href='/facturas'
              className='mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium'
            >
              Ver facturas →
            </a>
          </div>

          {/* Tarjeta siempre visible - Transacciones */}
          <div className='bg-white p-6 rounded-lg shadow-lg border-l-4 border-indigo-500'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Transacciones
                </h3>
                <p className='text-gray-600'>Movimientos históricos</p>
              </div>
              <div className='text-3xl text-indigo-500'>🔄</div>
            </div>
            <a
              href='/transacciones'
              className='mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium'
            >
              Ver transacciones →
            </a>
          </div>
        </div>

        {/* Demo Redux - Solo en desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className='mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200'>
            <h3 className='text-lg font-semibold text-blue-800 mb-4'>
              🚀 Funcionalidades Redux Implementadas
            </h3>

            {/* Demo de notificaciones */}
            <div className='mb-6'>
              <h4 className='text-md font-medium text-blue-700 mb-3'>
                Sistema de Notificaciones Globales
              </h4>
              <div className='flex flex-wrap gap-3'>
                <button
                  onClick={() =>
                    showNotification({
                      type: "success",
                      message: "¡Operación exitosa!",
                    })
                  }
                  className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
                >
                  Éxito
                </button>
                <button
                  onClick={() =>
                    showNotification({
                      type: "error",
                      message: "Error en la operación",
                    })
                  }
                  className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
                >
                  Error
                </button>
                <button
                  onClick={() =>
                    showNotification({
                      type: "warning",
                      message: "Advertencia importante",
                    })
                  }
                  className='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors'
                >
                  Advertencia
                </button>
                <button
                  onClick={() =>
                    showNotification({
                      type: "info",
                      message: "Información relevante",
                    })
                  }
                  className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
                >
                  Info
                </button>
              </div>
            </div>

            {/* Estado actual de Redux */}
            <div>
              <h4 className='text-md font-medium text-blue-700 mb-3'>
                Estado Actual de Redux
              </h4>
              <div className='flex flex-wrap gap-3'>
                <a
                  href='/clientes'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
                >
                  👥 Clientes Redux (Principal)
                </a>
                <span className='px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg'>
                  ✅ Filtros avanzados
                </span>
                <span className='px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg'>
                  ✅ Estadísticas en tiempo real
                </span>
                <span className='px-3 py-2 bg-green-100 text-green-800 text-sm rounded-lg'>
                  ✅ Estado sincronizado
                </span>
                <span className='px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg'>
                  🔄 Migración completa
                </span>
              </div>
            </div>
          </div>
        )}

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
