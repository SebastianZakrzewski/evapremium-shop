import { z } from 'zod'

export type PaynowEnvironment = 'sandbox' | 'production'

export type PaymentInternalStatus =
  | 'created'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'

export type PaynowProviderStatus =
  | 'NEW'
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'ERROR'
  | 'EXPIRED'
  | 'ABANDONED'

export interface PaynowConfig {
  apiKey: string
  signatureKey: string
  environment: PaynowEnvironment
  urlReturn: string
  urlNotification: string
  apiUrl: string
}

export interface PaynowBuyer {
  email: string
  firstName?: string
  lastName?: string
}

export interface PaynowCreatePaymentRequest {
  amount: number
  externalId: string
  description: string
  continueUrl?: string
  currency?: string
  buyer: PaynowBuyer
}

export interface PaynowCreatePaymentResponse {
  redirectUrl: string
  paymentId: string
  status: PaynowProviderStatus
}

export interface PaynowWebhookNotification {
  paymentId: string
  externalId: string
  status: PaynowProviderStatus
  modifiedAt: string
}

export interface PaynowPaymentResult {
  success: boolean
  redirectUrl?: string
  paymentId?: string
  error?: string
}

export interface PaymentRecord {
  id: string
  orderId: string
  provider: string
  environment: PaynowEnvironment
  externalId: string
  providerPaymentId: string | null
  idempotencyKey: string
  amountMinor: number
  currency: string
  status: PaymentInternalStatus
  providerStatus: string | null
  redirectUrl: string | null
  buyerEmail: string | null
  failureReason: string | null
  webhookDedupeKey: string | null
  lastWebhookAt: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export const paynowWebhookNotificationSchema = z.object({
  paymentId: z.string().min(1),
  externalId: z.string().min(1),
  status: z.enum([
    'NEW',
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'ERROR',
    'EXPIRED',
    'ABANDONED',
  ]),
  modifiedAt: z.string().min(1),
})

export const paynowCreatePaymentResponseSchema = z.object({
  redirectUrl: z.string().url(),
  paymentId: z.string().min(1),
  status: z.enum(['NEW', 'PENDING', 'ERROR']),
})

export class PaynowError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'PaynowError'
  }
}
