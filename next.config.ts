import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize build performance
  experimental: {
    optimizePackageImports: ['lucide-react']
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },

  // Reduce bundle size
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 300
  },

  // Reduce memory usage during build
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
