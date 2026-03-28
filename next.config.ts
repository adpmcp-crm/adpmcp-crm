import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'dist',
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ais-dev-lnpxtzhoh7caesmhab2ibw-124689498029.europe-west2.run.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.run.app',
        port: '',
        pathname: '/**',
      }
    ],
  },
  env: {
    DISABLE_HMR: 'true',
  }
};

export default nextConfig;
