import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  serverExternalPackages: ['youtubei.js'],
  // Clean, standard config with no invalid or deprecated keys.
};

export default nextConfig;
