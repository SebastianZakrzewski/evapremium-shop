import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderService } from '@/lib/services/OrderService'
import { convertAbandonedCartsOnPaid } from '@/lib/services/AbandonedCartConversionService'

const isE2eAllowed = (): boolean => {
  return process.env.NODE_ENV !== 'production' || process.env.ALLOW_ABANDONED_E2E === 'true'
}

const bodySchema = z.object({
  email: z.string().email(),
  orderId: z.string().uuid(),
  orderNumber: z.string().min(3),
})

/**
 * E2E-only helper: run convertAbandonedCartsOnPaid with a real order payload.
 * Disabled in production unless ALLOW_ABANDONED_E2E=true.
 */
export async function POST(request: NextRequest) {
  if (!isE2eAllowed()) {
    return NextResponse.json({ success: false, error: 'Not available' }, { status: 404 })
  }

  try {
    const input = bodySchema.parse(await request.json())
    const orderService = new OrderService()
    const order = await orderService.getOrderById(input.orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const result = await convertAbandonedCartsOnPaid({
      email: input.email,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      order,
    })

    return NextResponse.json({ success: true, ...result }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
