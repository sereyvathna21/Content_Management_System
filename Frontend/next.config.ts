// next.config.ts
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
 

  async redirects() {
    return [
      {
        source: '/',
        destination: '/Landing-page/Home',
        permanent: false, // Use false for local development to avoid browser caching
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

// Wraps the config with next-intl for i18n support
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl(nextConfig);
