/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.1.7",
    "192.168.1.4",
    "localhost",
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
  },
  async rewrites() {
    const apiTarget =
      process.env.API_PROXY_TARGET || "https://aqid.subcodeco.com/api";

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aqid.subcodeco.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "b3app.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
