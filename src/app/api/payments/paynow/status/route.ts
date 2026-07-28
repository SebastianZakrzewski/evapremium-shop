import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { PaymentService } from '@/lib/services/PaymentService'

const paymentService = new PaymentService()

export async function GET(request: NextRequest) {
  try {
    if (!env.features?.paynowEnabled) {
      return NextResponse.json({ error: 'Paynow disabled' }, { status: 503 })
    }

    const orderId = request.nextUrl.searchParams.get('orderId')
    if (!orderId) {
      return NextResponse.json({ error: 'Brak orderId' }, { status: 400 })
    }

    const payment = await paymentService.getLatestPaymentForOrder(orderId)
    if (!payment) {
      return NextResponse.json({ error: 'Płatność nie została znaleziona' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        providerStatus: payment.providerStatus,
        providerPaymentId: payment.providerPaymentId,
        paidAt: payment.paidAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Nieoczekiwany błąd serwera',
      },
      { status: 500 }
    )
  }
}
