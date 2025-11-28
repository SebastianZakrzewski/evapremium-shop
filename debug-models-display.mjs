// Debug: Sprawdź dlaczego modele nie są wyświetlane
// Symuluje dokładnie logikę komponentu brand-products-section.tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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
  } catch (e) {}
  
  try {
    const env = readFileSync('.env', 'utf8');
    env.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  } catch (e) {}
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDk0MjUsImV4cCI6MjA3MzA4NTQyNX0.PlhrCXHWb3YhOnqu8jVrt_P7nGMx3ETUmrxSwdj48rE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Symulacja API response (jak w route.ts)
async function fetchCarModelsFromAPI(brandApiName) {
  const brandMapping = {
    'Mercedes': 'Mercedes-Benz',
    'mercedes': 'Mercedes-Benz',
    'Mercedes-Benz': 'Mercedes-Benz',
    'BMW': 'Bmw',
    'bmw': 'Bmw',
    'Bmw': 'Bmw',
    'Audi': 'Audi',
    'audi': 'Audi',
  };
  
  const mappedBrand = brandMapping[brandApiName] || brandApiName;
  
  const { data, error } = await supabase
    .from('car_models_extended')
    .select('brand_name, model_name, generation, body_type, year_from, year_to, is_currently_produced')
    .eq('brand_name', mappedBrand)
    .order('model_name', { ascending: true });
  
  if (error) {
    console.error('❌ API Error:', error);
    return [];
  }
  
  // Grupowanie (jak w API route)
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
  
  return result;
}

// Symulacja availableModels (jak w komponencie)
function calculateAvailableModels(carModels) {
  const modelMap = new Map();
  
  console.log('\n📊 Przetwarzanie carModels do availableModels:');
  console.log(`   Liczba carModels: ${carModels.length}`);
  
  if (carModels.length === 0) {
    console.log('   ⚠️  Brak carModels!');
    return [];
  }
  
  carModels.forEach((apiModel, index) => {
    if (index < 3) {
      console.log(`\n   Model ${index}:`, {
        brand: apiModel.brand,
        model: apiModel.model,
        hasGenerations: !!apiModel.generations,
        generationsCount: apiModel.generations?.length || 0,
        hasBodyTypes: !!apiModel.bodyTypes,
        bodyTypesCount: apiModel.bodyTypes?.length || 0,
        generations: apiModel.generations?.slice(0, 2),
        bodyTypes: apiModel.bodyTypes?.slice(0, 3),
      });
    }
    
    const modelName = apiModel.model?.trim();
    if (!modelName) {
      console.warn(`   ⚠️  Pomijam model bez nazwy:`, apiModel);
      return;
    }
    
    if (!modelMap.has(modelName)) {
      modelMap.set(modelName, {
        model: modelName,
        bodyTypes: new Set(),
        years: new Set(),
        count: 0,
      });
    }
    
    const modelData = modelMap.get(modelName);
    
    // Dodaj typy nadwozia z generacji
    if (apiModel.generations && Array.isArray(apiModel.generations)) {
      apiModel.generations.forEach((gen) => {
        if (gen.bodyType) {
          modelData.bodyTypes.add(gen.bodyType);
        }
        if (gen.yearFrom) {
          modelData.years.add(gen.yearFrom);
        }
        if (gen.yearTo) {
          modelData.years.add(gen.yearTo);
        }
        modelData.count += 1;
      });
    }
    
    // Dodaj typy nadwozia z bodyTypes array
    if (apiModel.bodyTypes && Array.isArray(apiModel.bodyTypes)) {
      apiModel.bodyTypes.forEach((bt) => {
        modelData.bodyTypes.add(bt);
      });
    }
    
    // Dodaj lata z years array
    if (apiModel.years && Array.isArray(apiModel.years)) {
      apiModel.years.forEach((year) => {
        modelData.years.add(year);
      });
    }
  });
  
  const result = Array.from(modelMap.values())
    .map((modelData) => ({
      model: modelData.model,
      bodyTypes: Array.from(modelData.bodyTypes).sort(),
      years: Array.from(modelData.years).sort((a, b) => b - a),
      count: modelData.count,
    }))
    .sort((a, b) => a.model.localeCompare(b.model));
  
  console.log(`\n✅ Wynik availableModels: ${result.length} modeli`);
  
  if (result.length > 0) {
    console.log('\n   Przykładowe modele:');
    result.slice(0, 5).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.model} - ${m.bodyTypes.length} typów nadwozia, ${m.count} wariantów`);
    });
  } else {
    console.log('   ⚠️  PROBLEM: availableModels jest puste mimo że carModels ma dane!');
  }
  
  return result;
}

async function testBrand(brandSlug, brandApiName) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 Test dla: ${brandSlug} → ${brandApiName}`);
  console.log('='.repeat(80));
  
  // 1. Pobierz dane z API (jak komponent)
  console.log('\n📡 Krok 1: Pobieranie danych z API...');
  const carModels = await fetchCarModelsFromAPI(brandApiName);
  
  console.log(`   ✅ Otrzymano ${carModels.length} modeli z API`);
  
  if (carModels.length === 0) {
    console.log('   ❌ Brak danych z API - to jest problem!');
    return;
  }
  
  // 2. Sprawdź strukturę pierwszego modelu
  console.log('\n📋 Krok 2: Struktura pierwszego modelu:');
  const firstModel = carModels[0];
  console.log(JSON.stringify(firstModel, null, 2));
  
  // 3. Oblicz availableModels (jak komponent)
  console.log('\n🔄 Krok 3: Obliczanie availableModels...');
  const availableModels = calculateAvailableModels(carModels);
  
  // 4. Podsumowanie
  console.log('\n📊 Podsumowanie:');
  console.log(`   carModels.length: ${carModels.length}`);
  console.log(`   availableModels.length: ${availableModels.length}`);
  console.log(`   Czy modele będą wyświetlone: ${availableModels.length > 0 ? '✅ TAK' : '❌ NIE'}`);
  
  if (carModels.length > 0 && availableModels.length === 0) {
    console.log('\n❌ PROBLEM ZNALEZIONY!');
    console.log('   carModels ma dane, ale availableModels jest puste.');
    console.log('   Sprawdź strukturę danych z API.');
  }
  
  return { carModels, availableModels };
}

async function runTests() {
  console.log('🔍 Debug: Dlaczego modele nie są wyświetlane\n');
  
  const testCases = [
    { slug: 'bmw', apiName: 'Bmw' },
    { slug: 'mercedes', apiName: 'Mercedes-Benz' },
    { slug: 'audi', apiName: 'Audi' },
  ];
  
  for (const { slug, apiName } of testCases) {
    await testBrand(slug, apiName);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ Debug zakończony!\n');
}

runTests();











