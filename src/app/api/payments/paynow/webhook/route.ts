import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { PaymentService } from '@/lib/services/PaymentService'

const paymentService = new PaymentService()

export async function POST(request: NextRequest) {
  try {
    if (!env.features?.paynowEnabled) {
      return NextResponse.json({ error: 'Paynow disabled' }, { status: 503 })
    }

    const rawBody = await request.text()
    const signatureHeader = request.headers.get('Signature')

    const result = await paymentService.handleWebhook(rawBody, signatureHeader)

    if (!result.success) {
      const status = result.error === 'Nieprawidłowy podpis webhook' ? 400 : 404
      return NextResponse.json({ error: result.error }, { status })
    }

    return new Response(null, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Nieoczekiwany błąd serwera' }, { status: 500 })
  }
}
