/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remote image hosts (R2 public bucket / CDN) are added here once storage is configured.
  images: {
    remotePatterns: [],
  },
  // `qrcode` (digital-pass QR rendering) is imported dynamically and required at
  // runtime rather than bundled — so the build stays green if it isn't installed
  // yet, and the pass falls back to its printed token. See src/lib/qr.ts.
  serverExternalPackages: ["qrcode"],
  // Admin uploads (PDF/PPTX/images) post through server actions; raise the body
  // limit above the 1 MB default. Production moves large uploads to R2 (Phase 6).
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
