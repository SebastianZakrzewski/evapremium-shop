import { supabaseAdmin } from '@/lib/database/supabase'
import {
  isAmountWithinTolerance,
  resolveAbandonedExportSkipReason,
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
} from '@/lib/services/abandonedCartExportGuardPolicy'

/**
 * Finds a recent pending/paid order for the same customer with similar amount.
 * Used to skip abandoned-cart Bitrix export while checkout/payment is in progress.
 */
export const findRecentBlockingOrder = async (
  input: FindRecentBlockingOrderInput
): Promise<FindRecentBlockingOrderResult> => {
  const email = input.email?.trim()
  if (!email) return null

  const windowMs = input.windowMs ?? 30 * 60 * 1000
  const cartTotal = input.totalAmount ?? 0

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, payment_status, total, created_at')
    .eq('customer->>email', email)
    .in('payment_status', ['pending', 'paid'])
    .gte('created_at', new Date(Date.now() - windowMs).toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw error
  }

  if (!data || data.length === 0) return null

  for (const row of data as BlockingOrderRow[]) {
    const orderTotal = Number(row.total)
    if (!isAmountWithinTolerance(orderTotal, cartTotal)) continue

    return {
      order: row,
      reason: resolveAbandonedExportSkipReason(String(row.payment_status)),
    }
  }

  return null
}
