import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/features/vehicle-catalog/server/matCartValidation', () => ({
  revalidateMatItemPrice: vi.fn(),
}))

const mockRepositoryUpdate = vi.fn()
const mockGetOrderById = vi.fn()

vi.mock('@/lib/repositories/OrderRepository', () => ({
  OrderRepository: class {
    update = mockRepositoryUpdate
  },
}))

vi.mock('@/lib/services/AccessoryService', () => ({
  AccessoryService: class {},
}))

vi.mock('@/lib/services/MatService', () => ({
  MatService: class {},
}))

vi.mock('@/lib/services/PricingService', () => ({
  PricingService: class {},
}))

const mockGetBitrix24Config = vi.fn()
vi.mock('@/lib/integrations/bitrix24/config', () => ({
  getBitrix24Config: () => mockGetBitrix24Config(),
}))

const mockFindByOrderNumber = vi.fn()
const mockCreateDeal = vi.fn()
const mockUpdateDeal = vi.fn()
const mockUpdateDealStage = vi.fn()
const mockAddProductsToDeal = vi.fn()
const mockLinkContact = vi.fn()
const mockGetDeal = vi.fn()

vi.mock('@/lib/integrations/bitrix24/services/DealService', () => ({
  dealService: {
    findByOrderNumber: (...args: unknown[]) => mockFindByOrderNumber(...args),
    getDeal: (...args: unknown[]) => mockGetDeal(...args),
    createDeal: (...args: unknown[]) => mockCreateDeal(...args),
    updateDeal: (...args: unknown[]) => mockUpdateDeal(...args),
    updateDealStage: (...args: unknown[]) => mockUpdateDealStage(...args),
    addProductsToDeal: (...args: unknown[]) => mockAddProductsToDeal(...args),
    linkContact: (...args: unknown[]) => mockLinkContact(...args),
  },
}))

const mockFindOrCreateContact = vi.fn()
vi.mock('@/lib/integrations/bitrix24/services/ContactService', () => ({
  contactService: {
    findOrCreateContact: (...args: unknown[]) => mockFindOrCreateContact(...args),
  },
}))

vi.mock('@/lib/integrations/bitrix24/services/StageMappingService', () => ({
  stageMappingService: {
    resolveStage: vi.fn(async ({ paymentStatus }: { paymentStatus?: string }) => {
      if (paymentStatus === 'paid') return { stageId: 'UC_DMBNNJ' }
      if (paymentStatus === 'failed' || paymentStatus === 'refunded') return { stageId: 'LOSE' }
      return { stageId: 'NEW' }
    }),
  },
}))

vi.mock('@/lib/integrations/bitrix24/mappers/orderToContact', () => ({
  mapOrderToContact: vi.fn(() => ({ NAME: 'Test' })),
}))

vi.mock('@/lib/integrations/bitrix24/mappers/orderToDeal', () => ({
  mapOrderToDeal: vi.fn(() => ({ TITLE: 'Zamówienie TEST', STAGE_ID: 'UC_DMBNNJ' })),
  mapOrderToDealProductRows: vi.fn(() => [
    {
      PRODUCT_NAME: 'Dywaniki testowe',
      QUANTITY: 1,
      PRICE: 637,
    },
  ]),
}))

vi.mock('@/lib/services/AbandonedCartConversionService', () => ({
  convertAbandonedCartsOnPaid: vi.fn(async () => ({ promotedDealIds: [] })),
}))

import { OrderService } from '@/lib/services/OrderService'
import type { Order } from '@/lib/types/order-new'

const buildOrder = (overrides: Partial<Order> = {}): Order =>
  ({
    id: 'order-1',
    orderNumber: 'ORD-2026-000999',
    status: 'pending',
    paymentStatus: 'pending',
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
    subtotal: 232,
    shippingCost: 27,
    tax: 0,
    discount: 0,
    total: 259,
    notes: null,
    items: [],
    createdAt: new Date('2026-08-11T10:00:00.000Z'),
    updatedAt: new Date('2026-08-11T10:00:00.000Z'),
    ...overrides,
  }) as Order

describe('OrderService Bitrix sync on payment status', () => {
  let service: OrderService

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBitrix24Config.mockReturnValue({
      enabled: true,
      autoSyncOrders: true,
    })
    mockRepositoryUpdate.mockResolvedValue(undefined)
    mockFindOrCreateContact.mockResolvedValue({ id: 'contact-1', created: true })
    mockCreateDeal.mockResolvedValue({ success: true, id: 'deal-new' })
    mockUpdateDeal.mockResolvedValue({ success: true })
    mockUpdateDealStage.mockResolvedValue({ success: true })
    mockAddProductsToDeal.mockResolvedValue({ success: true })
    mockLinkContact.mockResolvedValue({ success: true })

    service = new OrderService()
    vi.spyOn(service, 'getOrderById').mockImplementation(async () => mockGetOrderById())
  })

  it('paid with existing deal updates deal and syncs products', async () => {
    const pending = buildOrder({ paymentStatus: 'pending' })
    const paid = buildOrder({
      status: 'confirmed',
      paymentStatus: 'paid',
      items: [
        {
          id: 'item-1',
          orderId: 'order-1',
          productType: 'mat',
          productId: 'mat-1',
          productName: 'Dywaniki testowe',
          productSku: 'MAT-TEST',
          productImage: '/img.webp',
          quantity: 1,
          unitPrice: 637,
          subtotal: 637,
          configuration: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })
    mockGetOrderById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(paid)
      .mockResolvedValueOnce(paid)
    mockFindByOrderNumber.mockResolvedValue({
      id: 'deal-existing',
      stageId: 'NEW',
      title: 'Zamówienie ORD-2026-000999',
    })

    await service.updatePaymentStatus('order-1', 'paid')

    expect(mockCreateDeal).not.toHaveBeenCalled()
    expect(mockUpdateDeal).toHaveBeenCalledWith('deal-existing', expect.any(Object))
    expect(mockUpdateDealStage).toHaveBeenCalledWith('deal-existing', {
      stageId: 'UC_DMBNNJ',
      comment: expect.stringContaining('paid'),
    })
    expect(mockLinkContact).toHaveBeenCalledWith('deal-existing', 'contact-1')
    expect(mockAddProductsToDeal).toHaveBeenCalledWith('deal-existing', [
      {
        PRODUCT_NAME: 'Dywaniki testowe',
        QUANTITY: 1,
        PRICE: 637,
      },
    ])
  })

  it('paid without existing deal creates Bitrix deal', async () => {
    const pending = buildOrder({ paymentStatus: 'pending' })
    const paid = buildOrder({ status: 'confirmed', paymentStatus: 'paid' })
    mockGetOrderById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(paid)
      .mockResolvedValueOnce(paid)
    mockFindByOrderNumber.mockResolvedValue(null)

    await service.updatePaymentStatus('order-1', 'paid')

    expect(mockFindByOrderNumber).toHaveBeenCalledWith('ORD-2026-000999')
    expect(mockCreateDeal).toHaveBeenCalledTimes(1)
    expect(mockUpdateDeal).not.toHaveBeenCalled()
    expect(mockAddProductsToDeal).toHaveBeenCalledWith('deal-new', [
      {
        PRODUCT_NAME: 'Dywaniki testowe',
        QUANTITY: 1,
        PRICE: 637,
      },
    ])
  })

  it('failed without existing deal does not create Bitrix deal', async () => {
    const pending = buildOrder({ paymentStatus: 'pending' })
    const failed = buildOrder({ paymentStatus: 'failed', notes: 'Paynow status: REJECTED' })
    mockGetOrderById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(failed)
      .mockResolvedValueOnce(failed)
    mockFindByOrderNumber.mockResolvedValue(null)

    await service.updatePaymentStatus('order-1', 'failed', {
      error: 'Paynow status: REJECTED',
    })

    expect(mockFindByOrderNumber).toHaveBeenCalledWith('ORD-2026-000999')
    expect(mockCreateDeal).not.toHaveBeenCalled()
    expect(mockUpdateDeal).not.toHaveBeenCalled()
    expect(mockFindOrCreateContact).not.toHaveBeenCalled()
  })

  it('refunded without existing deal does not create Bitrix deal', async () => {
    const pending = buildOrder({ paymentStatus: 'pending' })
    const refunded = buildOrder({ paymentStatus: 'refunded' })
    mockGetOrderById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(refunded)
      .mockResolvedValueOnce(refunded)
    mockFindByOrderNumber.mockResolvedValue(null)

    await service.updatePaymentStatus('order-1', 'refunded')

    expect(mockCreateDeal).not.toHaveBeenCalled()
    expect(mockUpdateDeal).not.toHaveBeenCalled()
  })

  it('failed with existing deal updates Bitrix deal to LOSE', async () => {
    const pending = buildOrder({ paymentStatus: 'pending' })
    const failed = buildOrder({ paymentStatus: 'failed' })
    mockGetOrderById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(failed)
      .mockResolvedValueOnce(failed)
    mockFindByOrderNumber.mockResolvedValue({
      id: 'deal-existing',
      stageId: 'UC_DMBNNJ',
      title: 'Zamówienie ORD-2026-000999',
    })

    await service.updatePaymentStatus('order-1', 'failed')

    expect(mockCreateDeal).not.toHaveBeenCalled()
    expect(mockUpdateDeal).toHaveBeenCalledWith(
      'deal-existing',
      expect.any(Object)
    )
    expect(mockUpdateDealStage).toHaveBeenCalledWith('deal-existing', {
      stageId: 'LOSE',
      comment: expect.stringContaining('failed'),
    })
  })

  it('pending does not sync to Bitrix', async () => {
    const pending = buildOrder({ paymentStatus: 'pending' })
    mockGetOrderById.mockResolvedValue(pending)

    await service.updatePaymentStatus('order-1', 'pending')

    expect(mockFindByOrderNumber).not.toHaveBeenCalled()
    expect(mockCreateDeal).not.toHaveBeenCalled()
    expect(mockUpdateDeal).not.toHaveBeenCalled()
  })
})
