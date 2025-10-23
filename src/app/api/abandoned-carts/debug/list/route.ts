import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function GET(_request: NextRequest) {
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .lte('expire_at', nowIso)
      .is('bitrix_deal_id', null)
      .limit(20);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: data?.length || 0, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


