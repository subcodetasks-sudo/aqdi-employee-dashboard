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
        // Header-only hardening: safe behind Apache/cPanel Passenger (server.js),
        // no script-src CSP so framework inline scripts and Firebase keep working.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
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
