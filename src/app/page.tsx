import { SignedOut, SignIn, SignedIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-sky-500 flex flex-col items-center justify-center relative overflow-hidden'>
      {/* Efecto de profundidad oceánica */}
      <div className='absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-sky-400/10'></div>

      <SignedOut>
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

          <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden'>
            <SignIn
              fallbackRedirectUrl='/dashboard'
              appearance={{
                elements: {
                  footerAction: { display: "none" },
                  card: {
                    boxShadow: "none",
                    border: "none",
                    backgroundColor: "transparent",
                  },
                },
              }}
              routing='hash'
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className='text-center relative z-10'>
          <div className='w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white/20'>
            <span className='text-4xl text-white drop-shadow-lg'>✅</span>
          </div>
          <h2 className='text-3xl font-bold text-white mb-4 drop-shadow-lg'>
            ¡Sesión iniciada con éxito!
          </h2>
          <p className='text-sky-100 mb-8 text-lg drop-shadow-sm'>
            Bienvenido de vuelta. Redirigiendo al dashboard...
          </p>
          <a
            href='/dashboard'
            className='inline-flex items-center gap-3 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm'
          >
            <span className='text-2xl'>📊</span>
            Ir al Dashboard
          </a>
        </div>
      </SignedIn>
    </div>
  );
}
