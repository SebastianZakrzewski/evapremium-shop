import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const maxDuration = 30
import { env } from '@/config/env';
import { humanizeBrandSlug, mapApiNameToDbName, mapSlugToCanonicalBrand } from '@/shared/brands/brandNormalizer';
import {
  CAR_MODELS_EXTENDED_SELECT,
  CAR_MODELS_EXTENDED_SELECT_MINIMAL,
} from '@/lib/validators/car-models-extended';

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
      ? (canonicalBrandName ? mapApiNameToDbName(canonicalBrandName) ?? canonicalBrandName : humanizeBrandSlug(requestedBrand))
      : null;
    const brandFilterValue = requestedBrand ? (brandNameForDb || requestedBrand) : "";

    // Budowanie zapytania – ilike dla brand_name (case-insensitive: BMW/Bmw/bmw w DB)
    const buildQuery = (selectColumns: string) => {
      let q = supabase.from('car_models_extended').select(selectColumns);
      if (requestedBrand) q = q.ilike('brand_name', brandNameForDb!);
      if (validatedParams.bodyType) q = q.eq('body_type', validatedParams.bodyType);
      if (validatedParams.yearFrom) q = q.gte('year_from', validatedParams.yearFrom);
      if (validatedParams.yearTo) q = q.lte('year_to', validatedParams.yearTo);
      if (validatedParams.isCurrentlyProduced !== undefined) {
        q = q.eq('is_currently_produced', validatedParams.isCurrentlyProduced);
      }
      if (validatedParams.brand) {
        q = q.order('model_name', { ascending: true });
      } else {
        q = q.order('brand_name', { ascending: true }).order('model_name', { ascending: true });
      }
      return q;
    };

    let query = buildQuery(CAR_MODELS_EXTENDED_SELECT);

    console.log(`🔍 API /api/models: Executing query with filters:`, {
      requestedBrand,
      canonicalBrandName,
      brandNameForDb,
      bodyType: validatedParams.bodyType,
      yearFrom: validatedParams.yearFrom,
      yearTo: validatedParams.yearTo,
    });
    
    // Debug: sprawdź czy Supabase client jest poprawnie skonfigurowany
    console.log(`🔍 API /api/models: Supabase URL: ${env.supabase.url.substring(0, 30)}...`);
    console.log(`🔍 API /api/models: Supabase key exists: ${!!env.supabase.anonKey}`);

    // Wykonaj zapytanie – fallback na minimalny SELECT jeśli kolumny rozszerzone nie istnieją
    let queryResult = await query;
    let { data, error } = queryResult;

    if (error && (error.message?.includes('column') || error.message?.includes('does not exist'))) {
      console.warn('⚠️ API /api/models: Extended columns not found, falling back to minimal select');
      queryResult = await buildQuery(CAR_MODELS_EXTENDED_SELECT_MINIMAL);
      data = queryResult.data;
      error = queryResult.error;
    }

    if (error) {
      console.error('❌ API /api/models: Supabase error occurred!');
      console.error('Error details:', JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
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
        .ilike('brand_name', brandFilterValue)
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
              .ilike('brand_name', mappedBrand)
              .limit(5);
            
            if (directError) {
              console.error('❌ API /api/models: Direct query error:', directError);
            } else {
              console.log(`🔍 API /api/models: Direct query with ilike returned ${directData?.length || 0} rows`);
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
    const dataList = Array.isArray(data) ? (data as unknown[]) : [];
    const groupedModels = dataList.reduce((acc: Record<string, {
      brand: string;
      model: string;
      brandImage?: string | null;
      modelImage?: string | null;
      vehicleCategory?: string | null;
      generations: Array<{
        generation: string | null;
        bodyType: string | null;
        yearFrom: number | null;
        yearTo: number | null;
        isCurrentlyProduced: boolean | null;
        templateAvailable?: boolean | null;
        templateLocation?: string | null;
        stoperType?: string | null;
        stoperCount?: number | null;
        notesGeneral?: string | null;
        notesFront?: string | null;
        notesRear?: string | null;
        notesTrunk?: string | null;
        hasHookMount?: boolean | null;
        matFormat?: string | null;
        completeness?: string | null;
        hasTunnelMat?: boolean | null;
        velcroNotes?: string | null;
      }>;
      bodyTypes: Set<string>;
      years: Set<number>;
      isCurrentlyProduced: boolean;
    }>, item: unknown) => {
      const row = item as Record<string, unknown>;
      const key = `${row.brand_name}-${row.model_name}`;

      if (!acc[key]) {
        acc[key] = {
          brand: row.brand_name as string,
          model: row.model_name as string,
          brandImage: (row.brand_image as string | null) ?? null,
          modelImage: (row.model_image as string | null) ?? null,
          vehicleCategory: (row.vehicle_category as string | null) ?? null,
          generations: [],
          bodyTypes: new Set(),
          years: new Set(),
          isCurrentlyProduced: false,
        };
      }

      acc[key].generations.push({
        generation: row.generation as string | null,
        bodyType: row.body_type as string | null,
        yearFrom: row.year_from as number | null,
        yearTo: row.year_to as number | null,
        isCurrentlyProduced: row.is_currently_produced as boolean | null,
        templateAvailable: row.template_available as boolean | null | undefined,
        templateLocation: row.template_location as string | null | undefined,
        stoperType: row.stoper_type as string | null | undefined,
        stoperCount: row.stoper_count as number | null | undefined,
        notesGeneral: row.notes_general as string | null | undefined,
        notesFront: row.notes_front as string | null | undefined,
        notesRear: row.notes_rear as string | null | undefined,
        notesTrunk: row.notes_trunk as string | null | undefined,
        hasHookMount: row.has_hook_mount as boolean | null | undefined,
        matFormat: row.mat_format as string | null | undefined,
        completeness: row.completeness as string | null | undefined,
        hasTunnelMat: row.has_tunnel_mat as boolean | null | undefined,
        velcroNotes: row.velcro_notes as string | null | undefined,
      });

      if (row.body_type) {
        acc[key].bodyTypes.add(row.body_type as string);
      }
      // Pełny zakres lat generacji (np. 2001–2008 → 2001, 2002, …, 2008)
      const yFrom = row.year_from as number | null;
      const yTo = row.year_to as number | null;
      if (yFrom != null && yTo != null) {
        for (let y = yFrom; y <= yTo; y++) acc[key].years.add(y);
      } else if (yFrom != null) {
        acc[key].years.add(yFrom);
      } else if (yTo != null) {
        acc[key].years.add(yTo);
      }
      if (row.is_currently_produced) {
        acc[key].isCurrentlyProduced = true;
      }

      return acc;
    }, {});

    // Konwersja do formatu odpowiedzi
    const response = Object.values(groupedModels).map((model) => ({
      brand: model.brand,
      model: model.model,
      brandImage: model.brandImage,
      modelImage: model.modelImage,
      vehicleCategory: model.vehicleCategory,
      bodyTypes: Array.from(model.bodyTypes).sort(),
      years: Array.from(model.years).sort((a, b) => b - a),
      isCurrentlyProduced: model.isCurrentlyProduced,
      generations: model.generations,
    }));

    return NextResponse.json(response);
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
