import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  async redirects() {
    return [
      // Old public storefront → unified /[subdomain]
      {
        source: "/site/:subdomain",
        destination: "/:subdomain",
        permanent: true,
      },
      {
        source: "/site/:subdomain/:path*",
        destination: "/:subdomain/:path*",
        permanent: true,
      },
      // Old customer portal → unified /[subdomain]/portal
      {
        source: "/portal/:slug",
        destination: "/:slug/portal",
        permanent: true,
      },
      {
        source: "/portal/:slug/:path*",
        destination: "/:slug/portal/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
