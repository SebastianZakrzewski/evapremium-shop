/**
 * Typy TypeScript dla integracji z Przelewy24 API
 * 
 * Na podstawie dokumentacji P24 API 3.2 i testów połączenia
 */

// ===========================================
// REQUEST TYPES
// ===========================================

export interface P24RegisterRequest {
  merchantId: number
  posId: number
  sessionId: string
  amount: number
  currency: string
  description: string
  email: string
  country: string
  urlReturn: string
  urlStatus: string
  sign: string
}

export interface P24VerifyRequest {
  merchantId: number
  posId: number
  sessionId: string
  amount: number
  currency: string
  orderId: number
  sign: string
}

// ===========================================
// RESPONSE TYPES
// ===========================================

export interface P24RegisterResponse {
  data: {
    token: string
  }
  responseCode: number
}

export interface P24VerifyResponse {
  data: {
    status: string
    orderId: number
    sessionId: string
    amount: number
    currency: string
    methodId: number
    statement: string
  }
  responseCode: number
}

// ===========================================
// WEBHOOK TYPES
// ===========================================

export interface P24WebhookData {
  merchantId: number
  posId: number
  sessionId: string
  amount: number
  originAmount: number
  currency: string
  orderId: number
  methodId: number
  statement: string
  sign: string
}

// ===========================================
// CONFIGURATION TYPES
// ===========================================

export interface P24Config {
  merchantId: number
  posId: number
  crcKey: string
  apiKey: string
  reportKey: string
  environment: 'sandbox' | 'production'
  urlReturn: string
  urlStatus: string
  apiUrl: string
}

// ===========================================
// SERVICE TYPES
// ===========================================

export interface P24TransactionData {
  sessionId: string
  amount: number
  currency: string
  description: string
  email: string
  country: string
}

export interface P24PaymentResult {
  success: boolean
  token?: string
  paymentUrl?: string
  error?: string
}

export interface P24VerificationResult {
  success: boolean
  verified: boolean
  orderId?: number
  methodId?: number
  error?: string
}

// ===========================================
// ERROR TYPES
// ===========================================

export class P24Error extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'P24Error'
  }
}

export interface P24ApiError {
  error: string
  errorMessage: string
  responseCode: number
}
