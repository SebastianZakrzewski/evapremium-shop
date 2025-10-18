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
  console.log('🔍 P24Config: P24_CRC_KEY raw:', `"${process.env.P24_CRC_KEY}"`)
  console.log('🔍 P24Config: P24_CRC_KEY po czyszczeniu:', `"${process.env.P24_CRC_KEY?.replace(/[\r\n]/g, '').trim()}"`)
  console.log('🔍 P24Config: P24_API_KEY:', process.env.P24_API_KEY, 'length:', process.env.P24_API_KEY?.length)
  console.log('🔍 P24Config: P24_REPORT_KEY:', process.env.P24_REPORT_KEY, 'length:', process.env.P24_REPORT_KEY?.length)
  console.log('🔍 P24Config: P24_REPORT_KEY raw:', `"${process.env.P24_REPORT_KEY}"`)
  console.log('🔍 P24Config: P24_REPORT_KEY po czyszczeniu:', `"${process.env.P24_REPORT_KEY?.replace(/[\r\n]/g, '').trim()}"`)
  console.log('🔍 P24Config: P24_ENVIRONMENT:', process.env.P24_ENVIRONMENT, 'length:', process.env.P24_ENVIRONMENT?.length)
  
  validateEnvVars()

  // Usuń znaki \r\n z początku i końca, potem trim spacje
  const environment = (process.env.P24_ENVIRONMENT?.replace(/[\r\n]/g, '').trim() || 'sandbox') as 'sandbox' | 'production'
  
  // Debug: sprawdź wyczyszczoną wartość environment
  console.log('🔍 P24Config: environment po czyszczeniu:', `"${environment}"`, 'length:', environment.length)
  console.log('🔍 P24Config: environment === "sandbox":', environment === 'sandbox')
  console.log('🔍 P24Config: environment === "production":', environment === 'production')
  
  // Funkcja do czyszczenia zmiennych środowiskowych
  const cleanEnvVar = (value: string | undefined): string => {
    return value?.replace(/[\r\n]/g, '').trim() || ''
  }

  const config = {
    merchantId: parseInt(cleanEnvVar(process.env.P24_MERCHANT_ID)),
    posId: parseInt(cleanEnvVar(process.env.P24_POS_ID)),
    crcKey: cleanEnvVar(process.env.P24_CRC_KEY) || '9325080ce772326e', // Domyślny klucz z test skryptu
    apiKey: cleanEnvVar(process.env.P24_API_KEY) || 'ef0b16e0',
    reportKey: cleanEnvVar(process.env.P24_REPORT_KEY) || '1522d8628486e9e78a320967921470bc',
    environment,
    urlReturn: cleanEnvVar(process.env.NODE_ENV === 'development' 
      ? process.env.P24_URL_RETURN_LOCAL || process.env.P24_URL_RETURN
      : process.env.P24_URL_RETURN) || 'https://evapremium.pl/payment/success',
    urlStatus: cleanEnvVar(process.env.NODE_ENV === 'development'
      ? process.env.P24_URL_STATUS_LOCAL || process.env.P24_URL_STATUS
      : process.env.P24_URL_STATUS) || 'https://evapremium.pl/api/payments/p24/callback',
    apiUrl: environment === 'sandbox' 
      ? 'https://sandbox.przelewy24.pl/api/v1'
      : 'https://secure.przelewy24.pl/api/v1'
  }
  
  // Debug: sprawdź finalną konfigurację
  console.log('🔍 P24Config: Finalna konfiguracja:')
  console.log('🔍 P24Config: merchantId:', config.merchantId)
  console.log('🔍 P24Config: posId:', config.posId)
  console.log('🔍 P24Config: crcKey:', config.crcKey, 'length:', config.crcKey.length)
  console.log('🔍 P24Config: apiKey:', config.apiKey, 'length:', config.apiKey.length)
  console.log('🔍 P24Config: reportKey:', config.reportKey, 'length:', config.reportKey.length)
  console.log('🔍 P24Config: environment:', config.environment)
  console.log('🔍 P24Config: apiUrl:', config.apiUrl)
  console.log('🔍 P24Config: urlReturn:', config.urlReturn)
  console.log('🔍 P24Config: urlStatus:', config.urlStatus)
  
  return config
}

// Eksportuj domyślną konfigurację
export const P24_CONFIG = getP24Config()
