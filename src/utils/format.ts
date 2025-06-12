export const formatNumeroControl = (
  numero: number,
  prefijo: string = "C",
  longitud: number = 6
): string => {
  return `#${prefijo}-${numero.toString().padStart(longitud, "0")}`;
}; 