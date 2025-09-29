import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Pobierz wszystkie marki z tabeli car_models_extended używając paginacji
    let allBrands = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: brands, error } = await supabase
        .from('car_models_extended')
        .select('brand_name')
        .order('brand_name')
        .range(from, from + pageSize - 1);
        
      if (error) {
        console.error('Błąd podczas pobierania marek:', error);
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

    // Usuń duplikaty i przygotuj dane
    const uniqueBrands = Array.from(
      new Set(allBrands.map(brand => brand.brand_name))
    ).map((brandName, index) => ({
      id: index + 1,
      name: brandName,
      logo: `/images/brands/${brandName.toLowerCase().replace(/\s+/g, '-')}.png`, // Domyślna ścieżka do logo
      description: `Dywaniki samochodowe dla marki ${brandName}`,
    }));

    const response = NextResponse.json(uniqueBrands);
    
    // Dodaj nagłówki cache-busting
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Błąd API:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}