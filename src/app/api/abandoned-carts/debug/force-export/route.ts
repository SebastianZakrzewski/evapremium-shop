import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(request: NextRequest) {
  try {
    if (env.nodeEnv === 'production') {
      return NextResponse.json({ success: false, error: 'Forbidden in production' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { sessionId } = body || {};

    // Pick target cart
    let target: any = null;
    if (sessionId) {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'pending')
        .is('bitrix_deal_id', null)
        .contains('metadata', { stage: 'checkout_step2' })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      target = data;
    } else {
      const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('status', 'pending')
        .is('bitrix_deal_id', null)
        .contains('metadata', { stage: 'checkout_step2' })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      target = data;
    }

    if (!target) {
      return NextResponse.json({ success: true, message: 'No pending carts found' }, { status: 200 });
    }

    // Force create deal
    const created = await dealService.createDealForAbandonedCart(target);
    if (!created.success) {
      return NextResponse.json({ success: false, error: created.error || 'Unknown error creating deal' }, { status: 500 });
    }

    const { error: updErr } = await supabase
      .from('abandoned_carts')
      .update({ bitrix_deal_id: created.id })
      .eq('id', target.id);
    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message, dealId: created.id }, { status: 500 });
    }

    return NextResponse.json({ success: true, dealId: created.id, sessionId: target.session_id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


