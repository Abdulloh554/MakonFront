import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL ? 'https://makon-n823.onrender.com/api' : 'http://localhost:4000/api')
    const serverUrl = apiBase.replace(/\/api$/, '')
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/v1/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${serverUrl}/api/uploads/:path*`,
      },
    ]
  },
};

export default nextConfig;
