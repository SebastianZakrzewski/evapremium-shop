/**
 * Skrypt do seedowania zdjęć marek do tabeli car_models_extended w Supabase
 * Mapuje pliki z katalogu public/modele do marek w bazie danych
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

if (!supabaseKey) {
  console.error('❌ Brak klucza Supabase. Ustaw SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapowanie nazw plików do nazw marek w bazie danych (z wielkich liter)
const brandMapping = {
  'acura': 'Acura',
  'alfa_romeo': 'Alfa romeo',
  'aston_martin': 'Aston martin',
  'audi': 'Audi',
  'baic': 'Baic',
  'bentley': 'Bentley',
  'bugatti': 'Bugatti', // Nie istnieje w bazie
  'buick': 'Buick',
  'cadillac': 'Cadillac',
  'chevrolet': 'Chevrolet',
  'chrysler': 'Chrysler',
  'dodge': 'Dodge',
  'ferrari': 'Ferrari',
  'fiat': 'Fiat',
  'ford': 'Ford',
  'genesis': 'Genesis',
  'gmc': 'Gmc',
  'hammer': 'Hummer', // Hammer -> Hummer w bazie
  'honda': 'Honda',
  'hyundai': 'Hyundai',
  'infiniti': 'Infiniti',
  'kia': 'Kia',
  'lamborghini': 'Lamborghini',
  'lancia': 'Lancia',
  'lexus': 'Lexus',
  'lincoln': 'Lincoln',
  'maserati': 'Maserati',
  'mazda': 'Mazda',
  'mini': 'Mini',
  'mitsubishi': 'Mitsubishi',
  'nissan': 'Nissan',
  'pontiac': 'Pontiac',
  'smart': 'Smart',
  'subaru': 'Subaru',
  'suzuki': 'Suzuki',
  'tesla': 'Tesla',
  'toyota': 'Toyota',
  'volkswagen': 'Volkswagen'
};

async function checkBrandImageColumn() {
  try {
    console.log('🔍 Sprawdzam czy kolumna brand_image istnieje...');
    
    // Próbuję pobrać dane z kolumny brand_image
    const { data, error } = await supabase
      .from('car_models_extended')
      .select('brand_image')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('brand_image')) {
        console.log('⚠️  Kolumna brand_image nie istnieje. Dodaję ją...');
        return false;
      }
      throw error;
    }

    console.log('✅ Kolumna brand_image istnieje');
    return true;
  } catch (error) {
    console.log('⚠️  Nie można sprawdzić kolumny. Próbuję dodać...');
    return false;
  }
}

async function addBrandImageColumn() {
  try {
    console.log('🔧 Nie można dodać kolumny przez API. Wykonaj SQL w Supabase Dashboard:');
    console.log('');
    console.log('ALTER TABLE car_models_extended ADD COLUMN IF NOT EXISTS brand_image VARCHAR(500);');
    console.log('');
    console.log('Następnie uruchom ponownie ten skrypt.');
    return false;
  } catch (error) {
    console.error('❌ Błąd podczas dodawania kolumny:', error);
    return false;
  }
}

async function getAvailableBrands() {
  try {
    console.log('📋 Pobieram dostępne marki z bazy danych...');
    
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
        throw error;
      }
      
      if (brands.length === 0) {
        hasMore = false;
      } else {
        allBrands = allBrands.concat(brands);
        from += pageSize;
      }
    }

    const uniqueBrands = [...new Set(allBrands.map(b => b.brand_name))];
    console.log(`✅ Znaleziono ${uniqueBrands.length} unikalnych marek`);
    return uniqueBrands;
  } catch (error) {
    console.error('❌ Błąd podczas pobierania marek:', error);
    throw error;
  }
}

async function getImageFiles() {
  try {
    console.log('📁 Pobieram listę plików graficznych...');
    
    const modeleDir = path.join(process.cwd(), 'public', 'modele');
    
    if (!fs.existsSync(modeleDir)) {
      throw new Error(`Katalog ${modeleDir} nie istnieje!`);
    }

    const files = fs.readdirSync(modeleDir)
      .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
      .map(file => {
        const nameWithoutExt = path.parse(file).name;
        return {
          filename: file,
          brandKey: nameWithoutExt,
          url: `/modele/${file}`
        };
      });

    console.log(`✅ Znaleziono ${files.length} plików graficznych`);
    return files;
  } catch (error) {
    console.error('❌ Błąd podczas pobierania plików:', error);
    throw error;
  }
}

async function updateBrandImages() {
  try {
    console.log('🚀 Rozpoczynam aktualizację zdjęć marek...');
    
    // Sprawdź czy kolumna istnieje
    const columnExists = await checkBrandImageColumn();
    if (!columnExists) {
      await addBrandImageColumn();
    }

    // Pobierz dostępne marki i pliki
    const [availableBrands, imageFiles] = await Promise.all([
      getAvailableBrands(),
      getImageFiles()
    ]);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const imageFile of imageFiles) {
      const brandName = brandMapping[imageFile.brandKey];
      
      if (!brandName) {
        console.log(`⚠️  Nie znaleziono mapowania dla: ${imageFile.brandKey}`);
        notFoundCount++;
        continue;
      }

      if (!availableBrands.includes(brandName)) {
        console.log(`⚠️  Marka ${brandName} nie istnieje w bazie danych`);
        notFoundCount++;
        continue;
      }

      try {
        const { error } = await supabase
          .from('car_models_extended')
          .update({ brand_image: imageFile.url })
          .eq('brand_name', brandName);

        if (error) {
          console.error(`❌ Błąd podczas aktualizacji ${brandName}:`, error);
          skippedCount++;
        } else {
          console.log(`✅ Zaktualizowano ${brandName} -> ${imageFile.url}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Błąd podczas aktualizacji ${brandName}:`, error);
        skippedCount++;
      }
    }

    console.log('\n📊 Podsumowanie:');
    console.log(`✅ Zaktualizowano: ${updatedCount} marek`);
    console.log(`⚠️  Pominięto: ${skippedCount} marek`);
    console.log(`❌ Nie znaleziono: ${notFoundCount} marek`);
    console.log(`📁 Przetworzono: ${imageFiles.length} plików`);

    return { updatedCount, skippedCount, notFoundCount };
  } catch (error) {
    console.error('❌ Błąd podczas aktualizacji zdjęć marek:', error);
    throw error;
  }
}

async function verifyUpdates() {
  try {
    console.log('🔍 Weryfikuję aktualizacje...');
    
    const { data: brandsWithImages, error } = await supabase
      .from('car_models_extended')
      .select('brand_name, brand_image')
      .not('brand_image', 'is', null)
      .order('brand_name');

    if (error) {
      throw error;
    }

    const uniqueBrandsWithImages = [...new Set(brandsWithImages.map(b => b.brand_name))];
    
    console.log(`✅ ${uniqueBrandsWithImages.length} marek ma przypisane zdjęcia:`);
    uniqueBrandsWithImages.forEach(brand => {
      const brandData = brandsWithImages.find(b => b.brand_name === brand);
      console.log(`  - ${brand}: ${brandData.brand_image}`);
    });

    return uniqueBrandsWithImages.length;
  } catch (error) {
    console.error('❌ Błąd podczas weryfikacji:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Rozpoczynam seedowanie zdjęć marek...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  try {
    const result = await updateBrandImages();
    const verifiedCount = await verifyUpdates();
    
    console.log('\n🎉 Seedowanie zakończone pomyślnie!');
    console.log(`📊 Łącznie ${verifiedCount} marek ma przypisane zdjęcia`);
  } catch (error) {
    console.error('💥 Seedowanie nie powiodło się:', error);
    process.exit(1);
  }
}

// Uruchom skrypt
if (require.main === module) {
  main();
}

module.exports = {
  updateBrandImages,
  verifyUpdates,
  brandMapping
};
