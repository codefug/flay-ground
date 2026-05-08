import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    testProxy: true,
  },
};

export default nextConfig;
