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
): Promise<string | null> => {
  const { stageId } = await stageMappingService.resolveStage({
    type: 'order',
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
  })

  const paidCategoryId = 0
  const contactId = await resolveContactId(order)
  const dealData = mapOrderToDeal(order, contactId, { stageId })

  // 1) Try in-place pipeline move (CATEGORY_ID + STAGE_ID together)
  const pipelineMove = await dealService.updateDeal(dealId, {
    ...dealData,
    CATEGORY_ID: paidCategoryId,
    STAGE_ID: stageId,
    COMMENTS: `Porzucony koszyk przekształcony w opłacone zamówienie ${order.orderNumber}`,
  } as any)

  if (pipelineMove.success) {
    const afterMove = await dealService.getDeal(dealId)
    if (
      afterMove &&
      Number(afterMove.categoryId ?? -1) === paidCategoryId &&
      afterMove.stageId === stageId
    ) {
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
        await dealService.addProductsToDeal(dealId, dealProducts)
      }

      return dealId
    }

    console.warn('[AbandonedCartConversion] Bitrix ignored CATEGORY_ID move; recreating deal in paid pipeline', {
      dealId,
      actualCategoryId: afterMove?.categoryId,
      actualStageId: afterMove?.stageId,
      expectedCategoryId: paidCategoryId,
      expectedStageId: stageId,
    })
  } else {
    console.error('[AbandonedCartConversion] Failed to update abandoned deal before recreate', {
      dealId,
      error: pipelineMove.error,
    })
  }

  // 2) Fallback: Bitrix webhooks often cannot move deals across pipelines.
  // Recreate in paid pipeline and delete the abandoned deal to avoid duplicates.
  const created = await dealService.createDeal(
    {
      ...dealData,
      CATEGORY_ID: paidCategoryId,
      STAGE_ID: stageId,
    } as any,
    {
      currencyId: 'PLN',
      contactId,
    }
  )

  if (!created.success || !created.id) {
    console.error('[AbandonedCartConversion] Failed to recreate paid deal', {
      dealId,
      error: created.error,
    })
    return null
  }

  const products = createDealProducts(order)
  if (products.length > 0) {
    const dealProducts = products.map((product) => ({
      PRODUCT_ID: product.PRODUCT_NAME,
      QUANTITY: product.QUANTITY,
      PRICE: product.PRICE,
    }))
    await dealService.addProductsToDeal(created.id, dealProducts)
  }

  const deleted = await dealService.deleteDeal(dealId)
  if (!deleted.success) {
    console.warn('[AbandonedCartConversion] Paid deal created but abandoned deal delete failed', {
      abandonedDealId: dealId,
      paidDealId: created.id,
      error: deleted.error,
    })
  } else {
    console.log('[AbandonedCartConversion] Recreated abandoned deal in paid pipeline', {
      abandonedDealId: dealId,
      paidDealId: created.id,
      stageId,
    })
  }

  return created.id
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
        const promotedDealId = await promoteAbandonedDealToPaidOrder(cart.bitrix_deal_id, input.order)
        if (!promotedDealId) {
          result.failedDealIds.push(cart.bitrix_deal_id)
          continue
        }

        if (promotedDealId !== cart.bitrix_deal_id) {
          await supabaseAdmin
            .from('abandoned_carts')
            .update({
              bitrix_deal_id: promotedDealId,
              metadata: {
                ...nextMetadata,
                promoted_from_deal_id: cart.bitrix_deal_id,
                promoted_deal_id: promotedDealId,
              },
            })
            .eq('id', cart.id)
        }

        result.promotedDealIds.push(promotedDealId)
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
