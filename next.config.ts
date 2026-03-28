import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
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
  }
};

export default nextConfig;
