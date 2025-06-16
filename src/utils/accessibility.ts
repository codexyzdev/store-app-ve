/**
 * Utilidades para mejorar la accesibilidad en toda la aplicación
 */

// Función para generar IDs únicos para elementos
export const generateId = (prefix: string = 'element'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Función para manejar navegación por teclado
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  callbacks: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
  }
) => {
  const { key } = event;
  
  switch (key) {
    case 'Enter':
      callbacks.onEnter?.();
      break;
    case ' ':
    case 'Space':
      event.preventDefault(); // Prevenir scroll
      callbacks.onSpace?.();
      break;
    case 'Escape':
      callbacks.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      callbacks.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      callbacks.onArrowDown?.();
      break;
    case 'ArrowLeft':
      callbacks.onArrowLeft?.();
      break;
    case 'ArrowRight':
      callbacks.onArrowRight?.();
      break;
    case 'Tab':
      callbacks.onTab?.();
      break;
    default:
      break;
  }
};

// Función para verificar si un elemento está visible en el viewport
export const isElementVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Función para hacer scroll hacia un elemento si no está visible
export const scrollIntoViewIfNeeded = (element: HTMLElement, options?: ScrollIntoViewOptions): void => {
  if (!isElementVisible(element)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
      ...options,
    });
  }
};

// Hook personalizado para manejar focus trap (útil para modales)
export const createFocusTrap = (containerElement: HTMLElement): {
  activate: () => void;
  deactivate: () => void;
} => {
  let previouslyFocused: HTMLElement | null = null;
  
  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    return Array.from(containerElement.querySelectorAll(focusableSelectors)) as HTMLElement[];
  };
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  const activate = (): void => {
    previouslyFocused = document.activeElement as HTMLElement;
    
    // Focus en el primer elemento focusable
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    // Agregar event listener
    document.addEventListener('keydown', handleKeyDown);
  };
  
  const deactivate = (): void => {
    // Remover event listener
    document.removeEventListener('keydown', handleKeyDown);
    
    // Restaurar focus previo
    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  };
  
  return { activate, deactivate };
};

// Función para anunciar cambios a lectores de pantalla
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remover después de que se anuncie
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Función para validar contraste de colores (básica)
export const checkColorContrast = (
  foregroundColor: string,
  backgroundColor: string,
  fontSize: number = 14
): {
  ratio: number;
  isAA: boolean;
  isAAA: boolean;
} => {
  // Esta es una implementación básica
  // En un proyecto real, usarías una librería como 'color-contrast-checker'
  const getLuminance = (color: string): number => {
    // Implementación simplificada
    // En producción, usar una librería completa
    return 0.5; // Placeholder
  };
  
  const foregroundLuminance = getLuminance(foregroundColor);
  const backgroundLuminance = getLuminance(backgroundColor);
  
  const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
                (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
  
  const isLargeText = fontSize >= 18 || fontSize >= 14; // Aproximación
  
  return {
    ratio,
    isAA: isLargeText ? ratio >= 3 : ratio >= 4.5,
    isAAA: isLargeText ? ratio >= 4.5 : ratio >= 7,
  };
};

// Constantes para ARIA
export const ARIA_ROLES = {
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  APPLICATION: 'application',
  BANNER: 'banner',
  BUTTON: 'button',
  CHECKBOX: 'checkbox',
  DIALOG: 'dialog',
  MAIN: 'main',
  NAVIGATION: 'navigation',
  REGION: 'region',
  SEARCH: 'search',
  STATUS: 'status',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
} as const;

export const ARIA_STATES = {
  EXPANDED: 'aria-expanded',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  HIDDEN: 'aria-hidden',
  DISABLED: 'aria-disabled',
  INVALID: 'aria-invalid',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
} as const; 