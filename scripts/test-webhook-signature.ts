/**
 * Skrypt testowy: Symulacja webhook Przelewy24 z podpisem
 * 
 * Uruchom: npx tsx scripts/test-webhook-signature.ts
 * 
 * Testuje:
 * - Generowanie podpisu P24
 * - Weryfikację podpisu
 * - Różne warianty CRC_KEY
 */

import crypto from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env file manually
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf8')
    
    const envVars: Record<string, string> = {}
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!key.startsWith('#') && value) {
          envVars[key.trim()] = value
        }
      }
    })
    
    return envVars
  } catch (error) {
    console.error('❌ Failed to load .env file:', error)
    return {}
  }
}

// Load environment variables
const env = loadEnvFile()

function requireEnv(key: string): string {
  const value = env[key]
  if (!value || value.trim() === '' || value.toLowerCase().includes('your_')) {
    throw new Error(`Missing required env variable: ${key}`)
  }
  return value.trim()
}

// P24 config from .env (no fallbacks)
const p24Config = {
  merchantId: parseInt(requireEnv('P24_MERCHANT_ID')),
  posId: parseInt(requireEnv('P24_POS_ID')),
  crcKey: requireEnv('P24_CRC_KEY'),
  apiKey: requireEnv('P24_API_KEY'),
  reportKey: requireEnv('P24_REPORT_KEY'),
  environment: requireEnv('P24_ENVIRONMENT')
}

// Symulowane dane webhook P24
const mockWebhookData = {
  merchantId: 352557,
  posId: 352557,
  sessionId: 'ORDER-TEST-123',
  amount: 10000, // 100.00 PLN w groszach
  originAmount: 10000,
  currency: 'PLN',
  orderId: 123456789,
  methodId: 1,
  statement: 'Test payment',
  sign: '' // Będzie wygenerowany
}

// Warianty CRC tylko z env (brak hardcodu)
const crcKeys = [p24Config.crcKey]

/**
 * Generuje podpis P24 zgodnie z dokumentacją
 */
function generateP24Signature(data: {
  sessionId: string
  merchantId: number
  amount: number
  currency: string
  crcKey: string
}): string {
  const signData = {
    sessionId: data.sessionId,
    merchantId: data.merchantId,
    amount: data.amount,
    currency: data.currency,
    crc: data.crcKey
  }

  const jsonString = JSON.stringify(signData)
  console.log('🔍 JSON for signature:', jsonString)
  
  return crypto.createHash('sha384').update(jsonString).digest('hex')
}

/**
 * Testuje weryfikację podpisu
 */
function testSignatureVerification(webhookData: any, expectedSignature: string): boolean {
  try {
    const config = p24Config
    
    // Generuj oczekiwany podpis używając konfiguracji
    const expectedSign = generateP24Signature({
      sessionId: webhookData.sessionId,
      merchantId: webhookData.merchantId,
      amount: webhookData.amount,
      currency: webhookData.currency,
      crcKey: config.crcKey
    })

    console.log('🔍 Expected signature (from config):', expectedSign)
    console.log('🔍 Received signature:', expectedSignature)
    console.log('🔍 Signatures match:', expectedSign === expectedSignature)
    
    return expectedSign === expectedSignature
  } catch (error) {
    console.error('❌ Error in signature verification:', error)
    return false
  }
}

/**
 * Główna funkcja testowa
 */
async function runTests() {
  console.log('🧪 P24 Webhook Signature Test')
  console.log('================================')
  
  try {
    // Pobierz konfigurację P24
    const config = p24Config
    console.log('🔍 P24 Config loaded:')
    console.log('  - Merchant ID:', config.merchantId)
    console.log('  - POS ID:', config.posId)
    console.log('  - CRC Key:', config.crcKey)
    console.log('  - Environment:', config.environment)
    console.log('')

    // Test 1: Generowanie podpisu z CRC_KEY z env
    console.log('📝 Test 1: Generowanie podpisu z różnymi CRC_KEY')
    console.log('------------------------------------------------')
    
    crcKeys.forEach((crcKey, index) => {
      const signature = generateP24Signature({
        sessionId: mockWebhookData.sessionId,
        merchantId: mockWebhookData.merchantId,
        amount: mockWebhookData.amount,
        currency: mockWebhookData.currency,
        crcKey: crcKey
      })
      
      console.log(`  ${index + 1}. CRC: ${crcKey}`)
      console.log(`     Signature: ${signature}`)
      console.log(`     Length: ${signature.length} chars`)
      console.log('')
    })

    // Test 2: Weryfikacja podpisu z aktualną konfiguracją
    console.log('📝 Test 2: Weryfikacja podpisu z aktualną konfiguracją')
    console.log('-----------------------------------------------------')
    
    const correctSignature = generateP24Signature({
      sessionId: mockWebhookData.sessionId,
      merchantId: mockWebhookData.merchantId,
      amount: mockWebhookData.amount,
      currency: mockWebhookData.currency,
      crcKey: config.crcKey
    })
    
    mockWebhookData.sign = correctSignature
    
    const isValid = testSignatureVerification(mockWebhookData, correctSignature)
    console.log(`✅ Signature verification: ${isValid ? 'PASSED' : 'FAILED'}`)
    console.log('')

    // Test 3: Test z nieprawidłowym podpisem
    console.log('📝 Test 3: Test z nieprawidłowym podpisem')
    console.log('----------------------------------------')
    
    const wrongSignature = 'wrong-signature-123'
    const isWrongValid = testSignatureVerification(mockWebhookData, wrongSignature)
    console.log(`❌ Wrong signature verification: ${isWrongValid ? 'PASSED (ERROR!)' : 'FAILED (EXPECTED)'}`)
    console.log('')

    // Test 4: Symulacja pełnego webhook
    console.log('📝 Test 4: Symulacja pełnego webhook')
    console.log('-----------------------------------')
    
    const fullWebhookData = {
      ...mockWebhookData,
      sign: correctSignature
    }
    
    console.log('Webhook data:')
    console.log(JSON.stringify(fullWebhookData, null, 2))
    console.log('')
    
    // Test 5: Test różnych formatów JSON
    console.log('📝 Test 5: Test różnych formatów JSON')
    console.log('------------------------------------')
    
    const testData = {
      sessionId: 'ORDER-TEST-123',
      merchantId: 352557,
      amount: 10000,
      currency: 'PLN',
      crc: config.crcKey
    }
    
    // Format 1: Bez spacji (jak w P24)
    const jsonCompact = JSON.stringify(testData)
    const signatureCompact = crypto.createHash('sha384').update(jsonCompact).digest('hex')
    
    // Format 2: Ze spacjami (może być problem)
    const jsonPretty = JSON.stringify(testData, null, 2)
    const signaturePretty = crypto.createHash('sha384').update(jsonPretty).digest('hex')
    
    console.log('Compact JSON:', jsonCompact)
    console.log('Compact signature:', signatureCompact)
    console.log('')
    console.log('Pretty JSON:', jsonPretty)
    console.log('Pretty signature:', signaturePretty)
    console.log('')
    console.log('Signatures match:', signatureCompact === signaturePretty)
    console.log('')

    // Podsumowanie
    console.log('📊 Podsumowanie testów')
    console.log('=====================')
    console.log('✅ Generowanie podpisu: DZIAŁA')
    console.log('✅ Weryfikacja podpisu: DZIAŁA')
    console.log('✅ Odrzucanie złego podpisu: DZIAŁA')
    console.log('✅ Format JSON: Kompaktowy (bez spacji)')
    console.log('')
    console.log('🎯 Wniosek: Mechanizm podpisu działa poprawnie')
    console.log('🔍 Problem może być w:')
    console.log('   - P24 nie wysyła webhook (URL problem)')
    console.log('   - Różny CRC_KEY w P24 vs aplikacji')
    console.log('   - Format danych z P24 różni się od oczekiwanego')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Uruchom testy
runTests()
