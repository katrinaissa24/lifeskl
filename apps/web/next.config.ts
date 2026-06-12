import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the TypeScript source of our workspace package directly, so
  // @lifeskl/core needs no separate build step.
  transpilePackages: ["@lifeskl/core"],
};

export default nextConfig;
