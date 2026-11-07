import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfiguratorService } from '../ConfiguratorService'
import { CartService } from '../CartService'
import type { ConfigurationData } from '../../types/product'
import type { Cart } from '../../types/cart-new'
import type { CreateOrderDTO } from '../../types/order-new'

vi.mock('@/lib/database/supabase', () => ({
  supabase: { from: () => ({}) },
  supabaseAdmin: { from: () => ({}) },
  shopDb: () => ({ from: () => ({}) }),
  TABLES: {},
  SHOP_SCHEMA: 'evapremium_shop',
}))

const getAccessoryById = vi.fn()
const repo = vi.hoisted(() => ({
  countOrdersThisYear: vi.fn(async () => 0),
  findByOrderNumber: vi.fn(async () => null),
  create: vi.fn(async (data: Record<string, unknown>) => ({ id: 'order-1', ...data })),
  insertItems: vi.fn(async () => ({ error: null })),
}))

vi.mock('../AccessoryService', () => ({
  AccessoryService: vi.fn(function () {
    return {
      getAccessoryById,
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

vi.mock('../../repositories/OrderRepository', () => ({
  OrderRepository: vi.fn(function () {
    return {
      countOrdersThisYear: repo.countOrdersThisYear,
      findByOrderNumber: repo.findByOrderNumber,
      create: repo.create,
      supabase: { from: () => ({ insert: repo.insertItems }) },
    }
  }),
}))

import { OrderService } from '../OrderService'

const configuration: ConfigurationData = {
  setType: '3d-with-rims',
  cellType: 'diamonds',
  setVariant: 'basic',
  materialColor: 'black',
  edgeColor: 'red',
  heelPad: 'tak',
  carDetails: { brand: 'BMW', model: 'X5', year: '2023' },
}

const emptyCart = (): Cart => ({
  items: [],
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
})

const orderInput = (items: CreateOrderDTO['items'], extra: Partial<CreateOrderDTO> = {}): CreateOrderDTO => ({
  customer: {
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48123456789',
  },
  shippingAddress: {
    street: 'ul. Testowa 123',
    city: 'Warszawa',
    postalCode: '00-001',
    country: 'Polska',
  },
  paymentMethod: 'paynow',
  items,
  ...extra,
})

describe('Integration Test: Configurator → Cart → Order', () => {
  let cartService: CartService
  let orderService: OrderService

  beforeEach(() => {
    vi.clearAllMocks()
    getAccessoryById.mockResolvedValue({
      id: 'acc-1',
      name: 'Organizer',
      sku: 'ORG-1',
      price: 100,
      imageSrc: '',
    })
    repo.countOrdersThisYear.mockResolvedValue(0)
    repo.findByOrderNumber.mockResolvedValue(null)
    repo.create.mockImplementation(async (data: Record<string, unknown>) => ({ id: 'order-1', ...data }))
    repo.insertItems.mockResolvedValue({ error: null })
    cartService = new CartService()
    orderService = new OrderService()
  })

  it('creates a configured product, adds an accessory, and stores a pending order', async () => {
    const product = ConfiguratorService.createProductFromConfiguration(configuration)
    expect(product.configuration).toMatchObject({
      setType: '3d-with-rims',
      edgeColor: 'red',
      heelPad: 'tak',
    })
    expect(product.pricing.totalPrice).toBe(637)
    expect(product.status).toBe('cached')

    const cart = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    expect(cart.items).toHaveLength(1)

    const order = await orderService.createOrder(orderInput([{
      productType: 'accessory',
      productId: '11111111-1111-1111-1111-111111111111',
      productName: cart.items[0].productName,
      quantity: cart.items[0].quantity,
      unitPrice: cart.items[0].unitPrice,
      subtotal: cart.items[0].subtotal,
    }]))

    expect(order.status).toBe('pending')
    expect(order.customer).toMatchObject({ email: 'jan.kowalski@example.com' })
    expect(order.subtotal).toBe(100)
    expect(order.shipping_cost).toBe(27)
    expect(order.total).toBe(127)
    expect(cartService.clearCart().items).toHaveLength(0)
  })

  it('sums two accessory lines into the order subtotal', async () => {
    getAccessoryById.mockImplementation(async (id: string) => ({
      id,
      name: id,
      sku: id,
      price: id === 'acc-1' ? 100 : 50,
      imageSrc: '',
    }))
    const first = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const cart = await cartService.addToCart(first, {
      productType: 'accessory',
      productId: 'acc-2',
      quantity: 1,
    })

    const order = await orderService.createOrder(orderInput(cart.items.map((item, index) => ({
      productType: 'accessory' as const,
      productId: index === 0
        ? '11111111-1111-1111-1111-111111111111'
        : '22222222-2222-2222-2222-222222222222',
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }))))

    expect(order.subtotal).toBe(150)
    expect(order.total).toBe(177)
  })

  it('increments quantity for the same accessory and removes a line by id', async () => {
    const once = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const twice = await cartService.addToCart(once, {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    expect(twice.items[0].quantity).toBe(2)

    const cleared = await cartService.removeFromCart(twice, twice.items[0].id)
    expect(cleared.items).toHaveLength(0)
    expect(cleared.total).toBe(27)
  })

  it('subtracts the discount from subtotal plus shipping', async () => {
    const cart = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const order = await orderService.createOrder(orderInput([{
      productType: 'accessory',
      productId: '11111111-1111-1111-1111-111111111111',
      productName: cart.items[0].productName,
      quantity: 1,
      unitPrice: 100,
      subtotal: 100,
    }], { discountAmount: 50 }))

    expect(order.discount).toBe(50)
    expect(order.total).toBe(77)
  })

  it('stores company and tax id supplied with the customer', async () => {
    const order = await orderService.createOrder(orderInput([{
      productType: 'accessory',
      productId: '11111111-1111-1111-1111-111111111111',
      productName: 'Organizer',
      quantity: 1,
      unitPrice: 100,
      subtotal: 100,
    }], {
      customer: {
        name: 'Jan Kowalski',
        email: 'jan.kowalski@example.com',
        phone: '+48123456789',
        company: 'Firma Testowa',
        taxId: '1234567890',
      },
    }))

    expect(order.customer).toMatchObject({ company: 'Firma Testowa', taxId: '1234567890' })
  })

  it('does not reject an empty item list and still adds shipping', async () => {
    const order = await orderService.createOrder(orderInput([]))
    expect(order.subtotal).toBe(0)
    expect(order.shipping_cost).toBe(27)
    expect(order.total).toBe(27)
  })

  it('rejects an incomplete configuration before a product is created', () => {
    expect(() => {
      ConfiguratorService.createProductFromConfiguration({ ...configuration, setType: '' })
    }).toThrow('Invalid configuration data')
  })

  it('surfaces an item insert failure from the order repository', async () => {
    repo.insertItems.mockResolvedValue({ error: { message: 'Database error' } })

    await expect(orderService.createOrder(orderInput([{
      productType: 'accessory',
      productId: '11111111-1111-1111-1111-111111111111',
      productName: 'Organizer',
      quantity: 1,
      unitPrice: 100,
      subtotal: 100,
    }]))).rejects.toThrow('Error saving order items: Database error')
  })
})
