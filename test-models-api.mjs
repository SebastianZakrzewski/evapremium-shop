// Test API /api/models dla różnych marek
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Wczytaj zmienne środowiskowe
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

console.log('🧪 Test API /api/models\n');
console.log('📋 Konfiguracja:');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Key: ${supabaseKey ? '✅ Ustawiony' : '❌ Brak'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapowanie nazw marek (takie samo jak w API)
const brandMapping = {
  'Mercedes': 'Mercedes-Benz',
  'mercedes': 'Mercedes-Benz',
  'Mercedes-Benz': 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'BMW': 'Bmw',
  'bmw': 'Bmw',
  'Bmw': 'Bmw',
  'BMW Group': 'Bmw',
  'Audi': 'Audi',
  'audi': 'Audi',
  'Porsche': 'Porsche',
  'porsche': 'Porsche',
  'Volkswagen': 'Volkswagen',
  'volkswagen': 'Volkswagen',
  'VW': 'Volkswagen',
  'vw': 'Volkswagen',
  'Toyota': 'Toyota',
  'toyota': 'Toyota',
  'Ford': 'Ford',
  'ford': 'Ford',
  'Opel': 'Opel',
  'opel': 'Opel',
  'Skoda': 'Skoda',
  'skoda': 'Skoda',
  'Škoda': 'Skoda',
  'SEAT': 'Seat',
  'seat': 'Seat',
  'Seat': 'Seat',
  'Renault': 'Renault',
  'renault': 'Renault',
  'Peugeot': 'Peugeot',
  'peugeot': 'Peugeot',
  'Citroen': 'Citroen',
  'citroen': 'Citroen',
  'Citroën': 'Citroen',
  'Fiat': 'Fiat',
  'fiat': 'Fiat',
  'Mazda': 'Mazda',
  'mazda': 'Mazda',
  'Honda': 'Honda',
  'honda': 'Honda',
  'Nissan': 'Nissan',
  'nissan': 'Nissan',
  'Hyundai': 'Hyundai',
  'hyundai': 'Hyundai',
  'Kia': 'Kia',
  'kia': 'Kia',
  'Smart': 'Smart',
  'smart': 'Smart',
  'Chevrolet': 'Chevrolet',
  'chevrolet': 'Chevrolet',
};

async function testBrand(brandName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 Test dla marki: "${brandName}"`);
  console.log('='.repeat(80));
  
  // Mapuj nazwę marki
  const normalizedBrand = brandName.trim();
  const mappedBrand = brandMapping[normalizedBrand] || normalizedBrand;
  console.log(`📌 Zmapowana nazwa: "${normalizedBrand}" → "${mappedBrand}"`);
  
  // Test 1: Bezpośrednie zapytanie do Supabase (symulacja logiki API)
  console.log('\n📊 Test 1: Bezpośrednie zapytanie do Supabase');
  console.log('─'.repeat(80));
  
  const startTime = Date.now();
  const { data, error, count } = await supabase
    .from('car_models_extended')
    .select('brand_name, model_name, generation, body_type, year_from, year_to, is_currently_produced', { count: 'exact' })
    .eq('brand_name', mappedBrand)
    .order('model_name', { ascending: true });
  
  const queryTime = Date.now() - startTime;
  
  if (error) {
    console.error(`❌ Błąd zapytania:`, error);
    return;
  }
  
  console.log(`⏱️  Czas zapytania: ${queryTime}ms`);
  console.log(`📊 Liczba rekordów: ${count || data?.length || 0}`);
  
  if (!data || data.length === 0) {
    console.warn(`⚠️  Brak danych dla marki "${mappedBrand}"`);
    
    // Sprawdź czy marka istnieje w bazie
    const { data: allBrands } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .limit(100);
    
    const uniqueBrands = [...new Set(allBrands?.map(b => b.brand_name) || [])].sort();
    console.log(`\n📋 Dostępne marki w bazie (${uniqueBrands.length}):`);
    uniqueBrands.slice(0, 20).forEach((b, i) => {
      const match = b.toLowerCase() === mappedBrand.toLowerCase() ? ' ✅' : '';
      console.log(`   ${i + 1}. "${b}"${match}`);
    });
    
    return;
  }
  
  // Grupowanie modeli (takie samo jak w API)
  const groupedModels = data.reduce((acc, item) => {
    const key = `${item.brand_name}-${item.model_name}`;
    
    if (!acc[key]) {
      acc[key] = {
        brand: item.brand_name,
        model: item.model_name,
        generations: [],
        bodyTypes: new Set(),
        years: new Set(),
        isCurrentlyProduced: false
      };
    }
    
    acc[key].generations.push({
      generation: item.generation,
      bodyType: item.body_type,
      yearFrom: item.year_from,
      yearTo: item.year_to,
      isCurrentlyProduced: item.is_currently_produced
    });
    
    if (item.body_type) {
      acc[key].bodyTypes.add(item.body_type);
    }
    
    if (item.year_from) {
      acc[key].years.add(item.year_from);
    }
    if (item.year_to) {
      acc[key].years.add(item.year_to);
    }
    
    if (item.is_currently_produced) {
      acc[key].isCurrentlyProduced = true;
    }
    
    return acc;
  }, {});
  
  const result = Object.values(groupedModels).map((model) => ({
    ...model,
    bodyTypes: Array.from(model.bodyTypes).sort(),
    years: Array.from(model.years).sort((a, b) => b - a)
  }));
  
  console.log(`✅ Znaleziono ${result.length} unikalnych modeli`);
  
  // Wyświetl pierwsze 5 modeli
  console.log('\n📋 Przykładowe modele:');
  result.slice(0, 5).forEach((model, index) => {
    console.log(`\n   ${index + 1}. ${model.model.toUpperCase()}`);
    console.log(`      Marka: ${model.brand}`);
    console.log(`      Typy nadwozia: ${model.bodyTypes.length > 0 ? model.bodyTypes.join(', ') : 'brak'}`);
    console.log(`      Lata: ${model.years.length > 0 ? `${model.years[model.years.length - 1]}-${model.years[0]}` : 'brak'}`);
    console.log(`      Generacje: ${model.generations.length}`);
    console.log(`      Produkowany: ${model.isCurrentlyProduced ? 'Tak' : 'Nie'}`);
  });
  
  if (result.length > 5) {
    console.log(`\n   ... i ${result.length - 5} więcej modeli`);
  }
  
  // Statystyki
  console.log('\n📊 Statystyki:');
  const totalGenerations = result.reduce((sum, m) => sum + m.generations.length, 0);
  const allBodyTypes = new Set();
  result.forEach(m => m.bodyTypes.forEach(bt => allBodyTypes.add(bt)));
  
  console.log(`   • Łączna liczba generacji: ${totalGenerations}`);
  console.log(`   • Unikalne typy nadwozia: ${allBodyTypes.size} (${Array.from(allBodyTypes).join(', ')})`);
  console.log(`   • Modele produkowane: ${result.filter(m => m.isCurrentlyProduced).length}`);
  
  return result;
}

async function runTests() {
  try {
    // Test dla kilku popularnych marek
    const testBrands = ['Bmw', 'Mercedes-Benz', 'Audi', 'Porsche', 'Toyota'];
    
    console.log('🚀 Rozpoczynam testy API dla marek:', testBrands.join(', '));
    
    const results = {};
    
    for (const brand of testBrands) {
      const result = await testBrand(brand);
      results[brand] = result;
      
      // Małe opóźnienie między testami
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Podsumowanie
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 PODSUMOWANIE TESTÓW');
    console.log('='.repeat(80));
    
    testBrands.forEach(brand => {
      const result = results[brand];
      if (result && result.length > 0) {
        console.log(`✅ ${brand}: ${result.length} modeli`);
      } else {
        console.log(`❌ ${brand}: Brak danych`);
      }
    });
    
    const totalModels = Object.values(results).reduce((sum, r) => sum + (r?.length || 0), 0);
    console.log(`\n📈 Łącznie znaleziono: ${totalModels} modeli`);
    
    console.log('\n✅ Testy zakończone!\n');
    
  } catch (error) {
    console.error('❌ Błąd podczas testów:', error);
    if (error instanceof Error) {
      console.error('   Wiadomość:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

runTests();












