const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function normalizeBrandNames() {
  console.log('🚀 Normalizuję nazwy marek w bazie danych...');

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

    const brandsToNormalize = [];
    const normalizationMap = new Map();

    // Zidentyfikuj marki do normalizacji (np. "FORD" -> "Ford")
    uniqueBrands.forEach(brand => {
      const normalized = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
      if (brand !== normalized && !normalizationMap.has(brand.toLowerCase())) {
        brandsToNormalize.push({ original: brand, normalized: normalized });
        normalizationMap.set(brand.toLowerCase(), normalized);
      } else if (brand !== normalized && normalizationMap.has(brand.toLowerCase())) {
        // Jeśli istnieje już znormalizowana wersja (np. "Ford" i "FORD"), upewnij się, że "FORD" zostanie zmienione na "Ford"
        const existingNormalized = normalizationMap.get(brand.toLowerCase());
        if (existingNormalized !== brand) {
          brandsToNormalize.push({ original: brand, normalized: existingNormalized });
        }
      } else {
        normalizationMap.set(brand.toLowerCase(), brand);
      }
    });

    console.log(`📝 Znaleziono ${brandsToNormalize.length} marek do normalizacji`);
    brandsToNormalize.forEach(b => console.log(`🔄 ${b.original} → ${b.normalized}`));

    // 2. Zaktualizuj bazę danych
    for (const { original, normalized } of brandsToNormalize) {
      console.log(`\n🔄 Aktualizuję ${original} → ${normalized}...`);
      const { error: updateError } = await supabase
        .from('car_models_extended')
        .update({ brand_name: normalized })
        .eq('brand_name', original);

      if (updateError) {
        console.error(`❌ Błąd podczas aktualizacji marki ${original}:`, updateError);
      } else {
        console.log(`✅ Zaktualizowano ${original} → ${normalized}`);
      }
    }

    // 3. Sprawdź wyniki po normalizacji
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

    // Sprawdź konkretne warianty
    const fordVariants = finalUniqueBrands.filter(b => b.toLowerCase() === 'ford');
    console.log(`🔍 Warianty Ford: ${JSON.stringify(fordVariants)}`);
    const audiVariants = finalUniqueBrands.filter(b => b.toLowerCase() === 'audi');
    console.log(`🔍 Warianty Audi: ${JSON.stringify(audiVariants)}`);

    console.log('\n✅ Normalizacja zakończona!');

  } catch (error) {
    console.error('❌ Wystąpił błąd podczas normalizacji:', error);
  }
}

normalizeBrandNames();
