import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CartService } from '../CartService'
import type { Cart } from '../../types/cart-new'

const getAccessoryById = vi.fn()

vi.mock('../AccessoryService', () => ({
  AccessoryService: vi.fn(function () {
    return { getAccessoryById }
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

const emptyCart = (): Cart => ({
  items: [],
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
})

describe('CartService', () => {
  let cartService: CartService

  beforeEach(() => {
    vi.clearAllMocks()
    cartService = new CartService()
    getAccessoryById.mockResolvedValue({
      id: 'acc-1',
      name: 'Organizer',
      sku: 'ORG-1',
      price: 100,
      imageSrc: '/organizer.webp',
    })
  })

  it('adds an accessory to an empty cart and charges shipping below 637 zł', async () => {
    const cart = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].productId).toBe('acc-1')
    expect(cart.items[0].quantity).toBe(1)
    expect(cart.items[0].unitPrice).toBe(100)
    expect(cart.subtotal).toBe(100)
    expect(cart.shippingCost).toBe(27)
    expect(cart.total).toBe(127)
    expect(cart.itemCount).toBe(1)
  })

  it('keeps a second accessory as its own line', async () => {
    getAccessoryById.mockImplementation(async (id: string) => ({
      id,
      name: id,
      sku: id,
      price: id === 'acc-1' ? 100 : 50,
      imageSrc: '',
    }))
    const withFirst = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const cart = await cartService.addToCart(withFirst, {
      productType: 'accessory',
      productId: 'acc-2',
      quantity: 1,
    })

    expect(cart.items.map((item) => item.productId)).toEqual(['acc-1', 'acc-2'])
    expect(cart.subtotal).toBe(150)
    expect(cart.shippingCost).toBe(27)
    expect(cart.total).toBe(177)
  })

  it('increments quantity when the same accessory and configuration are added again', async () => {
    const once = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const cart = await cartService.addToCart(once, {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
    expect(cart.items[0].subtotal).toBe(200)
    expect(cart.itemCount).toBe(2)
  })

  it('removes one line and leaves the other', async () => {
    getAccessoryById.mockImplementation(async (id: string) => ({
      id,
      name: id,
      sku: id,
      price: 100,
      imageSrc: '',
    }))
    const withFirst = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const withBoth = await cartService.addToCart(withFirst, {
      productType: 'accessory',
      productId: 'acc-2',
      quantity: 1,
    })
    const cart = await cartService.removeFromCart(withBoth, withBoth.items[0].id)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].productId).toBe('acc-2')
  })

  it('leaves the cart unchanged when the removed id is absent', async () => {
    const withItem = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const cart = await cartService.removeFromCart(withItem, 'missing')

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].productId).toBe('acc-1')
  })

  it('clears the cart to a zero total', () => {
    expect(cartService.clearCart()).toEqual(emptyCart())
  })

  it('drops shipping once the subtotal reaches 637 zł', async () => {
    getAccessoryById.mockResolvedValue({
      id: 'acc-1',
      name: 'Zestaw',
      sku: 'SET',
      price: 700,
      imageSrc: '',
    })
    const cart = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })

    expect(cart.subtotal).toBe(700)
    expect(cart.shippingCost).toBe(0)
    expect(cart.total).toBe(700)
  })

  it('updates quantity and subtotal without dropping the line', async () => {
    const withItem = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const cart = await cartService.updateQuantity(withItem, withItem.items[0].id, 3)

    expect(cart.items[0].quantity).toBe(3)
    expect(cart.items[0].subtotal).toBe(300)
    expect(cart.itemCount).toBe(3)
    expect(cart).not.toBe(withItem)
  })

  it('keeps a line when quantity is set to 0 instead of deleting it', async () => {
    const withItem = await cartService.addToCart(emptyCart(), {
      productType: 'accessory',
      productId: 'acc-1',
      quantity: 1,
    })
    const cart = await cartService.updateQuantity(withItem, withItem.items[0].id, 0)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(0)
    expect(cart.items[0].subtotal).toBe(0)
    expect(cart.subtotal).toBe(0)
    expect(cart.shippingCost).toBe(27)
  })
})
