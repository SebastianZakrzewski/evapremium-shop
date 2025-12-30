import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/config/env';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

const stringParam = z.preprocess((val) => (val === null ? undefined : val), z.string().optional());
const numberParam = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") {
    return undefined;
  }
  const parsed = parseInt(String(val), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}, z.number().optional());

// Schema walidacji parametrów zapytania
const QueryParamsSchema = z.object({
  brand: stringParam,
  model: stringParam,
  year: numberParam,
  generation: stringParam,
  bodyType: stringParam,
}).passthrough();

/**
 * Konwertuje nazwę marki na slug dla zapytań do bazy danych
 * np. "Dacia" -> "dacia", "Mercedes-Benz" -> "mercedes-benz"
 */
function brandNameToSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Konwertuje nazwę modelu na slug dla zapytań do bazy danych
 * np. "Spring" -> "spring", "A4 B9" -> "a4-b9"
 */
function modelNameToSlug(modelName: string): string {
  return modelName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export interface MatProductImage {
  id: number;
  car_brand_slug: string;
  car_model_slug: string;
  generation: string | null;
  year: number | null;
  body_type: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      brand: searchParams.get('brand'),
      model: searchParams.get('model'),
      year: searchParams.get('year'),
      generation: searchParams.get('generation'),
      bodyType: searchParams.get('bodyType'),
    };

    console.log('🔍 API /api/mat-product-images: Fetching images with params:', queryParams);

    // Walidacja parametrów
    const validatedParams = QueryParamsSchema.parse(queryParams);

    // Budowanie zapytania
    let query = supabase
      .from('mat_product_images')
      .select('*')
      .eq('is_active', true);

    // Dodawanie filtrów
    if (validatedParams.brand) {
      const brandSlug = brandNameToSlug(validatedParams.brand);
      query = query.eq('car_brand_slug', brandSlug);
      console.log(`🔍 API /api/mat-product-images: Filtering by brand_slug: "${brandSlug}" (from "${validatedParams.brand}")`);
    }

    if (validatedParams.model) {
      const modelSlug = modelNameToSlug(validatedParams.model);
      query = query.eq('car_model_slug', modelSlug);
      console.log(`🔍 API /api/mat-product-images: Filtering by model_slug: "${modelSlug}" (from "${validatedParams.model}")`);
    }

    if (validatedParams.year) {
      query = query.eq('year', validatedParams.year);
      console.log(`🔍 API /api/mat-product-images: Filtering by year: ${validatedParams.year}`);
    }

    if (validatedParams.generation) {
      query = query.eq('generation', validatedParams.generation);
      console.log(`🔍 API /api/mat-product-images: Filtering by generation: "${validatedParams.generation}"`);
    }

    // Zapisz query przed dodaniem bodyType (na wypadek fallback)
    const queryWithoutBodyType = query;

    if (validatedParams.bodyType) {
      query = query.eq('body_type', validatedParams.bodyType.toLowerCase());
      console.log(`🔍 API /api/mat-product-images: Filtering by body_type: "${validatedParams.bodyType}"`);
    }

    // Sortowanie po sort_order, potem po year
    query = query.order('sort_order', { ascending: true });
    query = query.order('year', { ascending: true });

    let { data, error } = await query;

    // Jeśli nie znaleziono zdjęć z bodyType, spróbuj bez bodyType (fallback)
    if ((!data || data.length === 0) && validatedParams.bodyType && validatedParams.brand && validatedParams.model) {
      console.log(`⚠️ API /api/mat-product-images: No images found with bodyType="${validatedParams.bodyType}", trying without bodyType filter`);
      
      let fallbackQuery = queryWithoutBodyType
        .order('sort_order', { ascending: true })
        .order('year', { ascending: true });
      
      const fallbackResult = await fallbackQuery;
      
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        console.log(`✅ API /api/mat-product-images: Found ${fallbackResult.data.length} images without bodyType filter`);
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
    }

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania zdjęć produktów', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ API /api/mat-product-images: Found ${data?.length || 0} images`);

    return NextResponse.json({
      images: (data as MatProductImage[]) || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('❌ API /api/mat-product-images: Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Nieprawidłowe parametry zapytania', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

