export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  customer: CustomerData;
  shippingAddress: AddressData;
  billingAddress?: AddressData;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  // Przelewy24 fields
  p24SessionId?: string;
  p24OrderId?: number;
  p24TransactionId?: number;
  notes?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
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
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

export interface AddressData {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderDTO {
  customer: CustomerData;
  shippingAddress: AddressData;
  billingAddress?: AddressData;
  paymentMethod: string;
  notes?: string;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productType: 'accessory' | 'mat';
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  configuration?: any;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';
