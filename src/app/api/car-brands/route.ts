import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

const supabase = createClient(env.supabase.url, env.supabase.anonKey);

// Typy nadwozia uznawane za samochody osobowe
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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API car-brands: Starting request');
    
    // Pobierz wszystkie marki z tabeli car_models_extended używając paginacji
    let allBrands: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: brands, error } = await supabase
        .from('car_models_extended')
        .select('brand_name, brand_image, body_type')
        .in('body_type', PASSENGER_CAR_BODY_TYPES)
        .range(from, from + pageSize - 1);
        
      if (error) {
        console.error('❌ Błąd podczas pobierania marek:', error);
        return NextResponse.json(
          { error: 'Nie udało się pobrać marek samochodów' },
          { status: 500 }
        );
      }
      
      if (brands.length === 0) {
        hasMore = false;
      } else {
        allBrands = allBrands.concat(brands);
        from += pageSize;
      }
    }
    
    if (allBrands.length === 0) {
      return NextResponse.json([]);
    }

    // Usuń duplikaty i przygotuj dane
    const brandMap = new Map();
    
    allBrands.forEach((brand: any) => {
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
    
    // Konwertuj na listę marek
    const uniqueBrands = Array.from(brandMap.values())
      .map((brand, index) => ({
        id: index + 1,
        name: brand.brand_name,
        logo: brand.brand_image || `/modele/${brand.brand_name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
        description: `Dywaniki samochodowe dla marki ${brand.brand_name}`
      }));

    console.log(`📊 Znaleziono ${allBrands.length} rekordów, ${uniqueBrands.length} unikalnych marek`);

    return NextResponse.json(uniqueBrands);
  } catch (error) {
    console.error('❌ Błąd API car-brands:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}