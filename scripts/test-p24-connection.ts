#!/usr/bin/env tsx

/**
 * Test połączenia z Przelewy24 Sandbox API
 * 
 * Ten skrypt testuje:
 * 1. Autoryzację (Basic Auth)
 * 2. Obliczanie podpisu MD5
 * 3. Endpoint testAccess
 * 4. Rejestrację testowej transakcji
 */

import { config } from 'dotenv';
import crypto from 'crypto';

// Załaduj zmienne środowiskowe
config();

// Kolory dla konsoli
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Konfiguracja P24 - wymagana z .env (bez fallbacków)
function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v || v.trim() === '' || v.toLowerCase().includes('your_')) {
    throw new Error(`Missing required env variable: ${key}`)
  }
  return v
}

const P24_CONFIG = {
  merchantId: requireEnv('P24_MERCHANT_ID'),
  posId: requireEnv('P24_POS_ID'),
  crcKey: requireEnv('P24_CRC_KEY'),
  apiKey: requireEnv('P24_API_KEY'),
  reportKey: requireEnv('P24_REPORT_KEY'),
  environment: requireEnv('P24_ENVIRONMENT'),
  urlReturn: requireEnv('P24_URL_RETURN'),
  urlStatus: requireEnv('P24_URL_STATUS')
};

// URL API na podstawie środowiska
const API_URL = P24_CONFIG.environment === 'production' 
  ? 'https://secure.przelewy24.pl/api/v1'
  : 'https://sandbox.przelewy24.pl/api/v1';

// Funkcje pomocnicze
function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

function logHeader(message: string) {
  log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}`);
  log('='.repeat(message.length + 2), colors.cyan);
}

// Generowanie podpisu MD5
function generateSign(data: any, crcKey: string): string {
  const jsonString = JSON.stringify(data);
  const signString = jsonString + '|' + crcKey;
  return crypto.createHash('md5').update(signString).digest('hex');
}

// Alternatywna funkcja podpisu (konkatenacja stringów zamiast JSON.stringify)
function generateSignAlternative(data: any, crcKey: string): string {
  const signString = [
    data.merchantId,
    data.posId,
    data.sessionId,
    data.amount,
    data.currency,
    data.description,
    data.email,
    data.country,
    data.urlReturn,
    data.urlStatus,
    crcKey
  ].join('|');
  
  return crypto.createHash('md5').update(signString).digest('hex');
}

// Funkcja podpisu zgodna z dokumentacją P24 (tylko wymagane pola)
function generateSignP24(data: any, crcKey: string): string {
  const signString = [
    data.merchantId,
    data.posId,
    data.sessionId,
    data.amount,
    data.currency,
    data.description,
    data.email,
    data.country,
    data.urlReturn,
    data.urlStatus,
    crcKey
  ].join('|');
  
  return crypto.createHash('md5').update(signString).digest('hex');
}

// Funkcja podpisu z minimalnymi polami (tylko te wymagane przez P24)
function generateSignMinimal(data: any, crcKey: string): string {
  const signString = [
    data.merchantId,
    data.posId,
    data.sessionId,
    data.amount,
    data.currency,
    data.description,
    data.email,
    data.country,
    data.urlReturn,
    data.urlStatus,
    crcKey
  ].join('|');
  
  return crypto.createHash('md5').update(signString).digest('hex');
}

// Funkcja podpisu zgodna z dokumentacją P24 API 3.2
function generateSignP24Correct(data: any, crcKey: string): string {
  // Tylko wymagane pola w określonej kolejności
  const signData = {
    sessionId: data.sessionId,
    merchantId: data.merchantId,
    amount: data.amount,
    currency: data.currency,
    crc: crcKey
  };
  
  // JSON.stringify z zachowaniem kolejności kluczy
  const jsonString = JSON.stringify(signData);
  
  return crypto.createHash('sha384').update(jsonString).digest('hex');
}

// Funkcja podpisu z SHA256
function generateSignSHA256(data: any, crcKey: string): string {
  const signString = [
    data.merchantId,
    data.posId,
    data.sessionId,
    data.amount,
    data.currency,
    data.description,
    data.email,
    data.country,
    data.urlReturn,
    data.urlStatus,
    crcKey
  ].join('|');
  
  return crypto.createHash('sha256').update(signString).digest('hex');
}

// Basic Auth header (używamy klucza do raportów do autoryzacji)
function getBasicAuthHeader(posId: string, reportKey: string): string {
  const credentials = Buffer.from(`${posId}:${reportKey}`).toString('base64');
  return `Basic ${credentials}`;
}

// Test 1: Weryfikacja konfiguracji
async function testConfiguration() {
  logHeader('TEST 1: Weryfikacja konfiguracji');
  
  const requiredVars = [
    'P24_MERCHANT_ID',
    'P24_POS_ID', 
    'P24_CRC_KEY',
    'P24_API_KEY',
    'P24_REPORT_KEY'
  ];
  
  let allConfigured = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.includes('your_')) {
      logError(`Brak konfiguracji: ${varName}`);
      allConfigured = false;
    } else {
      logSuccess(`${varName}: ${value.substring(0, 8)}...`);
    }
  }
  
  if (!allConfigured) {
    logWarning('Skonfiguruj zmienne w pliku .env.local');
    return false;
  }
  
  logInfo(`Środowisko: ${P24_CONFIG.environment}`);
  logInfo(`API URL: ${API_URL}`);
  return true;
}

// Test 2: Test autoryzacji (testAccess)
async function testAuthorization() {
  logHeader('TEST 2: Test autoryzacji (testAccess)');
  
  try {
    const response = await fetch(`${API_URL}/testAccess`, {
      method: 'GET',
      headers: {
        'Authorization': getBasicAuthHeader(P24_CONFIG.posId, P24_CONFIG.reportKey),
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      logSuccess('Autoryzacja OK (posId:reportKey)');
      logInfo(`Odpowiedź: ${JSON.stringify(data, null, 2)}`);
      return true;
    } else {
      logError(`Błąd autoryzacji: ${response.status} ${response.statusText}`);
      logError(`Odpowiedź: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    logError(`Błąd połączenia: ${error}`);
    return false;
  }
}

// Test 3: Test obliczania podpisu
async function testSignatureGeneration() {
  logHeader('TEST 3: Test obliczania podpisu MD5');
  
  const testData = {
    merchantId: parseInt(P24_CONFIG.merchantId),
    posId: parseInt(P24_CONFIG.posId),
    sessionId: 'TEST-SESSION-' + Date.now(),
    amount: 1000, // 10.00 PLN w groszach
    currency: 'PLN',
    description: 'Test płatności',
    email: 'test@example.com',
    country: 'PL',
    urlReturn: P24_CONFIG.urlReturn,
    urlStatus: P24_CONFIG.urlStatus
  };
  
  const signCorrect = generateSignP24Correct(testData, P24_CONFIG.crcKey);
  
  // Pokaż dane używane do podpisu
  const signData = {
    sessionId: testData.sessionId,
    merchantId: testData.merchantId,
    amount: testData.amount,
    currency: testData.currency,
    crc: P24_CONFIG.crcKey
  };
  
  logInfo(`Dane testowe: ${JSON.stringify(testData, null, 2)}`);
  logInfo(`Dane do podpisu: ${JSON.stringify(signData, null, 2)}`);
  logInfo(`JSON string: ${JSON.stringify(signData)}`);
  logInfo(`Klucz CRC: ${P24_CONFIG.crcKey}`);
  logInfo(`Podpis (P24 API 3.2): ${signCorrect}`);
  
  // Weryfikacja długości podpisu (96 znaki hex dla SHA384)
  if (signCorrect.length === 96 && /^[a-f0-9]+$/.test(signCorrect)) {
    logSuccess('Podpis wygenerowany poprawnie (P24 API 3.2)');
    return { testData, sign: signCorrect };
  } else {
    logError('Nieprawidłowy format podpisu');
    return null;
  }
}

// Test 4: Rejestracja testowej transakcji
async function testTransactionRegistration(testData: any, sign: string) {
  logHeader('TEST 4: Rejestracja testowej transakcji');
  
  const requestData = {
    ...testData,
    sign: sign
  };
  
  logInfo(`Dane żądania: ${JSON.stringify(requestData, null, 2)}`);
  
  try {
    const response = await fetch(`${API_URL}/transaction/register`, {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuthHeader(P24_CONFIG.posId, P24_CONFIG.reportKey),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.data && data.data.token) {
      logSuccess('Transakcja zarejestrowana pomyślnie!');
      logInfo(`Token: ${data.data.token}`);
      logInfo(`URL płatności: https://${P24_CONFIG.environment === 'production' ? 'secure' : 'sandbox'}.przelewy24.pl/trnRequest/${data.data.token}`);
      return data.data.token;
    } else {
      logError(`Błąd rejestracji transakcji: ${response.status} ${response.statusText}`);
      logError(`Odpowiedź: ${JSON.stringify(data, null, 2)}`);
      return null;
    }
  } catch (error) {
    logError(`Błąd połączenia: ${error}`);
    return null;
  }
}

// Test 5: Weryfikacja transakcji
async function testTransactionVerification(sessionId: string, token: string) {
  logHeader('TEST 5: Weryfikacja transakcji');
  
  // Symulacja danych z webhook (w prawdziwej aplikacji pochodzą z P24)
  const webhookData = {
    merchantId: parseInt(P24_CONFIG.merchantId),
    posId: parseInt(P24_CONFIG.posId),
    sessionId: sessionId,
    amount: 1000,
    originAmount: 1000,
    currency: 'PLN',
    orderId: 12345, // Symulowany orderId
    methodId: 25,   // Symulowany methodId
    statement: 'Test płatności'
  };
  
  // Oblicz podpis dla weryfikacji (inny wzór niż dla rejestracji)
  const verifySignString = [
    webhookData.merchantId,
    webhookData.posId,
    webhookData.sessionId,
    webhookData.amount,
    webhookData.originAmount,
    webhookData.currency,
    webhookData.orderId,
    webhookData.methodId,
    webhookData.statement,
    P24_CONFIG.crcKey
  ].join('|');
  
  const verifySign = crypto.createHash('md5').update(verifySignString).digest('hex');
  
  const verifyData = {
    merchantId: webhookData.merchantId,
    posId: webhookData.posId,
    sessionId: webhookData.sessionId,
    amount: webhookData.amount,
    currency: webhookData.currency,
    orderId: webhookData.orderId,
    sign: verifySign
  };
  
  logInfo(`Dane weryfikacji: ${JSON.stringify(verifyData, null, 2)}`);
  
  try {
    const response = await fetch(`${API_URL}/transaction/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': getBasicAuthHeader(P24_CONFIG.posId, P24_CONFIG.reportKey),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      logSuccess('Weryfikacja transakcji OK');
      logInfo(`Odpowiedź: ${JSON.stringify(data, null, 2)}`);
      return true;
    } else {
      logError(`Błąd weryfikacji: ${response.status} ${response.statusText}`);
      logError(`Odpowiedź: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    logError(`Błąd połączenia: ${error}`);
    return false;
  }
}

// Główna funkcja testowa
async function runTests() {
  logHeader('PRZELEWY24 SANDBOX CONNECTION TEST');
  logInfo(`Test połączenia z Przelewy24 Sandbox API`);
  logInfo(`Data: ${new Date().toLocaleString('pl-PL')}`);
  
  const results = {
    config: false,
    auth: false,
    signature: false,
    registration: false,
    verification: false
  };
  
  // Test 1: Konfiguracja
  results.config = await testConfiguration();
  if (!results.config) {
    logError('Test przerwany - brak konfiguracji');
    return;
  }
  
  // Test 2: Autoryzacja
  results.auth = await testAuthorization();
  
  // Test 3: Podpis
  const signatureResult = await testSignatureGeneration();
  results.signature = signatureResult !== null;
  
  if (signatureResult) {
    // Test 4: Rejestracja transakcji
    const token = await testTransactionRegistration(signatureResult.testData, signatureResult.sign);
    results.registration = token !== null;
    
    if (token) {
      // Test 5: Weryfikacja
      results.verification = await testTransactionVerification(signatureResult.testData.sessionId, token);
    }
  }
  
  // Podsumowanie
  logHeader('PODSUMOWANIE TESTÓW');
  
  const testNames = [
    { key: 'config', name: 'Konfiguracja' },
    { key: 'auth', name: 'Autoryzacja' },
    { key: 'signature', name: 'Generowanie podpisu' },
    { key: 'registration', name: 'Rejestracja transakcji' },
    { key: 'verification', name: 'Weryfikacja transakcji' }
  ];
  
  let passedTests = 0;
  
  for (const test of testNames) {
    const result = results[test.key as keyof typeof results];
    if (result) {
      logSuccess(`${test.name}: PASSED`);
      passedTests++;
    } else {
      logError(`${test.name}: FAILED`);
    }
  }
  
  logInfo(`\nWynik: ${passedTests}/${testNames.length} testów przeszło pomyślnie`);
  
  if (passedTests === testNames.length) {
    logSuccess('🎉 Wszystkie testy przeszły! Połączenie z Przelewy24 działa poprawnie.');
  } else {
    logWarning('⚠ Niektóre testy nie przeszły. Sprawdź konfigurację i spróbuj ponownie.');
  }
  
  // Instrukcje dla następnych kroków
  if (results.config && results.auth) {
    logHeader('NASTĘPNE KROKI');
    logInfo('1. Skonfiguruj webhook URL w panelu P24');
    logInfo('2. Dodaj adres IP serwera do whitelist');
    logInfo('3. Przetestuj pełny przepływ płatności');
    logInfo('4. Przejdź na środowisko produkcyjne');
  }
}

// Uruchom testy
runTests().catch(error => {
  logError(`Błąd krytyczny: ${error}`);
  process.exit(1);
});
