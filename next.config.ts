import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* config options here */
  devIndicators: false,
  
  /* Configuración de ESLint para deployment */
  eslint: {
    // Permitir build en producción incluso con warnings
    ignoreDuringBuilds: true,
  },
  
  /* Configuración de TypeScript para deployment */
  typescript: {
    // Permitir build en producción incluso con errores de tipo
    ignoreBuildErrors: true,
  },
  
  /* Optimizaciones de compilación */
  compiler: {
    /* Remover console.log SOLO en producción */
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

export default withBundleAnalyzer(nextConfig);
