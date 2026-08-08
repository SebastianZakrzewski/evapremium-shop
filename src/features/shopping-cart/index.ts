// Shopping Cart feature - Public API
// Re-eksportuje wszystkie komponenty, hooki, serwisy i typy z feature shopping-cart

// Components
export { CartModal, CartModalWrapper, CartItem } from './components';

// Hooks
export { useCart } from './hooks/useCart';

// Utils
export { openCartModal } from './utils/openCartModal';

// Services (tymczasowo z oryginalnych lokalizacji)
export { CartService } from '../../lib/services/CartService';

// Types (tymczasowo z oryginalnych lokalizacji)
export type { CartItemType, Cart } from '../../entities/order';

// Components (będą dodane po migracji)
// export { CartItem } from './components/CartItem';
