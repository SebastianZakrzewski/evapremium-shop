export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = 'card' | 'transfer' | 'cash';

export interface CreateOrderRequest {
  userId: string;
  products: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
} 