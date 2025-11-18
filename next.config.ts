import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Agrega otros dominios que uses para imágenes
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Opcional: configurar formatos de imagen
    formats: ['image/webp', 'image/avif'],
    domains: [
      "multicenter.vtexassets.com", // Se añadió este dominio
      "example.com" // Otros dominios permitidos
    ],
  },
};

export default nextConfig;