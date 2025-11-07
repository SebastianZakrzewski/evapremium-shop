/**
 * Testowy endpoint do sprawdzania czy callback jest dostępny
 * GET /api/payments/p24/callback-test
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Callback endpoint jest dostępny',
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      'user-agent': request.headers.get('user-agent'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-forwarded-host': request.headers.get('x-forwarded-host')
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const parsed = body ? JSON.parse(body) : {}
    
    return NextResponse.json({
      success: true,
      message: 'Callback endpoint otrzymał POST',
      timestamp: new Date().toISOString(),
      body: parsed,
      bodyLength: body.length,
      headers: {
        host: request.headers.get('host'),
        'content-type': request.headers.get('content-type'),
        'user-agent': request.headers.get('user-agent'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-forwarded-host': request.headers.get('x-forwarded-host')
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Nieoczekiwany błąd',
      body: await request.text()
    }, { status: 400 })
  }
}





