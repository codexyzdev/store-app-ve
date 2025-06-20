import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className='fixed inset-0 z-50  flex items-center justify-center bg-black/30  overflow-y-auto'
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? "modal-title" : undefined}
      tabIndex={-1}
    >
      <div
        className='bg-white shadow-2xl md:rounded-2xl w-full max-w-2xl border border-gray-200 relative my-8 max-h-[100vh] md:max-h-[95vh] flex flex-col'
        onClick={handleContentClick}
      >
        <div className='flex-shrink-0 p-6 pb-4 border-b border-gray-100'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1'
            aria-label='Cerrar modal'
            type='button'
            tabIndex={0}
          >
            ×
          </button>
          {title && (
            <h2 id='modal-title' className='text-xl font-bold text-center pr-8'>
              {title}
            </h2>
          )}
        </div>
        <div className='flex-1 overflow-y-auto p-6 pt-4'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
