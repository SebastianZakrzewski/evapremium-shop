import { Product } from './product';

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ShippingData {
  method: string;
  methodName: string;
  cost: number;
  estimatedDelivery: string;
}

export interface PaymentData {
  method: string;
  methodName: string;
}

export interface CompanyData {
  name: string;
  nip: string;
  isInvoice: boolean;
}

export interface OrderPricing {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  sessionId: string;
  products: Product[];
  customer: CustomerData;
  shipping: ShippingData;
  payment: PaymentData;
  company?: CompanyData;
  pricing: OrderPricing;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
