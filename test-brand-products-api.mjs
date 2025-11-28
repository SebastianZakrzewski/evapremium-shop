// Test API używane przez sekcje produktów dla danej marki
// Symuluje dokładnie to co robi brand-products-section.tsx

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Mapowanie nazw marek - identyczne jak w brand-products-section.tsx
const brandMapping = {
  bmw: { displayName: "BMW", logo: "/images/products/bmw.png", apiName: "Bmw" },
  mercedes: { displayName: "Mercedes", logo: "/images/products/mercedes.jpg", apiName: "Mercedes-Benz" },
  'mercedes-benz': { displayName: "Mercedes", logo: "/images/products/mercedes.jpg", apiName: "Mercedes-Benz" },
  audi: { displayName: "Audi", logo: "/images/products/audi.jpg", apiName: "Audi" },
  porsche: { displayName: "Porsche", logo: "/images/products/porsche.png", apiName: "Porsche" },
  tesla: { displayName: "Tesla", logo: "/images/products/tesla.avif", apiName: "Tesla" },
  volkswagen: { displayName: "Volkswagen", logo: "/images/products/vw.png", apiName: "Volkswagen" },
  vw: { displayName: "Volkswagen", logo: "/images/products/vw.png", apiName: "Volkswagen" },
  toyota: { displayName: "Toyota", logo: "/images/products/toyota.png", apiName: "Toyota" },
  ford: { displayName: "Ford", logo: "/images/products/ford.png", apiName: "Ford" },
  opel: { displayName: "Opel", logo: "/images/products/opel.png", apiName: "Opel" },
  skoda: { displayName: "Škoda", logo: "/images/products/skoda.png", apiName: "Skoda" },
  seat: { displayName: "SEAT", logo: "/images/products/seat.png", apiName: "Seat" },
  renault: { displayName: "Renault", logo: "/images/products/renault.png", apiName: "Renault" },
  peugeot: { displayName: "Peugeot", logo: "/images/products/peugeot.png", apiName: "Peugeot" },
  citroen: { displayName: "Citroën", logo: "/images/products/citroen.png", apiName: "Citroen" },
  fiat: { displayName: "Fiat", logo: "/images/products/fiat.png", apiName: "Fiat" },
  mazda: { displayName: "Mazda", logo: "/images/products/mazda.png", apiName: "Mazda" },
  honda: { displayName: "Honda", logo: "/images/products/honda.png", apiName: "Honda" },
  nissan: { displayName: "Nissan", logo: "/images/products/nissan.png", apiName: "Nissan" },
  hyundai: { displayName: "Hyundai", logo: "/images/products/hyundai.png", apiName: "Hyundai" },
  kia: { displayName: "Kia", logo: "/images/products/kia.png", apiName: "Kia" },
  smart: { displayName: "Smart", logo: "/images/products/smart.png", apiName: "Smart" },
  chevrolet: { displayName: "Chevrolet", logo: "/images/products/chevrolet.png", apiName: "Chevrolet" },
};

// Funkcja do pobrania informacji o marce (identyczna jak w komponencie)
function getBrandInfo(brandSlug) {
  const normalized = brandSlug.toLowerCase().trim();
  return brandMapping[normalized] || null;
}

// Funkcja do mapowania nazw marek dla API (identyczna jak w komponencie)
function getApiBrandName(slug) {
  if (!slug) return "";
  
  const brandInfo = getBrandInfo(slug);
  
  // Najpierw sprawdź mapowanie
  if (brandInfo?.apiName) {
    return brandInfo.apiName;
  }
  
  // Fallback: spróbuj zmapować popularne warianty
  const fallbackMapping = {
    'bmw': 'Bmw',
    'mercedes': 'Mercedes-Benz',
    'mercedes-benz': 'Mercedes-Benz',
    'audi': 'Audi',
    'porsche': 'Porsche',
    'volkswagen': 'Volkswagen',
    'vw': 'Volkswagen',
    'toyota': 'Toyota',
    'ford': 'Ford',
    'opel': 'Opel',
    'skoda': 'Skoda',
    'seat': 'Seat',
    'renault': 'Renault',
    'peugeot': 'Peugeot',
    'citroen': 'Citroen',
    'fiat': 'Fiat',
    'mazda': 'Mazda',
    'honda': 'Honda',
    'nissan': 'Nissan',
    'hyundai': 'Hyundai',
    'kia': 'Kia',
    'smart': 'Smart',
    'chevrolet': 'Chevrolet',
  };
  
  const mapped = fallbackMapping[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
  return mapped;
}

// Funkcja fetchCarModels - identyczna jak w brand-products-section.tsx
async function fetchCarModels(brandName) {
  try {
    console.log(`🔍 BrandProductsSection: Fetching models for brand: "${brandName}"`);
    const url = `${API_BASE_URL}/api/models?brand=${encodeURIComponent(brandName)}`;
    console.log(`🔍 BrandProductsSection: API URL: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Wyłącz cache podczas debugowania
    });
    
    const fetchTime = Date.now() - startTime;
    console.log(`⏱️ BrandProductsSection: API fetch took ${fetchTime}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ BrandProductsSection: API returned ${response.status} for brand "${brandName}"`);
      console.error(`❌ BrandProductsSection: Error response: ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ BrandProductsSection: Received ${Array.isArray(data) ? data.length : 0} models for brand "${brandName}" (total time: ${totalTime}ms)`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`📊 BrandProductsSection: Sample models:`, data.slice(0, 3).map((m) => `${m.brand} - ${m.model}`));
      console.log(`📊 BrandProductsSection: First model structure:`, JSON.stringify(data[0], null, 2));
    } else if (!Array.isArray(data)) {
      console.warn(`⚠️ BrandProductsSection: Response is not an array:`, typeof data, data);
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ BrandProductsSection: Error fetching car models:', error);
    if (error instanceof Error) {
      console.error('❌ BrandProductsSection: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
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
  
  // Wywołaj API (tak jak robi to komponent)
  const models = await fetchCarModels(brandApiName);
  
  if (models && models.length > 0) {
    console.log(`\n✅ Sukces! Znaleziono ${models.length} modeli`);
    
    // Sprawdź strukturę danych (jak komponent)
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
      
      // Dodaj typy nadwozia z bodyTypes array jeśli istnieje
      if (apiModel.bodyTypes && Array.isArray(apiModel.bodyTypes)) {
        apiModel.bodyTypes.forEach((bt) => {
          modelData.bodyTypes.add(bt);
        });
      }
      
      // Dodaj lata z years array jeśli istnieje
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
    
    console.log(`\n📋 Dostępne modele dla wyświetlenia (${availableModelsArray.length}):`);
    availableModelsArray.slice(0, 10).forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.model.toUpperCase()} - ${model.bodyTypes.length} typów nadwozia, ${model.count} wariantów`);
    });
    
    if (availableModelsArray.length > 10) {
      console.log(`   ... i ${availableModelsArray.length - 10} więcej`);
    }
    
    return models;
  } else {
    console.warn(`⚠️  Brak modeli dla marki "${brandApiName}"`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Test API używane przez sekcje produktów dla danej marki\n');
  console.log(`📋 URL serwera: ${API_BASE_URL}`);
  console.log(`⚠️  UWAGA: Serwer Next.js musi być uruchomiony (npm run dev)\n`);
  
  // Test dla różnych brand slugs (jak w URL)
  const testBrandSlugs = ['bmw', 'mercedes', 'mercedes-benz', 'audi', 'porsche'];
  
  const results = {};
  
  for (const brandSlug of testBrandSlugs) {
    const result = await testBrandSlug(brandSlug);
    results[brandSlug] = result;
    
    if (result === null && brandSlug === testBrandSlugs[0]) {
      // Jeśli pierwszy test nie działa (serwer nie działa), przerwij
      console.error(`\n❌ Nie można połączyć się z serwerem!`);
      console.error(`   Upewnij się, że serwer Next.js jest uruchomiony:`);
      console.error(`   npm run dev`);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Podsumowanie
  if (results[testBrandSlugs[0]] !== null) {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 PODSUMOWANIE TESTÓW');
    console.log('='.repeat(80));
    
    testBrandSlugs.forEach(slug => {
      const result = results[slug];
      if (result && Array.isArray(result) && result.length > 0) {
        console.log(`✅ ${slug}: ${result.length} modeli`);
      } else if (result === null) {
        console.log(`❌ ${slug}: Błąd połączenia`);
      } else {
        console.log(`⚠️  ${slug}: Brak danych`);
      }
    });
    
    const totalModels = Object.values(results).reduce((sum, r) => sum + (Array.isArray(r) ? r.length : 0), 0);
    console.log(`\n📈 Łącznie znaleziono: ${totalModels} modeli`);
  }
  
  console.log('\n✅ Testy zakończone!\n');
}

runTests();











