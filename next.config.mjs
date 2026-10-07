// Headers sent with every page. They state that the site's content is reserved (no AI training or text and data
// mining), stop other sites from framing our pages, and keep browsers from guessing file types. See /copyright.
const protectiveHeaders = [
  { key: "X-Robots-Tag", value: "noai, noimageai" },
  { key: "tdm-reservation", value: "1" },
  { key: "tdm-policy", value: "https://patientcreations.com/copyright" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

import { UPSTREAM } from "./lib/site/showcaseUpstream.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Never publish source maps: they would hand anyone the original, readable source.
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // The design-concept photography (lib/site/concepts.ts) is served from the image host and optimised by Next.
  images: { remotePatterns: [{ protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net", pathname: "/user_3FkWSa3GVMBCZmq6h3uM5YfOKE8/**" }] },
  async headers() {
    return [
      { source: "/:path*", headers: protectiveHeaders },
      // Showcased client sites are copies of someone else's page, so search engines must not index them under our name.
      { source: "/showcase/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noai, noimageai" }] },
    ];
  },
  // Client sites we show on /examples are served from /showcase/<name>/ (app/showcase). Their pages and stylesheets are
  // rewritten there; their photos, video and fonts are passed straight through here, so large files never go through a function.
  async rewrites() {
    return {
      beforeFiles: Object.entries(UPSTREAM).flatMap(([slug, host]) => [
        { source: `/showcase/${slug}/assets/:path*`, destination: `https://${host}/assets/:path*` },
        { source: `/showcase/${slug}/:file(favicon\\.(?:svg|png|ico)|apple-touch-icon\\.png|site\\.webmanifest)`, destination: `https://${host}/:file` },
      ]),
    };
  },
  // The welcome kit used to be a static file; links already shared keep working.
  async redirects() {
    return [{ source: "/welcome-kit/index.html", destination: "/welcome-kit", permanent: true }];
  },
  // "file?raw" imports a file's text (the welcome kit's HTML), bundled into the build so the server never reads it from disk.
  webpack(config) {
    config.module.rules.push({ resourceQuery: /raw/, type: "asset/source" });
    return config;
  },
};

export default nextConfig;
