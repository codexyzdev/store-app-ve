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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 overflow-y-auto'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 relative my-8 max-h-[90vh] flex flex-col'>
        <div className='flex-shrink-0 p-6 pb-4 border-b border-gray-100'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl font-bold'
            aria-label='Cerrar modal'
            type='button'
          >
            ×
          </button>
          {title && (
            <h2 className='text-xl font-bold text-center pr-8'>{title}</h2>
          )}
        </div>
        <div className='flex-1 overflow-y-auto p-6 pt-4'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
