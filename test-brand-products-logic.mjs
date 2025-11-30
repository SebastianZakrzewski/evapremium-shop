// Test logiki API używanej przez sekcje produktów - symuluje dokładnie działanie komponentu
// ale używa bezpośredniego zapytania do Supabase (jak w pierwszym teście)
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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

// Mapowanie nazw marek - identyczne jak w brand-products-section.tsx
const brandMapping = {
  bmw: { displayName: "BMW", logo: "/images/products/bmw.png", apiName: "Bmw" },
  mercedes: { displayName: "Mercedes", logo: "/images/products/mercedes.jpg", apiName: "Mercedes-Benz" },
  'mercedes-benz': { displayName: "Mercedes", logo: "/images/products/mercedes.jpg", apiName: "Mercedes-Benz" },
  audi: { displayName: "Audi", logo: "/images/products/audi.jpg", apiName: "Audi" },
  porsche: { displayName: "Porsche", logo: "/images/products/porsche.png", apiName: "Porsche" },
  volkswagen: { displayName: "Volkswagen", logo: "/images/products/vw.png", apiName: "Volkswagen" },
  vw: { displayName: "Volkswagen", logo: "/images/products/vw.png", apiName: "Volkswagen" },
  toyota: { displayName: "Toyota", logo: "/images/products/toyota.png", apiName: "Toyota" },
};

function getBrandInfo(brandSlug) {
  const normalized = brandSlug.toLowerCase().trim();
  return brandMapping[normalized] || null;
}

function getApiBrandName(slug) {
  if (!slug) return "";
  
  const brandInfo = getBrandInfo(slug);
  if (brandInfo?.apiName) {
    return brandInfo.apiName;
  }
  
  const fallbackMapping = {
    'bmw': 'Bmw',
    'mercedes': 'Mercedes-Benz',
    'mercedes-benz': 'Mercedes-Benz',
    'audi': 'Audi',
    'porsche': 'Porsche',
    'volkswagen': 'Volkswagen',
    'vw': 'Volkswagen',
    'toyota': 'Toyota',
  };
  
  return fallbackMapping[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

// Symulacja fetchCarModels - używa bezpośredniego zapytania do Supabase (jak API route)
async function fetchCarModels(brandApiName) {
  try {
    console.log(`🔍 BrandProductsSection: Fetching models for brand: "${brandApiName}"`);
    
    // Mapowanie nazw marek (jak w API route)
    const brandMappingApi = {
      'Mercedes': 'Mercedes-Benz',
      'mercedes': 'Mercedes-Benz',
      'Mercedes-Benz': 'Mercedes-Benz',
      'mercedes-benz': 'Mercedes-Benz',
      'BMW': 'Bmw',
      'bmw': 'Bmw',
      'Bmw': 'Bmw',
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
    };
    
    const normalizedBrand = brandApiName.trim();
    const mappedBrand = brandMappingApi[normalizedBrand] || normalizedBrand;
    
    console.log(`🔍 API: Mapped brand: "${normalizedBrand}" → "${mappedBrand}"`);
    
    const startTime = Date.now();
    
    // Zapytanie do Supabase (identyczne jak w API route)
    const { data, error } = await supabase
      .from('car_models_extended')
      .select('brand_name, model_name, generation, body_type, year_from, year_to, is_currently_produced')
      .eq('brand_name', mappedBrand)
      .order('model_name', { ascending: true });
    
    const fetchTime = Date.now() - startTime;
    console.log(`⏱️ BrandProductsSection: API fetch took ${fetchTime}ms`);
    
    if (error) {
      console.error(`❌ BrandProductsSection: API error:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn(`⚠️ BrandProductsSection: No data returned`);
      return [];
    }
    
    // Grupowanie modeli (identyczne jak w API route)
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
    
    console.log(`✅ BrandProductsSection: Received ${result.length} models for brand "${brandApiName}"`);
    
    if (result.length > 0) {
      console.log(`📊 BrandProductsSection: Sample models:`, result.slice(0, 3).map((m) => `${m.brand} - ${m.model}`));
    }
    
    return result;
  } catch (error) {
    console.error('❌ BrandProductsSection: Error fetching car models:', error);
    return [];
  }
}

// Test dla różnych brand slugs (jak w URL)
async function testBrandSlug(brandSlug) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 Test dla brandSlug: "${brandSlug}"`);
  console.log('='.repeat(80));
  
  // Normalizuj brandSlug - dekoduj URL i zamień na lowercase (jak w komponencie)
  const normalizedSlug = decodeURIComponent(brandSlug).toLowerCase().trim();
  console.log(`📌 Znormalizowany slug: "${normalizedSlug}"`);
  
  // Pobierz informacje o marce
  const brandInfo = getBrandInfo(normalizedSlug);
  console.log(`📌 Brand info:`, brandInfo ? {
    displayName: brandInfo.displayName,
    apiName: brandInfo.apiName
  } : 'null');
  
  // Mapowanie nazw marek dla API
  const brandApiName = normalizedSlug ? getApiBrandName(normalizedSlug) : "";
  console.log(`📌 Brand API name: "${brandApiName}"`);
  
  if (!brandApiName) {
    console.error(`❌ Brak brandApiName dla slug "${brandSlug}"`);
    return null;
  }
  
  // Wywołaj funkcję fetchCarModels (symuluje komponent)
  const models = await fetchCarModels(brandApiName);
  
  if (models && models.length > 0) {
    console.log(`\n✅ Sukces! Znaleziono ${models.length} modeli`);
    
    // Przetwarzanie danych jak w komponencie (availableModels)
    const availableModels = models.reduce((acc, apiModel) => {
      const modelName = apiModel.model?.trim();
      if (!modelName) return acc;
      
      if (!acc[modelName]) {
        acc[modelName] = {
          model: modelName,
          bodyTypes: new Set(),
          years: new Set(),
          count: 0,
        };
      }
      
      const modelData = acc[modelName];
      
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
      
      return acc;
    }, {});
    
    const availableModelsArray = Object.values(availableModels)
      .map((modelData) => ({
        model: modelData.model,
        bodyTypes: Array.from(modelData.bodyTypes).sort(),
        years: Array.from(modelData.years).sort((a, b) => b - a),
        count: modelData.count,
      }))
      .sort((a, b) => a.model.localeCompare(b.model));
    
    console.log(`\n📋 Dostępne modele dla wyświetlenia w sekcji produktów (${availableModelsArray.length}):`);
    availableModelsArray.slice(0, 10).forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.model.toUpperCase()}`);
      console.log(`      Typy nadwozia: ${model.bodyTypes.length > 0 ? model.bodyTypes.slice(0, 3).join(', ') : 'brak'}${model.bodyTypes.length > 3 ? '...' : ''}`);
      console.log(`      Warianty: ${model.count}`);
      if (model.years.length > 0) {
        const minYear = Math.min(...model.years);
        const maxYear = Math.max(...model.years);
        console.log(`      Lata: ${minYear}-${maxYear}`);
      }
    });
    
    if (availableModelsArray.length > 10) {
      console.log(`   ... i ${availableModelsArray.length - 10} więcej modeli`);
    }
    
    return models;
  } else {
    console.warn(`⚠️  Brak modeli dla marki "${brandApiName}"`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Test logiki API używanej przez sekcje produktów dla danej marki\n');
  console.log('📋 Test symuluje dokładnie działanie komponentu brand-products-section.tsx\n');
  
  // Test dla różnych brand slugs (jak w URL)
  const testBrandSlugs = ['bmw', 'mercedes', 'mercedes-benz', 'audi', 'porsche', 'toyota'];
  
  const results = {};
  
  for (const brandSlug of testBrandSlugs) {
    const result = await testBrandSlug(brandSlug);
    results[brandSlug] = result;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Podsumowanie
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PODSUMOWANIE TESTÓW');
  console.log('='.repeat(80));
  
  testBrandSlugs.forEach(slug => {
    const result = results[slug];
    if (result && Array.isArray(result) && result.length > 0) {
      console.log(`✅ ${slug}: ${result.length} modeli`);
    } else {
      console.log(`⚠️  ${slug}: Brak danych`);
    }
  });
  
  const totalModels = Object.values(results).reduce((sum, r) => sum + (Array.isArray(r) ? r.length : 0), 0);
  console.log(`\n📈 Łącznie znaleziono: ${totalModels} modeli`);
  
  console.log('\n✅ Testy zakończone!\n');
}

runTests();












