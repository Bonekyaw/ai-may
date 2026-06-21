import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth", "@better-auth/core", "kysely"],
};

export default nextConfig;
