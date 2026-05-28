import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.facebook.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
    ],
  },
  // async rewrites() {
  //   // If the server URL is not defined, default to Render
  //   const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://glance-car-wash.onrender.com";
  //   return [
  //     {
  //       source: "/api/auth/:path*",
  //       destination: `${serverUrl}/api/auth/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
