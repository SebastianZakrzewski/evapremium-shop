import { useState, useEffect, useCallback, useRef } from 'react';
import { CartV2 as Cart, CartItemV2 as CartItem, AddToCartDTO } from '@/lib/types';
import { CartService } from '@/lib/services/CartService';
import { debugLog } from '@/lib/config/features';

const CART_STORAGE_KEY = 'cart-v2';

/**
 * Empty cart initial state
 */
const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
};

export interface UseCartReturn {
  cart: Cart;
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (item: AddToCartDTO) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => void;
}

/**
 * Nowy hook do zarządzania koszykiem (V2)
 * 
 * Używa nowego backendu z CartService, PricingService i polimorficznymi produktami.
 * 
 * @example
 * ```tsx
 * const { items, total, addToCart, removeFromCart } = useCart();
 * 
 * // Dodaj dywaniki
 * await addToCart({
 *   productType: 'mat',
 *   productId: mat.id,
 *   quantity: 1,
 *   configuration: { ... }
 * });
 * 
 * // Dodaj akcesorium
 * await addToCart({
 *   productType: 'accessory',
 *   productId: accessory.id,
 *   quantity: 1
 * });
 * ```
 */
export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Użyj useRef aby uniknąć tworzenia nowej instancji w każdym renderze
  const cartServiceRef = useRef<CartService | null>(null);
  const cartService = cartServiceRef.current || (cartServiceRef.current = new CartService());
  
  // Ref do śledzenia czy to pierwszy mount
  const isFirstMountRef = useRef(true);

  /**
   * Refresh cart (useful after external changes)
   */
  const refreshCart = useCallback(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
        debugLog('useCart: Cart refreshed', parsed);
      } catch (err) {
        console.error('useCart: Error refreshing cart:', err);
      }
    }
  }, []);

  /**
   * Load cart from localStorage on mount
   */
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        console.log('🛒 useCart: Loading cart from localStorage, key:', CART_STORAGE_KEY);
        console.log('🛒 useCart: Saved cart data:', savedCart);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          console.log('🛒 useCart: Parsed cart:', parsed);
          debugLog('useCart: Loaded cart from localStorage', parsed);
          setCart(parsed);
        } else {
          console.log('🛒 useCart: No cart in localStorage, using empty cart');
          debugLog('useCart: No cart in localStorage, using empty cart');
        }
      } catch (err) {
        console.error('useCart: Error loading cart from localStorage:', err);
        setError('Błąd ładowania koszyka');
      }
    };

    loadCart();
  }, []);

  /**
   * Save cart to localStorage whenever it changes
   */
  useEffect(() => {
    // Guard: nie zapisuj pustego koszyka TYLKO przy pierwszym mount
    if (isFirstMountRef.current && cart.items.length === 0 && cart.subtotal === 0 && cart.total === 0) {
      console.log('🛒 useCart: Skipping save of empty cart on first mount');
      isFirstMountRef.current = false; // Oznacz że pierwszy mount się skończył
      return;
    }

    // Po pierwszym mount, zapisuj wszystkie zmiany
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      debugLog('useCart: Saved cart to localStorage', cart);
    } catch (err) {
      console.error('useCart: Error saving cart to localStorage:', err);
    }
  }, [cart]);

  /**
   * Listen for cart updates from other components
   * Monitoruj localStorage co 500ms aby wychwycić zmiany
   */
  // Event-based synchronization instead of polling
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      setCart(event.detail);
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
    };
  }, []);

  /**
   * Add item to cart
   */
  const addToCart = useCallback(async (item: AddToCartDTO) => {
    setIsLoading(true);
    setError(null);
    debugLog('useCart: Adding item to cart', item);

    try {
      const updatedCart = await cartService.addToCart(cart, item);
      setCart(updatedCart);
      
      // Dispatch event only after successful addToCart and setCart
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
      }, 0);
      
      debugLog('useCart: Item added successfully', updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się dodać produktu do koszyka';
      console.error('useCart: Error adding item:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, cartService]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    debugLog('useCart: Removing item from cart', itemId);

    try {
      const updatedCart = await cartService.removeFromCart(cart, itemId);
      setCart(updatedCart);
      
      // Dispatch event to notify other components
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
      }, 0);
      
      debugLog('useCart: Item removed successfully', updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć produktu';
      console.error('useCart: Error removing item:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, cartService]);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    debugLog('useCart: Updating quantity', { itemId, quantity });

    try {
      const updatedCart = await cartService.updateQuantity(cart, itemId, quantity);
      setCart(updatedCart);
      debugLog('useCart: Quantity updated successfully', updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować ilości';
      console.error('useCart: Error updating quantity:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart, cartService]);

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    debugLog('useCart: Clearing cart');
    setCart(emptyCart);
    localStorage.removeItem(CART_STORAGE_KEY);
    
    // Dispatch event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: emptyCart }));
    }, 0);
  }, []);

  return {
    cart,
    items: cart.items,
    total: cart.total,
    itemCount: cart.itemCount,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  };
}

