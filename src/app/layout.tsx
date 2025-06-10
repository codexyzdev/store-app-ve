import type { Metadata } from "next";
import "@fontsource-variable/roboto";
import "./globals.css";
import "../styles/print.css";
import Header from "@/components/header/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";

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
    <ClerkProvider localization={esES}>
      <html lang='es'>
        <body>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
