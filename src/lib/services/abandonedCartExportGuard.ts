import { supabaseAdmin } from '@/lib/database/supabase'
import {
  isAmountWithinTolerance,
  resolveAbandonedExportSkipReason,
  shouldBlockAbandonedCartBitrixExport,
  shouldBlockAbandonedCartHeartbeat,
  type AbandonedExportSkipReason,
} from '@/lib/services/abandonedCartExportGuardPolicy'

export type BlockingOrderRow = {
  id: string
  order_number: string
  payment_status: 'pending' | 'paid' | string
  total: number | string
  created_at: string
}

export type FindRecentBlockingOrderInput = {
  email: string
  totalAmount?: number
  windowMs?: number
}

export type FindRecentBlockingOrderResult = {
  order: BlockingOrderRow
  reason: AbandonedExportSkipReason
} | null

export {
  isAmountWithinTolerance,
  resolveAbandonedExportSkipReason,
  shouldBlockAbandonedCartBitrixExport,
  shouldBlockAbandonedCartHeartbeat,
} from '@/lib/services/abandonedCartExportGuardPolicy'

type FindRecentOrderOptions = {
  paymentStatuses: Array<'pending' | 'paid'>
  shouldBlock: (paymentStatus: string) => boolean
}

const findRecentMatchingOrder = async (
  input: FindRecentBlockingOrderInput,
  options: FindRecentOrderOptions
): Promise<FindRecentBlockingOrderResult> => {
  const email = input.email?.trim()
  if (!email) return null

  const windowMs = input.windowMs ?? 30 * 60 * 1000
  const cartTotal = input.totalAmount ?? 0

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, payment_status, total, created_at')
    .eq('customer->>email', email)
    .in('payment_status', options.paymentStatuses)
    .gte('created_at', new Date(Date.now() - windowMs).toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw error
  }

  if (!data || data.length === 0) return null

  for (const row of data as BlockingOrderRow[]) {
    const paymentStatus = String(row.payment_status)
    if (!options.shouldBlock(paymentStatus)) continue

    const orderTotal = Number(row.total)
    if (!isAmountWithinTolerance(orderTotal, cartTotal)) continue

    return {
      order: row,
      reason: resolveAbandonedExportSkipReason(paymentStatus),
    }
  }

  return null
}

/**
 * Blocks heartbeat only when a matching order is already paid.
 * Pending orders must not prevent DB snapshots during checkout.
 */
export const findRecentBlockingOrderForHeartbeat = async (
  input: FindRecentBlockingOrderInput
): Promise<FindRecentBlockingOrderResult> => {
  return findRecentMatchingOrder(input, {
    paymentStatuses: ['paid'],
    shouldBlock: shouldBlockAbandonedCartHeartbeat,
  })
}

/**
 * Blocks Bitrix export while payment is pending or already paid.
 */
export const findRecentBlockingOrderForBitrixExport = async (
  input: FindRecentBlockingOrderInput
): Promise<FindRecentBlockingOrderResult> => {
  return findRecentMatchingOrder(input, {
    paymentStatuses: ['pending', 'paid'],
    shouldBlock: shouldBlockAbandonedCartBitrixExport,
  })
}

/**
 * @deprecated Use findRecentBlockingOrderForHeartbeat or findRecentBlockingOrderForBitrixExport.
 */
export const findRecentBlockingOrder = findRecentBlockingOrderForBitrixExport
