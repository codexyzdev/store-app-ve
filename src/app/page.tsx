"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-sky-500 flex flex-col items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4' />
        <p className='text-white text-lg'>Cargando...</p>
      </div>
    </div>
  );
}
