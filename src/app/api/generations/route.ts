import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Schema walidacji parametrów zapytania
const QueryParamsSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  yearTo: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  isCurrentlyProduced: z.string().transform(val => val === 'true').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      brand: searchParams.get('brand'),
      model: searchParams.get('model'),
      bodyType: searchParams.get('bodyType'),
      yearFrom: searchParams.get('yearFrom'),
      yearTo: searchParams.get('yearTo'),
      isCurrentlyProduced: searchParams.get('isCurrentlyProduced'),
    };

    // Walidacja parametrów
    const validatedParams = QueryParamsSchema.parse(queryParams);

    // Budowanie zapytania
    let query = supabase
      .from('car_models_extended')
      .select('brand_name, model_name, generation, body_type, year_from, year_to, is_currently_produced')
      .order('brand_name', { ascending: true })
      .order('model_name', { ascending: true })
      .order('generation', { ascending: true });

    // Dodawanie filtrów
    if (validatedParams.brand) {
      query = query.eq('brand_name', validatedParams.brand);
    }
    
    if (validatedParams.model) {
      query = query.eq('model_name', validatedParams.model);
    }
    
    if (validatedParams.bodyType) {
      query = query.eq('body_type', validatedParams.bodyType);
    }
    
    if (validatedParams.yearFrom) {
      query = query.gte('year_from', validatedParams.yearFrom);
    }
    
    if (validatedParams.yearTo) {
      query = query.lte('year_to', validatedParams.yearTo);
    }
    
    if (validatedParams.isCurrentlyProduced !== undefined) {
      query = query.eq('is_currently_produced', validatedParams.isCurrentlyProduced);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania generacji' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Grupowanie generacji po marce, modelu i generacji
    const groupedGenerations = data.reduce((acc: any, item: any) => {
      const key = `${item.brand_name}-${item.model_name}-${item.generation}`;
      
      if (!acc[key]) {
        acc[key] = {
          brand: item.brand_name,
          model: item.model_name,
          generation: item.generation,
          yearFrom: item.year_from,
          yearTo: item.year_to,
          isCurrentlyProduced: item.is_currently_produced,
          bodyTypes: new Set(),
          years: new Set()
        };
      }
      
      // Dodaj typ nadwozia
      if (item.body_type) {
        acc[key].bodyTypes.add(item.body_type);
      }
      
      // Dodaj lata
      if (item.year_from) {
        acc[key].years.add(item.year_from);
      }
      if (item.year_to) {
        acc[key].years.add(item.year_to);
      }
      
      return acc;
    }, {});

    // Konwersja do formatu odpowiedzi
    const result = Object.values(groupedGenerations).map((generation: any) => ({
      ...generation,
      bodyTypes: Array.from(generation.bodyTypes).sort(),
      years: Array.from(generation.years).sort((a: number, b: number) => b - a)
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}
