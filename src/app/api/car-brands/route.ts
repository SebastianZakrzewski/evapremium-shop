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
    
    // Debug - sprawdź czy Zhidou jest w danych
    const zhidouBrand = finalBrandsList.find(brand => 
      brand.brand_name.toLowerCase().includes('zhidou')
    );
    if (zhidouBrand) {
      console.log('Zhidou found in database:', zhidouBrand);
    } else {
      console.log('Zhidou NOT found in database');
      // Sprawdź wszystkie marki zawierające 'zhi'
      const zhiBrands = finalBrandsList.filter(brand => 
        brand.brand_name.toLowerCase().includes('zhi')
      );
      console.log('Brands containing "zhi":', zhiBrands);
      
      // Sprawdź wszystkie marki zawierające 'zhidou' (case insensitive)
      const zhidouBrands = finalBrandsList.filter(brand => 
        brand.brand_name.toLowerCase().includes('zhidou')
      );
      console.log('Brands containing "zhidou":', zhidouBrands);
      
      // Sprawdź wszystkie marki zawierające 'zhidou' (case insensitive)
      const zhidouBrands2 = allBrandsList.filter(brand => 
        brand.brand_name.toLowerCase().includes('zhidou')
      );
      console.log('Brands containing "zhidou" in allBrandsList:', zhidouBrands2);
    }
    
    // Lista plików graficznych, które istnieją w katalogu /modele/
    const existingImageFiles = [
      'acura.avif', 'Aixam.png', 'alfa_romeo.jpg', 'aston_martin.avif', 'audi.avif', 'baic.webp', 'bentley.webp', 'bmw.png', 'Bobcat.jpg', 'bugatti.jpg', 'buick.avif', 'byd.webp', 'cadillac.jpeg', 'Case.webp', 'cat.jpg', 'chevrolet.jpg', 'chrysler.jpg', 'citroen.jpg', 'Claas.webp', 'cupra.jpg', 'dacia.jpg', 'DAEWOO.jpg', 'daf.jpg', 'Daihatsu.jpeg', 'deuhtz-far.jpg', 'dodge.avif', 'ds.jpg', 'fendt.webp', 'ferrari.avif', 'fiat.png', 'ford.avif', 'forthing.png', 'forthing.webp', 'genesis.jpeg', 'gmc.jpg', 'hammer.jpeg', 'honda.jpg', 'hyundai.webp', 'ineos.webp', 'infiniti.jpg', 'Isuzu.webp', 'Iveco.jpg', 'Jaecoo.jpg', 'jaguar.avif', 'jeep.avif', 'john-deere.jpg', 'kia.jpg', 'komatsu.webp', 'kubota.jpg', 'lamborghini.webp', 'lancia.jpg', 'land_rover.webp', 'lexus.jpeg', 'lincoln.jpg', 'man.jpg', 'maserati.jpg', 'massey_ferguson.jpg', 'maxus.webp', 'mazda.jpg', 'mclaren.avif', 'mercedes_benz.jpg', 'mercedes_maybach.webp', 'mg.jpg', 'microcar.jpg', 'mini.avif', 'mitsubishi.avif', 'moris-minor.webp', 'new-holland.webp', 'nissan.jpeg', 'nissan.jpg', 'omoda.jpg', 'opel.webp', 'peugeot.webp', 'plymouth.jpg', 'pontiac.avif', 'porsche.jpg', 'renault.jpeg', 'rolls-royce.jpg', 'saab.jpg', 'scania.jpeg', 'seat.webp', 'seres.jpg', 'skoda.jpg', 'skywell.jpg', 'smart.avif', 'ssangyong.avif', 'subaru.webp', 'suzuki.avif', 'tesla.avif', 'toyota.png', 'toyota.webp', 'valtra.jpg', 'volkswagen.jpg', 'volvo.webp', 'XEV.webp', 'Zhidou.webp'
    ];

    const uniqueBrands = finalBrandsList
      .map((brand, index) => ({
        id: index + 1,
        name: brand.brand_name,
        logo: brand.brand_image || `/modele/${brand.brand_name.toLowerCase().replace(/\s+/g, '_')}.jpg`, // Użyj brand_image lub fallback do /modele/
        description: `Dywaniki samochodowe dla marki ${brand.brand_name}`,
        originalName: brand.brand_name
      }))
      .filter(brand => {
        // Sprawdź czy plik graficzny istnieje
        const logoPath = brand.logo;
        const fileName = logoPath.split('/').pop();
        
        // Sprawdź czy plik istnieje w liście dostępnych plików
        const hasImage = existingImageFiles.some(file => 
          file.toLowerCase() === fileName?.toLowerCase() ||
          file.toLowerCase() === brand.originalName.toLowerCase().replace(/\s+/g, '_') + '.jpg' ||
          file.toLowerCase() === brand.originalName.toLowerCase().replace(/\s+/g, '_') + '.png' ||
          file.toLowerCase() === brand.originalName.toLowerCase().replace(/\s+/g, '_') + '.webp' ||
          file.toLowerCase() === brand.originalName.toLowerCase().replace(/\s+/g, '_') + '.avif' ||
          file.toLowerCase() === brand.originalName.toLowerCase().replace(/\s+/g, '_') + '.jpeg'
        );
        
        // Debug dla Zhidou
        if (brand.originalName.toLowerCase().includes('zhidou')) {
          console.log('Zhidou debug:', {
            originalName: brand.originalName,
            logo: brand.logo,
            fileName: fileName,
            hasImage: hasImage
          });
        }
        
        return hasImage;
      });

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