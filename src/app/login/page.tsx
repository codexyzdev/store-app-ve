import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-sky-500 flex flex-col items-center justify-center relative overflow-hidden'>
      {/* Efecto de profundidad oceánica */}
      <div className='absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-sky-400/10'></div>

      <div className='w-full max-w-md mx-auto px-6 py-8 relative z-10'>
        <div className='text-center mb-8'>
          <div className='relative'>
            <img
              src='/logo-los-tiburones.webp'
              alt='Los Tiburones Logo'
              className='w-28 h-28 mx-auto mb-6 rounded-3xl shadow-2xl object-cover border-4 border-white/20 backdrop-blur-sm'
            />
            {/* Efecto de resplandor detrás del logo */}
            <div className='absolute inset-0 w-28 h-28 mx-auto mb-6 rounded-3xl bg-sky-400/30 blur-xl -z-10'></div>
          </div>
          <h1 className='text-4xl font-bold text-white mb-3 drop-shadow-lg'>
            Los Tiburones
          </h1>
          <p className='text-sky-100 text-lg drop-shadow-sm'>
            Sistema de gestión financiera y comercial
          </p>
        </div>

        <Suspense
          fallback={
            <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8'>
              <div className='animate-pulse space-y-4'>
                <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                <div className='h-10 bg-gray-300 rounded'></div>
                <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                <div className='h-10 bg-gray-300 rounded'></div>
                <div className='h-12 bg-gray-300 rounded'></div>
              </div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
