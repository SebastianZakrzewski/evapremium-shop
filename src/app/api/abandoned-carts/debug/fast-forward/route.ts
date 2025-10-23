import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(request: NextRequest) {
  try {
    if (env.nodeEnv === 'production') {
      return NextResponse.json({ success: false, error: 'Forbidden in production' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { sessionId, minutes = 15 } = body || {};

    // Find target record: latest pending abandoned cart in checkout_step2 without Bitrix deal
    let targetSessionId = sessionId as string | undefined;
    if (!targetSessionId) {
      const { data: latest, error: findErr } = await supabase
        .from('abandoned_carts')
        .select('session_id')
        .eq('status', 'pending')
        .is('bitrix_deal_id', null)
        .contains('metadata', { stage: 'checkout_step2' })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (findErr) {
        return NextResponse.json({ success: false, error: findErr.message }, { status: 500 });
      }
      if (!latest) {
        return NextResponse.json({ success: true, message: 'No pending carts found' }, { status: 200 });
      }
      targetSessionId = latest.session_id as string;
    }

    // Fast-forward expire_at to the past by X minutes
    const newExpireAt = new Date(Date.now() - Math.abs(Number(minutes)) * 60 * 1000).toISOString();
    const { data: updated, error: updErr } = await supabase
      .from('abandoned_carts')
      .update({ expire_at: newExpireAt })
      .eq('session_id', targetSessionId)
      .eq('status', 'pending')
      .is('bitrix_deal_id', null)
      .contains('metadata', { stage: 'checkout_step2' })
      .select();

    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: updated?.length || 0, sessionId: targetSessionId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


