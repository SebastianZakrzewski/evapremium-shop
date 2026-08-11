import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'
import type { AbandonedCartRecord } from '@/lib/types/abandonedCart'
import { dealService } from '@/lib/integrations/bitrix24/services/DealService'

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey)

export type ExportAbandonedCartResult = {
  exportedCount: number
  exportedDealIds: string[]
  failedCartIds: string[]
}

const exportSingleCart = async (cart: AbandonedCartRecord): Promise<string | null> => {
  const { data: lockedCart, error: lockError } = await supabase
    .from('abandoned_carts')
    .update({ status: 'processing' })
    .eq('id', cart.id)
    .eq('status', 'pending')
    .is('bitrix_deal_id', null)
    .select()
    .single()

  if (lockError) {
    console.error('[AbandonedCartExport] Error locking cart', { cartId: cart.id, lockError })
    return null
  }

  if (!lockedCart) {
    return null
  }

  const created = await dealService.createDealForAbandonedCart(cart)

  if (!created.success || !created.id) {
    console.error('[AbandonedCartExport] Failed to create deal', {
      cartId: cart.id,
      error: created.error,
    })
    await supabase.from('abandoned_carts').update({ status: 'pending' }).eq('id', cart.id)
    return null
  }

  const { data: updatedCart, error: updateError } = await supabase
    .from('abandoned_carts')
    .update({ bitrix_deal_id: created.id, status: 'exported' })
    .eq('id', cart.id)
    .eq('status', 'processing')
    .select()
    .single()

  if (updateError || !updatedCart) {
    console.error('[AbandonedCartExport] Failed to update cart after export', {
      cartId: cart.id,
      dealId: created.id,
      updateError,
    })
    await supabase.from('abandoned_carts').update({ status: 'pending' }).eq('id', cart.id)
    return null
  }

  return created.id
}

/**
 * Exports open abandoned carts for an email to Bitrix24.
 * Used when payment does not complete (failed/expired).
 */
export const exportPendingAbandonedCartsForEmail = async (
  email: string
): Promise<ExportAbandonedCartResult> => {
  const result: ExportAbandonedCartResult = {
    exportedCount: 0,
    exportedDealIds: [],
    failedCartIds: [],
  }

  const normalizedEmail = email.trim()
  if (!normalizedEmail) {
    return result
  }

  const { data: carts, error } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('contact->>email', normalizedEmail)
    .in('status', ['pending', 'processing'])
    .is('bitrix_deal_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[AbandonedCartExport] Failed to load carts', { email: normalizedEmail, error })
    return result
  }

  for (const cart of (carts || []) as AbandonedCartRecord[]) {
    const dealId = await exportSingleCart(cart)
    if (dealId) {
      result.exportedCount += 1
      result.exportedDealIds.push(dealId)
      continue
    }

    result.failedCartIds.push(cart.id)
  }

  if (result.exportedCount > 0) {
    console.log('[AbandonedCartExport] Exported carts after incomplete payment', {
      email: normalizedEmail,
      ...result,
    })
  }

  return result
}
