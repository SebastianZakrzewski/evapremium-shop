import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(_request: NextRequest) {
  try {
    const nowIso = new Date().toISOString();
    // Add 1 minute buffer to prevent race condition with webhook
    const bufferTime = new Date(Date.now() - 60 * 1000).toISOString();
    console.log('[AbandonedCart:Cron] Starting cron job', { now: nowIso, bufferTime });

    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .lte('expire_at', bufferTime) // Use buffer time instead of current time
      .is('bitrix_deal_id', null)
      .contains('metadata', { stage: 'checkout_step2' })
      .limit(50);

    if (error) {
      console.error('[AbandonedCart:Cron] Error fetching carts', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[AbandonedCart:Cron] Found expired carts', { count: carts?.length || 0 });

    const results: Array<{ id: string; bitrixDealId?: string; error?: string }> = [];

    for (const cart of carts || []) {
      try {
        console.log('[AbandonedCart:Cron] Processing cart', { cartId: cart.id });
        
        // Double-check that cart still doesn't have a deal (race condition protection)
        const { data: currentCart } = await supabase
          .from('abandoned_carts')
          .select('bitrix_deal_id')
          .eq('id', cart.id)
          .single();

        if (currentCart?.bitrix_deal_id) {
          console.log('[AbandonedCart:Cron] Cart already has deal, skipping', { cartId: cart.id, dealId: currentCart.bitrix_deal_id });
          results.push({ id: cart.id, error: 'already_exported' });
          continue;
        }

        const created = await dealService.createDealForAbandonedCart(cart as any);
        if (created.success && created.id) {
          // Atomic update: only update if deal_id is still null
          const { error: updateError } = await supabase
            .from('abandoned_carts')
            .update({ bitrix_deal_id: created.id, bitrix_category_id: null, bitrix_stage_id: null })
            .eq('id', cart.id)
            .is('bitrix_deal_id', null);

          if (updateError) {
            console.error('[AbandonedCart:Cron] Error updating cart with deal_id', updateError);
            results.push({ id: cart.id, error: updateError.message });
          } else {
            console.log('[AbandonedCart:Cron] Successfully created deal', { cartId: cart.id, dealId: created.id });
            results.push({ id: cart.id, bitrixDealId: created.id });
          }
        } else {
          console.error('[AbandonedCart:Cron] Failed to create deal', { cartId: cart.id, error: created.error });
          results.push({ id: cart.id, error: created.error || 'unknown' });
        }
      } catch (e: any) {
        console.error('[AbandonedCart:Cron] Exception processing cart', { cartId: cart.id, error: e?.message });
        results.push({ id: cart.id, error: e?.message || 'unknown' });
      }
    }

    const successCount = results.filter(r => r.bitrixDealId).length;
    const errorCount = results.filter(r => r.error).length;
    console.log('[AbandonedCart:Cron] Completed', { total: results.length, success: successCount, errors: errorCount });

    return NextResponse.json({ success: true, count: results.length, results }, { status: 200 });
  } catch (error) {
    console.error('[AbandonedCart:Cron] Unexpected error', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


