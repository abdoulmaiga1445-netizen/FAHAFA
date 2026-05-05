import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // disabled for local dev
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unpkg.com",
      },
    ],
  },
};

export default nextConfig;
