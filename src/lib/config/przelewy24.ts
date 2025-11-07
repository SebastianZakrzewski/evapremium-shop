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
  // Sprawdź czy P24 jest włączone
  const p24Enabled = process.env.P24_ENABLED === 'true'
  
  if (!p24Enabled) {
    console.log('🔧 P24Config: Przelewy24 jest wyłączone (P24_ENABLED=false)')
    return false
  }

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
  
  return true
}

// Pobierz konfigurację P24
export function getP24Config(): P24Config | null {
  console.log('🔍 P24Config: Ładowanie konfiguracji P24...')
  
  // Sprawdź czy P24 jest włączone
  const p24Enabled = process.env.P24_ENABLED === 'true'
  
  if (!p24Enabled) {
    console.log('🔧 P24Config: Przelewy24 jest wyłączone (P24_ENABLED=false)')
    return null
  }
  
  // Debug: sprawdź surowe zmienne środowiskowe
  console.log('🔍 P24Config: Surowe zmienne:')
  console.log('🔍 P24Config: P24_MERCHANT_ID:', `"${process.env.P24_MERCHANT_ID}"`, 'length:', process.env.P24_MERCHANT_ID?.length)
  console.log('🔍 P24Config: P24_POS_ID:', `"${process.env.P24_POS_ID}"`, 'length:', process.env.P24_POS_ID?.length)
  console.log('🔍 P24Config: P24_CRC_KEY:', `"${process.env.P24_CRC_KEY}"`, 'length:', process.env.P24_CRC_KEY?.length)
  console.log('🔍 P24Config: P24_API_KEY:', `"${process.env.P24_API_KEY}"`, 'length:', process.env.P24_API_KEY?.length)
  console.log('🔍 P24Config: P24_REPORT_KEY:', `"${process.env.P24_REPORT_KEY}"`, 'length:', process.env.P24_REPORT_KEY?.length)
  console.log('🔍 P24Config: P24_ENVIRONMENT:', `"${process.env.P24_ENVIRONMENT}"`, 'length:', process.env.P24_ENVIRONMENT?.length)
  
  const isValid = validateEnvVars()
  if (!isValid) {
    return null
  }

  // Wyczyść wszystkie zmienne środowiskowe
  const merchantId = parseInt(cleanEnvValue(process.env.P24_MERCHANT_ID))
  const posId = parseInt(cleanEnvValue(process.env.P24_POS_ID))
  const crcKey = cleanEnvValue(process.env.P24_CRC_KEY)
  const apiKey = cleanEnvValue(process.env.P24_API_KEY)
  const reportKey = cleanEnvValue(process.env.P24_REPORT_KEY)
  const environment = cleanEnvValue(process.env.P24_ENVIRONMENT)
  
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

  // Ostrzeżenie dla produkcji
  if (environment === 'production') {
    console.warn('⚠️ P24Config: ŚRODOWISKO PRODUKCYJNE - rzeczywiste płatności!')
    console.warn('⚠️ P24Config: Upewnij się, że wszystkie klucze są produkcyjne')
  } else {
    console.log('🔧 P24Config: Środowisko testowe (sandbox)')
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

// Eksportuj domyślną konfigurację (może być null jeśli P24 jest wyłączone)
// export const P24_CONFIG = getP24Config() // Wyłączone - nie używane po stronie klienta

// Helper function do sprawdzenia czy P24 jest dostępne
export function isP24Enabled(): boolean {
  return process.env.P24_ENABLED === 'true' && getP24Config() !== null
}