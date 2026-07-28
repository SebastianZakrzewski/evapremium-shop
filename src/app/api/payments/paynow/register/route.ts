import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { PaymentService } from '@/lib/services/PaymentService'

const paymentService = new PaymentService()

export async function POST(request: NextRequest) {
  try {
    if (!env.features?.paynowEnabled) {
      return NextResponse.json({ error: 'Paynow disabled' }, { status: 503 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Brak orderId w żądaniu' },
        { status: 400 }
      )
    }

    const result = await paymentService.initiatePayment(orderId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? 'Błąd rejestracji płatności' },
        { status: result.error === 'Zamówienie nie zostało znalezione' ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      paymentId: result.paymentId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Nieoczekiwany błąd serwera',
      },
      { status: 500 }
    )
  }
}
