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
        .select('brand_name, brand_image')
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

    // Usuń duplikaty i przygotuj dane (normalizuj wielkość liter)
    const brandMap = new Map();
    
    allBrands.forEach(brand => {
      // Normalizuj nazwę marki - pierwsza litera wielka, reszta małe
      const normalizedName = brand.brand_name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (!brandMap.has(normalizedName)) {
        brandMap.set(normalizedName, {
          brand_name: normalizedName,
          brand_image: brand.brand_image
        });
      }
    });
    
    // Przygotuj listę marek z Mercedes-Benz na pierwszym miejscu
    const allBrandsList = Array.from(brandMap.values());
    
    // Znajdź Mercedes-Benz i usuń z listy (uwzględnij różne warianty nazwy)
    const mercedesBrand = allBrandsList.find(brand => 
      brand.brand_name.toLowerCase() === 'mercedes-benz' || 
      brand.brand_name.toLowerCase() === 'mercedes benz' ||
      brand.brand_name.toLowerCase() === 'mercedes' ||
      brand.brand_name.toLowerCase().includes('mercedes')
    );
    
    // Usuń Mercedes-Benz z głównej listy jeśli istnieje
    const otherBrands = allBrandsList.filter(brand => 
      brand.brand_name.toLowerCase() !== 'mercedes-benz' && 
      brand.brand_name.toLowerCase() !== 'mercedes benz' &&
      brand.brand_name.toLowerCase() !== 'mercedes' &&
      !brand.brand_name.toLowerCase().includes('mercedes')
    );
    
    // Utwórz finalną listę z Mercedes-Benz na początku
    const finalBrandsList = mercedesBrand ? [mercedesBrand, ...otherBrands] : otherBrands;
    
    const uniqueBrands = finalBrandsList.map((brand, index) => ({
      id: index + 1,
      name: brand.brand_name,
      logo: brand.brand_image || `/images/brands/${brand.brand_name.toLowerCase().replace(/\s+/g, '-')}.png`, // Użyj brand_image lub fallback
      description: `Dywaniki samochodowe dla marki ${brand.brand_name}`,
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