import { currentUser } from "@clerk/nextjs/server";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Acceso Requerido
          </h2>
          <p className='text-gray-600'>
            Debes iniciar sesión para acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header del Dashboard */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center sm:text-left'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Bienvenido,{" "}
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </h1>
            <p className='text-gray-600'>
              Gestiona tu sistema de préstamos desde aquí
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <DashboardGrid />
      </main>
    </div>
  );
}
