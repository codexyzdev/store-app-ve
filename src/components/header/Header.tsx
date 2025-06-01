"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import HeaderBackButton from "@/components/header/HeaderBackButton";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className='flex justify-between items-center p-4 gap-4 h-16 border-b bg-white'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='p-2 hover:bg-gray-100 rounded-lg'
          >
            <Bars3Icon className='w-6 h-6' />
          </button>
          <h1 className='text-2xl font-bold'>Store App Ve</h1>
          <HeaderBackButton />
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-white border-r transition-transform duration-200 ease-in-out z-50`}
      >
        <div className='p-4'>
          <h2 className='text-lg font-semibold mb-4'>Navegación</h2>
          <nav className='space-y-2'>
            <button
              onClick={() => navigateTo("/dashboard")}
              className='w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg'
            >
              Dashboard
            </button>
            <button
              onClick={() => navigateTo("/inventario")}
              className='w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg'
            >
              Inventario
            </button>
            <button
              onClick={() => navigateTo("/ventas")}
              className='w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg'
            >
              Ventas
            </button>
            <button
              onClick={() => navigateTo("/reportes")}
              className='w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg'
            >
              Reportes
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
