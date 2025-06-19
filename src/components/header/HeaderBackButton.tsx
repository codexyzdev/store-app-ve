"use client";

import { useRouter, usePathname } from "next/navigation";

export default function HeaderBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar el botón en el dashboard
  if (pathname === "/dashboard" || pathname === "/login") return null;

  return (
    <button
      onClick={() => router.back()}
      className='inline-flex items-center px-3 py-2 border border-white/20 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30 transition-all duration-200'
    >
      <span className='mr-2'>←</span>
      Volver
    </button>
  );
}
