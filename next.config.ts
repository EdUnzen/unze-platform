import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /** Dev-„N“-Badge ausblenden (wirkt oft wie Norton-Overlay) */
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "html5-qrcode"],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [320, 480, 640, 960],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/discover",
        headers: [
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=120, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/discover/:path*",
        headers: [
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=120, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=180",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
