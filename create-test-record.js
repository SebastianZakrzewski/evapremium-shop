/**
 * Skrypt do utworzenia testowego rekordu w etapie UC_DMBNNJ
 * Po wykonaniu testu skrypt zostanie automatycznie usunięty
 */

const https = require('https');

// Konfiguracja z zmiennych środowiskowych
const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL;

if (!BITRIX24_WEBHOOK_URL) {
  console.error('❌ Błąd: BITRIX24_WEBHOOK_URL nie jest ustawione w zmiennych środowiskowych');
  process.exit(1);
}

console.log('🔍 Tworzenie testowego rekordu w etapie UC_DMBNNJ...');
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
        'User-Agent': 'EVA-Website-Bitrix24-Test-Record/1.0'
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
 * Tworzy testowy kontakt
 */
async function createTestContact() {
  try {
    console.log('\n👤 Tworzenie testowego kontaktu...');

    const contactData = {
      NAME: 'Test EVA',
      LAST_NAME: 'Website',
      EMAIL: [{
        VALUE: 'test@evapremium.pl',
        VALUE_TYPE: 'WORK'
      }],
      PHONE: [{
        VALUE: '+48123456789',
        VALUE_TYPE: 'WORK'
      }],
      COMMENTS: 'Testowy kontakt utworzony przez skrypt EVA Website - ' + new Date().toISOString()
    };

    const response = await makeBitrix24Request('crm.contact.add', {
      fields: contactData
    });

    if (response.result) {
      console.log('✅ Kontakt utworzony pomyślnie!');
      console.log(`🆔 ID kontaktu: ${response.result}`);
      return response.result;
    } else {
      throw new Error('Nie udało się utworzyć kontaktu');
    }

  } catch (error) {
    console.error('❌ Błąd podczas tworzenia kontaktu:', error.message);
    return null;
  }
}

/**
 * Tworzy testowy deal w etapie UC_DMBNNJ
 */
async function createTestDeal(contactId) {
  try {
    console.log('\n💼 Tworzenie testowego deala w etapie UC_DMBNNJ...');

    const dealData = {
      TITLE: 'Test EVA - Zamówienie ze strony opłacone',
      STAGE_ID: 'UC_DMBNNJ', // Etap "Zamówienia ze strony opłacone"
      OPPORTUNITY: 299.99,
      CURRENCY_ID: 'PLN',
      CONTACT_ID: contactId,
      COMMENTS: 'Testowy deal utworzony przez skrypt EVA Website - ' + new Date().toISOString(),
      // Dodatkowe pola niestandardowe
      UF_CRM_ORDER_NUMBER: 'TEST-' + Date.now(),
      UF_CRM_PAYMENT_METHOD: 'Przelewy24',
      UF_CRM_PAYMENT_STATUS: 'Opłacone',
      UF_CRM_CAR_BRAND: 'BMW',
      UF_CRM_CAR_MODEL: 'X5',
      UF_CRM_PRODUCT_TYPE: 'Dywaniki',
      UF_CRM_SHIPPING_METHOD: 'Kurier',
      UF_CRM_ORDER_DATE: new Date().toISOString().split('T')[0],
      UF_CRM_ORDER_SOURCE: 'Strona internetowa'
    };

    const response = await makeBitrix24Request('crm.deal.add', {
      fields: dealData
    });

    if (response.result) {
      console.log('✅ Deal utworzony pomyślnie!');
      console.log(`🆔 ID deala: ${response.result}`);
      console.log(`🎯 Etap: UC_DMBNNJ (Zamówienia ze strony opłacone)`);
      return response.result;
    } else {
      throw new Error('Nie udało się utworzyć deala');
    }

  } catch (error) {
    console.error('❌ Błąd podczas tworzenia deala:', error.message);
    return null;
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
  console.log('🚀 Uruchamianie tworzenia testowego rekordu w etapie UC_DMBNNJ\n');
  
  try {
    // Test połączenia
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.log('\n❌ Test zakończony niepowodzeniem - problem z połączeniem');
      deleteScript();
      process.exit(1);
    }

    // Utwórz testowy kontakt
    const contactId = await createTestContact();
    if (!contactId) {
      console.log('\n❌ Nie udało się utworzyć kontaktu');
      deleteScript();
      process.exit(1);
    }

    // Utwórz testowy deal w etapie UC_DMBNNJ
    const dealId = await createTestDeal(contactId);
    if (!dealId) {
      console.log('\n❌ Nie udało się utworzyć deala');
      deleteScript();
      process.exit(1);
    }

    console.log('\n📊 PODSUMOWANIE:');
    console.log('✅ Testowy rekord utworzony pomyślnie!');
    console.log(`👤 Kontakt ID: ${contactId}`);
    console.log(`💼 Deal ID: ${dealId}`);
    console.log(`🎯 Etap: UC_DMBNNJ (Zamówienia ze strony opłacone)`);
    console.log('💰 Kwota: 299.99 PLN');
    console.log('🚗 Samochód: BMW X5');
    console.log('📦 Produkt: Dywaniki');
    
    console.log('\n🎉 Test zakończony pomyślnie');
    
  } catch (error) {
    console.error('\n💥 Nieoczekiwany błąd:', error.message);
  } finally {
    // Usuń skrypt po zakończeniu
    deleteScript();
  }
}

// Uruchom test
main();
