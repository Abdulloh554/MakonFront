import path from 'path'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/:path*`,
      },
    ]
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
    resolveAlias: {
      '@shared/*': '../shared/*',
    },
  },
};

export default nextConfig;
