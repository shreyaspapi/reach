import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@farcaster/auth-kit',
    '@farcaster/auth-client', 
    '@farcaster/miniapp-sdk',
    '@farcaster/quick-auth',
    'viem',
  ],
  serverExternalPackages: [
    'pino',
    'thread-stream',
    '@walletconnect/ethereum-provider',
  ],
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  turbopack: {},
};

export default nextConfig;
