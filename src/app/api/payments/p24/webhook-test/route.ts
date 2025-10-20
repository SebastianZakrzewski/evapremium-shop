/**
 * API Endpoint: Test webhook Przelewy24 (BEZ WERYFIKACJI)
 * 
 * POST /api/payments/p24/webhook-test
 * Body: P24 webhook data
 * Response: Detailed webhook analysis
 * 
 * Ten endpoint służy do testowania czy P24 wysyła webhook z signature
 * NIE weryfikuje podpisu - tylko loguje dane
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const LOG_DIR = join(process.cwd(), 'logs')
const LOG_FILE = join(LOG_DIR, 'webhook-test.log')

// Ensure logs directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true })
}

function logToFile(message: string) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${message}\n`
  
  try {
    writeFileSync(LOG_FILE, logEntry, { flag: 'a' })
  } catch (error) {
    console.error('❌ Failed to write to log file:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 P24 Webhook Test: Otrzymano webhook (BEZ WERYFIKACJI)')
    logToFile('=== NEW WEBHOOK RECEIVED ===')

    // Get raw body
    const rawBody = await request.text()
    console.log('🔍 P24 Webhook Test: Raw body:', rawBody)
    logToFile(`Raw body: ${rawBody}`)

    // Parse JSON
    let webhookData: any
    try {
      webhookData = JSON.parse(rawBody)
      console.log('🔍 P24 Webhook Test: Parsed JSON:', webhookData)
      logToFile(`Parsed JSON: ${JSON.stringify(webhookData, null, 2)}`)
    } catch (parseError) {
      console.error('❌ P24 Webhook Test: JSON parse error:', parseError)
      logToFile(`JSON parse error: ${parseError}`)
      return NextResponse.json(
        { error: 'Invalid JSON', details: parseError },
        { status: 400 }
      )
    }

    // Analyze webhook structure
    const analysis = {
      hasSignature: 'sign' in webhookData,
      signatureValue: webhookData.sign || null,
      signatureLength: webhookData.sign?.length || 0,
      allFields: Object.keys(webhookData),
      expectedFields: [
        'merchantId', 'posId', 'sessionId', 'amount', 'originAmount',
        'currency', 'orderId', 'methodId', 'statement', 'sign'
      ],
      missingFields: [],
      extraFields: []
    }

    // Check for missing expected fields
    analysis.expectedFields.forEach(field => {
      if (!(field in webhookData)) {
        analysis.missingFields.push(field)
      }
    })

    // Check for extra fields
    analysis.allFields.forEach(field => {
      if (!analysis.expectedFields.includes(field)) {
        analysis.extraFields.push(field)
      }
    })

    console.log('🔍 P24 Webhook Test: Analysis:', analysis)
    logToFile(`Analysis: ${JSON.stringify(analysis, null, 2)}`)

    // Check signature format if present
    if (analysis.hasSignature) {
      const signature = webhookData.sign
      const isHex = /^[0-9a-f]+$/i.test(signature)
      const isLongEnough = signature.length >= 64 // SHA384 should be 96 chars
      
      console.log('🔍 P24 Webhook Test: Signature analysis:', {
        value: signature,
        length: signature.length,
        isHex,
        isLongEnough,
        looksLikeSHA384: signature.length === 96 && isHex
      })
      
      logToFile(`Signature analysis: ${JSON.stringify({
        value: signature,
        length: signature.length,
        isHex,
        isLongEnough,
        looksLikeSHA384: signature.length === 96 && isHex
      }, null, 2)}`)
    }

    // Log headers
    const headers = Object.fromEntries(request.headers.entries())
    console.log('🔍 P24 Webhook Test: Headers:', headers)
    logToFile(`Headers: ${JSON.stringify(headers, null, 2)}`)

    // Log IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    console.log('🔍 P24 Webhook Test: Client info:', { clientIP, userAgent })
    logToFile(`Client info: IP=${clientIP}, UA=${userAgent}`)

    logToFile('=== WEBHOOK ANALYSIS COMPLETE ===\n')

    return NextResponse.json({
      success: true,
      message: 'Webhook received and analyzed (no verification)',
      analysis,
      timestamp: new Date().toISOString(),
      logFile: LOG_FILE
    })

  } catch (error) {
    console.error('❌ P24 Webhook Test: Unexpected error', error)
    logToFile(`ERROR: ${error}`)
    
    return NextResponse.json(
      { 
        error: 'Webhook test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: 'P24 Webhook Test Endpoint',
    description: 'POST webhook data here to test signature presence',
    logFile: LOG_FILE,
    timestamp: new Date().toISOString()
  })
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method PUT not supported' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method DELETE not supported' },
    { status: 405 }
  )
}
