const modelCardFrameAncestors = [
  'https://widget-xi-eight.vercel.app',
  'https://www.evapremium.pl',
  'https://evapremium.pl',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].join(' ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
    optimizePackageImports: ['lucide-react', 'framer-motion', 'swiper'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [75, 80, 90, 100],
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
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path((?!modele$).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
      {
        source: '/modele',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${modelCardFrameAncestors}`,
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
