import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Schema walidacji parametrów
const ModelParamsSchema = z.object({
  brand: z.string().min(1, 'Nazwa marki jest wymagana'),
  model: z.string().min(1, 'Nazwa modelu jest wymagana')
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string; model: string }> }
) {
  try {
    // Pobierz parametry asynchronicznie
    const resolvedParams = await params;
    
    // Walidacja parametrów
    const validatedParams = ModelParamsSchema.parse({
      brand: decodeURIComponent(resolvedParams.brand),
      model: decodeURIComponent(resolvedParams.model)
    });

    const brandName = validatedParams.brand;
    const modelName = validatedParams.model;

    // Pobierz wszystkie generacje dla danego modelu
    const { data: generations, error } = await supabase
      .from('car_models_extended')
      .select('generation, body_type, year_from, year_to, is_currently_produced')
      .eq('brand_name', brandName)
      .eq('model_name', modelName)
      .order('generation', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania generacji' },
        { status: 500 }
      );
    }

    if (!generations || generations.length === 0) {
      return NextResponse.json([]);
    }

    // Grupuj po generacjach
    const groupedGenerations = generations.reduce((acc: any, item: any) => {
      const generationKey = item.generation;
      
      if (!acc[generationKey]) {
        acc[generationKey] = {
          brand: brandName,
          model: modelName,
          generation: generationKey,
          yearFrom: item.year_from,
          yearTo: item.year_to,
          isCurrentlyProduced: item.is_currently_produced,
          bodyTypes: new Set(),
          years: new Set()
        };
      }
      
      // Dodaj typ nadwozia
      if (item.body_type) {
        acc[generationKey].bodyTypes.add(item.body_type);
      }
      
      // Dodaj lata
      if (item.year_from) {
        acc[generationKey].years.add(item.year_from);
      }
      if (item.year_to) {
        acc[generationKey].years.add(item.year_to);
      }
      
      return acc;
    }, {});

    // Konwersja do formatu odpowiedzi
    const result = Object.values(groupedGenerations).map((generation: any) => ({
      ...generation,
      bodyTypes: Array.from(generation.bodyTypes).sort(),
      years: Array.from(generation.years).sort((a: any, b: any) => b - a)
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
