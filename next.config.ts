import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@privy-io/react-auth'],
  turbopack: {},
};

export default nextConfig;
