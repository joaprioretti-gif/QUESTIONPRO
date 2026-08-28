import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "questioncolor.com.ar",
      },
    ],
  },
};

export default nextConfig;
