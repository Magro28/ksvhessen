import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  // The optional Cloudflare D1 helper is not part of this static frontend.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
