import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(_request: NextRequest) {
  try {
    const nowIso = new Date().toISOString();

    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .lte('expire_at', nowIso)
      .is('bitrix_deal_id', null)
      .contains('metadata', { stage: 'checkout_step2' })
      .limit(50);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const results: Array<{ id: string; bitrixDealId?: string; error?: string }> = [];

    for (const cart of carts || []) {
      try {
        const created = await dealService.createDealForAbandonedCart(cart as any);
        if (created.success && created.id) {
          await supabase
            .from('abandoned_carts')
            .update({ bitrix_deal_id: created.id, bitrix_category_id: null, bitrix_stage_id: null })
            .eq('id', cart.id);
          results.push({ id: cart.id, bitrixDealId: created.id });
        } else {
          results.push({ id: cart.id, error: created.error || 'unknown' });
        }
      } catch (e: any) {
        results.push({ id: cart.id, error: e?.message || 'unknown' });
      }
    }

    return NextResponse.json({ success: true, count: results.length, results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


