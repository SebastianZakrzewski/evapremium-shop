import { supabaseAdmin } from '@/lib/database/supabase'
import type { PaymentInternalStatus, PaymentRecord } from '@/lib/types/paynow'

const SCHEMA = 'evapremium_shop'
const TABLE = 'payments'

type PaymentDbRow = {
  id: string
  order_id: string
  provider: string
  environment: string
  external_id: string
  provider_payment_id: string | null
  idempotency_key: string
  amount_minor: number
  currency: string
  status: string
  provider_status: string | null
  redirect_url: string | null
  buyer_email: string | null
  failure_reason: string | null
  webhook_dedupe_key: string | null
  last_webhook_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

const mapPaymentFromDb = (row: PaymentDbRow): PaymentRecord => ({
  id: row.id,
  orderId: row.order_id,
  provider: row.provider,
  environment: row.environment as PaymentRecord['environment'],
  externalId: row.external_id,
  providerPaymentId: row.provider_payment_id,
  idempotencyKey: row.idempotency_key,
  amountMinor: row.amount_minor,
  currency: row.currency,
  status: row.status as PaymentInternalStatus,
  providerStatus: row.provider_status,
  redirectUrl: row.redirect_url,
  buyerEmail: row.buyer_email,
  failureReason: row.failure_reason,
  webhookDedupeKey: row.webhook_dedupe_key,
  lastWebhookAt: row.last_webhook_at,
  paidAt: row.paid_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export type CreatePaymentInput = {
  orderId: string
  provider: string
  environment: 'sandbox' | 'production'
  externalId: string
  idempotencyKey: string
  amountMinor: number
  currency: string
  buyerEmail: string
}

export type UpdatePaymentInput = Partial<{
  providerPaymentId: string
  status: PaymentInternalStatus
  providerStatus: string
  redirectUrl: string
  failureReason: string
  webhookDedupeKey: string
  lastWebhookAt: string
  paidAt: string
}>

export class PaymentRepository {
  async create(input: CreatePaymentInput): Promise<PaymentRecord> {
    const { data, error } = await supabaseAdmin
      .schema(SCHEMA)
      .from(TABLE)
      .insert({
        order_id: input.orderId,
        provider: input.provider,
        environment: input.environment,
        external_id: input.externalId,
        idempotency_key: input.idempotencyKey,
        amount_minor: input.amountMinor,
        currency: input.currency,
        buyer_email: input.buyerEmail,
        status: 'created',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating payment: ${error.message}`)
    }

    return mapPaymentFromDb(data as PaymentDbRow)
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabaseAdmin
      .schema(SCHEMA)
      .from(TABLE)
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (error) {
      throw new Error(`Error finding payment by idempotency key: ${error.message}`)
    }

    return data ? mapPaymentFromDb(data as PaymentDbRow) : null
  }

  async findByProviderPaymentId(
    provider: string,
    providerPaymentId: string
  ): Promise<PaymentRecord | null> {
    const { data, error } = await supabaseAdmin
      .schema(SCHEMA)
      .from(TABLE)
      .select('*')
      .eq('provider', provider)
      .eq('provider_payment_id', providerPaymentId)
      .maybeSingle()

    if (error) {
      throw new Error(`Error finding payment by provider payment id: ${error.message}`)
    }

    return data ? mapPaymentFromDb(data as PaymentDbRow) : null
  }

  async findLatestByOrderId(orderId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabaseAdmin
      .schema(SCHEMA)
      .from(TABLE)
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Error finding latest payment for order: ${error.message}`)
    }

    return data ? mapPaymentFromDb(data as PaymentDbRow) : null
  }

  async findByWebhookDedupeKey(dedupeKey: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabaseAdmin
      .schema(SCHEMA)
      .from(TABLE)
      .select('*')
      .eq('webhook_dedupe_key', dedupeKey)
      .maybeSingle()

    if (error) {
      throw new Error(`Error finding payment by webhook dedupe key: ${error.message}`)
    }

    return data ? mapPaymentFromDb(data as PaymentDbRow) : null
  }

  async update(id: string, input: UpdatePaymentInput): Promise<PaymentRecord> {
    const payload: Record<string, unknown> = {}

    if (input.providerPaymentId !== undefined) payload.provider_payment_id = input.providerPaymentId
    if (input.status !== undefined) payload.status = input.status
    if (input.providerStatus !== undefined) payload.provider_status = input.providerStatus
    if (input.redirectUrl !== undefined) payload.redirect_url = input.redirectUrl
    if (input.failureReason !== undefined) payload.failure_reason = input.failureReason
    if (input.webhookDedupeKey !== undefined) payload.webhook_dedupe_key = input.webhookDedupeKey
    if (input.lastWebhookAt !== undefined) payload.last_webhook_at = input.lastWebhookAt
    if (input.paidAt !== undefined) payload.paid_at = input.paidAt

    const { data, error } = await supabaseAdmin
      .schema(SCHEMA)
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating payment: ${error.message}`)
    }

    return mapPaymentFromDb(data as PaymentDbRow)
  }
}
