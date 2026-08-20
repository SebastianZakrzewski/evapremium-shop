import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/features/vehicle-catalog/server/bitrixMappingService', () => ({
  resolveLegacySetTypeEnumId: vi.fn(),
  resolveLegacyVariantEnumId: vi.fn(),
}))

import { mapOrderToDealProductRows } from '@/lib/integrations/bitrix24/mappers/orderToDeal'
import type { Order } from '@/lib/types/order-new'

const buildOrder = (items: Order['items']): Order =>
  ({
    id: 'order-1',
    orderNumber: 'ORD-2026-000001',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'paynow',
    customer: {
      name: 'Jan Test',
      email: 'jan@example.com',
      phone: '+48111111111',
    },
    shippingAddress: {
      street: 'Test 1',
      city: 'Warszawa',
      postalCode: '00-001',
      country: 'Polska',
    },
    billingAddress: null,
    subtotal: 687,
    shippingCost: 0,
    tax: 0,
    discount: 0,
    total: 687,
    notes: null,
    items,
    createdAt: new Date('2026-08-11T10:00:00.000Z'),
    updatedAt: new Date('2026-08-11T10:00:00.000Z'),
  }) as Order

describe('mapOrderToDealProductRows', () => {
  it('maps order items to Bitrix product rows using PRODUCT_NAME', () => {
    const rows = mapOrderToDealProductRows(
      buildOrder([
        {
          id: 'item-1',
          orderId: 'order-1',
          productType: 'mat',
          productId: 'mat-1',
          productName: 'Dywaniki Toyota Yaris 4 gen',
          productSku: 'MAT-TOYOTA-YARIS 4 GEN',
          productImage: '/img.webp',
          quantity: 1,
          unitPrice: 637,
          subtotal: 637,
          configuration: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'item-2',
          orderId: 'order-1',
          productType: 'accessory',
          productId: 'acc-1',
          productName: 'Podpietka plastikowa',
          productSku: 'POD-PLASTIK',
          productImage: '/img2.webp',
          quantity: 1,
          unitPrice: 50,
          subtotal: 50,
          configuration: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    )

    expect(rows).toEqual([
      {
        PRODUCT_NAME: 'Dywaniki Toyota Yaris 4 gen',
        QUANTITY: 1,
        PRICE: 637,
      },
      {
        PRODUCT_NAME: 'Podpietka plastikowa',
        QUANTITY: 1,
        PRICE: 50,
      },
    ])
  })

  it('returns empty array when order has no items', () => {
    expect(mapOrderToDealProductRows(buildOrder([]))).toEqual([])
  })
})
