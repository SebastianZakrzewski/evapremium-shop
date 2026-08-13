import type { PaynowConfig, PaynowEnvironment } from '@/lib/types/paynow'

const PAYNOW_API_URLS: Record<PaynowEnvironment, string> = {
  sandbox: 'https://api.sandbox.paynow.pl',
  production: 'https://api.paynow.pl',
}

const resolveUrl = (productionUrl?: string, localUrl?: string): string | undefined => {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev && localUrl) {
    return localUrl
  }
  return productionUrl
}

export const getPaynowConfig = (): PaynowConfig | null => {
  if (process.env.PAYNOW_ENABLED !== 'true') {
    return null
  }

  const apiKey = process.env.PAYNOW_API_KEY
  const signatureKey = process.env.PAYNOW_SIGNATURE_KEY
  const environment = (process.env.PAYNOW_ENVIRONMENT as PaynowEnvironment) || 'sandbox'

  if (!apiKey || !signatureKey) {
    return null
  }

  const urlReturn = resolveUrl(
    process.env.PAYNOW_RETURN_URL,
    process.env.PAYNOW_RETURN_URL_LOCAL
  )
  const urlNotification = resolveUrl(
    process.env.PAYNOW_NOTIFICATION_URL,
    process.env.PAYNOW_NOTIFICATION_URL_LOCAL
  )

  if (!urlReturn || !urlNotification) {
    return null
  }

  return {
    apiKey,
    signatureKey,
    environment,
    urlReturn,
    urlNotification,
    apiUrl: PAYNOW_API_URLS[environment] ?? PAYNOW_API_URLS.sandbox,
  }
}

export const isPaynowEnabled = (): boolean => getPaynowConfig() !== null
