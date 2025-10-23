import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body || {};
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('abandoned_carts')
      .update({ status: 'converted' })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}


