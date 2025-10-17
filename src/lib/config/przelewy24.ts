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
    'P24_REPORT_KEY',
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
  validateEnvVars()

  const environment = process.env.P24_ENVIRONMENT as 'sandbox' | 'production'
  
  return {
    merchantId: parseInt(process.env.P24_MERCHANT_ID!),
    posId: parseInt(process.env.P24_POS_ID!),
    crcKey: process.env.P24_CRC_KEY!,
    apiKey: process.env.P24_API_KEY!,
    reportKey: process.env.P24_REPORT_KEY!,
    environment,
    urlReturn: process.env.P24_URL_RETURN!,
    urlStatus: process.env.P24_URL_STATUS!,
    apiUrl: environment === 'sandbox' 
      ? 'https://sandbox.przelewy24.pl/api/v1'
      : 'https://secure.przelewy24.pl/api/v1'
  }
}

// Eksportuj domyślną konfigurację
export const P24_CONFIG = getP24Config()
