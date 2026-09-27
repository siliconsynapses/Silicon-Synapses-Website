/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remote image hosts (R2 public bucket / CDN) are added here once storage is configured.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
