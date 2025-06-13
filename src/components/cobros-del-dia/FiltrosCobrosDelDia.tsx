import React from "react";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { FiltrosCobrosDelDia } from "@/store/slices/cobrosDelDiaSlice";

interface FiltrosCobrosDelDiaProps {
  filters: FiltrosCobrosDelDia;
  onBusquedaChange: (busqueda: string) => void;
  onTipoVistaChange: (tipoVista: "tarjetas" | "lista") => void;
}

export function FiltrosCobrosDelDia({
  filters,
  onBusquedaChange,
  onTipoVistaChange,
}: FiltrosCobrosDelDiaProps) {
  return (
    <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
      {/* Buscador */}
      <div className='relative w-full'>
        <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
        <input
          type='text'
          placeholder='Buscar cliente por nombre, cédula o teléfono...'
          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          value={filters.busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>

      {/* Selector de vista */}
      <div className='flex bg-gray-100 rounded-lg p-1 min-w-fit'>
        <button
          onClick={() => onTipoVistaChange("tarjetas")}
          className={`p-2 rounded-md flex items-center gap-2 transition-colors min-w-fit ${
            filters.tipoVista === "tarjetas"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Squares2X2Icon className='w-5 h-5' />
          <span className='hidden sm:inline'>Tarjetas</span>
        </button>
        <button
          onClick={() => onTipoVistaChange("lista")}
          className={`p-2 rounded-md flex items-center gap-2 transition-colors min-w-fit ${
            filters.tipoVista === "lista"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <ListBulletIcon className='w-5 h-5' />
          <span className='hidden sm:inline'>Lista</span>
        </button>
      </div>
    </div>
  );
}
