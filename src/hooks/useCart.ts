import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../lib/types/product';
import { CartItem } from '../lib/types/cart';
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
  const currentSessionId = useMemo(() => {
    return sessionId || (typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : '');
  }, [sessionId]);

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

  // Odśwież koszyk
  const refreshCart = useCallback(() => {
    // Użyj świeżego sessionId z HybridSessionManager
    const freshSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : currentSessionId;
    console.log('🔄 useCart: refreshCart called, currentSessionId:', currentSessionId);
    console.log('🔄 useCart: freshSessionId:', freshSessionId);
    
    if (!freshSessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 useCart: calling CartService.getCartItems with sessionId:', freshSessionId);
      const cartItems = CartService.getCartItems(freshSessionId);
      console.log('🔄 useCart: cartItems from CartService:', cartItems);

      console.log('🔄 useCart: setting cartItems state');
      setCartItems(cartItems);
    } catch (err) {
      console.error('❌ useCart: error loading cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Załaduj koszyk przy inicjalizacji
  useEffect(() => {
    console.log('🔄 useCart: useEffect triggered, currentSessionId:', currentSessionId);
    if (currentSessionId) {
      refreshCart();
    }
  }, [currentSessionId]);

  // Nasłuchuj na zmiany w localStorage (między kartami)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const freshSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : currentSessionId;
      if (e.key === `cart-${freshSessionId}`) {
        console.log('🔄 useCart: localStorage changed (cross-tab), refreshing cart...');
        refreshCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentSessionId, refreshCart]);

  // Nasłuchuj na custom event dla tej samej karty
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 useCart: custom cart update event received, refreshing cart...');
      refreshCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [refreshCart]);

  // Dodaj produkt do koszyka
  const addToCart = useCallback(async (product: Product) => {
    console.log('🛒 useCart: addToCart called with product:', product.id);
    console.log('🛒 useCart: currentSessionId:', currentSessionId);
    
    // Walidacja sessionId
    const freshSessionId = HybridSessionManager.getSessionId();
    console.log('🛒 useCart: freshSessionId from HybridSessionManager:', freshSessionId);
    
    if (freshSessionId !== currentSessionId) {
      console.warn('⚠️ SessionId mismatch! Refreshing sessionId...');
      console.log('🛒 useCart: old sessionId:', currentSessionId);
      console.log('🛒 useCart: new sessionId:', freshSessionId);
    }
    
    if (!freshSessionId) {
      setError('No session ID available');
      return;
    }

    try {
      setError(null);
      console.log('🛒 useCart: calling CartService.addProductToCart');
      CartService.addProductToCart(product);
      
      console.log('🛒 useCart: product added, custom event will trigger refreshCart');
      // refreshCart zostanie wywołane przez custom event 'cartUpdated'
      
      // Backup: wywołaj refreshCart po krótkim opóźnieniu na wypadek gdyby custom event nie zadziałał
      setTimeout(() => {
        console.log('🔄 useCart: backup refreshCart call');
        refreshCart();
      }, 50);
      
      console.log('✅ Product added to cart:', product.id);
    } catch (err) {
      console.error('❌ useCart: error in addToCart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product to cart');
    }
  }, [currentSessionId, refreshCart]);

  // Usuń produkt z koszyka
  const removeFromCart = useCallback((productId: string) => {
    const freshSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : currentSessionId;
    
    if (!freshSessionId) {
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
    const freshSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : currentSessionId;
    
    if (!freshSessionId) {
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
    const freshSessionId = typeof window !== 'undefined' ? HybridSessionManager.getSessionId() : currentSessionId;
    
    if (!freshSessionId) {
      setError('No session ID available');
      return;
    }

    try {
      setError(null);
      CartService.clearCart(freshSessionId);
      
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
