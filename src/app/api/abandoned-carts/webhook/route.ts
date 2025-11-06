import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/config/env';
import { abandonedCartUpsertInputSchema } from '@/lib/validators/abandonedCart';
import type { AbandonedCartRecord } from '@/lib/types/abandonedCart';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const webhookInputSchema = abandonedCartUpsertInputSchema.extend({
  event: z.enum(['pagehide', 'beforeunload', 'heartbeat']).optional(),
});

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

    if (input.stage !== 'checkout_step2' || !input.cartHasItems) {
      console.log('[AbandonedCart:Webhook] Not eligible', { stage: input.stage, cartHasItems: input.cartHasItems });
      return NextResponse.json({ success: false, error: 'Not eligible (stage/cart)' }, { status: 400 });
    }

    const now = new Date();

    // Try find existing pending cart without exported deal
    const { data: existingList, error: findError } = await supabase
      .from('abandoned_carts')
      .select('id, expire_at, bitrix_deal_id, status')
      .eq('session_id', input.sessionId)
      .eq('status', 'pending')
      .is('bitrix_deal_id', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError) {
      console.error('[AbandonedCart:Webhook] Error finding existing cart', findError);
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    const existing = Array.isArray(existingList) && existingList.length > 0 ? existingList[0] : null;

    // Don't reset expire_at since we're creating deal immediately
    // This prevents cron from picking up the same cart
    const expireAt = existing?.expire_at || new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // Check if cart already has a deal (race condition protection)
    if (existing && existing.bitrix_deal_id) {
      console.log('[AbandonedCart:Webhook] Cart already has deal, skipping', { cartId: existing.id, dealId: existing.bitrix_deal_id });
      return NextResponse.json({ success: true, skipped: true, dealId: existing.bitrix_deal_id, reason: 'already_exported' }, { status: 200 });
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
          metadata: { ...(input.metadata || {}), stage: input.stage, event: input.event },
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
          metadata: { ...(input.metadata || {}), stage: input.stage, event: input.event },
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

    // Immediately create Bitrix24 deal for this abandoned cart
    console.log('[AbandonedCart:Webhook] Creating Bitrix24 deal for cart', { cartId: (record as any).id });
    const created = await dealService.createDealForAbandonedCart(record as AbandonedCartRecord);
    if (!created.success || !created.id) {
      console.error('[AbandonedCart:Webhook] Failed to create deal', created.error);
      return NextResponse.json({ success: false, error: created.error || 'Failed to create deal' }, { status: 500 });
    }

    // Atomic update: only update if deal_id is still null (race condition protection)
    const { data: updatedCart, error: updErr } = await supabase
      .from('abandoned_carts')
      .update({ bitrix_deal_id: created.id, status: 'exported' })
      .eq('id', (record as any).id)
      .is('bitrix_deal_id', null)
      .select()
      .single();

    if (updErr) {
      console.error('[AbandonedCart:Webhook] Error updating cart with deal_id', updErr);
      return NextResponse.json({ success: false, error: updErr.message, dealId: created.id }, { status: 500 });
    }

    if (!updatedCart) {
      // Another process already created a deal (race condition)
      console.warn('[AbandonedCart:Webhook] Race condition detected - deal was already created', { 
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


