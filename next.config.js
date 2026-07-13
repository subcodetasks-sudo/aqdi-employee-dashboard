// next.config.js
module.exports = {
  allowedDevOrigins: [
    "192.168.1.7",
    "192.168.1.4",
    "localhost",
  ],
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
    domains: ["aqid.subcodeco.com", "b3app.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aqid.subcodeco.com",
        pathname: "/**",
      },
    ],
  }, eslint: {
    ignoreDuringBuilds: true,
  },
};