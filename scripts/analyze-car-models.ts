import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CarModel {
  id: number;
  brand_name: string;
  model_name: string;
}

async function analyzeBrandsAndModels() {
  console.log('🔍 Analizuję marki i modele w tabeli car_models_extended...\n');

  try {
    // 1. Sprawdź ile rekordów jest w tabeli
    const { count, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Błąd podczas liczenia rekordów:', countError);
      return;
    }

    console.log(`📊 Całkowita liczba rekordów: ${count}\n`);

    // 2. Pobierz wszystkie unikalne marki
    const { data: brands, error: brandsError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .order('brand_name');

    if (brandsError) {
      console.error('❌ Błąd podczas pobierania marek:', brandsError);
      return;
    }

    // Unikalne marki
    const uniqueBrands = [...new Set(brands?.map(b => b.brand_name))].sort();
    console.log(`🚗 Liczba unikalnych marek: ${uniqueBrands.length}\n`);
    console.log('📋 Lista marek:', uniqueBrands.join(', '));
    console.log('\n' + '='.repeat(80) + '\n');

    // 3. Dla każdej marki pobierz przykładowe modele
    for (const brand of uniqueBrands) {
      const { data: models, error: modelsError, count: brandCount } = await supabase
        .from('car_models_extended')
        .select('id, brand_name, model_name', { count: 'exact' })
        .eq('brand_name', brand)
        .limit(5);

      if (modelsError) {
        console.error(`❌ Błąd dla marki ${brand}:`, modelsError);
        continue;
      }

      console.log(`🏷️  MARKA: ${brand}`);
      console.log(`   Liczba modeli: ${brandCount}`);
      console.log(`   Przykładowe nazwy modeli (model_name):`);
      
      models?.forEach((model, index) => {
        console.log(`   ${index + 1}. "${model.model_name}"`);
      });
      
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n✅ Analiza zakończona!');

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
  }
}

// Uruchom analizę
analyzeBrandsAndModels();
