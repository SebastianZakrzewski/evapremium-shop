import 'server-only'
import { supabaseAdmin } from '@/lib/database/supabase'
import { mapOrderToContact } from '@/lib/integrations/bitrix24/mappers/orderToContact'
import { createDealProducts, mapOrderToDeal } from '@/lib/integrations/bitrix24/mappers/orderToDeal'
import { contactService } from '@/lib/integrations/bitrix24/services/ContactService'
import { dealService } from '@/lib/integrations/bitrix24/services/DealService'
import { stageMappingService } from '@/lib/integrations/bitrix24/services/StageMappingService'
import {
  type ConvertAbandonedCartsOnPaidInput,
  type ConvertAbandonedCartsOnPaidResult,
} from '@/lib/services/abandonedCartConversionPolicy'

type AbandonedCartRow = {
  id: string
  status: string
  bitrix_deal_id: string | null
  metadata: Record<string, unknown> | null
}

const resolveContactId = async (order: ConvertAbandonedCartsOnPaidInput['order']): Promise<string | undefined> => {
  try {
    const contactData = mapOrderToContact(order, {
      sourceId: 'WEB',
      sourceDescription: 'EVA Website',
    })

    const contactResult = await contactService.findOrCreateContact(contactData, {
      sourceId: 'WEB',
      sourceDescription: 'EVA Website',
    })

    return contactResult.id || undefined
  } catch (error) {
    console.error('[AbandonedCartConversion] Failed to resolve contact for promotion', error)
    return undefined
  }
}

const promoteAbandonedDealToPaidOrder = async (
  dealId: string,
  order: ConvertAbandonedCartsOnPaidInput['order']
): Promise<boolean> => {
  const { stageId } = await stageMappingService.resolveStage({
    type: 'order',
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
  })

  const contactId = await resolveContactId(order)
  const dealData = mapOrderToDeal(order, contactId, { stageId })

  const updateDealResult = await dealService.updateDeal(dealId, dealData)
  if (!updateDealResult.success) {
    console.error('[AbandonedCartConversion] Failed to update abandoned deal with order data', {
      dealId,
      error: updateDealResult.error,
    })
    return false
  }

  const updateStageResult = await dealService.updateDealStage(dealId, {
    stageId,
    comment: `Porzucony koszyk przekształcony w opłacone zamówienie ${order.orderNumber}`,
  })

  if (!updateStageResult.success) {
    console.error('[AbandonedCartConversion] Failed to move abandoned deal to paid stage', {
      dealId,
      stageId,
      error: updateStageResult.error,
    })
    return false
  }

  if (contactId) {
    await dealService.linkContact(dealId, contactId)
  }

  const products = createDealProducts(order)
  if (products.length > 0) {
    const dealProducts = products.map((product) => ({
      PRODUCT_ID: product.PRODUCT_NAME,
      QUANTITY: product.QUANTITY,
      PRICE: product.PRICE,
    }))

    const productResult = await dealService.addProductsToDeal(dealId, dealProducts)
    if (!productResult.success) {
      console.warn('[AbandonedCartConversion] Deal promoted but products update failed', {
        dealId,
        error: productResult.error,
      })
    }
  }

  return true
}

/**
 * Marks open abandoned carts as converted after a successful payment
 * and promotes related Bitrix abandoned deals to "Zamówienia ze strony opłacone".
 *
 * Never throws — payment flow must not fail because of CRM cleanup.
 */
export const convertAbandonedCartsOnPaid = async (
  input: ConvertAbandonedCartsOnPaidInput
): Promise<ConvertAbandonedCartsOnPaidResult> => {
  const result: ConvertAbandonedCartsOnPaidResult = {
    convertedCount: 0,
    promotedDealIds: [],
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
        const promoted = await promoteAbandonedDealToPaidOrder(cart.bitrix_deal_id, input.order)
        if (!promoted) {
          result.failedDealIds.push(cart.bitrix_deal_id)
          continue
        }

        result.promotedDealIds.push(cart.bitrix_deal_id)
      } catch (dealError) {
        console.error('[AbandonedCartConversion] Unexpected Bitrix promotion error', {
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
