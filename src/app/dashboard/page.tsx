import { currentUser } from "@clerk/nextjs/server";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100 flex items-center justify-center'>
        <div className='text-center p-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
            <span className='text-2xl text-white'>🔒</span>
          </div>
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

  // Obtener el nombre para mostrar
  const nombreUsuario = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.username ||
      user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      "Usuario";

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100'>
      {/* Header del Dashboard */}
      <div className='bg-gradient-to-r from-white to-sky-50/50 shadow-lg border-b border-sky-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center sm:text-left'>
            <div className='flex items-center gap-4 justify-center sm:justify-start mb-4'>
              <div className='relative'>
                <img
                  src='/logo-los-tiburones.webp'
                  alt='Los Tiburones Logo'
                  className='w-20 h-20 rounded-2xl shadow-xl object-cover border-2 border-sky-200/50'
                />
                <div className='absolute inset-0 w-20 h-20 rounded-2xl bg-sky-400/20 blur-md -z-10'></div>
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-800 to-sky-600 bg-clip-text text-transparent capitalize drop-shadow-sm'>
                  Bienvenido, {nombreUsuario}
                </h1>
                <p className='text-gray-700 text-lg font-medium'>
                  Gestiona tu sistema de préstamos desde aquí
                </p>
              </div>
            </div>
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
