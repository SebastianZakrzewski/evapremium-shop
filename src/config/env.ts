/**
 * Konfiguracja środowiskowa aplikacji
 * Ten plik zawiera wszystkie zmienne środowiskowe używane w aplikacji
 */

export const env = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDk0MjUsImV4cCI6MjA3MzA4NTQyNX0.PlhrCXHWb3YhOnqu8jVrt_P7nGMx3ETUmrxSwdj48rE',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI'
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
    merchantId: parseInt(process.env.P24_MERCHANT_ID || '352557'),
    posId: parseInt(process.env.P24_POS_ID || '352557'),
    crcKey: process.env.P24_CRC_KEY || '9325080ce772326e',
    apiKey: process.env.P24_API_KEY || 'ef0b16e0',
    reportKey: process.env.P24_REPORT_KEY || '1522d8628486e9e78a320967921470bc',
    environment: (process.env.P24_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    urlReturn: process.env.P24_URL_RETURN || 'https://evapremium.pl/payment/success',
    urlStatus: process.env.P24_URL_STATUS || 'https://evapremium.pl/api/payments/p24/callback',
    urlReturnLocal: process.env.P24_URL_RETURN_LOCAL || 'http://localhost:3000/payment/success',
    urlStatusLocal: process.env.P24_URL_STATUS_LOCAL || 'http://localhost:3000/api/payments/p24/callback'
  }
} as const;

// Walidacja wymaganych zmiennych środowiskowych
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'P24_MERCHANT_ID',
    'P24_POS_ID',
    'P24_CRC_KEY',
    'P24_API_KEY',
    'P24_REPORT_KEY',
    'P24_ENVIRONMENT',
    'P24_URL_RETURN',
    'P24_URL_STATUS'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default env;
