// Test połączenia z Supabase i sprawdzenie dostępnych marek
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Wczytaj zmienne środowiskowe z .env.local lub .env
function loadEnv() {
  try {
    const envLocal = readFileSync('.env.local', 'utf8');
    envLocal.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  } catch (e) {
    // .env.local może nie istnieć
  }
  
  try {
    const env = readFileSync('.env', 'utf8');
    env.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  } catch (e) {
    // .env może nie istnieć
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDk0MjUsImV4cCI6MjA3MzA4NTQyNX0.PlhrCXHWb3YhOnqu8jVrt_P7nGMx3ETUmrxSwdj48rE';

console.log('🔍 Test połączenia z Supabase\n');
console.log('📋 Konfiguracja:');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Key: ${supabaseKey ? '✅ Ustawiony' : '❌ Brak'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseBrands() {
  try {
    console.log('🔍 Test 1: Sprawdzanie czy tabela car_models_extended istnieje...\n');
    
    // Test 1: Sprawdź czy tabela istnieje i ile ma rekordów
    const { count, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania tabeli:', countError);
      console.error('   Kod błędu:', countError.code);
      console.error('   Wiadomość:', countError.message);
      return;
    }
    
    console.log(`✅ Tabela istnieje i zawiera ${count} rekordów\n`);
    
    // Test 2: Pobierz wszystkie unikalne marki
    console.log('🔍 Test 2: Pobieranie unikalnych marek z tabeli...\n');
    
    const { data: brandsData, error: brandsError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .limit(1000);
    
    if (brandsError) {
      console.error('❌ Błąd podczas pobierania marek:', brandsError);
      return;
    }
    
    const uniqueBrands = [...new Set(brandsData?.map((b) => b.brand_name) || [])].sort();
    
    console.log(`✅ Znaleziono ${uniqueBrands.length} unikalnych marek:\n`);
    uniqueBrands.forEach((brand, index) => {
      console.log(`   ${index + 1}. "${brand}"`);
    });
    
    // Test 3: Sprawdź przykładowe modele dla każdej marki
    console.log('\n🔍 Test 3: Przykładowe modele dla każdej marki...\n');
    
    for (const brand of uniqueBrands.slice(0, 10)) { // Tylko pierwsze 10 marek
      const { data: modelsData, error: modelsError } = await supabase
        .from('car_models_extended')
        .select('model_name')
        .eq('brand_name', brand)
        .limit(5);
      
      if (!modelsError && modelsData && modelsData.length > 0) {
        const uniqueModels = [...new Set(modelsData.map((m) => m.model_name))];
        console.log(`   ${brand}:`);
        console.log(`      Modele (${uniqueModels.length}): ${uniqueModels.join(', ')}`);
      }
    }
    
    // Test 4: Sprawdź zapytanie z ilike dla konkretnej marki
    console.log('\n🔍 Test 4: Test zapytania z ilike dla różnych wariantów nazw...\n');
    
    const testBrands = ['Bmw', 'BMW', 'bmw', 'Mercedes-Benz', 'Mercedes', 'mercedes-benz', 'Audi', 'audi'];
    
    for (const testBrand of testBrands) {
      const { data, error, count: queryCount } = await supabase
        .from('car_models_extended')
        .select('brand_name, model_name', { count: 'exact' })
        .ilike('brand_name', testBrand)
        .limit(5);
      
      if (error) {
        console.log(`   ❌ "${testBrand}": Błąd - ${error.message}`);
      } else {
        const uniqueModels = [...new Set(data?.map((m) => m.model_name) || [])];
        console.log(`   ${queryCount > 0 ? '✅' : '❌'} "${testBrand}": ${queryCount || 0} rekordów, ${uniqueModels.length} unikalnych modeli`);
        if (data && data.length > 0) {
          console.log(`      Przykładowe modele: ${uniqueModels.slice(0, 3).join(', ')}`);
        }
      }
    }
    
    console.log('\n✅ Test zakończony!\n');
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
    if (error instanceof Error) {
      console.error('   Wiadomość:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

testSupabaseBrands();



















