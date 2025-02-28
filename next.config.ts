import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mdxeolqfiosscdommyhc.supabase.co',
      },
    ],
  },
};

export default nextConfig;
