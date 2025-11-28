// Test rzeczywistego endpointu API /api/models przez HTTP
import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testApiEndpoint(brand) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/api/models?brand=${encodeURIComponent(brand)}`;
    
    console.log(`\n🔍 Test API endpoint: GET ${url}`);
    
    const startTime = Date.now();
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode !== 200) {
          console.error(`❌ Status: ${res.statusCode}`);
          console.error(`   Response: ${data}`);
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        try {
          const jsonData = JSON.parse(data);
          
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`⏱️  Czas odpowiedzi: ${responseTime}ms`);
          console.log(`📊 Liczba modeli: ${Array.isArray(jsonData) ? jsonData.length : 0}`);
          
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            console.log(`\n📋 Przykładowe modele (pierwsze 3):`);
            jsonData.slice(0, 3).forEach((model, index) => {
              console.log(`\n   ${index + 1}. ${model.model?.toUpperCase() || 'N/A'}`);
              console.log(`      Marka: ${model.brand || 'N/A'}`);
              console.log(`      Typy nadwozia: ${model.bodyTypes?.length > 0 ? model.bodyTypes.join(', ') : 'brak'}`);
              console.log(`      Generacje: ${model.generations?.length || 0}`);
              console.log(`      Produkowany: ${model.isCurrentlyProduced ? 'Tak' : 'Nie'}`);
            });
            
            // Sprawdź strukturę danych
            const firstModel = jsonData[0];
            console.log(`\n📋 Struktura danych:`);
            console.log(`   • brand: ${typeof firstModel.brand} - ${firstModel.brand}`);
            console.log(`   • model: ${typeof firstModel.model} - ${firstModel.model}`);
            console.log(`   • generations: ${Array.isArray(firstModel.generations) ? 'array' : typeof firstModel.generations} (${firstModel.generations?.length || 0} elementów)`);
            console.log(`   • bodyTypes: ${Array.isArray(firstModel.bodyTypes) ? 'array' : typeof firstModel.bodyTypes} (${firstModel.bodyTypes?.length || 0} elementów)`);
            console.log(`   • years: ${Array.isArray(firstModel.years) ? 'array' : typeof firstModel.years} (${firstModel.years?.length || 0} elementów)`);
            console.log(`   • isCurrentlyProduced: ${typeof firstModel.isCurrentlyProduced} - ${firstModel.isCurrentlyProduced}`);
          } else {
            console.warn(`⚠️  Brak danych dla marki "${brand}"`);
          }
          
          resolve(jsonData);
        } catch (error) {
          console.error(`❌ Błąd parsowania JSON:`, error.message);
          console.error(`   Response: ${data.substring(0, 200)}...`);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error(`❌ Błąd połączenia:`, error.message);
      reject(error);
    });
  });
}

async function runApiTests() {
  console.log('🧪 Test endpointu API /api/models\n');
  console.log(`📋 URL bazy: ${API_BASE_URL}`);
  console.log('⚠️  UWAGA: Upewnij się, że serwer Next.js jest uruchomiony (npm run dev)\n');
  
  const testBrands = ['Bmw', 'Mercedes-Benz', 'Audi'];
  
  try {
    for (const brand of testBrands) {
      try {
        await testApiEndpoint(brand);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        if (error.message.includes('ECONNREFUSED')) {
          console.error(`\n❌ Nie można połączyć się z serwerem!`);
          console.error(`   Upewnij się, że serwer Next.js jest uruchomiony:`);
          console.error(`   npm run dev`);
          break;
        }
        throw error;
      }
    }
    
    console.log('\n✅ Testy endpointu zakończone!\n');
  } catch (error) {
    console.error('\n❌ Błąd podczas testów:', error.message);
    process.exit(1);
  }
}

runApiTests();











