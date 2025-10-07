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
const BrandParamsSchema = z.object({
  brand: z.string().min(1, 'Nazwa marki jest wymagana')
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  try {
    // Pobierz parametry asynchronicznie
    const resolvedParams = await params;
    
    // Walidacja parametrów
    const validatedParams = BrandParamsSchema.parse({
      brand: decodeURIComponent(resolvedParams.brand)
    });

    const brandName = validatedParams.brand;

    // Pobierz wszystkie modele dla danej marki
    const { data: models, error } = await supabase
      .from('car_models_extended')
      .select('model_name, generation, body_type, year_from, year_to, is_currently_produced')
      .eq('brand_name', brandName)
      .order('model_name', { ascending: true })
      .order('generation', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania modeli' },
        { status: 500 }
      );
    }

    if (!models || models.length === 0) {
      return NextResponse.json([]);
    }

    // Grupuj modele po nazwie
    const groupedModels = models.reduce((acc: any, item: any) => {
      const modelName = item.model_name;
      
      if (!acc[modelName]) {
        acc[modelName] = {
          brand: brandName,
          model: modelName,
          generations: [],
          bodyTypes: new Set(),
          years: new Set(),
          isCurrentlyProduced: false
        };
      }
      
      // Dodaj generację
      acc[modelName].generations.push({
        generation: item.generation,
        bodyType: item.body_type,
        yearFrom: item.year_from,
        yearTo: item.year_to,
        isCurrentlyProduced: item.is_currently_produced
      });
      
      // Dodaj typ nadwozia
      if (item.body_type) {
        acc[modelName].bodyTypes.add(item.body_type);
      }
      
      // Dodaj lata
      if (item.year_from) {
        acc[modelName].years.add(item.year_from);
      }
      if (item.year_to) {
        acc[modelName].years.add(item.year_to);
      }
      
      // Ustaw flagę czy jest produkowany
      if (item.is_currently_produced) {
        acc[modelName].isCurrentlyProduced = true;
      }
      
      return acc;
    }, {});

    // Konwersja do formatu odpowiedzi
    const result = Object.values(groupedModels).map((model: any) => ({
      ...model,
      bodyTypes: Array.from(model.bodyTypes).sort(),
      years: Array.from(model.years).sort((a: any, b: any) => b - a)
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
