import { SignedOut, SignIn, SignedIn } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center'>
      <SignedOut>
        <div className='w-full max-w-md mx-auto px-6 py-8'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
              <span className='text-3xl text-white'>🏪</span>
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
              Store App Ve
            </h1>
            <p className='text-gray-600'>
              Sistema de gestión financiera y comercial
            </p>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
            <SignIn
              fallbackRedirectUrl='/dashboard'
              appearance={{
                elements: {
                  footerAction: { display: "none" },
                  card: {
                    boxShadow: "none",
                    border: "none",
                  },
                },
              }}
              routing='hash'
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className='text-center'>
          <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
            <span className='text-3xl text-white'>✅</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            ¡Sesión iniciada con éxito!
          </h2>
          <p className='text-gray-600 mb-6'>
            Bienvenido de vuelta. Redirigiendo al dashboard...
          </p>
          <a
            href='/dashboard'
            className='inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
          >
            <span className='text-xl'>📊</span>
            Ir al Dashboard
          </a>
        </div>
      </SignedIn>
    </div>
  );
}
