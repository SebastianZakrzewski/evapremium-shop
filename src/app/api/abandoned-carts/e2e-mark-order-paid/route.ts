import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderService } from '@/lib/services/OrderService'

const isE2eAllowed = (): boolean => {
  return process.env.NODE_ENV !== 'production' || process.env.ALLOW_ABANDONED_E2E === 'true'
}

const bodySchema = z.object({
  orderId: z.string().uuid(),
})

/**
 * E2E-only helper: mark order paid through OrderService (triggers Bitrix sync + abandoned conversion).
 */
export async function POST(request: NextRequest) {
  if (!isE2eAllowed()) {
    return NextResponse.json({ success: false, error: 'Not available' }, { status: 404 })
  }

  try {
    const input = bodySchema.parse(await request.json())
    const orderService = new OrderService()
    await orderService.updatePaymentStatus(input.orderId, 'paid')
    const order = await orderService.getOrderById(input.orderId)

    return NextResponse.json({
      success: true,
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      paymentStatus: order?.paymentStatus,
      status: order?.status,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
