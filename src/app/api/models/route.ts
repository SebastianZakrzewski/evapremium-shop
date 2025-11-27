import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/config/env';
import { humanizeBrandSlug, mapSlugToCanonicalBrand } from '@/shared/brands/brandNormalizer';

// Debug: loguj konfigurację Supabase przy inicjalizacji modułu
if (typeof window === 'undefined') {
  console.log('🔍 API /api/models: Module loaded, Supabase config:', {
    url: env.supabase.url?.substring(0, 40) + '...',
    hasKey: !!env.supabase.anonKey,
    keyLength: env.supabase.anonKey?.length || 0,
  });
}

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

const stringParam = z.preprocess((val) => (val === null ? undefined : val), z.string().optional());

const numberParam = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") {
    return undefined;
  }
  const parsed = parseInt(String(val), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}, z.number().optional());

const booleanParam = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") {
    return undefined;
  }
  return String(val) === "true";
}, z.boolean().optional());

// Schema walidacji parametrów zapytania
const QueryParamsSchema = z.object({
  brand: stringParam,
  bodyType: stringParam,
  yearFrom: numberParam,
  yearTo: numberParam,
  isCurrentlyProduced: booleanParam,
}).passthrough();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      brand: searchParams.get('brand'),
      bodyType: searchParams.get('bodyType'),
      yearFrom: searchParams.get('yearFrom'),
      yearTo: searchParams.get('yearTo'),
      isCurrentlyProduced: searchParams.get('isCurrentlyProduced'),
    };

    console.log('🔍 API /api/models: Fetching models with params:', queryParams);

    // Walidacja parametrów
    const validatedParams = QueryParamsSchema.parse(queryParams);

    const requestedBrand = validatedParams.brand?.trim() || "";
    const canonicalBrandName = requestedBrand ? mapSlugToCanonicalBrand(requestedBrand) : null;
    const brandNameForDb = requestedBrand
      ? canonicalBrandName ?? humanizeBrandSlug(requestedBrand)
      : null;
    const brandFilterValue = requestedBrand ? (brandNameForDb || requestedBrand) : "";

    // Budowanie zapytania
    // UWAGA: order() musi być wywołane PO wszystkich filtrach w Supabase!
    let query = supabase
      .from('car_models_extended')
      .select('brand_name, model_name, generation, body_type, year_from, year_to, is_currently_produced');

    // Dodawanie filtrów
    if (requestedBrand) {
      console.log(`🔍 API /api/models: Searching for brand: "${requestedBrand}"`);
      console.log(`🔍 API /api/models: Canonical brand: "${canonicalBrandName ?? "N/A"}"`);
      console.log(`🔍 API /api/models: Final brand_name used: "${brandNameForDb}"`);
      
      query = query.eq('brand_name', brandNameForDb!);
      
      console.log(`🔍 API /api/models: Using eq query for brand_name: "${brandNameForDb}"`);
      console.log(`🔍 API /api/models: Query builder before execution:`, {
        table: 'car_models_extended',
        select: 'brand_name, model_name, generation, body_type, year_from, year_to, is_currently_produced',
        filter: `brand_name = "${brandNameForDb}"`,
      });
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

    // Dodaj sortowanie PO wszystkich filtrach
    // Jeśli filtrujemy po marce, sortowanie po brand_name jest zbędne (wszystkie wyniki mają tę samą markę)
    if (validatedParams.brand) {
      // Sortuj tylko po nazwie modelu gdy filtrujemy po marce
      query = query.order('model_name', { ascending: true });
    } else {
      // Sortuj po marce i modelu gdy nie ma filtra marki
      query = query.order('brand_name', { ascending: true })
                    .order('model_name', { ascending: true });
    }

    console.log(`🔍 API /api/models: Executing query with filters:`, {
      brand: validatedParams.brand,
      bodyType: validatedParams.bodyType,
      yearFrom: validatedParams.yearFrom,
      yearTo: validatedParams.yearTo,
    });
    
    // Debug: sprawdź czy Supabase client jest poprawnie skonfigurowany
    console.log(`🔍 API /api/models: Supabase URL: ${env.supabase.url.substring(0, 30)}...`);
    console.log(`🔍 API /api/models: Supabase key exists: ${!!env.supabase.anonKey}`);

    // Wykonaj zapytanie
    const { data, error } = await query;
    
    // Debug: loguj dokładnie co zwraca Supabase
    console.log(`🔍 API /api/models: Supabase response:`, {
      hasData: !!data,
      dataLength: data?.length || 0,
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
    });
    
    // Jeśli jest błąd, zwróć go natychmiast
    if (error) {
      console.error('❌ API /api/models: Supabase error occurred!');
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Jeśli tabela nie istnieje lub brak uprawnień, zwróć pustą tablicę zamiast błędu
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist') || error.message.includes('permission denied')) {
        console.warn('⚠️ Table car_models_extended may not exist or be accessible, returning empty array');
        return NextResponse.json([]);
      }
      
      return NextResponse.json(
        { error: `Błąd podczas pobierania modeli: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Sprawdź czy są dane
    if (data && data.length > 0) {
      console.log(`✅ API /api/models: Query successful! Received ${data.length} rows`);
      console.log(`📊 API /api/models: First row sample:`, JSON.stringify(data[0], null, 2));
    } else if (data && Array.isArray(data) && data.length === 0) {
      console.warn(`⚠️ API /api/models: Query returned empty array - no data found`);
      console.warn(`⚠️ API /api/models: Query params were:`, {
        brand: validatedParams.brand,
        mappedBrand: brandNameForDb,
      });
    } else if (!data) {
      console.error(`❌ API /api/models: Data is null or undefined`);
    } else {
      console.error(`❌ API /api/models: Data is not an array:`, typeof data, data);
    }

    console.log(`📊 API /api/models: Query returned ${data?.length || 0} rows`);
    
    // WAŻNE: Sprawdź czy dane są dostępne przed zwróceniem pustej tablicy
    if (!data) {
      console.error(`❌ API /api/models: Data is null or undefined!`);
      return NextResponse.json([]);
    }
    
    if (data.length === 0) {
      console.warn(`⚠️ API /api/models: Data array is empty!`);
      console.log('ℹ️ API /api/models: No models found for params:', validatedParams);
      console.log('ℹ️ API /api/models: This should not happen if brand exists in database!');
      
      // TEST: Spróbuj bezpośredniego zapytania bez filtrów aby sprawdzić czy Supabase działa
      console.log('🔍 API /api/models: Testing direct Supabase query...');
      const { data: testData, error: testError } = await supabase
        .from('car_models_extended')
        .select('brand_name, model_name')
        .eq('brand_name', brandFilterValue)
        .limit(5);
      
      console.log('🔍 API /api/models: Direct test query result:', {
        hasData: !!testData,
        dataLength: testData?.length || 0,
        hasError: !!testError,
        errorMessage: testError?.message,
      });
      
      if (testData && testData.length > 0) {
        console.log('✅ API /api/models: Direct query works! Sample:', testData[0]);
        console.error('❌ API /api/models: BUT main query returned empty! This is a bug!');
      }
      
      // Jeśli szukamy po marce, sprawdź jakie marki są dostępne w bazie
      if (requestedBrand) {
        const normalizedBrand = requestedBrand;
        const mappedBrand = brandNameForDb || normalizedBrand;
        
        console.log(`🔍 API /api/models: Checking available brands for debugging...`);
        
        const { data: sampleBrands, error: brandsError } = await supabase
          .from('car_models_extended')
          .select('brand_name')
          .limit(50);
        
        if (brandsError) {
          console.error('❌ API /api/models: Error fetching sample brands:', brandsError);
        } else {
          const uniqueBrands = [...new Set(sampleBrands?.map((b: any) => b.brand_name) || [])].sort();
          console.log(`📊 API /api/models: Available brand names in database (${uniqueBrands.length}):`, uniqueBrands);
          console.log(`🔍 API /api/models: Searched for: "${normalizedBrand}", mapped to: "${mappedBrand}"`);
          
          // Sprawdź czy zmapowana nazwa istnieje w bazie
          const brandExists = uniqueBrands.some(b => b.toLowerCase() === mappedBrand.toLowerCase());
          if (!brandExists) {
            console.warn(`⚠️ API /api/models: Mapped brand "${mappedBrand}" not found in database!`);
            console.warn(`⚠️ API /api/models: Available brands: ${uniqueBrands.join(', ')}`);
            
            // Spróbuj znaleźć podobną nazwę
            const similarBrand = uniqueBrands.find(b => 
              b.toLowerCase().includes(mappedBrand.toLowerCase()) || 
              mappedBrand.toLowerCase().includes(b.toLowerCase())
            );
            if (similarBrand) {
              console.warn(`💡 API /api/models: Found similar brand: "${similarBrand}"`);
            }
          } else {
            console.log(`✅ API /api/models: Brand "${mappedBrand}" exists in database, but query returned no results`);
            
            // Spróbuj bezpośrednie zapytanie z eq zamiast ilike
            const { data: directData, error: directError } = await supabase
              .from('car_models_extended')
              .select('brand_name, model_name')
              .eq('brand_name', mappedBrand)
              .limit(5);
            
            if (directError) {
              console.error('❌ API /api/models: Direct query error:', directError);
            } else {
              console.log(`🔍 API /api/models: Direct query with eq returned ${directData?.length || 0} rows`);
              if (directData && directData.length > 0) {
                console.log(`📊 API /api/models: Direct query sample:`, directData[0]);
              }
            }
          }
        }
      }
      
      return NextResponse.json([]);
    }

    console.log(`✅ API /api/models: Found ${data.length} models`);
    if (data.length > 0) {
      const uniqueBrands = [...new Set(data.map((item: any) => item.brand_name))];
      console.log(`📊 Unique brands in results: ${uniqueBrands.join(', ')}`);
    }

    // Grupowanie modeli po marce i nazwie
    const groupedModels = data.reduce((acc: any, item: any) => {
      const key = `${item.brand_name}-${item.model_name}`;
      
      if (!acc[key]) {
        acc[key] = {
          brand: item.brand_name,
          model: item.model_name,
          generations: [],
          bodyTypes: new Set(),
          years: new Set(),
          isCurrentlyProduced: false
        };
      }
      
      // Dodaj generację
      acc[key].generations.push({
        generation: item.generation,
        bodyType: item.body_type,
        yearFrom: item.year_from,
        yearTo: item.year_to,
        isCurrentlyProduced: item.is_currently_produced
      });
      
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
      
      // Ustaw flagę czy jest produkowany
      if (item.is_currently_produced) {
        acc[key].isCurrentlyProduced = true;
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
    console.error('❌ API error:', error);
    
    // Jeśli błąd walidacji lub inny, zwróć pustą tablicę zamiast błędu 500
    if (error instanceof z.ZodError) {
      console.warn('⚠️ Validation error, returning empty array');
      return NextResponse.json([]);
    }
    
    // Jeśli problem z tabelą, zwróć pustą tablicę
    if (error instanceof Error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
      console.warn('⚠️ Table may not exist, returning empty array');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}
