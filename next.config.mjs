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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Never publish source maps: they would hand anyone the original, readable source.
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: protectiveHeaders }];
  },
};

export default nextConfig;
