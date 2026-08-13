import { useState, useEffect, useCallback, useRef } from 'react';
import { CartV2 as Cart, CartItemV2 as CartItem, AddToCartDTO } from '@/lib/types';
import { CartService } from '@/lib/services/CartService';
import { debugLog } from '@/lib/config/features';
import { useTracking, createAddToCartData } from '@/lib/tracking';

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

/**
 * Validates and normalizes cart data to ensure all required properties exist
 */
function validateCartData(cartData: any): Cart {
  if (!cartData || typeof cartData !== 'object') {
    return emptyCart;
  }

  return {
    items: Array.isArray(cartData.items) ? cartData.items : [],
    subtotal: typeof cartData.subtotal === 'number' && !isNaN(cartData.subtotal) ? cartData.subtotal : 0,
    shippingCost: typeof cartData.shippingCost === 'number' && !isNaN(cartData.shippingCost) ? cartData.shippingCost : 0,
    tax: typeof cartData.tax === 'number' && !isNaN(cartData.tax) ? cartData.tax : 0,
    discount: typeof cartData.discount === 'number' && !isNaN(cartData.discount) ? cartData.discount : 0,
    total: typeof cartData.total === 'number' && !isNaN(cartData.total) ? cartData.total : 0,
    itemCount: typeof cartData.itemCount === 'number' && !isNaN(cartData.itemCount) ? cartData.itemCount : 0,
  };
}

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
 * Hook do zarządzania koszykiem
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
  const { trackAddToCart, createAddToCartData: createAddToCart } = useTracking();

  // Użyj useRef aby uniknąć tworzenia nowej instancji w każdym renderze
  const cartServiceRef = useRef<CartService | null>(null);
  const cartService = cartServiceRef.current || (cartServiceRef.current = new CartService());
  
  // Ref do śledzenia czy to pierwszy mount
  const isFirstMountRef = useRef(true);
  const cartRef = useRef(cart);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  /**
   * Refresh cart (useful after external changes)
   */
  const refreshCart = useCallback(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const validatedCart = validateCartData(parsed);
        setCart(validatedCart);
        debugLog('useCart: Cart refreshed', validatedCart);
      } catch (err) {
        console.error('useCart: Error refreshing cart:', err);
        setCart(emptyCart);
      }
    } else {
      setCart(emptyCart);
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
          const validatedCart = validateCartData(parsed);
          console.log('🛒 useCart: Validated cart:', validatedCart);
          debugLog('useCart: Loaded cart from localStorage', validatedCart);
          setCart(validatedCart);
        } else {
          console.log('🛒 useCart: No cart in localStorage, using empty cart');
          debugLog('useCart: No cart in localStorage, using empty cart');
          setCart(emptyCart);
        }
      } catch (err) {
        console.error('useCart: Error loading cart from localStorage:', err);
        setError('Błąd ładowania koszyka');
        setCart(emptyCart);
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
      console.log('💾 useCart: Saved cart to localStorage', { key: CART_STORAGE_KEY, cart });
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
      const validatedCart = validateCartData(event.detail);
      setCart(validatedCart);
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
      const updatedCart = await cartService.addToCart(cartRef.current, item);
      setCart(updatedCart);
      cartRef.current = updatedCart;
      
      // Dispatch event only after successful addToCart and setCart
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
      }, 0);
      
      // Track AddToCart event
      try {
        // Znajdź dodany item w zaktualizowanym koszyku
        const addedItem = updatedCart.items.find(
          cartItem => cartItem.productId === item.productId &&
          JSON.stringify(cartItem.configuration) === JSON.stringify(item.configuration)
        );

        if (addedItem) {
          const addToCartData = createAddToCart(addedItem, updatedCart.total);
          trackAddToCart(addToCartData);
        }
      } catch (trackingError) {
        console.error('[Tracking] Error tracking AddToCart:', trackingError);
      }
      
      debugLog('useCart: Item added successfully', updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się dodać produktu do koszyka';
      console.error('useCart: Error adding item:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cartService, createAddToCart, trackAddToCart]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    console.log('🗑️ useCart: Removing item from cart', itemId);
    console.log('🗑️ useCart: Current cart before removal:', cartRef.current);

    try {
      const updatedCart = await cartService.removeFromCart(cartRef.current, itemId);
      console.log('🗑️ useCart: Updated cart after removal:', updatedCart);
      setCart(updatedCart);
      cartRef.current = updatedCart;
      
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
  }, [cartService]);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);
    debugLog('useCart: Updating quantity', { itemId, quantity });

    try {
      const updatedCart = await cartService.updateQuantity(cartRef.current, itemId, quantity);
      setCart(updatedCart);
      cartRef.current = updatedCart;
      debugLog('useCart: Quantity updated successfully', updatedCart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować ilości';
      console.error('useCart: Error updating quantity:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cartService]);

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
