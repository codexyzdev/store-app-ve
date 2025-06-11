"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function AuthRedirect() {
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
      <LoadingSpinner size='lg' color='white' text='Cargando...' centered />
    </div>
  );
}
