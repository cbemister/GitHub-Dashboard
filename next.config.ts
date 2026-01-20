import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // Electron compatibility - ensure proper asset handling
  assetPrefix: process.env.ELECTRON_BUILD === 'true' ? '' : undefined,
  // Ensure server actions work in Electron
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
