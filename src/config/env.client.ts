/**
 * Client-safe environment configuration (NEXT_PUBLIC_* only).
 */

export const clientEnv = {
  features: {
    matTemplatesCatalogEnabled:
      process.env.NEXT_PUBLIC_MAT_TEMPLATES_CATALOG_ENABLED !== 'false',
    paynowCheckoutEnabled: process.env.NEXT_PUBLIC_PAYNOW_ENABLED === 'true',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
} as const

export default clientEnv
