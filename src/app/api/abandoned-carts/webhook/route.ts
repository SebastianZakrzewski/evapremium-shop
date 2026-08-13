import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { abandonedCartWebhookInputSchema } from '@/lib/validators/abandonedCart';
import type { AbandonedCartRecord } from '@/lib/types/abandonedCart';
import { isAbandonedPaymentRedirectEvent } from '@/lib/services/abandonedCartPaymentRedirectPolicy'
import { findRecentBlockingOrderForBitrixExport, findRecentBlockingOrderForHeartbeat } from '@/lib/services/abandonedCartExportGuard'
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const webhookInputSchema = abandonedCartWebhookInputSchema;

export async function POST(request: NextRequest) {
  try {
    // Handle both regular JSON and Blob from sendBeacon
    let raw: any = {};
    try {
      // Try to parse as JSON first (for regular requests)
      raw = await request.json();
    } catch (jsonError) {
      // If JSON parsing fails, try to read as text (for sendBeacon Blob)
      try {
        const text = await request.text();
        if (text) {
          raw = JSON.parse(text);
        }
      } catch (textError) {
        console.error('[AbandonedCart:Webhook] Failed to parse request body', { jsonError, textError });
        return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
      }
    }

    const input = webhookInputSchema.parse(raw);

    console.log('[AbandonedCart:Webhook] Received webhook request', { 
      sessionId: input.sessionId?.substring(0, 8) + '...', 
      event: input.event,
      stage: input.stage,
      cartHasItems: input.cartHasItems,
      hasContact: !!input.contact,
      itemsCount: input.items?.length || 0
    });

    if (!input.sessionId || input.sessionId.length < 8) {
      console.warn('[AbandonedCart:Webhook] Invalid sessionId');
      return NextResponse.json({ success: false, error: 'Invalid sessionId' }, { status: 400 });
    }

    if ((input.stage !== 'checkout_step2' && input.stage !== 'checkout_step3') || !input.cartHasItems) {
      console.log('[AbandonedCart:Webhook] Not eligible', { stage: input.stage, cartHasItems: input.cartHasItems });
      return NextResponse.json({ success: false, error: 'Not eligible (stage/cart)' }, { status: 400 });
    }

    // Skip only when customer already paid a matching order
    if (input.contact?.email) {
      try {
        const blocking = await findRecentBlockingOrderForHeartbeat({
          email: input.contact.email,
          totalAmount: input.totalAmount,
          windowMs: 30 * 60 * 1000,
        })

        if (blocking) {
          console.log('[AbandonedCart:Webhook] Blocking order found, skipping abandoned cart', {
            orderId: blocking.order.id,
            orderNumber: blocking.order.order_number,
            paymentStatus: blocking.order.payment_status,
            reason: blocking.reason,
            email: input.contact.email,
          })
          return NextResponse.json(
            {
              success: true,
              skipped: true,
              reason: blocking.reason,
              orderId: blocking.order.id,
            },
            { status: 200 }
          )
        }
      } catch (checkError) {
        console.error('[AbandonedCart:Webhook] Error checking for blocking orders', checkError);
        // Kontynuuj przetwarzanie - nie blokuj jeśli sprawdzenie się nie powiodło
      }
    }

    const isPaymentRedirect = isAbandonedPaymentRedirectEvent({
      event: input.event,
      metadata: input.metadata as Record<string, unknown> | undefined,
    })

    // Payment gateway redirect: keep abandoned snapshot and create Bitrix "Porzucone Koszyki"
    // deal immediately. If the buyer later pays, convertAbandonedCartsOnPaid promotes it.
    if (isPaymentRedirect) {
      const nowPayment = new Date()
      const expireAtPayment = new Date(nowPayment.getTime() + 15 * 60 * 1000).toISOString()

      const { data: existingPaymentCarts } = await supabase
        .from('abandoned_carts')
        .select('id, metadata, bitrix_deal_id, status')
        .eq('session_id', input.sessionId)
        .in('status', ['pending', 'processing', 'exported'])
        .order('created_at', { ascending: false })
        .limit(1)

      const existingPaymentCart =
        Array.isArray(existingPaymentCarts) && existingPaymentCarts.length > 0
          ? existingPaymentCarts[0]
          : null

      if (existingPaymentCart?.bitrix_deal_id) {
        console.log('[AbandonedCart:Webhook] Payment redirect cart already exported', {
          cartId: existingPaymentCart.id,
          dealId: existingPaymentCart.bitrix_deal_id,
        })
        return NextResponse.json(
          {
            success: true,
            skipped: true,
            reason: 'already_exported',
            dealId: existingPaymentCart.bitrix_deal_id,
            recordId: existingPaymentCart.id,
          },
          { status: 200 }
        )
      }

      if (input.contact?.email) {
        try {
          const paidBlocking = await findRecentBlockingOrderForHeartbeat({
            email: input.contact.email,
            totalAmount: input.totalAmount,
            windowMs: 30 * 60 * 1000,
          })

          if (paidBlocking) {
            console.log('[AbandonedCart:Webhook] Skipping payment-redirect export — order already paid', {
              orderId: paidBlocking.order.id,
            })
            return NextResponse.json(
              {
                success: true,
                skipped: true,
                reason: paidBlocking.reason,
                orderId: paidBlocking.order.id,
              },
              { status: 200 }
            )
          }
        } catch (checkError) {
          console.error('[AbandonedCart:Webhook] Paid-order guard failed on payment redirect', checkError)
        }
      }

      let paymentCartId: string | null = existingPaymentCart?.id ?? null

      if (existingPaymentCart && existingPaymentCart.status !== 'exported') {
        const { data: updatedPaymentCart, error: updatePaymentError } = await supabase
          .from('abandoned_carts')
          .update({
            utm: input.utm || {},
            contact: input.contact || {},
            car: input.car || {},
            configuration: input.configuration || {},
            items: input.items || [],
            currency: input.currency || 'PLN',
            total_amount: input.totalAmount ?? 0,
            ip: input.ip,
            user_agent: input.userAgent,
            metadata: {
              ...((existingPaymentCart.metadata as Record<string, unknown>) || {}),
              ...(input.metadata || {}),
              stage: input.stage,
              event: input.event,
              paymentRedirect: true,
              address: input.address || {},
            },
            last_activity_at: nowPayment.toISOString(),
            expire_at: expireAtPayment,
            status: 'pending',
          })
          .eq('id', existingPaymentCart.id)
          .is('bitrix_deal_id', null)
          .select()
          .single()

        if (updatePaymentError) {
          console.error('[AbandonedCart:Webhook] Failed to update payment-redirect cart', updatePaymentError)
          return NextResponse.json({ success: false, error: updatePaymentError.message }, { status: 500 })
        }

        paymentCartId = updatedPaymentCart?.id ?? existingPaymentCart.id
      } else {
        const { data: insertedPaymentCart, error: insertPaymentError } = await supabase
          .from('abandoned_carts')
          .insert({
            session_id: input.sessionId,
            status: 'pending',
            utm: input.utm || {},
            contact: input.contact || {},
            car: input.car || {},
            configuration: input.configuration || {},
            items: input.items || [],
            currency: input.currency || 'PLN',
            total_amount: input.totalAmount ?? 0,
            ip: input.ip,
            user_agent: input.userAgent,
            metadata: {
              ...(input.metadata || {}),
              stage: input.stage,
              event: input.event,
              paymentRedirect: true,
              address: input.address || {},
            },
            last_activity_at: nowPayment.toISOString(),
            expire_at: expireAtPayment,
          })
          .select()
          .single()

        if (insertPaymentError || !insertedPaymentCart) {
          console.error('[AbandonedCart:Webhook] Failed to insert payment-redirect cart', insertPaymentError)
          return NextResponse.json(
            { success: false, error: insertPaymentError?.message || 'Insert failed' },
            { status: 500 }
          )
        }

        paymentCartId = insertedPaymentCart.id
      }

      const { data: paymentCartRecord, error: loadPaymentCartError } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('id', paymentCartId)
        .single()

      if (loadPaymentCartError || !paymentCartRecord) {
        console.error('[AbandonedCart:Webhook] Failed to load payment-redirect cart', loadPaymentCartError)
        return NextResponse.json(
          { success: false, error: loadPaymentCartError?.message || 'Cart not found' },
          { status: 500 }
        )
      }

      const { data: lockedPaymentCart, error: lockPaymentError } = await supabase
        .from('abandoned_carts')
        .update({ status: 'processing' })
        .eq('id', paymentCartId)
        .eq('status', 'pending')
        .is('bitrix_deal_id', null)
        .select()
        .single()

      if (lockPaymentError) {
        console.error('[AbandonedCart:Webhook] Failed to lock payment-redirect cart', lockPaymentError)
        return NextResponse.json({ success: false, error: lockPaymentError.message }, { status: 500 })
      }

      if (!lockedPaymentCart) {
        return NextResponse.json(
          { success: true, skipped: true, reason: 'already_processing', recordId: paymentCartId },
          { status: 200 }
        )
      }

      console.log('[AbandonedCart:Webhook] Creating Bitrix deal for payment-redirect cart', {
        cartId: paymentCartId,
      })

      const createdPaymentDeal = await dealService.createDealForAbandonedCart(
        paymentCartRecord as AbandonedCartRecord
      )

      if (!createdPaymentDeal.success || !createdPaymentDeal.id) {
        await supabase.from('abandoned_carts').update({ status: 'pending' }).eq('id', paymentCartId)
        console.error('[AbandonedCart:Webhook] Failed to create payment-redirect deal', {
          cartId: paymentCartId,
          error: createdPaymentDeal.error,
        })
        return NextResponse.json(
          { success: false, error: createdPaymentDeal.error || 'Failed to create deal' },
          { status: 500 }
        )
      }

      const { error: exportPaymentError } = await supabase
        .from('abandoned_carts')
        .update({ bitrix_deal_id: createdPaymentDeal.id, status: 'exported' })
        .eq('id', paymentCartId)
        .eq('status', 'processing')
        .is('bitrix_deal_id', null)

      if (exportPaymentError) {
        await supabase.from('abandoned_carts').update({ status: 'pending' }).eq('id', paymentCartId)
        console.error('[AbandonedCart:Webhook] Failed to mark payment-redirect cart exported', exportPaymentError)
        return NextResponse.json(
          {
            success: false,
            error: exportPaymentError.message,
            dealId: createdPaymentDeal.id,
          },
          { status: 500 }
        )
      }

      console.log('[AbandonedCart:Webhook] Payment-redirect abandoned cart exported', {
        cartId: paymentCartId,
        dealId: createdPaymentDeal.id,
      })

      return NextResponse.json(
        {
          success: true,
          dealId: createdPaymentDeal.id,
          recordId: paymentCartId,
          reason: 'payment_redirect_exported',
        },
        { status: 200 }
      )
    }

    const now = new Date();

    // Try find existing cart (pending or processing) without exported deal
    const { data: existingList, error: findError } = await supabase
      .from('abandoned_carts')
      .select('id, expire_at, bitrix_deal_id, status, metadata')
      .eq('session_id', input.sessionId)
      .in('status', ['pending', 'processing']) // Include both pending and processing statuses
      .is('bitrix_deal_id', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError) {
      console.error('[AbandonedCart:Webhook] Error finding existing cart', findError);
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    const existing = Array.isArray(existingList) && existingList.length > 0 ? existingList[0] : null;

    // Sprawdź ponownie dla istniejącego rekordu (może być race condition)
    if (existing && input.contact?.email) {
      try {
        const blocking = await findRecentBlockingOrderForHeartbeat({
          email: input.contact.email,
          totalAmount: input.totalAmount,
          windowMs: 60 * 60 * 1000,
        })

        if (blocking) {
          if (blocking.reason === 'order_already_paid') {
            console.log('[AbandonedCart:Webhook] Found paid order for existing cart, marking as converted', {
              cartId: existing.id,
              orderId: blocking.order.id,
              orderNumber: blocking.order.order_number,
              email: input.contact.email
            });
            
            const existingMetadata = (existing.metadata as Record<string, unknown>) || {};
            await supabase
              .from('abandoned_carts')
              .update({ 
                status: 'converted',
                metadata: { 
                  ...existingMetadata, 
                  converted_reason: 'order_paid',
                  converted_order_id: blocking.order.id,
                  converted_at: new Date().toISOString()
                }
              })
              .eq('id', existing.id);
          }

          return NextResponse.json({ 
            success: true, 
            skipped: true, 
            reason: blocking.reason,
            orderId: blocking.order.id 
          }, { status: 200 });
        }
      } catch (checkError) {
        console.error('[AbandonedCart:Webhook] Error checking for blocking orders (existing cart)', checkError);
      }
    }

    // Don't reset expire_at since we're creating deal immediately
    // This prevents cron from picking up the same cart
    const expireAt = existing?.expire_at || new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // Check if cart already has a deal (race condition protection)
    if (existing && existing.bitrix_deal_id) {
      console.log('[AbandonedCart:Webhook] Cart already has deal, skipping', { cartId: existing.id, dealId: existing.bitrix_deal_id });
      return NextResponse.json({ success: true, skipped: true, dealId: existing.bitrix_deal_id, reason: 'already_exported' }, { status: 200 });
    }

    // Check if cart is already being processed by another request
    if (existing && existing.status === 'processing') {
      console.log('[AbandonedCart:Webhook] Cart has status processing, checking if deal exists in Bitrix24', { cartId: existing.id });
      
      // Check if deal already exists in Bitrix24 (might have been created but not updated in DB)
      const existingDeal = await dealService.findByOriginId(existing.id);
      
      if (existingDeal) {
        // Deal exists - update cart with deal_id and status 'exported'
        console.log('[AbandonedCart:Webhook] Deal found in Bitrix24, updating cart', { cartId: existing.id, dealId: existingDeal.id });
        const { error: updateError } = await supabase
          .from('abandoned_carts')
          .update({ bitrix_deal_id: existingDeal.id, status: 'exported' })
          .eq('id', existing.id)
          .eq('status', 'processing');
        
        if (updateError) {
          console.error('[AbandonedCart:Webhook] Error updating cart with existing deal_id', updateError);
          return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, dealId: existingDeal.id, recordId: existing.id, reason: 'deal_already_exists' }, { status: 200 });
      } else {
        // Deal doesn't exist - previous request might have failed, rollback status and continue processing
        console.log('[AbandonedCart:Webhook] Deal not found in Bitrix24, rolling back status to pending and continuing', { cartId: existing.id });
        const { error: rollbackError } = await supabase
          .from('abandoned_carts')
          .update({ status: 'pending' })
          .eq('id', existing.id)
          .eq('status', 'processing');
        
        if (rollbackError) {
          console.error('[AbandonedCart:Webhook] Error rolling back status', rollbackError);
          return NextResponse.json({ success: false, error: rollbackError.message }, { status: 500 });
        }
        
        // Continue with processing - treat as if cart was pending
        // The existing cart will be updated below
      }
    }

    let record: AbandonedCartRecord | null = null;

    if (existing) {
      console.log('[AbandonedCart:Webhook] Updating existing cart', { cartId: existing.id });
      const { data: updated, error: updateError } = await supabase
        .from('abandoned_carts')
        .update({
          utm: input.utm || {},
          contact: input.contact || {},
          car: input.car || {},
          configuration: input.configuration || {},
          items: input.items || [],
          currency: input.currency || 'PLN',
          total_amount: input.totalAmount ?? 0,
          ip: input.ip,
          user_agent: input.userAgent,
          metadata: { ...(input.metadata || {}), stage: input.stage, event: input.event, address: input.address || {} },
          last_activity_at: new Date().toISOString(),
          expire_at: expireAt, // Keep existing expire_at or set if new
        })
        .eq('id', existing.id)
        .is('bitrix_deal_id', null) // Only update if deal_id is still null (race condition protection)
        .select()
        .single();

      if (updateError) {
        console.error('[AbandonedCart:Webhook] Error updating cart', updateError);
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
      
      if (!updated) {
        // Another process already created a deal for this cart
        console.log('[AbandonedCart:Webhook] Cart was updated by another process, skipping deal creation');
        return NextResponse.json({ success: true, skipped: true, reason: 'race_condition_prevented' }, { status: 200 });
      }
      
      record = updated as unknown as AbandonedCartRecord;
    } else {
      console.log('[AbandonedCart:Webhook] Creating new cart');
      const { data: inserted, error: insertError } = await supabase
        .from('abandoned_carts')
        .insert({
          session_id: input.sessionId,
          status: 'pending',
          utm: input.utm || {},
          contact: input.contact || {},
          car: input.car || {},
          configuration: input.configuration || {},
          items: input.items || [],
          currency: input.currency || 'PLN',
          total_amount: input.totalAmount ?? 0,
          ip: input.ip,
          user_agent: input.userAgent,
          metadata: { ...(input.metadata || {}), stage: input.stage, event: input.event, address: input.address || {} },
          last_activity_at: new Date().toISOString(),
          expire_at: expireAt, // Use calculated expire_at (will be set immediately, so no reset needed)
        })
        .select()
        .single();

      if (insertError) {
        console.error('[AbandonedCart:Webhook] Error inserting cart', insertError);
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
      record = inserted as unknown as AbandonedCartRecord;
    }

    // Don't export to Bitrix while payment is still pending for a matching order
    if (input.contact?.email) {
      try {
        const blockingExport = await findRecentBlockingOrderForBitrixExport({
          email: input.contact.email,
          totalAmount: input.totalAmount,
          windowMs: 60 * 60 * 1000,
        })

        if (blockingExport) {
          if (blockingExport.reason === 'order_already_paid') {
            console.log('[AbandonedCart:Webhook] Found paid order before export, marking as converted', {
              cartId: (record as any).id,
              orderId: blockingExport.order.id,
            })

            await supabase
              .from('abandoned_carts')
              .update({
                status: 'converted',
                metadata: {
                  ...((record as any).metadata || {}),
                  converted_reason: 'order_paid',
                  converted_order_id: blockingExport.order.id,
                  converted_at: new Date().toISOString(),
                },
              })
              .eq('id', (record as any).id)
          }

          return NextResponse.json(
            {
              success: true,
              skipped: true,
              reason: blockingExport.reason,
              orderId: blockingExport.order.id,
              recordId: (record as any).id,
            },
            { status: 200 }
          )
        }
      } catch (checkError) {
        console.error('[AbandonedCart:Webhook] Error checking export guard before Bitrix', checkError)
      }
    }

    // Atomic lock: set status to 'processing' to prevent concurrent processing
    const { data: lockedCart, error: lockError } = await supabase
      .from('abandoned_carts')
      .update({ status: 'processing' })
      .eq('id', (record as any).id)
      .eq('status', 'pending') // Only update if still pending
      .is('bitrix_deal_id', null) // Only update if deal_id is still null
      .select()
      .single();

    if (lockError) {
      console.error('[AbandonedCart:Webhook] Error locking cart for processing', lockError);
      return NextResponse.json({ success: false, error: lockError.message }, { status: 500 });
    }

    if (!lockedCart) {
      // Another process already locked this cart (race condition prevented)
      console.log('[AbandonedCart:Webhook] Cart already locked by another process, skipping', { cartId: (record as any).id });
      return NextResponse.json({ success: true, skipped: true, reason: 'already_processing' }, { status: 200 });
    }

    // Immediately create Bitrix24 deal for this abandoned cart
    console.log('[AbandonedCart:Webhook] Creating Bitrix24 deal for cart', { cartId: (record as any).id });
    const created = await dealService.createDealForAbandonedCart(record as AbandonedCartRecord);
    
    if (!created.success || !created.id) {
      console.error('[AbandonedCart:Webhook] Failed to create deal, rolling back status', { cartId: (record as any).id, error: created.error });
      // Rollback status to 'pending' if deal creation failed
      await supabase
        .from('abandoned_carts')
        .update({ status: 'pending' })
        .eq('id', (record as any).id);
      return NextResponse.json({ success: false, error: created.error || 'Failed to create deal' }, { status: 500 });
    }

    // Atomic update: set deal_id and status to 'exported'
    const { data: updatedCart, error: updErr } = await supabase
      .from('abandoned_carts')
      .update({ bitrix_deal_id: created.id, status: 'exported' })
      .eq('id', (record as any).id)
      .eq('status', 'processing') // Only update if still processing (double-check)
      .select()
      .single();

    if (updErr) {
      console.error('[AbandonedCart:Webhook] Error updating cart with deal_id', updErr);
      // Rollback status to 'pending' if update failed
      await supabase
        .from('abandoned_carts')
        .update({ status: 'pending' })
        .eq('id', (record as any).id);
      return NextResponse.json({ success: false, error: updErr.message, dealId: created.id }, { status: 500 });
    }

    if (!updatedCart) {
      // Another process already updated this cart (should not happen, but handle it)
      console.warn('[AbandonedCart:Webhook] Cart was updated by another process during processing', { 
        cartId: (record as any).id, 
        dealId: created.id 
      });
      return NextResponse.json({ success: true, dealId: created.id, recordId: (record as any).id, warning: 'race_condition' }, { status: 200 });
    }

    console.log('[AbandonedCart:Webhook] Successfully created deal', { 
      cartId: (record as any).id, 
      dealId: created.id 
    });

    return NextResponse.json({ success: true, dealId: created.id, recordId: (record as any).id }, { status: 200 });
  } catch (error) {
    console.error('[AbandonedCart:Webhook] Unexpected error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}


