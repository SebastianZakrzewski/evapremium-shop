import { Product } from '../types/product';
import { CartItem } from '../types/cart';

export class CartService {
  private static readonly CART_PREFIX = 'cart-';

  /**
   * Dodaje produkt do koszyka
   */
  static addProductToCart(product: Product): void {
    if (typeof window === 'undefined') {
      console.warn('CartService: Cannot access localStorage on server side');
      return;
    }

    const sessionId = this.getCurrentSessionId();
    const cartKey = `${this.CART_PREFIX}${sessionId}`;
    
    try {
      const existingCart = this.getCartFromStorage(cartKey);
      const existingItemIndex = existingCart.findIndex(item => item.id === product.id);

      if (existingItemIndex >= 0) {
        // Zwiększ ilość istniejącego produktu
        existingCart[existingItemIndex].quantity += 1;
      } else {
        // Dodaj nowy produkt z ilością 1
        const cartItem: CartItem = {
          ...product,
          quantity: 1
        };
        existingCart.push(cartItem);
      }

      this.saveCartToStorage(cartKey, existingCart);
      console.log('🛒 Product added to cart:', product.id);
      console.log('📦 Cart contents:', existingCart.map(item => ({
        id: item.id,
        configuration: item.configuration,
        pricing: item.pricing,
        quantity: item.quantity
      })));
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
    }
  }

  /**
   * Pobiera produkty z koszyka
   */
  static getCartProducts(sessionId: string): Product[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const cartKey = `${this.CART_PREFIX}${sessionId}`;
    
    try {
      const cartItems = this.getCartFromStorage(cartKey);
      return cartItems.map(item => {
        const { quantity, ...product } = item;
        return product;
      });
    } catch (error) {
      console.error('❌ Error getting cart products:', error);
      return [];
    }
  }

  /**
   * Usuwa produkt z koszyka
   */
  static removeProductFromCart(productId: string): void {
    if (typeof window === 'undefined') {
      console.warn('CartService: Cannot access localStorage on server side');
      return;
    }

    const sessionId = this.getCurrentSessionId();
    const cartKey = `${this.CART_PREFIX}${sessionId}`;
    
    try {
      const existingCart = this.getCartFromStorage(cartKey);
      const filteredCart = existingCart.filter(item => item.id !== productId);
      
      this.saveCartToStorage(cartKey, filteredCart);
      console.log('🗑️ Product removed from cart:', productId);
    } catch (error) {
      console.error('❌ Error removing product from cart:', error);
    }
  }

  /**
   * Czyści cały koszyk
   */
  static clearCart(sessionId: string): void {
    if (typeof window === 'undefined') {
      console.warn('CartService: Cannot access localStorage on server side');
      return;
    }

    const cartKey = `${this.CART_PREFIX}${sessionId}`;
    
    try {
      localStorage.removeItem(cartKey);
      console.log('🧹 Cart cleared for session:', sessionId);
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  }

  /**
   * Oblicza całkowitą wartość koszyka
   */
  static getCartTotal(sessionId: string): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    const cartKey = `${this.CART_PREFIX}${sessionId}`;
    
    try {
      const cartItems = this.getCartFromStorage(cartKey);
      return cartItems.reduce((total, item) => {
        return total + (item.pricing.totalPrice * item.quantity);
      }, 0);
    } catch (error) {
      console.error('❌ Error calculating cart total:', error);
      return 0;
    }
  }

  /**
   * Aktualizuje ilość produktu w koszyku
   */
  static updateProductQuantity(productId: string, quantity: number): void {
    if (typeof window === 'undefined') {
      console.warn('CartService: Cannot access localStorage on server side');
      return;
    }

    const sessionId = this.getCurrentSessionId();
    const cartKey = `${this.CART_PREFIX}${sessionId}`;
    
    try {
      const existingCart = this.getCartFromStorage(cartKey);
      
      if (quantity <= 0) {
        // Usuń produkt jeśli ilość <= 0
        this.removeProductFromCart(productId);
        return;
      }

      const itemIndex = existingCart.findIndex(item => item.id === productId);
      if (itemIndex >= 0) {
        existingCart[itemIndex].quantity = quantity;
        this.saveCartToStorage(cartKey, existingCart);
        console.log('📊 Product quantity updated:', productId, quantity);
      }
    } catch (error) {
      console.error('❌ Error updating product quantity:', error);
    }
  }

  /**
   * Pobiera koszyk z localStorage
   */
  private static getCartFromStorage(cartKey: string): CartItem[] {
    try {
      const cartData = localStorage.getItem(cartKey);
      if (!cartData) {
        return [];
      }
      
      const parsed = JSON.parse(cartData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('❌ Error parsing cart data:', error);
      return [];
    }
  }

  /**
   * Zapisuje koszyk do localStorage
   */
  private static saveCartToStorage(cartKey: string, cartItems: CartItem[]): void {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error('❌ Error saving cart to storage:', error);
    }
  }

  /**
   * Pobiera aktualny session ID
   */
  private static getCurrentSessionId(): string {
    if (typeof window !== 'undefined') {
      // W przeglądarce - użyj HybridSessionManager
      const { HybridSessionManager } = require('../utils/hybrid-session-manager');
      return HybridSessionManager.getSessionId();
    }
    
    // Na serwerze - wygeneruj tymczasowy ID
    return `temp-session-${Date.now()}`;
  }
}
