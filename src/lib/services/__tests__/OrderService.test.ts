import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateOrderDTO } from '../../types/order-new'

vi.mock('@/lib/database/supabase', () => ({
  supabase: { from: () => ({}) },
  supabaseAdmin: { from: () => ({}) },
  shopDb: () => ({ from: () => ({}) }),
  TABLES: {},
  SHOP_SCHEMA: 'evapremium_shop',
}))

const repo = vi.hoisted(() => ({
  countOrdersThisYear: vi.fn(async () => 0),
  findByOrderNumber: vi.fn(async () => null),
  findById: vi.fn(),
  create: vi.fn(async (data: Record<string, unknown>) => ({ id: 'order-1', ...data })),
  insertItems: vi.fn(async () => ({ error: null })),
}))

vi.mock('../../repositories/OrderRepository', () => ({
  OrderRepository: vi.fn(function () {
    return {
      countOrdersThisYear: repo.countOrdersThisYear,
      findByOrderNumber: repo.findByOrderNumber,
      findById: repo.findById,
      create: repo.create,
      supabase: {
        from: () => ({
          insert: repo.insertItems,
        }),
      },
    }
  }),
}))

vi.mock('../AccessoryService', () => ({
  AccessoryService: vi.fn(function () {
    return {
      checkAvailability: vi.fn(async () => true),
      decrementStock: vi.fn(async () => undefined),
    }
  }),
}))

vi.mock('../MatService', () => ({
  MatService: vi.fn(function () {
    return {}
  }),
}))

vi.mock('../PricingService', () => ({
  PricingService: vi.fn(function () {
    return {}
  }),
}))

import { OrderService } from '../OrderService'

const address = {
  street: 'ul. Testowa 123',
  city: 'Warszawa',
  postalCode: '00-001',
  country: 'Polska',
}

const accessory = (id: string, unitPrice: number, quantity = 1) => ({
  productType: 'accessory' as const,
  productId: id,
  productName: 'Organizer',
  quantity,
  unitPrice,
  subtotal: unitPrice * quantity,
})

const orderInput = (items: CreateOrderDTO['items'], extra: Partial<CreateOrderDTO> = {}): CreateOrderDTO => ({
  customer: {
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48123456789',
  },
  shippingAddress: address,
  paymentMethod: 'paynow',
  items,
  ...extra,
})

describe('OrderService', () => {
  let service: OrderService

  beforeEach(() => {
    vi.clearAllMocks()
    repo.countOrdersThisYear.mockResolvedValue(0)
    repo.findByOrderNumber.mockResolvedValue(null)
    repo.create.mockImplementation(async (data: Record<string, unknown>) => ({ id: 'order-1', ...data }))
    repo.insertItems.mockResolvedValue({ error: null })
    service = new OrderService()
  })

  it('stores a pending order with the customer and a 27 zł shipping fee under 637 zł', async () => {
    const order = await service.createOrder(orderInput([accessory('11111111-1111-1111-1111-111111111111', 258)]))

    expect(order.id).toBe('order-1')
    expect(order.status).toBe('pending')
    expect(order.payment_status).toBe('pending')
    expect(order.customer).toMatchObject({ email: 'jan.kowalski@example.com' })
    expect(order.subtotal).toBe(258)
    expect(order.shipping_cost).toBe(27)
    expect(order.discount).toBe(0)
    expect(order.total).toBe(285)
    expect(order.order_number).toMatch(/^ORD-\d{4}-000001$/)
  })

  it('sums accessory line subtotals', async () => {
    const order = await service.createOrder(orderInput([
      accessory('11111111-1111-1111-1111-111111111111', 258),
      accessory('22222222-2222-2222-2222-222222222222', 200),
    ]))

    expect(order.subtotal).toBe(458)
    expect(order.shipping_cost).toBe(27)
    expect(order.total).toBe(485)
  })

  it('subtracts a provided discount after shipping', async () => {
    const order = await service.createOrder(orderInput(
      [accessory('11111111-1111-1111-1111-111111111111', 258)],
      { discountAmount: 25 },
    ))

    expect(order.discount).toBe(25)
    expect(order.total).toBe(260)
  })

  it('persists company and tax id on the customer payload', async () => {
    const order = await service.createOrder(orderInput(
      [accessory('11111111-1111-1111-1111-111111111111', 100)],
      {
        customer: {
          name: 'Jan Kowalski',
          email: 'jan.kowalski@example.com',
          phone: '+48123456789',
          company: 'Firma Testowa',
          taxId: '1234567890',
        },
      },
    ))

    expect(order.customer).toMatchObject({
      company: 'Firma Testowa',
      taxId: '1234567890',
    })
  })

  it('creates an order for an empty item list and still adds the 27 zł shipping fee', async () => {
    const order = await service.createOrder(orderInput([]))

    expect(order.subtotal).toBe(0)
    expect(order.shipping_cost).toBe(27)
    expect(order.total).toBe(27)
    expect(order.status).toBe('pending')
  })

  it('throws the repository item error instead of saving a partial success', async () => {
    repo.insertItems.mockResolvedValue({ error: { message: 'Database error' } })

    await expect(service.createOrder(orderInput([
      accessory('11111111-1111-1111-1111-111111111111', 100),
    ]))).rejects.toThrow('Error saving order items: Database error')
  })

  it('returns the repository row from getOrderById', async () => {
    repo.findById.mockResolvedValue({ id: 'order-123', order_number: 'ORD-2026-000001' })

    await expect(service.getOrderById('order-123')).resolves.toMatchObject({ id: 'order-123' })
    expect(repo.findById).toHaveBeenCalledWith('order-123')
  })

  it('returns null when the repository has no order', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(service.getOrderById('missing')).resolves.toBeNull()
  })

  it('propagates a repository read failure', async () => {
    repo.findById.mockRejectedValue(new Error('Query error'))

    await expect(service.getOrderById('order-123')).rejects.toThrow('Query error')
  })
})
