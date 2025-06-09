import { currentUser } from "@clerk/nextjs/server";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      {/* Header del Dashboard */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center sm:text-left'>
            <div className='flex items-center gap-4 justify-center sm:justify-start mb-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
                <span className='text-2xl text-white'>📊</span>
              </div>
              <div>
                <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize'>
                  Bienvenido, {nombreUsuario}
                </h1>
                <p className='text-gray-600 text-lg'>
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
