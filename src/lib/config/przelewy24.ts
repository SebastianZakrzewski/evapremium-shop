/**
 * Konfiguracja Przelewy24
 * 
 * Ładuje zmienne środowiskowe i przygotowuje konfigurację dla P24 API
 */

import { P24Config } from '@/lib/types/przelewy24'

// Walidacja zmiennych środowiskowych
function validateEnvVars() {
  const required = [
    'P24_MERCHANT_ID',
    'P24_POS_ID', 
    'P24_CRC_KEY',
    'P24_API_KEY',
    'P24_ENVIRONMENT',
    'P24_URL_RETURN',
    'P24_URL_STATUS'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Brakujące zmienne środowiskowe P24: ${missing.join(', ')}`)
  }
}

// Pobierz konfigurację P24
export function getP24Config(): P24Config {
  // Debug: sprawdź wszystkie zmienne P24
  console.log('🔍 P24Config: Wszystkie zmienne P24:')
  console.log('🔍 P24Config: NODE_ENV:', process.env.NODE_ENV)
  console.log('🔍 P24Config: VERCEL:', process.env.VERCEL)
  console.log('🔍 P24Config: VERCEL_ENV:', process.env.VERCEL_ENV)
  console.log('🔍 P24Config: P24_MERCHANT_ID:', process.env.P24_MERCHANT_ID, 'length:', process.env.P24_MERCHANT_ID?.length)
  console.log('🔍 P24Config: P24_POS_ID:', process.env.P24_POS_ID, 'length:', process.env.P24_POS_ID?.length)
  console.log('🔍 P24Config: P24_CRC_KEY:', process.env.P24_CRC_KEY, 'length:', process.env.P24_CRC_KEY?.length)
  console.log('🔍 P24Config: P24_API_KEY:', process.env.P24_API_KEY, 'length:', process.env.P24_API_KEY?.length)
  console.log('🔍 P24Config: P24_REPORT_KEY:', process.env.P24_REPORT_KEY, 'length:', process.env.P24_REPORT_KEY?.length)
  console.log('🔍 P24Config: P24_ENVIRONMENT:', process.env.P24_ENVIRONMENT, 'length:', process.env.P24_ENVIRONMENT?.length)
  
  validateEnvVars()

  const environment = process.env.P24_ENVIRONMENT as 'sandbox' | 'production'
  
  return {
    merchantId: parseInt(process.env.P24_MERCHANT_ID!),
    posId: parseInt(process.env.P24_POS_ID!),
    crcKey: process.env.P24_CRC_KEY!,
    apiKey: process.env.P24_API_KEY!,
    reportKey: process.env.P24_REPORT_KEY || 'ef0b16e0', // Domyślna wartość jeśli nie ustawiona
    environment,
    urlReturn: process.env.NODE_ENV === 'development' 
      ? process.env.P24_URL_RETURN_LOCAL || process.env.P24_URL_RETURN!
      : process.env.P24_URL_RETURN!,
    urlStatus: process.env.NODE_ENV === 'development'
      ? process.env.P24_URL_STATUS_LOCAL || process.env.P24_URL_STATUS!
      : process.env.P24_URL_STATUS!,
    apiUrl: environment === 'sandbox' 
      ? 'https://sandbox.przelewy24.pl/api/v1'
      : 'https://secure.przelewy24.pl/api/v1'
  }
}

// Eksportuj domyślną konfigurację
export const P24_CONFIG = getP24Config()
