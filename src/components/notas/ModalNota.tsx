"use client";

import { useState } from "react";
import Modal from "@/components/Modal";

interface ModalNotaProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (nota: string) => void;
  notaActual?: string;
  titulo?: string;
  loading?: boolean;
}

export default function ModalNota({
  isOpen,
  onClose,
  onGuardar,
  notaActual = "",
  titulo = "Agregar Nota",
  loading = false,
}: ModalNotaProps) {
  const [nota, setNota] = useState(notaActual);

  const handleGuardar = () => {
    if (nota.trim()) {
      onGuardar(nota.trim());
      setNota("");
    }
  };

  const handleClose = () => {
    setNota(notaActual);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titulo}>
      <div className='space-y-4'>
        <div>
          <label
            htmlFor='nota'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Nota
          </label>
          <textarea
            id='nota'
            rows={4}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder='Escribe una nota sobre esta cuota...'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none'
            disabled={loading}
          />
          <p className='text-sm text-gray-500 mt-1'>
            {nota.length}/500 caracteres
          </p>
        </div>

        <div className='flex gap-3 justify-end pt-4 border-t border-gray-200'>
          <button
            onClick={handleClose}
            disabled={loading}
            className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading || !nota.trim() || nota.length > 500}
            className='px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {loading && (
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            )}
            Guardar Nota
          </button>
        </div>
      </div>
    </Modal>
  );
}
