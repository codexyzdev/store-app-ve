import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  
  /* Optimizaciones de compilación */
  compiler: {
    /* Remover console.log en producción */
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  /* Paquetes externos del servidor (movido desde experimental) */
  serverExternalPackages: ['firebase-admin'],
  
  /* Optimizaciones de imágenes */
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  /* Optimizaciones experimentales */
  experimental: {
    /* Mejorar rendimiento de Turbopack */
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  /* Configuración de headers para mejor caching */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
