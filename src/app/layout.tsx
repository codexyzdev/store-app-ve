import type { Metadata } from "next";
import "@fontsource-variable/roboto";
import "./globals.css";
import "../styles/print.css";
import Header from "@/components/header/Header";
import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "Los Tiburones",
  description: "Los Tiburones - Sistema de Gestión Financiera y Comercial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es'>
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
