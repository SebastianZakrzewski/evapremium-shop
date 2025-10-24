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
    const raw = await request.json().catch(() => ({}));
    const input = webhookInputSchema.parse(raw);

    if (!input.sessionId || input.sessionId.length < 8) {
      return NextResponse.json({ success: false, error: 'Invalid sessionId' }, { status: 400 });
    }

    if (input.stage !== 'checkout_step2' || !input.cartHasItems) {
      return NextResponse.json({ success: false, error: 'Not eligible (stage/cart)' }, { status: 400 });
    }

    const now = new Date();
    const expireAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // Try find existing pending cart without exported deal
    const { data: existingList, error: findError } = await supabase
      .from('abandoned_carts')
      .select('id')
      .eq('session_id', input.sessionId)
      .eq('status', 'pending')
      .is('bitrix_deal_id', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError) {
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 });
    }

    const existing = Array.isArray(existingList) && existingList.length > 0 ? existingList[0] : null;

    let record: AbandonedCartRecord | null = null;

    if (existing) {
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
          expire_at: expireAt,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
      record = updated as unknown as AbandonedCartRecord;
    } else {
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
          expire_at: expireAt,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
      record = inserted as unknown as AbandonedCartRecord;
    }

    // Immediately create Bitrix24 deal for this abandoned cart
    const created = await dealService.createDealForAbandonedCart(record as AbandonedCartRecord);
    if (!created.success || !created.id) {
      return NextResponse.json({ success: false, error: created.error || 'Failed to create deal' }, { status: 500 });
    }

    const { error: updErr } = await supabase
      .from('abandoned_carts')
      .update({ bitrix_deal_id: created.id, status: 'exported' })
      .eq('id', (record as any).id);

    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message, dealId: created.id }, { status: 500 });
    }

    return NextResponse.json({ success: true, dealId: created.id, recordId: (record as any).id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}


