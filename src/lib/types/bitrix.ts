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
    address?: string;
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
  totalAmount: number;
  contactId?: string;
} 