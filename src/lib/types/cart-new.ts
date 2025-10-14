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
  configuration?: any; // JSONB for mat configuration
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
  configuration?: any;
}

export interface UpdateCartItemDTO {
  itemId: string;
  quantity: number;
}
