// Hooks - Public API (re-exports for backward compatibility)
// Prefer importing from features directly: @/features/shopping-cart/hooks, etc.
export { useCart } from '@/features/shopping-cart/hooks/useCart';
export { useOrder } from '@/features/orders/hooks/useOrder';
export { useAccessories } from '@/features/accessories/hooks/useAccessories';
export { useAbandonedCartHeartbeat } from '@/features/shopping-cart/hooks/useAbandonedCartHeartbeat';
export { useMat, useAvailableBodyTypes } from '@/features/mats/hooks/useMat';

