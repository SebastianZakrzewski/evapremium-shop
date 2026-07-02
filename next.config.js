/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignoruj ESLint podczas builda - warningi nie powinny blokować deploymentu
    // Warningi są naprawiane w trakcie developmentu, ale nie blokują produkcji
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignoruj błędy TypeScript podczas builda (tylko warningi)
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [75, 90, 100],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kmepxyervpeujwvgdqtm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Dodaj polling dla lepszego hot reload w Docker
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Next.js 16 uses Turbopack by default, add empty config to silence warning
  turbopack: {},
};

module.exports = nextConfig;
