import { useState, useCallback, useMemo } from 'react';

interface OptimizedStateOptions<T> {
  equalityCheck?: (prev: T, next: T) => boolean;
  debugName?: string;
}

/**
 * Hook optimizado que previene re-renders innecesarios
 * usando comparación de igualdad personalizada
 */
export const useOptimizedState = <T>(
  initialState: T,
  options: OptimizedStateOptions<T> = {}
) {
  const { equalityCheck, debugName } = options;
  const [state, setState] = useState<T>(initialState);

  const setOptimizedState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(currentState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(currentState)
        : newState;

      // Usar comparación personalizada si se proporciona
      if (equalityCheck && equalityCheck(currentState, nextState)) {
        if (debugName && process.env.NODE_ENV === 'development') {
          console.log(`🚫 [${debugName}] State update skipped - no changes detected`);
        }
        return currentState;
      }

      // Comparación shallow por defecto para objetos
      if (typeof currentState === 'object' && typeof nextState === 'object') {
        const isEqual = JSON.stringify(currentState) === JSON.stringify(nextState);
        if (isEqual) {
          if (debugName && process.env.NODE_ENV === 'development') {
            console.log(`🚫 [${debugName}] State update skipped - shallow equal`);
          }
          return currentState;
        }
      }

      if (debugName && process.env.NODE_ENV === 'development') {
        console.log(`✅ [${debugName}] State updated`, { from: currentState, to: nextState });
      }

      return nextState;
    });
  }, [equalityCheck, debugName]);

  return [state, setOptimizedState] as const;
}

/**
 * Hook para manejar arrays de forma optimizada
 */
export const useOptimizedArray = <T>(
  initialArray: T[] = [],
  keyExtractor: (item: T) => string | number = (_, index) => index
) {
  const [array, setArray] = useOptimizedState(initialArray, {
    equalityCheck: (prev, next) => {
      if (prev.length !== next.length) return false;
      return prev.every((item, index) => 
        keyExtractor(item) === keyExtractor(next[index])
      );
    },
    debugName: 'OptimizedArray'
  });

  const actions = useMemo(() => ({
    add: (item: T) => setArray(prev => [...prev, item]),
    remove: (key: string | number) => setArray(prev => 
      prev.filter(item => keyExtractor(item) !== key)
    ),
    update: (key: string | number, updatedItem: T) => setArray(prev =>
      prev.map(item => keyExtractor(item) === key ? updatedItem : item)
    ),
    clear: () => setArray([]),
    replace: (newArray: T[]) => setArray(newArray)
  }), [setArray, keyExtractor]);

  return {
    array,
    ...actions
  };
}

/**
 * Hook para formularios optimizado que previene re-renders en cada keystroke
 */
export const useOptimizedForm = <T extends Record<string, any>>(
  initialValues: T
) {
  const [values, setValues] = useOptimizedState(initialValues, {
    debugName: 'OptimizedForm'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [setValues, errors]);

  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues, setValues]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    updateField,
    touchField,
    setFieldError,
    clearErrors,
    reset
  };
} 