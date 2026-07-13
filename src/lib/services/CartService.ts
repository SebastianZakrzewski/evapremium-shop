import { AccessoryService } from './AccessoryService';
import { MatService } from './MatService';
import { PricingService } from './PricingService';
import { CartItem, Cart, AddToCartDTO, UpdateCartItemDTO } from '../types/cart-new';
import { MatConfigurationSchema } from '@/features/vehicle-catalog/model/matConfiguration';

export class CartService {
  private accessoryService: AccessoryService;
  private matService: MatService;
  private pricingService: PricingService;

  constructor() {
    this.accessoryService = new AccessoryService();
    this.matService = new MatService();
    this.pricingService = new PricingService();
  }

  /**
   * Dodaj produkt do koszyka
   */
  async addToCart(cart: Cart, item: AddToCartDTO): Promise<Cart> {
    // Waliduj produkt
    await this.validateCartItem(item);
    
    // Sprawdź czy produkt już jest w koszyku
    const existingIndex = cart.items.findIndex(
      i => i.productId === item.productId && 
           JSON.stringify(i.configuration) === JSON.stringify(item.configuration)
    );
    
    if (existingIndex >= 0) {
      // Zwiększ ilość
      cart.items[existingIndex].quantity += item.quantity;
      cart.items[existingIndex].subtotal = 
        cart.items[existingIndex].quantity * cart.items[existingIndex].unitPrice;
    } else {
      // Dodaj nowy item
      const cartItem = await this.createCartItem(item);
      cart.items.push(cartItem);
    }
    
    // Przelicz ceny koszyka
    return await this.recalculateCart(cart);
  }

  /**
   * Usuń produkt z koszyka
   */
  async removeFromCart(cart: Cart, itemId: string): Promise<Cart> {
    cart.items = cart.items.filter(item => item.id !== itemId);
    return this.recalculateCart(cart);
  }

  /**
   * Zaktualizuj ilość
   */
  async updateQuantity(cart: Cart, itemId: string, quantity: number): Promise<Cart> {
    const item = cart.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }
    
    // Waliduj dostępność - tymczasowo wyłączone
    if (item.productType === 'accessory') {
      console.log('CartService: Skipping accessory availability validation in updateQuantity');
      // const available = await this.accessoryService.checkAvailability(
      //   item.productId,
      //   quantity
      // );
      
      // if (!available) {
      //   throw new Error('Product not available in requested quantity');
      // }
    }
    
    item.quantity = quantity;
    item.subtotal = item.quantity * item.unitPrice;
    
    return this.recalculateCart(cart);
  }

  /**
   * Wyczyść koszyk
   */
  clearCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      total: 0,
      itemCount: 0
    };
  }

  private static readonly FREE_SHIPPING_THRESHOLD = 637
  private static readonly SHIPPING_COST = 27

  /**
   * Przelicz koszyk
   */
  private async recalculateCart(cart: Cart): Promise<Cart> {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    cart.shippingCost = cart.subtotal >= CartService.FREE_SHIPPING_THRESHOLD ? 0 : CartService.SHIPPING_COST;
    
    cart.tax = 0; // VAT wyłączony
    cart.discount = 0; // TODO: Kody rabatowe
    cart.total = cart.subtotal + cart.shippingCost - cart.discount; // Bez VAT
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log('💰 CartService.recalculateCart:', {
      subtotal: cart.subtotal,
      shippingCost: cart.shippingCost,
      total: cart.total
    });
    
    return cart;
  }

  /**
   * Waliduj pozycję koszyka
   */
  private async validateCartItem(item: AddToCartDTO): Promise<void> {
    if (item.productType === 'accessory') {
      const accessory = await this.accessoryService.getAccessoryById(item.productId);
      
      if (!accessory) {
        throw new Error('Accessory not found');
      }
      
      // Tymczasowo wyłączamy walidację dostępności dla akcesoriów
      console.log('CartService: Skipping accessory availability validation');
      
      // const available = await this.accessoryService.checkAvailability(
      //   item.productId,
      //   item.quantity
      // );
      
      // if (!available) {
      //   throw new Error('Accessory not available');
      // }
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

  /**
   * Utwórz pozycję koszyka
   */
  private async createCartItem(item: AddToCartDTO): Promise<CartItem> {
    let productName = '';
    let productSku = '';
    let productImage = '';
    let unitPrice = 0;

    if (item.productType === 'accessory') {
      const accessory = await this.accessoryService.getAccessoryById(item.productId);
      if (!accessory) {
        throw new Error('Accessory not found');
      }
      
      productName = accessory.name;
      productSku = accessory.sku;
      productImage = accessory.imageSrc || '';
      unitPrice = accessory.price;
    } else if (item.productType === 'mat') {
      const config = item.configuration
      if (!config || !('carDetails' in config)) {
        throw new Error('Brak konfiguracji dywaników')
      }

      productName = item.productName || `Dywaniki ${config.carDetails.brand} ${config.carDetails.model}`;
      productSku = item.productSku || `MAT-${config.carDetails.brand.toUpperCase()}-${config.carDetails.model.toUpperCase()}`;
      productImage = item.productImage || '';
      unitPrice = item.unitPrice || config.pricing?.totalPrice || 0;
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
      configuration: item.configuration
    };
  }

  /**
   * Pobierz podsumowanie koszyka
   */
  getCartSummary(cart: Cart): {
    itemCount: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
  } {
    return {
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      shippingCost: cart.shippingCost,
      tax: cart.tax,
      discount: cart.discount,
      total: cart.total
    };
  }

  /**
   * Sprawdź czy koszyk jest pusty
   */
  isEmpty(cart: Cart): boolean {
    return cart.items.length === 0;
  }

  /**
   * Pobierz liczbę pozycji w koszyku
   */
  getItemCount(cart: Cart): number {
    return cart.itemCount;
  }
}