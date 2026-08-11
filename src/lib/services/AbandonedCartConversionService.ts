import 'server-only'
import { supabaseAdmin } from '@/lib/database/supabase'
import { dealService } from '@/lib/integrations/bitrix24/services/DealService'
import {
  resolveAbandonedDealLoseStageId,
  type ConvertAbandonedCartsOnPaidInput,
  type ConvertAbandonedCartsOnPaidResult,
} from '@/lib/services/abandonedCartConversionPolicy'

type AbandonedCartRow = {
  id: string
  status: string
  bitrix_deal_id: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Marks open abandoned carts as converted after a successful payment
 * and closes related Bitrix abandoned deals on LOSE (category-aware).
 *
 * Never throws — payment flow must not fail because of CRM cleanup.
 */
export const convertAbandonedCartsOnPaid = async (
  input: ConvertAbandonedCartsOnPaidInput
): Promise<ConvertAbandonedCartsOnPaidResult> => {
  const result: ConvertAbandonedCartsOnPaidResult = {
    convertedCount: 0,
    closedDealIds: [],
    failedDealIds: [],
  }

  const email = input.email?.trim()
  if (!email) {
    return result
  }

  try {
    const { data: carts, error: selectError } = await supabaseAdmin
      .from('abandoned_carts')
      .select('id, status, bitrix_deal_id, metadata')
      .eq('contact->>email', email)
      .in('status', ['pending', 'processing', 'exported'])

    if (selectError) {
      console.error('[AbandonedCartConversion] Failed to load carts', selectError)
      return result
    }

    if (!carts || carts.length === 0) {
      console.log('[AbandonedCartConversion] No open abandoned carts to convert', { email })
      return result
    }

    const convertedAt = new Date().toISOString()

    for (const cart of carts as AbandonedCartRow[]) {
      const nextMetadata = {
        ...(cart.metadata || {}),
        converted_reason: 'order_paid',
        converted_order_id: input.orderId,
        converted_order_number: input.orderNumber,
        converted_at: convertedAt,
      }

      const { error: updateError } = await supabaseAdmin
        .from('abandoned_carts')
        .update({
          status: 'converted',
          metadata: nextMetadata,
        })
        .eq('id', cart.id)
        .in('status', ['pending', 'processing', 'exported'])

      if (updateError) {
        console.error('[AbandonedCartConversion] Failed to convert cart', {
          cartId: cart.id,
          error: updateError,
        })
        continue
      }

      result.convertedCount += 1

      if (!cart.bitrix_deal_id) {
        continue
      }

      try {
        const deal = await dealService.getDeal(cart.bitrix_deal_id)
        const loseStageId = resolveAbandonedDealLoseStageId(deal?.categoryId)

        const stageResult = await dealService.updateDealStage(cart.bitrix_deal_id, {
          stageId: loseStageId,
          comment: `Koszyk przekonwertowany po opłaceniu zamówienia ${input.orderNumber}`,
        })

        if (!stageResult.success) {
          console.error('[AbandonedCartConversion] Failed to close Bitrix deal', {
            dealId: cart.bitrix_deal_id,
            error: stageResult.error,
          })
          result.failedDealIds.push(cart.bitrix_deal_id)
          continue
        }

        result.closedDealIds.push(cart.bitrix_deal_id)
      } catch (dealError) {
        console.error('[AbandonedCartConversion] Unexpected Bitrix close error', {
          dealId: cart.bitrix_deal_id,
          error: dealError,
        })
        result.failedDealIds.push(cart.bitrix_deal_id)
      }
    }

    console.log('[AbandonedCartConversion] Completed', {
      email,
      orderNumber: input.orderNumber,
      ...result,
    })
  } catch (error) {
    console.error('[AbandonedCartConversion] Unexpected failure', error)
  }

  return result
}
