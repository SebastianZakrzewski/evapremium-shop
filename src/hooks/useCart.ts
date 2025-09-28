import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { CartService } from '../lib/services/CartService';
import { HybridSessionManager } from '../lib/utils/hybrid-session-manager';

export interface UseCartReturn {
  cartItems: CartItem[];
  cartProducts: Product[];
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => void;
}

export function useCart(sessionId?: string): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pobierz sessionId z HybridSessionManager jeśli nie podano
  const currentSessionId = sessionId || (typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : '');

  // Oblicz produkty bez quantity
  const cartProducts = cartItems.map(item => {
    const { quantity, ...product } = item;
    return product;
  });

  // Oblicz całkowitą wartość koszyka
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.pricing.totalPrice * item.quantity);
  }, 0);

  // Oblicz liczbę przedmiotów w koszyku
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Załaduj koszyk przy inicjalizacji
  useEffect(() => {
    if (currentSessionId) {
      refreshCart();
    }
  }, [currentSessionId]);

  // Odśwież koszyk
  const refreshCart = useCallback(() => {
    if (!currentSessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const products = CartService.getCartProducts(currentSessionId);
      
      // Konwertuj na CartItem z quantity = 1
      const cartItems: CartItem[] = products.map(product => ({
        ...product,
        quantity: 1
      }));

      setCartItems(cartItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Dodaj produkt do koszyka
  const addToCart = useCallback((product: Product) => {
    if (!currentSessionId) {
      setError('No session ID available');
      return;
    }

    try {
      setError(null);
      CartService.addProductToCart(product);
      
      // Odśwież koszyk
      refreshCart();
      
      console.log('✅ Product added to cart:', product.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product to cart');
    }
  }, [currentSessionId, refreshCart]);

  // Usuń produkt z koszyka
  const removeFromCart = useCallback((productId: string) => {
    if (!currentSessionId) {
      setError('No session ID available');
      return;
    }

    try {
      setError(null);
      CartService.removeProductFromCart(productId);
      
      // Odśwież koszyk
      refreshCart();
      
      console.log('✅ Product removed from cart:', productId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove product from cart');
    }
  }, [currentSessionId, refreshCart]);

  // Aktualizuj ilość produktu
  const updateProductQuantity = useCallback((productId: string, quantity: number) => {
    if (!currentSessionId) {
      setError('No session ID available');
      return;
    }

    try {
      setError(null);
      CartService.updateProductQuantity(productId, quantity);
      
      // Odśwież koszyk
      refreshCart();
      
      console.log('✅ Product quantity updated:', productId, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product quantity');
    }
  }, [currentSessionId, refreshCart]);

  // Wyczyść koszyk
  const clearCart = useCallback(() => {
    if (!currentSessionId) {
      setError('No session ID available');
      return;
    }

    try {
      setError(null);
      CartService.clearCart(currentSessionId);
      
      setCartItems([]);
      
      console.log('✅ Cart cleared');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
    }
  }, [currentSessionId]);

  return {
    cartItems,
    cartProducts,
    cartTotal,
    cartCount,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateProductQuantity,
    clearCart,
    refreshCart
  };
}
