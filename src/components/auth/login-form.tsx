"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, authLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await loginUser(email, password);

    if (result.success) {
      // Guardar token en cookie para el middleware
      document.cookie = `auth-token=${result.user?.uid}; path=/; max-age=86400; secure; samesite=strict`;
      router.push(returnUrl);
    } else {
      setError(result.error || "Error al iniciar sesión");
    }

    setIsLoading(false);
  };

  // Usar la misma estructura de contenedor para resolver problemas de hidratación
  if (authLoading) {
    return (
      <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8'>
        <div className='text-center mb-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto' />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          Iniciar Sesión
        </h2>
        <p className='text-gray-600'>Accede al sistema de gestión</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all'
            placeholder='usuario@lostiburones.com'
            required
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Contraseña
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all'
            placeholder='••••••••'
            required
          />
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <p className='text-red-800 text-sm font-medium'>⚠️ {error}</p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading}
          className='w-full bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]'
        >
          {isLoading ? (
            <span className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>
    </div>
  );
}
