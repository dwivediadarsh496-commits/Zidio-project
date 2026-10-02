import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./public/dev.db", "./prisma/dev.db", "./dev.db"],
  },
};

export default nextConfig;
