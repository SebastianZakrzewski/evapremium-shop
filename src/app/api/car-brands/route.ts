import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Pobierz unikalne marki z tabeli car_models_extended
    const { data: brands, error } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .order('brand_name');

    if (error) {
      console.error('Błąd podczas pobierania marek:', error);
      return NextResponse.json(
        { error: 'Nie udało się pobrać marek samochodów' },
        { status: 500 }
      );
    }

    // Usuń duplikaty i przygotuj dane
    const uniqueBrands = Array.from(
      new Set(brands.map(brand => brand.brand_name))
    ).map((brandName, index) => ({
      id: index + 1,
      name: brandName,
      logo: `/images/brands/${brandName.toLowerCase().replace(/\s+/g, '-')}.png`, // Domyślna ścieżka do logo
      description: `Dywaniki samochodowe dla marki ${brandName}`,
    }));

    return NextResponse.json(uniqueBrands);
  } catch (error) {
    console.error('Błąd API:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}