import React, { useState, useCallback } from 'react';

export const useModalStates = () => {
  const [modalStates, setModalStates] = useState<{ [key: string]: boolean }>({});

  const openModal = useCallback((modalId: string) => {
    setModalStates(prev => ({ ...prev, [modalId]: true }));
  }, []);

  const closeModal = useCallback((modalId: string) => {
    setModalStates(prev => ({ ...prev, [modalId]: false }));
  }, []);

  const toggleModal = useCallback((modalId: string) => {
    setModalStates(prev => ({ ...prev, [modalId]: !prev[modalId] }));
  }, []);

  const isOpen = useCallback((modalId: string) => {
    return !!modalStates[modalId];
  }, [modalStates]);

  const closeAllModals = useCallback(() => {
    setModalStates({});
  }, []);

  return {
    modalStates,
    openModal,
    closeModal,
    toggleModal,
    isOpen,
    closeAllModals,
  };
} 