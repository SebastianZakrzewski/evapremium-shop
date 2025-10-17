// Typy dla Przelewy24 API

export interface P24TransactionRequest {
  merchantId: number;
  posId: number;
  sessionId: string;
  amount: number; // w groszach
  currency: string;
  description: string;
  email: string;
  country: string;
  language: string;
  urlReturn: string;
  urlStatus: string;
  timeLimit?: number;
  channel?: number;
  waitForResult?: boolean;
  regulationAccept?: boolean;
  shipping?: number;
  transferLabel?: string;
  mobileLib?: boolean;
  sig: string; // podpis CRC
}

export interface P24TransactionResponse {
  data: {
    token: string;
  };
  responseCode: string;
}

export interface P24VerifyRequest {
  merchantId: number;
  posId: number;
  sessionId: string;
  amount: number;
  currency: string;
  orderId: number;
  sig: string;
}

export interface P24VerifyResponse {
  data: {
    status: string;
    error: string;
  };
  responseCode: string;
}

export interface P24CallbackPayload {
  merchantId: number;
  posId: number;
  sessionId: string;
  amount: number;
  currency: string;
  orderId: number;
  method: number;
  statement: string;
  sig: string;
}

export interface P24StatusResponse {
  data: {
    orderId: number;
    sessionId: string;
    status: string;
    amount: number;
    currency: string;
    date: string;
  };
  responseCode: string;
}

// Typy dla naszego API
export interface InitPaymentRequest {
  orderId: string;
}

export interface InitPaymentResponse {
  paymentUrl: string;
  sessionId: string;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  orderId?: string;
  transactionId?: number;
}

// Statusy płatności
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

// Walidacja callback payload
export const P24CallbackSchema = {
  merchantId: 'number',
  posId: 'number', 
  sessionId: 'string',
  amount: 'number',
  currency: 'string',
  orderId: 'number',
  method: 'number',
  statement: 'string',
  sig: 'string'
} as const;
