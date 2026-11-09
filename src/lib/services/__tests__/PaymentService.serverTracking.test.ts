import { describe, expect, it, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({}) }),
}))

vi.mock('@/lib/database/supabase', () => ({
  supabase: {},
  supabaseAdmin: {},
  shopDb: () => ({}),
  SHOP_SCHEMA: 'evapremium_shop',
  TABLES: {},
}))

import { PaymentService } from '@/lib/services/PaymentService'
import type { PaymentRecord } from '@/lib/types/paynow'
import type { Order } from '@/lib/types/order-new'

const payment = (): PaymentRecord => ({
  id: 'payment-1',
  orderId: 'order-1',
  provider: 'paynow',
  environment: 'production',
  externalId: 'order-1',
  providerPaymentId: 'PAY-528',
  idempotencyKey: 'idem-1',
  amountMinor: 84700,
  currency: 'PLN',
  status: 'pending',
  providerStatus: 'PENDING',
  redirectUrl: null,
  buyerEmail: 'synthetic@example.com',
  failureReason: null,
  webhookDedupeKey: null,
  lastWebhookAt: null,
  paidAt: null,
  createdAt: '2026-11-08T10:00:00.000Z',
  updatedAt: '2026-11-08T10:00:00.000Z',
})

const order = (): Order => ({
  id: 'order-1',
  orderNumber: 'ORD-2026-000528',
  status: 'pending',
  paymentStatus: 'pending',
  total: 847,
  subtotal: 847,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  customer: { name: 'Synthetic', email: 'synthetic@example.com', phone: '000' },
  shippingAddress: { street: 'Synthetic 1', city: 'Sandbox', postalCode: '00-000', country: 'PL' },
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
})

const notification = () =>
  JSON.stringify({
    paymentId: 'PAY-528',
    externalId: 'order-1',
    status: 'CONFIRMED',
    modifiedAt: '2026-11-08T12:00:00.000Z',
  })

describe('Paynow webhook purchase tracking', () => {
  it('returns success when server tracking throws', async () => {
    const current = payment()
    const currentOrder = order()
    const trackPaidPurchase = vi.fn(async () => {
      throw new Error('GA4 down')
    })
    const service = new PaymentService(
      {
        findByWebhookDedupeKey: async () => null,
        findByProviderPaymentId: async () => current,
        findLatestByOrderId: async () => current,
        update: async () => current,
      } as never,
      {
        getOrderById: async () => currentOrder,
        updatePaymentStatus: async () => {
          currentOrder.paymentStatus = 'paid'
        },
      } as never,
      { verifyNotificationSignature: () => true } as never,
      trackPaidPurchase
    )

    const result = await service.handleWebhook(notification(), 'signature')

    expect(result).toEqual({ success: true })
    expect(trackPaidPurchase).toHaveBeenCalledWith({
      orderId: 'order-1',
      providerPaymentId: 'PAY-528',
      paymentEnvironment: 'production',
      paidAt: '2026-11-08T12:00:00.000Z',
    })
  })
})
