import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TABLES } from '@/lib/database/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const brandName = searchParams.get('brandName');
    const bodyType = searchParams.get('bodyType');
    const engineType = searchParams.get('engineType');
    const yearFrom = searchParams.get('yearFrom');
    const yearTo = searchParams.get('yearTo');

    const filters: any = {};
    
    let query = supabaseAdmin.from(TABLES.CAR_MODELS).select('*');
    
    if (brandId) {
      query = query.eq('carBrandId', parseInt(brandId));
    } else if (brandName) {
      // Jeśli podano nazwę marki, najpierw znajdź jej ID
      const { data: brandData, error: brandError } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .select('id')
        .eq('name', brandName)
        .single();
      
      if (brandError || !brandData) {
        return NextResponse.json([]);
      }
      query = query.eq('carBrandId', brandData.id);
    }
    
    if (bodyType) query = query.eq('bodyType', bodyType);
    if (engineType) query = query.eq('engineType', engineType);
    if (yearFrom) query = query.gte('yearFrom', parseInt(yearFrom));
    if (yearTo) query = query.lte('yearTo', parseInt(yearTo));

    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Błąd podczas pobierania modeli aut:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania modeli aut' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CAR_MODELS)
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Błąd podczas tworzenia modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas tworzenia modelu auta' },
      { status: 500 }
    );
  }
} 