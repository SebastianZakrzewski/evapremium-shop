// Typy dla integracji z API Bitrix24

export interface BitrixResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

export interface BitrixOrder {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  carDetails: {
    brand: string;
    model: string;
    year: string;
    body: string;
    trans: string;
  };
  productDetails: {
    type: string;
    color: string;
    texture: string;
    variant: string;
    edgeColor: string;
    image: string;
  };
  shipping: {
    method: string;
    methodName: string;
    cost: number;
    estimatedDelivery: string;
  };
  payment: {
    method: string;
    methodName: string;
  };
  company: {
    name: string;
    nip: string;
    isInvoice: boolean;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    totalAmount: number;
  };
  additional: {
    termsAccepted: boolean;
    newsletter: boolean;
    discountCode: string;
    discountApplied: boolean;
    notes: string;
  };
  metadata: {
    orderId: string;
    orderDate: Date;
    source: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
  contactId?: string;
} 