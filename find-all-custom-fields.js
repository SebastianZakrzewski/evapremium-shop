/**
 * Skrypt do znalezienia wszystkich niestandardowych pól w Bitrix24
 * Po wykonaniu testu skrypt zostanie automatycznie usunięty
 */

const https = require('https');

// Konfiguracja z zmiennych środowiskowych
const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL;

if (!BITRIX24_WEBHOOK_URL) {
  console.error('❌ Błąd: BITRIX24_WEBHOOK_URL nie jest ustawione w zmiennych środowiskowych');
  process.exit(1);
}

console.log('🔍 Wyszukiwanie wszystkich niestandardowych pól w Bitrix24...');
console.log('📡 URL webhook:', BITRIX24_WEBHOOK_URL);

/**
 * Wykonuje zapytanie do API Bitrix24
 */
function makeBitrix24Request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BITRIX24_WEBHOOK_URL}${method}`;
    const postData = JSON.stringify(params);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'EVA-Website-Bitrix24-Field-Finder/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(`Błąd API Bitrix24: ${result.error.error_description || result.error.error}`));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Błąd parsowania odpowiedzi: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Błąd połączenia: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Znajduje wszystkie niestandardowe pola w dealach
 */
async function findAllCustomFields() {
  try {
    console.log('\n💼 Wyszukiwanie wszystkich niestandardowych pól w dealach...\n');

    // Pobierz wszystkie pola deali
    const fields = await makeBitrix24Request('crm.deal.fields');
    
    if (!fields.result) {
      console.log('❌ Nie udało się pobrać pól deali');
      return [];
    }

    console.log(`📋 Znaleziono ${Object.keys(fields.result).length} pól w dealach\n`);

    // Znajdź wszystkie pola niestandardowe (UF_)
    const customFields = Object.keys(fields.result).filter(key => key.startsWith('UF_'));
    
    console.log(`🏷️  Niestandardowe pola (${customFields.length}):`);
    console.log('=' .repeat(80));

    const fieldDetails = [];

    customFields.forEach((fieldName, index) => {
      const field = fields.result[fieldName];
      
      const fieldInfo = {
        index: index + 1,
        code: fieldName,
        name: field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy',
        type: field.USER_TYPE_ID || 'Nieznany',
        required: field.IS_REQUIRED ? 'TAK' : 'NIE',
        readOnly: field.IS_READ_ONLY ? 'TAK' : 'NIE',
        enum: field.ENUM ? field.ENUM.map(e => e.VALUE).join(', ') : null
      };

      fieldDetails.push(fieldInfo);

      console.log(`\n${index + 1}. ${fieldName}`);
      console.log(`   📋 Nazwa: ${fieldInfo.name}`);
      console.log(`   🏷️  Typ: ${fieldInfo.type}`);
      console.log(`   📊 Wymagane: ${fieldInfo.required}`);
      console.log(`   🔒 Tylko do odczytu: ${fieldInfo.readOnly}`);
      if (fieldInfo.enum) {
        console.log(`   📋 Wartości: ${fieldInfo.enum}`);
      }
    });

    // Grupuj pola według typu
    console.log('\n📊 GRUPOWANIE PÓL WEDŁUG TYPU:');
    console.log('=' .repeat(80));

    const fieldsByType = {};
    fieldDetails.forEach(field => {
      if (!fieldsByType[field.type]) {
        fieldsByType[field.type] = [];
      }
      fieldsByType[field.type].push(field);
    });

    Object.keys(fieldsByType).forEach(type => {
      console.log(`\n🔧 ${type} (${fieldsByType[type].length} pól):`);
      fieldsByType[type].forEach(field => {
        console.log(`   - ${field.code}: ${field.name}`);
      });
    });

    // Znajdź pola z nazwami zawierającymi kluczowe słowa
    console.log('\n🔍 POLA Z KLUCZOWYMI SŁOWAMI:');
    console.log('=' .repeat(80));

    const keywords = ['CAR', 'ORDER', 'PAYMENT', 'PRODUCT', 'SHIPPING', 'AUTO', 'SAMOCHOD', 'ZAMOWIENIE', 'PLATNOSC'];
    
    keywords.forEach(keyword => {
      const matchingFields = fieldDetails.filter(field => 
        field.code.toUpperCase().includes(keyword) || 
        field.name.toUpperCase().includes(keyword)
      );
      
      if (matchingFields.length > 0) {
        console.log(`\n🔍 Pola zawierające "${keyword}":`);
        matchingFields.forEach(field => {
          console.log(`   - ${field.code}: ${field.name} (${field.type})`);
        });
      }
    });

    // Eksport do JSON
    console.log('\n📄 EKSPORT DANYCH:');
    console.log('=' .repeat(80));
    console.log('Wszystkie pola niestandardowe:');
    console.log(JSON.stringify(fieldDetails, null, 2));

    return fieldDetails;

  } catch (error) {
    console.error('❌ Błąd podczas wyszukiwania pól:', error.message);
    return [];
  }
}

/**
 * Sprawdza połączenie z Bitrix24
 */
async function testConnection() {
  try {
    console.log('🔗 Testowanie połączenia z Bitrix24...');
    const userInfo = await makeBitrix24Request('user.current');
    
    if (userInfo.result) {
      console.log('✅ Połączenie z Bitrix24 działa poprawnie');
      console.log('👤 Użytkownik:', userInfo.result.NAME || 'Nieznany');
      return true;
    } else {
      console.log('❌ Nie udało się pobrać informacji o użytkowniku');
      return false;
    }
  } catch (error) {
    console.error('❌ Błąd połączenia z Bitrix24:', error.message);
    return false;
  }
}

/**
 * Usuwa skrypt po zakończeniu
 */
function deleteScript() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const scriptPath = __filename;
    console.log('\n🗑️  Usuwanie skryptu po zakończeniu testu...');
    fs.unlinkSync(scriptPath);
    console.log('✅ Skrypt został usunięty');
  } catch (error) {
    console.log('⚠️  Nie udało się usunąć skryptu:', error.message);
  }
}

/**
 * Główna funkcja
 */
async function main() {
  console.log('🚀 Uruchamianie wyszukiwania wszystkich niestandardowych pól\n');
  
  try {
    // Test połączenia
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.log('\n❌ Test zakończony niepowodzeniem - problem z połączeniem');
      deleteScript();
      process.exit(1);
    }

    // Znajdź wszystkie pola
    const fields = await findAllCustomFields();
    
    console.log('\n📊 PODSUMOWANIE:');
    console.log(`✅ Znaleziono ${fields.length} niestandardowych pól`);
    console.log('📋 Wszystkie kody pól zostały wyświetlone powyżej');
    console.log('💡 Możesz użyć tych kodów do mapowania w systemie EVA Website');
    
    console.log('\n🎉 Wyszukiwanie zakończone pomyślnie');
    
  } catch (error) {
    console.error('\n💥 Nieoczekiwany błąd:', error.message);
  } finally {
    // Usuń skrypt po zakończeniu
    deleteScript();
  }
}

// Uruchom test
main();
