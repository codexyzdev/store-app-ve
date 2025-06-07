import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
      <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-gray-200 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl font-bold'
          aria-label='Cerrar modal'
          type='button'
        >
          ×
        </button>
        {title && (
          <h2 className='text-xl font-bold text-center mb-4'>{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
