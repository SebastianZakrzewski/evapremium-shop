import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/config/env';
import { MatService } from '@/lib/services/MatService';

export const maxDuration = 30
import { resolveBrandLogo } from '@/shared/brands';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);
const matService = new MatService();

// Schema walidacji parametrów zapytania
const QueryParamsSchema = z.object({
  q: z.string().min(1, 'Query parameter is required').max(100),
});

// Typy nadwozia uznawane za samochody osobowe (te same co w car-brands)
const PASSENGER_CAR_BODY_TYPES = [
  'sedan',
  'hatchback',
  'hatchback 3drzwi',
  'hatchback 5drzwi',
  'hatchback 3/5drzwi',
  'hatchback 2drzwi',
  'coupe',
  'roadster',
  'cabrio',
  'cabriolet',
  'fastback',
  'liftback',
  'kombi',
  'kombi/ sedan',
  'kombi (touring)',
  'liftback/kombi',
  'sedan, kombi',
  'kombi/coupe/ sedan',
  'shooting brake',
  'targa',
  'SUV',
  'SUV 5os.',
  'SUV 7os.',
  'SUV 5/7os.',
  'SUV 6os.',
  'SUV 6/7os',
  'SUVcoupe',
  'SUV coupe',
  'crossover',
  'minivan',
  'minivan 5os.',
  'minivan 7os.',
  'minivan 8os.',
  'kombivan',
  'kombivan 7os.',
  'kombi / hatchback 5 drzwi',
  'hatchback/ kombi/sedan',
  'hatchback 3 drzwi',
  'hatchback 5 drzwi',
  'cabrio/ hatchback 3drzwi',
  'Liftback'
];

interface SearchResult {
  brands: Array<{
    id: number;
    name: string;
    logo: string;
    description: string;
  }>;
  models: Array<{
    brand: string;
    model: string;
    bodyTypes: string[];
    isCurrentlyProduced: boolean;
  }>;
  products: Array<{
    id: string;
    carBrandSlug: string;
    carModelSlug: string;
    generation?: string;
    bodyType?: string;
    basePrice: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({
        brands: [],
        models: [],
        products: []
      });
    }

    // Walidacja parametrów
    const validatedParams = QueryParamsSchema.parse({ q: query });
    const searchTerm = validatedParams.q.toLowerCase().trim();

    console.log('🔍 API /api/search: Searching for:', searchTerm);

    const results: SearchResult = {
      brands: [],
      models: [],
      products: []
    };

    // 1. Wyszukiwanie marek
    try {
      const { data: brandsData, error: brandsError } = await supabase
        .from('car_models_extended')
        .select('brand_name, brand_image, body_type')
        .in('body_type', PASSENGER_CAR_BODY_TYPES)
        .ilike('brand_name', `%${searchTerm}%`)
        .limit(100);

      if (!brandsError && brandsData) {
        // Usuń duplikaty marek
        const brandMap = new Map<string, { brand_name: string; brand_image: string | null }>();
        
        brandsData.forEach((brand: any) => {
          const normalizedName = brand.brand_name
            .toLowerCase()
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          if (!brandMap.has(normalizedName)) {
            brandMap.set(normalizedName, {
              brand_name: normalizedName,
              brand_image: brand.brand_image
            });
          }
        });

        results.brands = Array.from(brandMap.values())
          .slice(0, 10)
          .map((brand, index) => ({
            id: index + 1,
            name: brand.brand_name,
            logo: resolveBrandLogo(brand.brand_name, brand.brand_image),
            description: `Dywaniki samochodowe dla marki ${brand.brand_name}`
          }));
      }
    } catch (error) {
      console.warn('⚠️ Error searching brands:', error);
    }

    // 2. Wyszukiwanie modeli
    try {
      const { data: modelsData, error: modelsError } = await supabase
        .from('car_models_extended')
        .select('brand_name, model_name, body_type, is_currently_produced')
        .in('body_type', PASSENGER_CAR_BODY_TYPES)
        .or(`brand_name.ilike.%${searchTerm}%,model_name.ilike.%${searchTerm}%`)
        .limit(100);

      if (!modelsError && modelsData) {
        // Grupuj modele po marce i nazwie
        const modelMap = new Map<string, {
          brand: string;
          model: string;
          bodyTypes: Set<string>;
          isCurrentlyProduced: boolean;
        }>();

        modelsData.forEach((item: any) => {
          const key = `${item.brand_name}-${item.model_name}`;
          
          if (!modelMap.has(key)) {
            modelMap.set(key, {
              brand: item.brand_name,
              model: item.model_name,
              bodyTypes: new Set(),
              isCurrentlyProduced: item.is_currently_produced || false
            });
          }
          
          if (item.body_type) {
            modelMap.get(key)!.bodyTypes.add(item.body_type);
          }
        });

        results.models = Array.from(modelMap.values())
          .slice(0, 10)
          .map(model => ({
            brand: model.brand,
            model: model.model,
            bodyTypes: Array.from(model.bodyTypes).sort(),
            isCurrentlyProduced: model.isCurrentlyProduced
          }));
      }
    } catch (error) {
      console.warn('⚠️ Error searching models:', error);
    }

    // 3. Wyszukiwanie produktów (dywaników)
    try {
      const allMats = await matService.getAvailableMats({ isActive: true });
      
      // Filtruj produkty po nazwie marki lub modelu
      const filteredMats = allMats.filter(mat => {
        const brandMatch = mat.carBrandSlug.toLowerCase().includes(searchTerm);
        const modelMatch = mat.carModelSlug.toLowerCase().includes(searchTerm);
        return brandMatch || modelMatch;
      });

      results.products = filteredMats
        .slice(0, 10)
        .map(mat => ({
          id: mat.id,
          carBrandSlug: mat.carBrandSlug,
          carModelSlug: mat.carModelSlug,
          generation: mat.generation,
          bodyType: mat.bodyType,
          basePrice: mat.basePrice
        }));
    } catch (error) {
      console.warn('⚠️ Error searching products:', error);
    }

    console.log(`✅ API /api/search: Found ${results.brands.length} brands, ${results.models.length} models, ${results.products.length} products`);

    return NextResponse.json(results);
  } catch (error) {
    console.error('❌ API /api/search error:', error);
    
    // Jeśli błąd walidacji, zwróć pusty wynik
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        brands: [],
        models: [],
        products: []
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}

