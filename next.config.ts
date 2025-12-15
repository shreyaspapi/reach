import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@farcaster/miniapp-sdk',
    '@neynar/nodejs-sdk',
    '@neynar/react',
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
