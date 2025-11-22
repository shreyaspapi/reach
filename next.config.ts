import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@privy-io/react-auth'],
  serverExternalPackages: [
    'pino',
    'thread-stream',
    '@walletconnect/ethereum-provider',
    '@privy-io/server-auth',
  ],
  turbopack: {},
};

export default nextConfig;
