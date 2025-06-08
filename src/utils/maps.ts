/**
 * Utilidades para manejar enlaces de Google Maps y coordenadas
 */

export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Detecta si una dirección es un enlace de Google Maps
 */
export function esEnlaceGoogleMaps(direccion: string): boolean {
  const patron = /(?:maps\.google\.com|google\.com\/maps)/i;
  return patron.test(direccion);
}

/**
 * Extrae coordenadas de un enlace de Google Maps
 * Soporta varios formatos como:
 * - https://www.google.com/maps?q=lat,lng
 * - https://maps.google.com/?q=lat,lng
 * - https://www.google.com/maps/@lat,lng,zoom
 */
export function extraerCoordenadas(enlace: string): Coordenadas | null {
  try {
    const url = new URL(enlace);
    
    // Formato: ?q=lat,lng
    const qParam = url.searchParams.get('q');
    if (qParam) {
      const coords = qParam.split(',');
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    
    // Formato: /@lat,lng,zoom
    const pathname = url.pathname;
    const match = pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Genera una URL para Google Maps Embed
 */
export function generarUrlGoogleMapsEmbed(coordenadas: Coordenadas): string {
  return `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${coordenadas.lat},${coordenadas.lng}&zoom=15`;
}

/**
 * Genera una URL para OpenStreetMap (alternativa gratuita)
 */
export function generarUrlOpenStreetMap(coordenadas: Coordenadas): string {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${coordenadas.lng-0.01},${coordenadas.lat-0.01},${coordenadas.lng+0.01},${coordenadas.lat+0.01}&layer=mapnik&marker=${coordenadas.lat},${coordenadas.lng}`;
}

/**
 * Formatea coordenadas para mostrar al usuario
 */
export function formatearCoordenadas(coordenadas: Coordenadas): string {
  return `${coordenadas.lat.toFixed(6)}, ${coordenadas.lng.toFixed(6)}`;
} 