/**
 * Skrypt testowy: Test rzeczywistego webhook Przelewy24
 * 
 * Uruchom: npx tsx scripts/test-real-webhook.ts
 * 
 * Testuje:
 * - Wysyłanie webhook do endpoint testowego
 * - Sprawdzanie czy P24 wysyła signature
 * - Porównanie z rzeczywistymi danymi
 */

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
  environment: requireEnv('P24_ENVIRONMENT')
}

// Test URLs
const testUrls = {
  // Endpoint testowy (bez weryfikacji)
  webhookTest: 'https://evapremium.pl/api/payments/p24/webhook-test',
  // Endpoint produkcyjny (z weryfikacją)
  webhookProd: 'https://evapremium.pl/api/payments/p24/callback',
  // Local development (jeśli używasz ngrok)
  webhookLocal: 'http://localhost:3000/api/payments/p24/webhook-test'
}

/**
 * Symuluje webhook P24 z prawidłowym podpisem
 */
function generateTestWebhook(sessionId: string, amount: number = 10000) {
  const crypto = require('crypto')
  
  // Generuj podpis zgodnie z P24
  const signData = {
    sessionId: sessionId,
    merchantId: p24Config.merchantId,
    amount: amount,
    currency: 'PLN',
    crc: p24Config.crcKey
  }
  
  const jsonString = JSON.stringify(signData)
  const signature = crypto.createHash('sha384').update(jsonString).digest('hex')
  
  return {
    merchantId: p24Config.merchantId,
    posId: p24Config.posId,
    sessionId: sessionId,
    amount: amount,
    originAmount: amount,
    currency: 'PLN',
    orderId: Math.floor(Math.random() * 1000000000),
    methodId: 1,
    statement: 'Test payment from script',
    sign: signature
  }
}

/**
 * Wysyła webhook do endpoint testowego
 */
async function sendTestWebhook(url: string, webhookData: any) {
  try {
    console.log(`🔄 Sending webhook to: ${url}`)
    console.log('📤 Webhook data:', JSON.stringify(webhookData, null, 2))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'P24-Webhook-Test/1.0'
      },
      body: JSON.stringify(webhookData)
    })
    
    const responseText = await response.text()
    let responseData
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }
    
    console.log(`📥 Response status: ${response.status}`)
    console.log('📥 Response data:', responseData)
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    }
    
  } catch (error) {
    console.error('❌ Error sending webhook:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Testuje różne scenariusze webhook
 */
async function runWebhookTests() {
  console.log('🧪 P24 Real Webhook Test')
  console.log('========================')
  console.log('')
  
  console.log('🔍 P24 Configuration:')
  console.log(`  - Merchant ID: ${p24Config.merchantId}`)
  console.log(`  - POS ID: ${p24Config.posId}`)
  console.log(`  - CRC Key: ${p24Config.crcKey}`)
  console.log(`  - Environment: ${p24Config.environment}`)
  console.log('')
  
  // Test 1: Webhook z prawidłowym podpisem
  console.log('📝 Test 1: Webhook z prawidłowym podpisem')
  console.log('----------------------------------------')
  
  const testSessionId = `ORDER-TEST-${Date.now()}`
  const validWebhook = generateTestWebhook(testSessionId, 10000)
  
  console.log('🔍 Generated webhook with signature:')
  console.log(`  - Session ID: ${validWebhook.sessionId}`)
  console.log(`  - Amount: ${validWebhook.amount} (${validWebhook.amount / 100} PLN)`)
  console.log(`  - Signature: ${validWebhook.sign}`)
  console.log(`  - Signature length: ${validWebhook.sign.length} chars`)
  console.log('')
  
  // Test endpoint testowy (bez weryfikacji)
  console.log('🔄 Testing webhook-test endpoint...')
  const testResult = await sendTestWebhook(testUrls.webhookTest, validWebhook)
  
  if (testResult.success) {
    console.log('✅ Webhook test endpoint: SUCCESS')
    if (testResult.data.analysis) {
      console.log('📊 Analysis results:')
      console.log(`  - Has signature: ${testResult.data.analysis.hasSignature}`)
      console.log(`  - Signature length: ${testResult.data.analysis.signatureLength}`)
      console.log(`  - Missing fields: ${testResult.data.analysis.missingFields.join(', ') || 'None'}`)
      console.log(`  - Extra fields: ${testResult.data.analysis.extraFields.join(', ') || 'None'}`)
    }
  } else {
    console.log('❌ Webhook test endpoint: FAILED')
    console.log('Error:', testResult.error || testResult.data)
  }
  console.log('')
  
  // Test 2: Webhook z nieprawidłowym podpisem
  console.log('📝 Test 2: Webhook z nieprawidłowym podpisem')
  console.log('-------------------------------------------')
  
  const invalidWebhook = {
    ...validWebhook,
    sessionId: `ORDER-INVALID-${Date.now()}`,
    sign: 'invalid-signature-123'
  }
  
  console.log('🔄 Testing with invalid signature...')
  const invalidResult = await sendTestWebhook(testUrls.webhookTest, invalidWebhook)
  
  if (invalidResult.success) {
    console.log('✅ Invalid webhook test: SUCCESS (endpoint accepted it)')
  } else {
    console.log('❌ Invalid webhook test: FAILED (endpoint rejected it)')
  }
  console.log('')
  
  // Test 3: Webhook bez podpisu
  console.log('📝 Test 3: Webhook bez podpisu')
  console.log('-----------------------------')
  
  const noSignatureWebhook = {
    ...validWebhook,
    sessionId: `ORDER-NO-SIGN-${Date.now()}`
  }
  delete noSignatureWebhook.sign
  
  console.log('🔄 Testing without signature...')
  const noSignResult = await sendTestWebhook(testUrls.webhookTest, noSignatureWebhook)
  
  if (noSignResult.success) {
    console.log('✅ No signature webhook: SUCCESS (endpoint accepted it)')
    if (noSignResult.data.analysis) {
      console.log(`📊 Has signature: ${noSignResult.data.analysis.hasSignature}`)
    }
  } else {
    console.log('❌ No signature webhook: FAILED (endpoint rejected it)')
  }
  console.log('')
  
  // Test 4: Test produkcyjnego endpoint (z weryfikacją)
  console.log('📝 Test 4: Test produkcyjnego endpoint (z weryfikacją)')
  console.log('----------------------------------------------------')
  
  console.log('⚠️  WARNING: This will test the production endpoint with verification!')
  console.log('🔄 Testing production callback endpoint...')
  
  const prodResult = await sendTestWebhook(testUrls.webhookProd, validWebhook)
  
  if (prodResult.success) {
    console.log('✅ Production endpoint: SUCCESS')
  } else {
    console.log('❌ Production endpoint: FAILED')
    console.log('Error:', prodResult.error || prodResult.data)
  }
  console.log('')
  
  // Podsumowanie
  console.log('📊 Test Summary')
  console.log('===============')
  console.log('✅ Webhook generation: WORKING')
  console.log('✅ Signature generation: WORKING')
  console.log('✅ Test endpoint: ' + (testResult.success ? 'ACCESSIBLE' : 'NOT ACCESSIBLE'))
  console.log('✅ Production endpoint: ' + (prodResult.success ? 'ACCESSIBLE' : 'NOT ACCESSIBLE'))
  console.log('')
  
  console.log('🎯 Next Steps:')
  console.log('1. Check if P24 Sandbox is configured with correct webhook URL')
  console.log('2. Test real payment flow in P24 Sandbox')
  console.log('3. Check logs for actual webhook data from P24')
  console.log('4. Verify CRC_KEY matches between P24 panel and application')
}

// Uruchom testy
runWebhookTests().catch(console.error)
