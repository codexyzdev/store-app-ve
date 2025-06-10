"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NuevoClienteForm from "@/components/clientes/NuevoClienteForm";

export default function NuevoClientePage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClienteCreado = (cliente: any) => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/clientes");
    }, 2000);
  };

  const handleCancel = () => {
    router.push("/clientes");
  };

  if (showSuccess) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center'>
        <div className='bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center'>
          <div className='mb-6'>
            <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse'>
              <span className='text-3xl text-white'>✅</span>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              ¡Cliente Creado!
            </h2>
            <p className='text-gray-600'>
              El cliente ha sido registrado exitosamente en el sistema.
            </p>
          </div>

          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
            <div className='w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin'></div>
            Redirigiendo a la lista de clientes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-6'>
            <Link
              href='/clientes'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors'
            >
              <span className='text-xl'>←</span>
              <span className='font-medium'>Volver a Clientes</span>
            </Link>
          </div>

          <div className='text-center mb-8'>
            <div className='inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-blue-100 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                <span className='text-xl text-white'>👤</span>
              </div>
              <div className='text-left'>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Nuevo Cliente
                </h1>
                <p className='text-sm text-gray-600'>
                  Registra un nuevo cliente en el sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pasos del proceso */}
        <div className='max-w-4xl mx-auto mb-8'>
          <div className='flex items-center justify-center gap-4 mb-8'>
            <div className='flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                1
              </span>
              Información Básica
            </div>
            <div className='w-8 h-px bg-gray-300'></div>
            <div className='flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                2
              </span>
              Documentación
            </div>
            <div className='w-8 h-px bg-gray-300'></div>
            <div className='flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium'>
              <span className='w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                3
              </span>
              Confirmación
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className='max-w-4xl mx-auto'>
          <div className='bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
            {/* Header del formulario */}
            <div className='bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center'>
                  <span className='text-2xl text-white'>📋</span>
                </div>
                <div className='text-white'>
                  <h2 className='text-xl font-bold mb-1'>
                    Información del Cliente
                  </h2>
                  <p className='text-blue-100'>
                    Completa todos los campos requeridos
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className='p-8'>
              <NuevoClienteForm
                onClienteCreado={handleClienteCreado}
                onCancel={handleCancel}
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>🔒</span>
                </div>
                <h3 className='font-semibold text-gray-900'>Datos Seguros</h3>
              </div>
              <p className='text-sm text-gray-600'>
                Toda la información se almacena de forma segura y encriptada.
              </p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>⚡</span>
                </div>
                <h3 className='font-semibold text-gray-900'>Proceso Rápido</h3>
              </div>
              <p className='text-sm text-gray-600'>
                El registro se completa en menos de 2 minutos.
              </p>
            </div>

            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <span className='text-lg'>📱</span>
                </div>
                <h3 className='font-semibold text-gray-900'>Fácil Acceso</h3>
              </div>
              <p className='text-sm text-gray-600'>
                Podrás gestionar financiamientos inmediatamente después.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className='mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200'>
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1'>
                <span className='text-white text-sm'>💡</span>
              </div>
              <div>
                <h3 className='font-semibold text-blue-900 mb-2'>
                  Consejos para un registro exitoso
                </h3>
                <ul className='text-sm text-blue-700 space-y-1'>
                  <li>
                    • Asegúrate de que la foto de la cédula sea clara y legible
                  </li>
                  <li>• Verifica que el número de teléfono esté correcto</li>
                  <li>• La dirección debe ser lo más específica posible</li>
                  <li>• Todos los campos marcados con * son obligatorios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
