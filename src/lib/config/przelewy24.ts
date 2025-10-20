/**
 * Konfiguracja Przelewy24
 * 
 * Ładuje zmienne środowiskowe i przygotowuje konfigurację dla P24 API
 * Automatycznie czyści dane z problemów Vercel (\r\n, spacje)
 */

import { P24Config } from '@/lib/types/przelewy24'

// Funkcja do czyszczenia zmiennych środowiskowych
function cleanEnvValue(value: string | undefined): string {
  if (!value) return ''
  
  // Usuń wszystkie znaki \r, \n, \t i spacje z początku/końca
  return value
    .replace(/[\r\n\t]/g, '')  // Usuń znaki kontrolne
    .trim()                    // Usuń spacje z początku/końca
}

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

  // W development sprawdź też zmienne LOCAL
  if (process.env.NODE_ENV === 'development') {
    required.push('P24_URL_RETURN_LOCAL', 'P24_URL_STATUS_LOCAL')
  }

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Brakujące zmienne środowiskowe P24: ${missing.join(', ')}`)
  }
}

// Pobierz konfigurację P24
export function getP24Config(): P24Config {
  console.log('🔍 P24Config: Ładowanie konfiguracji P24...')
  
  // Debug: sprawdź surowe zmienne środowiskowe
  console.log('🔍 P24Config: Surowe zmienne:')
  console.log('🔍 P24Config: P24_MERCHANT_ID:', `"${process.env.P24_MERCHANT_ID}"`, 'length:', process.env.P24_MERCHANT_ID?.length)
  console.log('🔍 P24Config: P24_POS_ID:', `"${process.env.P24_POS_ID}"`, 'length:', process.env.P24_POS_ID?.length)
  console.log('🔍 P24Config: P24_CRC_KEY:', `"${process.env.P24_CRC_KEY}"`, 'length:', process.env.P24_CRC_KEY?.length)
  console.log('🔍 P24Config: P24_API_KEY:', `"${process.env.P24_API_KEY}"`, 'length:', process.env.P24_API_KEY?.length)
  console.log('🔍 P24Config: P24_REPORT_KEY:', `"${process.env.P24_REPORT_KEY}"`, 'length:', process.env.P24_REPORT_KEY?.length)
  console.log('🔍 P24Config: P24_ENVIRONMENT:', `"${process.env.P24_ENVIRONMENT}"`, 'length:', process.env.P24_ENVIRONMENT?.length)
  
  validateEnvVars()

  // Wyczyść wszystkie zmienne środowiskowe
  const merchantId = parseInt(cleanEnvValue(process.env.P24_MERCHANT_ID))
  const posId = parseInt(cleanEnvValue(process.env.P24_POS_ID))
  const crcKey = cleanEnvValue(process.env.P24_CRC_KEY) || '9325080ce772326e'
  const apiKey = cleanEnvValue(process.env.P24_API_KEY) || 'ef0b16e0'
  const reportKey = cleanEnvValue(process.env.P24_REPORT_KEY) || '1522d8628486e9e78a320967921470bc'
  const environment = cleanEnvValue(process.env.P24_ENVIRONMENT) || 'sandbox'
  
  // Wyczyść URL-e - tylko ze zmiennych środowiskowych (.env)
  const urlReturn = cleanEnvValue(process.env.NODE_ENV === 'development' 
    ? process.env.P24_URL_RETURN_LOCAL
    : process.env.P24_URL_RETURN)
    
  const urlStatus = cleanEnvValue(process.env.NODE_ENV === 'development'
    ? process.env.P24_URL_STATUS_LOCAL
    : process.env.P24_URL_STATUS)

  // Walidacja URL-ów
  if (!urlReturn) {
    throw new Error(`Brak P24_URL_RETURN${process.env.NODE_ENV === 'development' ? '_LOCAL' : ''} w zmiennych środowiskowych`)
  }
  
  if (!urlStatus) {
    throw new Error(`Brak P24_URL_STATUS${process.env.NODE_ENV === 'development' ? '_LOCAL' : ''} w zmiennych środowiskowych`)
  }

  // Ustaw URL API na podstawie środowiska
  const apiUrl = environment === 'sandbox' 
    ? 'https://sandbox.przelewy24.pl/api/v1'
    : 'https://secure.przelewy24.pl/api/v1'

  // Walidacja wyczyszczonych wartości
  if (!merchantId || isNaN(merchantId)) {
    throw new Error('P24_MERCHANT_ID musi być liczbą')
  }
  
  if (!posId || isNaN(posId)) {
    throw new Error('P24_POS_ID musi być liczbą')
  }
  
  if (!crcKey || crcKey.length < 8) {
    throw new Error('P24_CRC_KEY musi mieć co najmniej 8 znaków')
  }
  
  if (!apiKey || apiKey.length < 4) {
    throw new Error('P24_API_KEY musi mieć co najmniej 4 znaki')
  }
  
  if (!reportKey || reportKey.length < 16) {
    throw new Error('P24_REPORT_KEY musi mieć co najmniej 16 znaków')
  }
  
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('P24_ENVIRONMENT musi być "sandbox" lub "production"')
  }

  const config: P24Config = {
    merchantId,
    posId,
    crcKey,
    apiKey,
    reportKey,
    environment: environment as 'sandbox' | 'production',
    urlReturn,
    urlStatus,
    apiUrl
  }
  
  // Debug: sprawdź finalną konfigurację
  console.log('🔍 P24Config: Finalna konfiguracja:')
  console.log('🔍 P24Config: merchantId:', config.merchantId, '(type:', typeof config.merchantId, ')')
  console.log('🔍 P24Config: posId:', config.posId, '(type:', typeof config.posId, ')')
  console.log('🔍 P24Config: crcKey:', `"${config.crcKey}"`, 'length:', config.crcKey.length)
  console.log('🔍 P24Config: apiKey:', `"${config.apiKey}"`, 'length:', config.apiKey.length)
  console.log('🔍 P24Config: reportKey:', `"${config.reportKey}"`, 'length:', config.reportKey.length)
  console.log('🔍 P24Config: environment:', `"${config.environment}"`, 'length:', config.environment.length)
  console.log('🔍 P24Config: apiUrl:', config.apiUrl)
  console.log('🔍 P24Config: urlReturn:', config.urlReturn)
  console.log('🔍 P24Config: urlStatus:', config.urlStatus)
  
  // Sprawdź czy environment jest prawidłowo rozpoznany
  console.log('🔍 P24Config: environment === "sandbox":', config.environment === 'sandbox')
  console.log('🔍 P24Config: environment === "production":', config.environment === 'production')
  console.log('🔍 P24Config: apiUrl będzie:', config.apiUrl)
  
  return config
}

// Eksportuj domyślną konfigurację
export const P24_CONFIG = getP24Config()