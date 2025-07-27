const fetch = require('node-fetch');

// TODO: Zaktualizuj te dane o rzeczywiste wartości
const API_BASE_URL = 'http://localhost:3001';

// Przykładowe dane zamówienia do testu
const testOrderData = {
  customer: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48123456789',
    address: 'ul. Testowa 1, 00-000 Warszawa'
  },
  carDetails: {
    brand: 'BMW',
    model: 'X5',
    year: '2020',
    body: 'SUV',
    trans: 'Automatyczna'
  },
  productDetails: {
    type: '3D',
    color: 'czarny',
    texture: 'romby',
    variant: '3D bez rantów',
    edgeColor: 'czarny',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-black-black.webp'
  },
  totalAmount: 299.99
};

async function testBitrixConnection() {
  console.log('🔗 Testowanie połączenia z Bitrix24...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/bitrix/order`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Połączenie z Bitrix24 działa poprawnie');
      console.log('📊 Odpowiedź:', result.message);
    } else {
      console.log('❌ Błąd połączenia z Bitrix24');
      console.log('🔍 Szczegóły:', result.error);
      console.log('📝 Wiadomość:', result.details);
    }
  } catch (error) {
    console.log('❌ Błąd podczas testowania połączenia:', error.message);
  }
}

async function testOrderCreation() {
  console.log('\n📦 Testowanie wysyłania zamówienia do Bitrix24...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/bitrix/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Zamówienie zostało pomyślnie wysłane do Bitrix24');
      console.log('🆔 ID zamówienia:', result.data.orderId);
      console.log('📊 Odpowiedź Bitrix:', result.data.bitrixResponse);
    } else {
      console.log('❌ Błąd podczas wysyłania zamówienia');
      console.log('🔍 Szczegóły:', result.error);
      console.log('📝 Wiadomość:', result.details);
    }
  } catch (error) {
    console.log('❌ Błąd podczas testowania wysyłania zamówienia:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Rozpoczynam testy integracji z Bitrix24...\n');
  
  await testBitrixConnection();
  await testOrderCreation();
  
  console.log('\n✅ Testy zakończone');
  console.log('\n📝 TODO: Zaktualizuj zmienne środowiskowe o rzeczywiste dane Bitrix24');
  console.log('   - BITRIX_WEBHOOK_URL');
  console.log('   - BITRIX_DEAL_STAGE_ID');
  console.log('   - BITRIX_ASSIGNED_BY_ID');
}

// Uruchom testy jeśli skrypt jest wywołany bezpośrednio
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testBitrixConnection,
  testOrderCreation,
  runTests
}; 