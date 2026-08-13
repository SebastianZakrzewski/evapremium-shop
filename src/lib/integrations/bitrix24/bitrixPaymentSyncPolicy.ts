export type PaymentStatusForBitrix = 'pending' | 'paid' | 'failed' | 'refunded'

export type BitrixPaymentSyncDecision = {
  shouldSync: boolean
  createIfMissing: boolean
}

export type BitrixDealSyncAction = 'create' | 'update' | 'skip'

/**
 * Decides whether a payment-status change should sync to Bitrix,
 * and whether a missing deal may be created.
 *
 * - paid: create or update deal
 * - failed/refunded: update existing deal only (never create)
 * - pending: no Bitrix sync
 */
export const resolveBitrixPaymentSyncDecision = (
  paymentStatus: PaymentStatusForBitrix
): BitrixPaymentSyncDecision => {
  if (paymentStatus === 'paid') {
    return { shouldSync: true, createIfMissing: true }
  }

  if (paymentStatus === 'failed' || paymentStatus === 'refunded') {
    return { shouldSync: true, createIfMissing: false }
  }

  return { shouldSync: false, createIfMissing: false }
}

export const resolveBitrixDealSyncAction = (
  paymentStatus: PaymentStatusForBitrix,
  dealExists: boolean
): BitrixDealSyncAction => {
  const decision = resolveBitrixPaymentSyncDecision(paymentStatus)
  if (!decision.shouldSync) return 'skip'
  if (dealExists) return 'update'
  if (decision.createIfMissing) return 'create'
  return 'skip'
}
