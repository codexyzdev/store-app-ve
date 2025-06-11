import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/roboto";
import "./globals.css";
import "../styles/print.css";
import Header from "@/components/header/Header";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "Los Tiburones",
  description: "Los Tiburones - Sistema de Gestión Financiera y Comercial",
  robots: "noindex, nofollow", // Para aplicación privada
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Componente de loading para Suspense
function LoadingFallback() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-sky-500 flex flex-col items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4' />
        <p className='text-white text-lg'>Cargando...</p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className='antialiased'>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Header />
            <main>{children}</main>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
