import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 native module - webpack이 번들링하지 않도록
  serverExternalPackages: ["better-sqlite3"],

  // Vercel 배포 시 SQLite 파일을 서버리스 함수 번들에 포함
  // (Next.js 16: picomatch 글로브, route path 기준으로 매칭)
  outputFileTracingIncludes: {
    "/api/products": ["./products_db.sqlite"],
    "/api/consult":  ["./products_db.sqlite"],
    "/api/recommend":["./products_db.sqlite"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
