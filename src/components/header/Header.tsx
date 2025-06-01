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
        } w-80 bg-gray-50 border-r transition-transform duration-200 ease-in-out z-50`}
      >
        <div className='p-6'>
          <h2 className='text-lg font-semibold mb-6'>Navegación</h2>
          <nav className='flex flex-col gap-2'>
            <button
              onClick={() => navigateTo("/dashboard")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition mb-2'
            >
              <FolderIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Inicio</span>
            </button>
            <button
              onClick={() => navigateTo("/cobros-dia")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <CalendarDaysIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Cobros del día</span>
            </button>
            <button
              onClick={() => navigateTo("/cobranza/cuotas-atrasadas")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <ExclamationCircleIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Cuotas atrasadas</span>
            </button>
            <button
              onClick={() => navigateTo("/clientes")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <UsersIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Clientes</span>
            </button>
            <button
              onClick={() => navigateTo("/clientes/nuevo")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <UserPlusIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Nuevo Cliente</span>
            </button>
            <button
              onClick={() => navigateTo("/prestamos")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <ListBulletIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Préstamos</span>
            </button>
            <button
              onClick={() => navigateTo("/prestamos/nuevo")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <PlusCircleIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Nuevo Préstamo</span>
            </button>
            <button
              onClick={() => navigateTo("/inventario")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <ArchiveBoxIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Inventario</span>
            </button>
            <button
              onClick={() => navigateTo("/estadisticas")}
              className='flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-indigo-50 transition'
            >
              <ChartBarIcon className='w-5 h-5 text-gray-700' />
              <span className='font-semibold text-sm'>Estadísticas</span>
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
