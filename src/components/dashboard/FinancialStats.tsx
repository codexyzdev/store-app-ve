"use client";

import { useState, useEffect } from "react";
import {
  financiamientoDB,
  cobrosDB,
  FinanciamientoCuota,
  Cobro,
} from "@/lib/firebase/database";

export function FinancialStats() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCuota[]>(
    []
  );
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const unsubFinanciamientos = financiamientoDB.suscribir((data) => {
      setFinanciamientos(data);
    });

    const unsubCobros = cobrosDB.suscribir((data) => {
      setCobros(data);
      setLoading(false);
    });

    return () => {
      unsubFinanciamientos();
      unsubCobros();
    };
  }, []);

  // Calcular estadísticas
  const totalCobrado = cobros.reduce((sum, cobro) => sum + cobro.monto, 0);

  const financiamientosActivos = financiamientos.filter(
    (financiamiento) =>
      financiamiento.estado === "activo" || financiamiento.estado === "atrasado"
  );

  const montoPendiente = financiamientosActivos.reduce(
    (sum, financiamiento) => {
      const cobrosDelFinanciamiento = cobros.filter(
        (c) => c.financiamientoId === financiamiento.id
      );
      const totalCobradoFinanciamiento = cobrosDelFinanciamiento.reduce(
        (s, c) => s + c.monto,
        0
      );
      return sum + (financiamiento.monto - totalCobradoFinanciamiento);
    },
    0
  );

  // Animación de números
  useEffect(() => {
    if (loading) return;

    const targets = {
      totalCobrado,
      montoPendiente,
    };

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 30; // 30 frames de animación
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 50);
    });
  }, [totalCobrado, montoPendiente, loading]);

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse'>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 bg-gray-200 rounded-2xl'></div>
            <div>
              <div className='h-8 bg-gray-200 rounded w-24 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse'>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 bg-gray-200 rounded-2xl'></div>
            <div>
              <div className='h-8 bg-gray-200 rounded w-24 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-32'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
      {/* Total Cobrado */}
      <div className='bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-200'>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg'>
            <span className='text-2xl text-white'>💰</span>
          </div>
          <div>
            <p className='text-3xl font-bold text-green-600'>
              ${(animatedValues.totalCobrado || 0).toLocaleString()}
            </p>
            <p className='text-sm text-gray-600'>Total Cobrado</p>
          </div>
        </div>
        <div className='mt-4 flex items-center gap-2'>
          <span className='text-green-500'>🔄</span>
          <span className='text-xs text-gray-500'>
            Actualizado en tiempo real
          </span>
        </div>
      </div>

      {/* Monto Pendiente */}
      <div className='bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200'>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg'>
            <span className='text-2xl text-white'>⏳</span>
          </div>
          <div>
            <p className='text-3xl font-bold text-orange-600'>
              ${(animatedValues.montoPendiente || 0).toLocaleString()}
            </p>
            <p className='text-sm text-gray-600'>Monto Pendiente</p>
          </div>
        </div>
        <div className='mt-4 flex items-center gap-2'>
          <span className='text-orange-500'>📊</span>
          <span className='text-xs text-gray-500'>
            De {financiamientosActivos.length} financiamientos activos
          </span>
        </div>
      </div>
    </div>
  );
}
