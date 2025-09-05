import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "img.daisyui.com",
      "randomuser.me",
      "yeazsejygzcvjfbxklnq.supabase.co",
      "xsgames.co",
    ],
  },
};

export default nextConfig;
