import { fetchAccessoryById } from '@/features/accessories/api/accessoriesClient'
import { PricingService } from './PricingService'
import { CartItem, Cart, AddToCartDTO } from '../types/cart-new'
import { MatConfigurationSchema } from '@/features/vehicle-catalog/model/matConfiguration'
import type { Accessory } from '@/lib/types'

type AccessoryResolver = (id: string) => Promise<Accessory | null>

export class CartService {
  private pricingService: PricingService
  private resolveAccessoryById: AccessoryResolver

  constructor(resolveAccessoryById: AccessoryResolver = fetchAccessoryById) {
    this.pricingService = new PricingService()
    this.resolveAccessoryById = resolveAccessoryById
  }

  async addToCart(cart: Cart, item: AddToCartDTO): Promise<Cart> {
    await this.validateCartItem(item)

    const existingIndex = cart.items.findIndex(
      (cartItem) =>
        cartItem.productId === item.productId &&
        JSON.stringify(cartItem.configuration) === JSON.stringify(item.configuration),
    )

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity
      cart.items[existingIndex].subtotal =
        cart.items[existingIndex].quantity * cart.items[existingIndex].unitPrice
    } else {
      const cartItem = await this.createCartItem(item)
      cart.items.push(cartItem)
    }

    return this.recalculateCart(cart)
  }

  async removeFromCart(cart: Cart, itemId: string): Promise<Cart> {
    cart.items = cart.items.filter((item) => item.id !== itemId)
    return this.recalculateCart(cart)
  }

  async updateQuantity(cart: Cart, itemId: string, quantity: number): Promise<Cart> {
    const item = cart.items.find((cartItem) => cartItem.id === itemId)

    if (!item) {
      throw new Error('Item not found in cart')
    }

    item.quantity = quantity
    item.subtotal = item.quantity * item.unitPrice

    return this.recalculateCart(cart)
  }

  clearCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
    }
  }

  private static readonly FREE_SHIPPING_THRESHOLD = 637
  private static readonly SHIPPING_COST = 27

  private async recalculateCart(cart: Cart): Promise<Cart> {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0)
    cart.shippingCost =
      cart.subtotal >= CartService.FREE_SHIPPING_THRESHOLD ? 0 : CartService.SHIPPING_COST
    cart.tax = 0
    cart.discount = 0
    cart.total = cart.subtotal + cart.shippingCost - cart.discount
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    return cart
  }

  private async validateCartItem(item: AddToCartDTO): Promise<void> {
    if (item.productType === 'accessory') {
      const accessory = await this.resolveAccessoryById(item.productId)

      if (!accessory) {
        throw new Error('Accessory not found')
      }
    } else if (item.productType === 'mat') {
      const parsedConfig = MatConfigurationSchema.safeParse(item.configuration)
      if (!parsedConfig.success) {
        throw new Error('Nieprawidłowa konfiguracja dywaników')
      }

      const clientUnitPrice = item.unitPrice
      if (clientUnitPrice == null || clientUnitPrice <= 0) {
        throw new Error('Brak ceny dla wybranych dywaników')
      }

      const config = parsedConfig.data
      if (!config.carDetails.recordKey || !config.carDetails.bodyTypeKey) {
        throw new Error('Niekompletna konfiguracja pojazdu — wybierz pojazd ponownie w konfiguratorze')
      }
    }
  }

  private async createCartItem(item: AddToCartDTO): Promise<CartItem> {
    let productName = ''
    let productSku = ''
    let productImage = ''
    let unitPrice = 0

    if (item.productType === 'accessory') {
      const accessory = await this.resolveAccessoryById(item.productId)
      if (!accessory) {
        throw new Error('Accessory not found')
      }

      productName = accessory.name
      productSku = accessory.sku
      productImage = accessory.imageSrc || ''
      unitPrice = accessory.price
    } else if (item.productType === 'mat') {
      const config = item.configuration
      if (!config || !('carDetails' in config)) {
        throw new Error('Brak konfiguracji dywaników')
      }

      productName =
        item.productName || `Dywaniki ${config.carDetails.brand} ${config.carDetails.model}`
      productSku =
        item.productSku ||
        `MAT-${config.carDetails.brand.toUpperCase()}-${config.carDetails.model.toUpperCase()}`
      productImage = item.productImage || ''
      unitPrice = item.unitPrice || config.pricing?.totalPrice || 0

      if (unitPrice <= 0) {
        throw new Error('Nie udało się ustalić ceny dywaników')
      }
    }

    return {
      id: `${item.productType}-${item.productId}-${Date.now()}`,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
      productType: item.productType,
      productId: item.productId,
      productName,
      productSku,
      productImage,
      configuration: item.configuration,
    }
  }

  getCartSummary(cart: Cart): {
    itemCount: number
    subtotal: number
    shippingCost: number
    tax: number
    discount: number
    total: number
  } {
    return {
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      shippingCost: cart.shippingCost,
      tax: cart.tax,
      discount: cart.discount,
      total: cart.total,
    }
  }

  isEmpty(cart: Cart): boolean {
    return cart.items.length === 0
  }

  getItemCount(cart: Cart): number {
    return cart.itemCount
  }
}
