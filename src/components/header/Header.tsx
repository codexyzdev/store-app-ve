"use client";

import HeaderBackButton from "@/components/header/HeaderBackButton";
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  UsersIcon,
  ListBulletIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import {
  Bars3Icon,
  FolderIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUI } from "@/hooks/useUI";
import { logoutUser } from "@/lib/firebase/auth";

const Header = () => {
  // Early return si no hay autenticación
  const { userProfile, isAuthenticated } = useAuth();

  // Estado local para el menú de usuario (mantenemos esto local por ahora)
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  // Estado global para el sidebar usando Redux
  const { sidebarOpen: isSidebarOpen, toggleSidebar, setSidebarOpen } = useUI();

  const handleNavigateTo = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const handleLogoutUser = async () => {
    const result = await logoutUser();
    if (result.success) {
      // Eliminar cookie
      document.cookie =
        "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      router.push("/login");
    }
    setShowUserMenu(false);
  };

  // Cerrar sidebar y menú de usuario al presionar Escape o hacer clic fuera
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setShowUserMenu(false);
      }
    };

    const handleClickOutsideMenu = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-user-menu]")) {
        setShowUserMenu(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutsideMenu);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("click", handleClickOutsideMenu);
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen, showUserMenu, setSidebarOpen]);

  return (
    <>
      <header className='sticky top-0 z-40 flex justify-between items-center p-4 gap-4 h-16 border-b bg-gradient-to-r from-slate-800 to-sky-500 text-white shadow-lg'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => toggleSidebar()}
            className='p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20'
            aria-label='Abrir menú de navegación'
          >
            <Bars3Icon className='w-6 h-6' />
          </button>
          <h1 className='text-lg sm:text-2xl font-bold tracking-tight truncate'>
            Los Tiburones
          </h1>
          <HeaderBackButton />
        </div>
        {isAuthenticated && userProfile && (
          <div className='relative' data-user-menu>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20'
            >
              <UserCircleIcon className='w-8 h-8' />
              <div className='hidden sm:block text-left'>
                <div className='text-sm font-medium'>
                  {userProfile.displayName}
                </div>
                <div className='text-xs text-sky-100 capitalize'>
                  {userProfile.role}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50'>
                <div className='p-4 border-b'>
                  <div className='text-sm font-medium text-gray-900'>
                    {userProfile.displayName}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {userProfile.email}
                  </div>
                  <div className='text-xs text-sky-600 capitalize'>
                    {userProfile.role}
                  </div>
                </div>
                <button
                  onClick={handleLogoutUser}
                  className='w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  aria-label='Cerrar sesión de usuario'
                >
                  <ArrowRightOnRectangleIcon
                    className='w-4 h-4'
                    aria-hidden='true'
                  />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform w-80 max-w-[85vw] bg-white border-r shadow-2xl transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role='navigation'
        aria-label='Menú principal de navegación'
      >
        {/* Header del Sidebar */}
        <div className='flex items-center justify-between p-6 border-b bg-gray-50'>
          <h2 className='text-xl font-bold text-gray-800'>Navegación</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className='p-2 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500'
            aria-label='Cerrar menú'
          >
            <XMarkIcon className='w-5 h-5 text-gray-600' />
          </button>
        </div>

        {/* Contenido del Sidebar */}
        <div className='p-6 h-full overflow-y-auto'>
          <nav className='flex flex-col gap-3'>
            <button
              onClick={() => handleNavigateTo("/dashboard")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
              aria-label='Ir al panel de inicio'
            >
              <FolderIcon
                className='w-5 h-5 text-gray-600 group-hover:text-sky-600'
                aria-hidden='true'
              />
              <span className='font-medium text-sm'>Inicio</span>
            </button>

            {/* Separador */}
            <div className='border-t border-gray-200 my-2'></div>
            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2'>
              Cobranza
            </div>

            <button
              onClick={() => navigateTo("/cobros-del-dia")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <CalendarDaysIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Cobros del día</span>
            </button>
            <button
              onClick={() => navigateTo("/cuotas-atrasadas")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <ExclamationCircleIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Cuotas atrasadas</span>
            </button>

            {/* Separador */}
            <div className='border-t border-gray-200 my-2'></div>
            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2'>
              Gestión
            </div>

            <button
              onClick={() => navigateTo("/clientes")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <UsersIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Clientes</span>
            </button>
            <button
              onClick={() => navigateTo("/financiamiento-cuota")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <ListBulletIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>
                Financiamiento a Cuota
              </span>
            </button>
            <button
              onClick={() => navigateTo("/ventas-contado")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <BanknotesIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Ventas al Contado</span>
            </button>

            {/* Separador */}
            <div className='border-t border-gray-200 my-2'></div>
            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2'>
              Inventario y Análisis
            </div>

            <button
              onClick={() => navigateTo("/inventario")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <ArchiveBoxIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Inventario</span>
            </button>

            <button
              onClick={() => navigateTo("/transacciones")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <ArrowsRightLeftIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Transacciones</span>
            </button>
            <button
              onClick={() => navigateTo("/estadisticas")}
              className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sky-500'
            >
              <ChartBarIcon className='w-5 h-5 text-gray-600 group-hover:text-sky-600' />
              <span className='font-medium text-sm'>Estadísticas</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300'
          onClick={() => setSidebarOpen(false)}
          aria-hidden='true'
        />
      )}
    </>
  );
};

export default Header;
