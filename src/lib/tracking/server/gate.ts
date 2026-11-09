export type ServerTrackingEnv = {
  vercelEnv?: string
  sandboxIsolation?: string
  paynowEnvironment?: string
  paymentEnvironment?: string
  serverTrackingEnabled?: string
  adsServerUploadEnabled?: string
  ga4MeasurementId?: string
  ga4ApiSecret?: string
  ga4DebugMode?: string
  googleAdsDeveloperToken?: string
  googleAdsClientId?: string
  googleAdsClientSecret?: string
  googleAdsRefreshToken?: string
  googleAdsCustomerId?: string
  googleAdsLoginCustomerId?: string
  googleAdsConversionAction?: string
}

export type ServerTrackingBlockReason =
  | 'disabled'
  | 'preview'
  | 'sandbox_isolation'
  | 'paynow_sandbox'

export const readServerTrackingEnv = (): ServerTrackingEnv => ({
  vercelEnv: process.env.VERCEL_ENV,
  sandboxIsolation: process.env.SANDBOX_ISOLATION,
  paynowEnvironment: process.env.PAYNOW_ENVIRONMENT,
  serverTrackingEnabled: process.env.SERVER_TRACKING_ENABLED,
  adsServerUploadEnabled: process.env.ADS_SERVER_UPLOAD_ENABLED,
  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID,
  ga4ApiSecret: process.env.GA4_API_SECRET,
  ga4DebugMode: process.env.GA4_MP_DEBUG,
  googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  googleAdsClientId: process.env.GOOGLE_ADS_OAUTH_CLIENT_ID,
  googleAdsClientSecret: process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET,
  googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
  googleAdsLoginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  googleAdsConversionAction: process.env.GOOGLE_ADS_SERVER_CONVERSION_ACTION,
})

/**
 * Preview and sandbox never send, matching the isolation rules prepared in the
 * sandbox PR: VERCEL_ENV=preview, SANDBOX_ISOLATION=enforce, or Paynow sandbox.
 * Production is off until SERVER_TRACKING_ENABLED=true.
 */
export const serverTrackingBlockReason = (
  env: ServerTrackingEnv
): ServerTrackingBlockReason | null => {
  if (env.vercelEnv === 'preview') return 'preview'
  if (env.sandboxIsolation === 'enforce') return 'sandbox_isolation'
  if (env.paynowEnvironment === 'sandbox' || env.paymentEnvironment === 'sandbox') {
    return 'paynow_sandbox'
  }
  if (env.serverTrackingEnabled !== 'true') return 'disabled'
  return null
}

export const adsUploadEnabled = (env: ServerTrackingEnv): boolean =>
  env.adsServerUploadEnabled === 'true'
