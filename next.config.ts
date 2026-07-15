import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Next guess the
  // wrong workspace root without this.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
