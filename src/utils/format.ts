export const formatNumeroControl = (
  numero: number,
  prefijo: string = "C",
  longitud: number = 6
): string => {
  return `${prefijo}-${numero.toString().padStart(longitud, "0")}`;
};

// Función simplificada para normalizar números de control de financiamiento
export const normalizarNumeroControl = (entrada: string): number | null => {
  // Remueve espacios y convierte a minúsculas
  const limpio = entrada.trim().toLowerCase();
  
  // Remover prefijos F-, f-, C-, c- y guiones
  const sinPrefijo = limpio.replace(/^[fc]-?/i, '');
  
  // Convertir a número eliminando ceros a la izquierda
  const numero = parseInt(sinPrefijo.replace(/\D/g, ''), 10);
  
  return isNaN(numero) ? null : numero;
};

// Función para detectar si es formato de número de control
export const esFormatoNumeroControl = (entrada: string): boolean => {
  const entradaLimpia = entrada.trim();
  
  // Acepta formatos: F-000001, f-000001, C-000001, c-000001, 000001, 1, etc.
  const patron = /^[fc]?-?\d+$/i;
  return patron.test(entradaLimpia);
}; 