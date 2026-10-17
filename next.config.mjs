import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  async redirects() {
    return [
      { source: '/aboutus', destination: '/about', permanent: true },
      { source: '/apartments/:path*', destination: '/rooms', permanent: true },
      { source: '/privacyPolicy', destination: '/privacy-policy', permanent: true },
      { source: '/termsandservice', destination: '/terms', permanent: true },
      { source: '/search-results', destination: '/booking', permanent: true },
    ];
  },
};

export default nextConfig;
