// Test rzeczywistego endpointu API /api/models przez HTTP
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testApiEndpoint(brand) {
  const url = `${API_BASE_URL}/api/models?brand=${encodeURIComponent(brand)}`;
  
  console.log(`\n🔍 Test rzeczywistego endpointu API:`);
  console.log(`   GET ${url}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${errorText.substring(0, 200)}`);
      return null;
    }
    
    const jsonData = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`⏱️  Czas odpowiedzi: ${responseTime}ms`);
    console.log(`📊 Liczba modeli: ${Array.isArray(jsonData) ? jsonData.length : 0}`);
    
    if (Array.isArray(jsonData) && jsonData.length > 0) {
      console.log(`\n📋 Przykładowe modele (pierwsze 3):`);
      jsonData.slice(0, 3).forEach((model, index) => {
        console.log(`\n   ${index + 1}. ${model.model?.toUpperCase() || 'N/A'}`);
        console.log(`      Marka: ${model.brand || 'N/A'}`);
        console.log(`      Typy nadwozia: ${model.bodyTypes?.length > 0 ? model.bodyTypes.slice(0, 3).join(', ') : 'brak'}`);
        console.log(`      Generacje: ${model.generations?.length || 0}`);
        console.log(`      Produkowany: ${model.isCurrentlyProduced ? 'Tak' : 'Nie'}`);
      });
      
      // Sprawdź strukturę danych
      const firstModel = jsonData[0];
      console.log(`\n📋 Struktura danych:`);
      console.log(`   • brand: ${typeof firstModel.brand} - "${firstModel.brand}"`);
      console.log(`   • model: ${typeof firstModel.model} - "${firstModel.model}"`);
      console.log(`   • generations: ${Array.isArray(firstModel.generations) ? 'array' : typeof firstModel.generations} (${firstModel.generations?.length || 0} elementów)`);
      console.log(`   • bodyTypes: ${Array.isArray(firstModel.bodyTypes) ? 'array' : typeof firstModel.bodyTypes} (${firstModel.bodyTypes?.length || 0} elementów)`);
      console.log(`   • years: ${Array.isArray(firstModel.years) ? 'array' : typeof firstModel.years} (${firstModel.years?.length || 0} elementów)`);
      console.log(`   • isCurrentlyProduced: ${typeof firstModel.isCurrentlyProduced} - ${firstModel.isCurrentlyProduced}`);
      
      return jsonData;
    } else {
      console.warn(`⚠️  Brak danych dla marki "${brand}"`);
      return jsonData;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      console.error(`❌ Nie można połączyć się z serwerem!`);
      console.error(`   Upewnij się, że serwer Next.js jest uruchomiony:`);
      console.error(`   npm run dev`);
      return null;
    }
    console.error(`❌ Błąd:`, error.message);
    return null;
  }
}

async function runApiTests() {
  console.log('🧪 Test rzeczywistego endpointu API /api/models\n');
  console.log(`📋 URL serwera: ${API_BASE_URL}`);
  console.log(`⚠️  UWAGA: Serwer Next.js musi być uruchomiony (npm run dev)\n`);
  
  const testBrands = ['Bmw', 'Mercedes-Benz', 'Audi'];
  const results = {};
  
  for (const brand of testBrands) {
    const result = await testApiEndpoint(brand);
    results[brand] = result;
    
    if (result === null) {
      // Jeśli nie można połączyć się z serwerem, przerwij testy
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Podsumowanie
  if (results[testBrands[0]] !== null) {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 PODSUMOWANIE TESTÓW ENDPOINTU API');
    console.log('='.repeat(80));
    
    testBrands.forEach(brand => {
      const result = results[brand];
      if (result && Array.isArray(result) && result.length > 0) {
        console.log(`✅ ${brand}: ${result.length} modeli`);
      } else if (result && Array.isArray(result)) {
        console.log(`⚠️  ${brand}: Brak danych`);
      } else {
        console.log(`❌ ${brand}: Błąd`);
      }
    });
    
    const totalModels = Object.values(results).reduce((sum, r) => sum + (Array.isArray(r) ? r.length : 0), 0);
    console.log(`\n📈 Łącznie znaleziono: ${totalModels} modeli`);
  }
  
  console.log('\n✅ Testy zakończone!\n');
}

runApiTests();











