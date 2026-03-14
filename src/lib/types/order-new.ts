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
  notes?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  // Przelewy24 fields
  p24SessionId?: string;
  p24Token?: string;
  p24OrderId?: string; // Zmienione z number na string - P24 zwraca bardzo długie ID
  p24MethodId?: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productType: 'accessory' | 'mat';
  productId: string | null; // UUID dla akcesoriów, null dla matów (produkty konfigurowane)
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
  /** NIP (Polish tax ID) for invoice - optional */
  taxId?: string;
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
  discountCode?: string;
  discountAmount?: number;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productType: 'accessory' | 'mat';
  productId?: string | null; // UUID dla akcesoriów (wymagany), null/undefined dla matów (produkty konfigurowane)
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
