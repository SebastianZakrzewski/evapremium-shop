import { Product } from './product';

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartService {
  addProductToCart(product: Product): void;
  getCartProducts(sessionId: string): Product[];
  removeProductFromCart(productId: string): void;
  clearCart(sessionId: string): void;
  getCartTotal(sessionId: string): number;
  updateProductQuantity(productId: string, quantity: number): void;
}
