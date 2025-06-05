"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import HeaderBackButton from "@/components/header/HeaderBackButton";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  UsersIcon,
  UserPlusIcon,
  ListBulletIcon,
  PlusCircleIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  Bars3Icon,
  FolderIcon,
} from "@heroicons/react/24/outline";
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
      <header className='flex justify-between items-center p-4 gap-4 h-16 border-b bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='p-2 hover:bg-white/10 rounded-lg transition-colors'
          >
            <Bars3Icon className='w-6 h-6' />
          </button>
          <h1 className='text-2xl font-bold tracking-tight'>Store App Ve</h1>
          <HeaderBackButton />
        </div>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10 border-2 border-white",
              },
            }}
          />
        </SignedIn>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 bg-white border-r shadow-xl transition-transform duration-300 ease-in-out z-50`}
      >
        <div className='p-6'>
          <h2 className='text-xl font-bold mb-8 text-gray-800'>Navegación</h2>
          <nav className='flex flex-col gap-3'>
            <button
              onClick={() => navigateTo("/dashboard")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <FolderIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Inicio</span>
            </button>
            <button
              onClick={() => navigateTo("/cobranza/cobros-del-dia")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <CalendarDaysIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Cobros del día</span>
            </button>
            <button
              onClick={() => navigateTo("/cobranza/cuotas-atrasadas")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <ExclamationCircleIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Cuotas atrasadas</span>
            </button>
            <button
              onClick={() => navigateTo("/clientes")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <UsersIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Clientes</span>
            </button>
            <button
              onClick={() => navigateTo("/prestamos")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <ListBulletIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Préstamos</span>
            </button>
            <button
              onClick={() => navigateTo("/inventario")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <ArchiveBoxIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Inventario</span>
            </button>
            <button
              onClick={() => navigateTo("/estadisticas")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group'
            >
              <ChartBarIcon className='w-5 h-5 text-gray-600 group-hover:text-indigo-600' />
              <span className='font-medium text-sm'>Estadísticas</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
