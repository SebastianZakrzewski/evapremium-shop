import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TABLES } from '@/lib/database/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.CAR_BRANDS)
      .select('*')
      .eq('isActive', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching car brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CAR_BRANDS)
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating car brand:', error);
    return NextResponse.json(
      { error: 'Failed to create car brand' },
      { status: 500 }
    );
  }
} 