import 'server-only'

/**
 * Server-only environment configuration.
 * Never import this module from client components.
 */

const requiredServerEnv = (key: string): string => {
  const value = process.env[key]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const env = {
  features: {
    p24Enabled: process.env.P24_ENABLED === 'true',
    paynowEnabled: process.env.PAYNOW_ENABLED === 'true',
    paynowCheckoutEnabled: process.env.NEXT_PUBLIC_PAYNOW_ENABLED === 'true',
    matTemplatesCatalogEnabled:
      process.env.NEXT_PUBLIC_MAT_TEMPLATES_CATALOG_ENABLED !== 'false',
  },
  supabase: {
    url: requiredServerEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requiredServerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: requiredServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  nextjs: {
    url: process.env.NEXTAUTH_URL || 'https://evapremium.pl',
    secret:
      process.env.NEXTAUTH_SECRET ||
      (process.env.NODE_ENV === 'production' ? requiredServerEnv('NEXTAUTH_SECRET') : 'dev-only-nextauth-secret'),
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://evapremium.pl/api',
  },
  postgresql: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || '',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || '',
  },
  paynow: {
    apiKey: process.env.PAYNOW_API_KEY as string,
    signatureKey: process.env.PAYNOW_SIGNATURE_KEY as string,
    environment: process.env.PAYNOW_ENVIRONMENT as 'sandbox' | 'production',
    urlReturn: process.env.PAYNOW_RETURN_URL as string,
    urlNotification: process.env.PAYNOW_NOTIFICATION_URL as string,
    urlReturnLocal: process.env.PAYNOW_RETURN_URL_LOCAL as string,
    urlNotificationLocal: process.env.PAYNOW_NOTIFICATION_URL_LOCAL as string,
  },
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
    urlStatusLocal: process.env.P24_URL_STATUS_LOCAL as string,
  },
} as const

export function validateEnv() {
  const baseRequired = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
  ]

  const p24Required = [
    'P24_MERCHANT_ID',
    'P24_POS_ID',
    'P24_CRC_KEY',
    'P24_API_KEY',
    'P24_REPORT_KEY',
    'P24_ENVIRONMENT',
    'P24_URL_RETURN',
    'P24_URL_STATUS',
  ]

  const paynowRequired = [
    'PAYNOW_API_KEY',
    'PAYNOW_SIGNATURE_KEY',
    'PAYNOW_ENVIRONMENT',
    'PAYNOW_RETURN_URL',
    'PAYNOW_NOTIFICATION_URL',
  ]

  let required = baseRequired
  if (env.features.p24Enabled) {
    required = [...required, ...p24Required]
  }
  if (env.features.paynowEnabled) {
    required = [...required, ...paynowRequired]
  }

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export default env
