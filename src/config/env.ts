/**
 * Konfiguracja środowiskowa aplikacji
 * Ten plik zawiera wszystkie zmienne środowiskowe używane w aplikacji
 */

export const env = {
  // Feature flags
  features: {
    p24Enabled: process.env.P24_ENABLED === 'true',
    paynowEnabled: process.env.PAYNOW_ENABLED === 'true',
    paynowCheckoutEnabled: process.env.NEXT_PUBLIC_PAYNOW_ENABLED === 'true',
    matTemplatesCatalogEnabled:
      process.env.NEXT_PUBLIC_MAT_TEMPLATES_CATALOG_ENABLED !== 'false',
  },
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/eva_website_db'
  },

  // Next.js Configuration
  nextjs: {
    url: process.env.NEXTAUTH_URL || 'https://evapremium.pl',
    secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret'
  },

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',


  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://evapremium.pl/api'
  },

  // PostgreSQL Configuration (for scripts)
  postgresql: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'eva_user',
    password: process.env.PGPASSWORD || 'eva_password',
    database: process.env.PGDATABASE || 'eva_db'
  },

  // Przelewy24 Configuration
  przelewy24: {
    merchantId: parseInt(process.env.P24_MERCHANT_ID as string),
    posId: parseInt(process.env.P24_POS_ID as string),
    crcKey: process.env.P24_CRC_KEY as string,
    apiKey: process.env.P24_API_KEY as string,
    reportKey: process.env.P24_REPORT_KEY as string,
    environment: process.env.P24_ENVIRONMENT as 'sandbox' | 'production',
    urlReturn: process.env.P24_URL_RETURN as string,
    urlStatus: process.env.P24_URL_STATUS as string,
    urlReturnLocal: process.env.P24_URL_RETURN_LOCAL as string,
    urlStatusLocal: process.env.P24_URL_STATUS_LOCAL as string
  }
} as const;

// Walidacja wymaganych zmiennych środowiskowych
export function validateEnv() {
  const baseRequired = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const p24Required = [
    'P24_MERCHANT_ID',
    'P24_POS_ID',
    'P24_CRC_KEY',
    'P24_API_KEY',
    'P24_REPORT_KEY',
    'P24_ENVIRONMENT',
    'P24_URL_RETURN',
    'P24_URL_STATUS'
  ];

  const required = env.features.p24Enabled ? [...baseRequired, ...p24Required] : baseRequired;

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default env;
