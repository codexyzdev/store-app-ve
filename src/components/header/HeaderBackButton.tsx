'use client';

import { ges } from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";

export default function HeaderBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  
  // No mostrar el botón en el dashboard
  if (pathname === '/dashboard') return null;

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <ArrowLeftIcon className="h-5 w-5 mr-2" />
      Volver
    </button>
  );
} 