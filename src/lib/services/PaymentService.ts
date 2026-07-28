import { randomUUID } from 'crypto'
import { getPaynowConfig } from '@/lib/config/paynow'
import { PaymentRepository } from '@/lib/repositories/PaymentRepository'
import { OrderService } from '@/lib/services/OrderService'
import { PaynowService } from '@/lib/services/PaynowService'
import {
  PaynowProviderStatus,
  PaynowWebhookNotification,
  PaymentInternalStatus,
  paynowWebhookNotificationSchema,
} from '@/lib/types/paynow'
import type { Order } from '@/lib/types/order-new'

export type InitiatePaymentResult = {
  success: boolean
  paymentUrl?: string
  paymentId?: string
  error?: string
}

export type WebhookHandleResult = {
  success: boolean
  duplicate?: boolean
  error?: string
}

const mapProviderStatusToInternal = (
  providerStatus: PaynowProviderStatus
): PaymentInternalStatus => {
  switch (providerStatus) {
    case 'NEW':
      return 'created'
    case 'PENDING':
      return 'pending'
    case 'CONFIRMED':
      return 'paid'
    case 'EXPIRED':
      return 'expired'
    case 'REJECTED':
    case 'ERROR':
      return 'failed'
    case 'ABANDONED':
      return 'failed'
    default:
      return 'pending'
  }
}

const mapProviderStatusToOrderPaymentStatus = (
  providerStatus: PaynowProviderStatus
): 'pending' | 'paid' | 'failed' | null => {
  switch (providerStatus) {
    case 'CONFIRMED':
      return 'paid'
    case 'REJECTED':
    case 'ERROR':
    case 'EXPIRED':
      return 'failed'
    case 'NEW':
    case 'PENDING':
    case 'ABANDONED':
      return 'pending'
    default:
      return null
  }
}

const buildWebhookDedupeKey = (notification: PaynowWebhookNotification): string => {
  return `paynow:${notification.paymentId}:${notification.status}:${notification.modifiedAt}`
}

export class PaymentService {
  private readonly paymentRepository: PaymentRepository
  private readonly orderService: OrderService
  private readonly paynowService: PaynowService

  constructor(
    paymentRepository = new PaymentRepository(),
    orderService = new OrderService(),
    paynowService = new PaynowService()
  ) {
    this.paymentRepository = paymentRepository
    this.orderService = orderService
    this.paynowService = paynowService
  }

  async initiatePayment(orderId: string): Promise<InitiatePaymentResult> {
    const config = getPaynowConfig()
    if (!config) {
      return { success: false, error: 'Paynow nie jest skonfigurowane' }
    }

    if (!this.paynowService.isPaynowAvailable()) {
      return { success: false, error: 'Paynow nie jest dostępne' }
    }

    const order = await this.orderService.getOrderById(orderId)
    if (!order) {
      return { success: false, error: 'Zamówienie nie zostało znalezione' }
    }

    if (order.paymentStatus === 'paid') {
      return { success: false, error: 'Zamówienie zostało już opłacone' }
    }

    const latestPayment = await this.paymentRepository.findLatestByOrderId(orderId)
    if (latestPayment?.status === 'pending' && latestPayment.redirectUrl) {
      return {
        success: true,
        paymentUrl: latestPayment.redirectUrl,
        paymentId: latestPayment.providerPaymentId ?? undefined,
      }
    }

    const idempotencyKey = randomUUID()
    const amountMinor = Math.round(Number(order.total) * 100)
    const customer = order.customer as Order['customer']
    const continueUrl = `${config.urlReturn}?orderId=${order.id}`

    let paymentRecord = await this.paymentRepository.create({
      orderId: order.id,
      provider: 'paynow',
      environment: config.environment,
      externalId: order.id,
      idempotencyKey,
      amountMinor,
      currency: 'PLN',
      buyerEmail: customer.email,
    })

    const paynowResult = await this.paynowService.createPayment(
      {
        amount: amountMinor,
        externalId: order.id,
        description: `Zamówienie ${order.orderNumber} - Dywaniki EVA`,
        continueUrl,
        currency: 'PLN',
        buyer: {
          email: customer.email,
          firstName: customer.name?.split(' ')[0],
          lastName: customer.name?.split(' ').slice(1).join(' ') || undefined,
        },
      },
      idempotencyKey
    )

    if (!paynowResult.success || !paynowResult.redirectUrl || !paynowResult.paymentId) {
      await this.paymentRepository.update(paymentRecord.id, {
        status: 'failed',
        failureReason: paynowResult.error ?? 'Błąd rejestracji płatności Paynow',
      })

      return {
        success: false,
        error: paynowResult.error ?? 'Błąd rejestracji płatności Paynow',
      }
    }

    paymentRecord = await this.paymentRepository.update(paymentRecord.id, {
      providerPaymentId: paynowResult.paymentId,
      redirectUrl: paynowResult.redirectUrl,
      status: 'pending',
      providerStatus: 'NEW',
    })

    return {
      success: true,
      paymentUrl: paymentRecord.redirectUrl ?? paynowResult.redirectUrl,
      paymentId: paymentRecord.providerPaymentId ?? paynowResult.paymentId,
    }
  }

  async handleWebhook(rawBody: string, signatureHeader: string | null): Promise<WebhookHandleResult> {
    if (!this.paynowService.verifyNotificationSignature(rawBody, signatureHeader)) {
      return { success: false, error: 'Nieprawidłowy podpis webhook' }
    }

    let notification: PaynowWebhookNotification
    try {
      const parsed = JSON.parse(rawBody)
      notification = paynowWebhookNotificationSchema.parse(parsed)
    } catch {
      return { success: false, error: 'Nieprawidłowy format webhook' }
    }

    const dedupeKey = buildWebhookDedupeKey(notification)
    const existingByDedupe = await this.paymentRepository.findByWebhookDedupeKey(dedupeKey)
    if (existingByDedupe) {
      return { success: true, duplicate: true }
    }

    const payment =
      (await this.paymentRepository.findByProviderPaymentId('paynow', notification.paymentId)) ??
      (await this.paymentRepository.findLatestByOrderId(notification.externalId))

    if (!payment) {
      return { success: false, error: 'Płatność nie została znaleziona' }
    }

    const order = await this.orderService.getOrderById(payment.orderId)
    if (!order) {
      return { success: false, error: 'Zamówienie nie zostało znalezione' }
    }

    if (order.paymentStatus === 'paid') {
      await this.paymentRepository.update(payment.id, {
        webhookDedupeKey: dedupeKey,
        lastWebhookAt: new Date().toISOString(),
      })
      return { success: true, duplicate: true }
    }

    if (payment.amountMinor !== Math.round(Number(order.total) * 100)) {
      await this.paymentRepository.update(payment.id, {
        status: 'failed',
        providerStatus: notification.status,
        failureReason: 'Niezgodność kwoty płatności',
        webhookDedupeKey: dedupeKey,
        lastWebhookAt: new Date().toISOString(),
      })

      await this.orderService.updatePaymentStatus(payment.orderId, 'failed', {
        error: 'Niezgodność kwoty płatności',
      })

      return { success: false, error: 'Niezgodność kwoty płatności' }
    }

    const internalStatus = mapProviderStatusToInternal(notification.status)
    const orderPaymentStatus = mapProviderStatusToOrderPaymentStatus(notification.status)

    await this.paymentRepository.update(payment.id, {
      status: internalStatus,
      providerStatus: notification.status,
      webhookDedupeKey: dedupeKey,
      lastWebhookAt: new Date().toISOString(),
      paidAt: notification.status === 'CONFIRMED' ? new Date().toISOString() : undefined,
      failureReason:
        internalStatus === 'failed' ? `Paynow status: ${notification.status}` : undefined,
    })

    if (orderPaymentStatus && orderPaymentStatus !== order.paymentStatus) {
      await this.orderService.updatePaymentStatus(payment.orderId, orderPaymentStatus, {
        error: internalStatus === 'failed' ? `Paynow status: ${notification.status}` : undefined,
      })
    }

    return { success: true }
  }

  async getLatestPaymentForOrder(orderId: string) {
    return this.paymentRepository.findLatestByOrderId(orderId)
  }
}
