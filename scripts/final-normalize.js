const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalNormalize() {
  console.log('🚀 Finalna normalizacja marek...');

  try {
    // 1. Pobierz wszystkie unikalne nazwy marek
    const { data: brandsData, error: brandsError } = await supabase
      .from('car_models_extended')
      .select('brand_name');

    if (brandsError) {
      console.error('❌ Błąd podczas pobierania marek:', brandsError);
      return;
    }

    const uniqueBrands = [...new Set(brandsData.map(b => b.brand_name))];
    console.log(`📊 Znaleziono ${uniqueBrands.length} unikalnych marek`);

    // 2. Zidentyfikuj duplikaty (różne wielkości liter)
    const brandGroups = new Map();
    
    uniqueBrands.forEach(brand => {
      const key = brand.toLowerCase();
      if (!brandGroups.has(key)) {
        brandGroups.set(key, []);
      }
      brandGroups.get(key).push(brand);
    });

    const duplicates = Array.from(brandGroups.entries()).filter(([key, brands]) => brands.length > 1);
    console.log(`🔍 Znaleziono ${duplicates.length} grup duplikatów`);

    // 3. Dla każdej grupy duplikatów, wybierz najlepszą wersję
    const normalizationMap = new Map();
    
    duplicates.forEach(([key, brands]) => {
      console.log(`\n📝 Grupa: ${key}`);
      brands.forEach(brand => console.log(`  - "${brand}"`));
      
      // Wybierz najlepszą wersję (pierwsza litera wielka, reszta mała)
      let bestVersion = brands.find(b => 
        b.charAt(0) === b.charAt(0).toUpperCase() && 
        b.slice(1) === b.slice(1).toLowerCase()
      );
      
      // Jeśli nie ma idealnej, wybierz najkrótszą
      if (!bestVersion) {
        bestVersion = brands.reduce((shortest, current) => 
          current.length < shortest.length ? current : shortest
        );
      }
      
      console.log(`  ✅ Wybrano: "${bestVersion}"`);
      
      // Dodaj mapowanie dla wszystkich wersji
      brands.forEach(brand => {
        if (brand !== bestVersion) {
          normalizationMap.set(brand, bestVersion);
        }
      });
    });

    console.log(`\n📝 Znaleziono ${normalizationMap.size} marek do normalizacji`);
    normalizationMap.forEach((to, from) => console.log(`🔄 ${from} → ${to}`));

    // 4. Zaktualizuj bazę danych
    for (const [from, to] of normalizationMap) {
      console.log(`\n🔄 Aktualizuję ${from} → ${to}...`);
      const { error: updateError } = await supabase
        .from('car_models_extended')
        .update({ brand_name: to })
        .eq('brand_name', from);

      if (updateError) {
        console.error(`❌ Błąd podczas aktualizacji marki ${from}:`, updateError);
      } else {
        console.log(`✅ Zaktualizowano ${from} → ${to}`);
      }
    }

    // 5. Sprawdź wyniki po normalizacji
    const { data: finalBrandsData, error: finalBrandsError } = await supabase
      .from('car_models_extended')
      .select('brand_name');

    if (finalBrandsError) {
      console.error('❌ Błąd podczas pobierania marek po normalizacji:', finalBrandsError);
      return;
    }

    const finalUniqueBrands = [...new Set(finalBrandsData.map(b => b.brand_name))];
    console.log(`\n🔍 Sprawdzanie wyników...`);
    console.log(`📊 Po normalizacji: ${finalUniqueBrands.length} unikalnych marek`);

    // Sprawdź czy Omoda jest nadal w bazie
    const omodaExists = finalUniqueBrands.includes('Omoda');
    console.log(`🚗 Omoda w bazie: ${omodaExists ? '✅ TAK' : '❌ NIE'}`);

    // Sprawdź czy są jeszcze duplikaty
    const finalBrandGroups = new Map();
    finalUniqueBrands.forEach(brand => {
      const key = brand.toLowerCase();
      if (!finalBrandGroups.has(key)) {
        finalBrandGroups.set(key, []);
      }
      finalBrandGroups.get(key).push(brand);
    });

    const remainingDuplicates = Array.from(finalBrandGroups.entries()).filter(([key, brands]) => brands.length > 1);
    console.log(`🔍 Pozostałe duplikaty: ${remainingDuplicates.length}`);
    
    if (remainingDuplicates.length > 0) {
      console.log('Pozostałe duplikaty:');
      remainingDuplicates.forEach(([key, brands]) => {
        console.log(`  ${key}: ${brands.join(', ')}`);
      });
    }

    console.log('\n✅ Finalna normalizacja zakończona!');

  } catch (error) {
    console.error('❌ Wystąpił błąd podczas normalizacji:', error);
  }
}

finalNormalize();
