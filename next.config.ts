import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  experimental: {
    serverComponentsExternalPackages: ['youtubei.js'],
  },
  serverExternalPackages: ['youtubei.js'],
};

export default nextConfig;
