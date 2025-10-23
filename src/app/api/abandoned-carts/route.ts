import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { abandonedCartUpsertInputSchema } from '@/lib/validators/abandonedCart';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = abandonedCartUpsertInputSchema.parse(body);
    if (!input.sessionId || input.sessionId.length < 8) {
      return NextResponse.json({ success: false, error: 'Invalid sessionId' }, { status: 400 });
    }

    // Enforce conditions: only checkout step 2 and cart must have items
    if (input.stage !== 'checkout_step2' || !input.cartHasItems) {
      return NextResponse.json({ success: false, error: 'Not eligible (stage/cart)' }, { status: 400 });
    }

    const now = new Date();
    const expireAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // Find existing pending record for this session (not yet exported)
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
          metadata: { ...(input.metadata || {}), stage: input.stage },
          last_activity_at: new Date().toISOString(),
          expire_at: expireAt,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    }

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
        metadata: { ...(input.metadata || {}), stage: input.stage },
        last_activity_at: new Date().toISOString(),
        expire_at: expireAt,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: inserted }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}


