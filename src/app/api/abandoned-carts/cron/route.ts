import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';
import { findRecentBlockingOrderForBitrixExport } from '@/lib/services/abandonedCartExportGuard';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(_request: NextRequest) {
  try {
    const nowIso = new Date().toISOString();
    // Add 1 minute buffer to prevent race condition with webhook
    const bufferTime = new Date(Date.now() - 60 * 1000).toISOString();
    console.log('[AbandonedCart:Cron] Starting cron job', { now: nowIso, bufferTime });

    const { data: allCarts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .lte('expire_at', bufferTime) // Use buffer time instead of current time
      .is('bitrix_deal_id', null)
      .limit(50);

    if (error) {
      console.error('[AbandonedCart:Cron] Error fetching carts', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Filter carts by stage (checkout_step2 or checkout_step3)
    // This ensures carts abandoned at payment stage (step 3) are also processed
    const carts = (allCarts || []).filter(cart => {
      const metadata = cart.metadata as Record<string, unknown> | null;
      const stage = metadata?.stage;
      return stage === 'checkout_step2' || stage === 'checkout_step3';
    });

    console.log('[AbandonedCart:Cron] Found expired carts', { 
      total: allCarts?.length || 0, 
      filtered: carts.length 
    });

    const results: Array<{ id: string; bitrixDealId?: string; error?: string; skipped?: string }> = [];

    for (const cart of carts || []) {
      try {
        console.log('[AbandonedCart:Cron] Processing cart', { cartId: cart.id });

        const contact = (cart.contact || {}) as { email?: string }
        if (contact.email) {
          try {
            const blocking = await findRecentBlockingOrderForBitrixExport({
              email: contact.email,
              totalAmount: Number(cart.total_amount) || 0,
              windowMs: 60 * 60 * 1000,
            })

            if (blocking) {
              console.log('[AbandonedCart:Cron] Skipping cart due to blocking order', {
                cartId: cart.id,
                orderId: blocking.order.id,
                reason: blocking.reason,
              })

              if (blocking.reason === 'order_already_paid') {
                await supabase
                  .from('abandoned_carts')
                  .update({
                    status: 'converted',
                    metadata: {
                      ...((cart.metadata as Record<string, unknown>) || {}),
                      converted_reason: 'order_paid',
                      converted_order_id: blocking.order.id,
                      converted_at: new Date().toISOString(),
                    },
                  })
                  .eq('id', cart.id)
              }

              results.push({ id: cart.id, skipped: blocking.reason })
              continue
            }
          } catch (guardError) {
            console.error('[AbandonedCart:Cron] Blocking-order guard failed, continuing', {
              cartId: cart.id,
              error: guardError,
            })
          }
        }
        
        // Atomic lock: set status to 'processing' to prevent concurrent processing
        const { data: lockedCart, error: lockError } = await supabase
          .from('abandoned_carts')
          .update({ status: 'processing' })
          .eq('id', cart.id)
          .eq('status', 'pending') // Only update if still pending
          .is('bitrix_deal_id', null) // Only update if deal_id is still null
          .select()
          .single();

        if (lockError) {
          console.error('[AbandonedCart:Cron] Error locking cart for processing', { cartId: cart.id, error: lockError });
          results.push({ id: cart.id, error: lockError.message });
          continue;
        }

        if (!lockedCart) {
          // Another process already locked this cart (race condition prevented)
          console.log('[AbandonedCart:Cron] Cart already locked by another process, skipping', { cartId: cart.id });
          results.push({ id: cart.id, error: 'already_processing' });
          continue;
        }

        const created = await dealService.createDealForAbandonedCart(cart as any);
        
        if (!created.success || !created.id) {
          console.error('[AbandonedCart:Cron] Failed to create deal, rolling back status', { cartId: cart.id, error: created.error });
          // Rollback status to 'pending' if deal creation failed
          await supabase
            .from('abandoned_carts')
            .update({ status: 'pending' })
            .eq('id', cart.id);
          results.push({ id: cart.id, error: created.error || 'unknown' });
          continue;
        }

        // Atomic update: set deal_id and status to 'exported'
        const { error: updateError } = await supabase
          .from('abandoned_carts')
          .update({ bitrix_deal_id: created.id, status: 'exported', bitrix_category_id: null, bitrix_stage_id: null })
          .eq('id', cart.id)
          .eq('status', 'processing') // Only update if still processing (double-check)
          .is('bitrix_deal_id', null); // Extra safety check

        if (updateError) {
          console.error('[AbandonedCart:Cron] Error updating cart with deal_id', { cartId: cart.id, error: updateError });
          // Rollback status to 'pending' if update failed
          await supabase
            .from('abandoned_carts')
            .update({ status: 'pending' })
            .eq('id', cart.id);
          results.push({ id: cart.id, error: updateError.message });
        } else {
          console.log('[AbandonedCart:Cron] Successfully created deal', { cartId: cart.id, dealId: created.id });
          results.push({ id: cart.id, bitrixDealId: created.id });
        }
      } catch (e: any) {
        console.error('[AbandonedCart:Cron] Exception processing cart', { cartId: cart.id, error: e?.message });
        // Try to rollback status on exception
        try {
          await supabase
            .from('abandoned_carts')
            .update({ status: 'pending' })
            .eq('id', cart.id);
        } catch (rollbackError) {
          console.error('[AbandonedCart:Cron] Failed to rollback status on exception', { cartId: cart.id, error: rollbackError });
        }
        results.push({ id: cart.id, error: e?.message || 'unknown' });
      }
    }

    const successCount = results.filter(r => r.bitrixDealId).length;
    const errorCount = results.filter(r => r.error).length;
    const skippedCount = results.filter(r => r.skipped).length;
    console.log('[AbandonedCart:Cron] Completed', {
      total: results.length,
      success: successCount,
      errors: errorCount,
      skipped: skippedCount,
    });

    return NextResponse.json({ success: true, count: results.length, results }, { status: 200 });
  } catch (error) {
    console.error('[AbandonedCart:Cron] Unexpected error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
