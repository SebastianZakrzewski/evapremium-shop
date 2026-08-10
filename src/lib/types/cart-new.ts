import type { MatConfiguration } from '@/features/vehicle-catalog/model/matConfiguration';

export type AccessoryCartConfiguration = {
  color?: string
  mounting?: "professional" | "self"
}
export type CartItemConfiguration = MatConfiguration | AccessoryCartConfiguration

export const isMatCartConfiguration = (
  configuration: CartItemConfiguration | undefined,
): configuration is MatConfiguration =>
  Boolean(configuration && "carDetails" in configuration && "setType" in configuration)

export interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productType: 'accessory' | 'mat';
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  configuration?: CartItemConfiguration;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface AddToCartDTO {
  productType: 'accessory' | 'mat';
  productId: string;
  quantity: number;
  configuration?: CartItemConfiguration;
  productName?: string;
  productSku?: string;
  productImage?: string;
  unitPrice?: number;
}

export interface UpdateCartItemDTO {
  itemId: string;
  quantity: number;
}
