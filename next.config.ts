import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@farcaster/auth-kit'],
  serverExternalPackages: [
    'pino',
    'thread-stream',
    '@walletconnect/ethereum-provider',
  ],
  turbopack: {},
};

export default nextConfig;
