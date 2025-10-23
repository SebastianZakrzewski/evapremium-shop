/**
 * Skrypt do pobierania deali z etapu "Zamówienia ze strony opłacone" z Bitrix24
 * 
 * Ten skrypt:
 * 1. Łączy się z API Bitrix24
 * 2. Pobiera wszystkie deali z etapu UC_DMBNNJ (Zamówienia ze strony opłacone)
 * 3. Wyświetla szczegółowe informacje o znalezionych dealach
 * 4. Sprawdza czy istnieją obiekty zamówień
 */

require('dotenv').config();

const https = require('https');
const fs = require('fs');
const path = require('path');

// Konfiguracja Bitrix24
const BITRIX24_CONFIG = {
  webhookUrl: process.env.BITRIX24_WEBHOOK_URL || 'https://your-domain.bitrix24.com/rest/1/xxxxx/',
  enabled: process.env.BITRIX24_WEBHOOK_ENABLED === 'true',
  targetStageId: 'UC_DMBNNJ', // Zamówienia ze strony opłacone
  categoryId: 2, // Kategoria "Leady z Reklam"
  maxDeals: 100 // Maksymalna liczba deali do pobrania
};

// Kolory dla konsoli
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Wykonaj żądanie HTTP do Bitrix24 API
 */
async function makeBitrix24Request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BITRIX24_CONFIG.webhookUrl}${method}`);
    
    // Dodaj parametry do URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EVA-Website-Bitrix24-Script/1.0'
      },
      timeout: 30000
    };

    log(`🔄 Wysyłanie żądania do: ${url.toString()}`, 'blue');

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            log(`❌ Błąd Bitrix24 API: ${response.error.error_description || response.error.error}`, 'red');
            reject(new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`));
            return;
          }

          log(`✅ Odpowiedź otrzymana pomyślnie`, 'green');
          resolve(response);
        } catch (parseError) {
          log(`❌ Błąd parsowania odpowiedzi: ${parseError.message}`, 'red');
          log(`📄 Surowa odpowiedź: ${data}`, 'yellow');
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Błąd sieci: ${error.message}`, 'red');
      reject(error);
    });

    req.on('timeout', () => {
      log(`❌ Timeout żądania`, 'red');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Pobierz wszystkie deali z określonego etapu
 */
async function getDealsFromStage(stageId, categoryId = 0) {
  try {
    log(`🔍 Pobieranie deali z etapu: ${stageId} (kategoria: ${categoryId})`, 'cyan');
    
    const params = {
      filter: {
        STAGE_ID: stageId,
        CATEGORY_ID: categoryId
      },
      select: [
        'ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 
        'CONTACT_ID', 'CATEGORY_ID', 'DATE_CREATE', 'DATE_MODIFY',
        'ORIGIN_ID', 'ORIGINATOR_ID', 'SOURCE_ID', 'SOURCE_DESCRIPTION',
        'UF_CRM_ORDER_NUMBER', 'UF_CRM_PAYMENT_STATUS', 'UF_CRM_PAYMENT_METHOD',
        'UF_CRM_ORDER_DATE', 'UF_CRM_ORDER_SOURCE', 'COMMENTS'
      ],
      start: 0,
      order: { DATE_CREATE: 'DESC' }
    };

    const response = await makeBitrix24Request('crm.deal.list', params);
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Pobierz szczegóły deala
 */
async function getDealDetails(dealId) {
  try {
    const response = await makeBitrix24Request('crm.deal.get', { id: dealId });
    return response.result;
  } catch (error) {
    log(`❌ Błąd podczas pobierania szczegółów deala ${dealId}: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Pobierz produkty deala
 */
async function getDealProducts(dealId) {
  try {
    const response = await makeBitrix24Request('crm.deal.productrows.get', { id: dealId });
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania produktów deala ${dealId}: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz informacje o kontakcie
 */
async function getContactDetails(contactId) {
  try {
    const response = await makeBitrix24Request('crm.contact.get', { id: contactId });
    return response.result;
  } catch (error) {
    log(`❌ Błąd podczas pobierania kontaktu ${contactId}: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Formatuj datę
 */
function formatDate(dateString) {
  if (!dateString) return 'Brak daty';
  const date = new Date(dateString);
  return date.toLocaleString('pl-PL');
}

/**
 * Formatuj kwotę
 */
function formatAmount(amount, currency = 'PLN') {
  if (!amount) return '0.00 PLN';
  return `${Number(amount).toFixed(2)} ${currency}`;
}

/**
 * Wyświetl szczegóły deala
 */
function displayDealDetails(deal, contact = null, products = []) {
  log(`\n${'='.repeat(80)}`, 'bright');
  log(`📋 DEAL: ${deal.TITLE}`, 'bright');
  log(`${'='.repeat(80)}`, 'bright');
  
  // Podstawowe informacje
  log(`🆔 ID: ${deal.ID}`, 'cyan');
  log(`📊 Etap: ${deal.STAGE_ID}`, 'yellow');
  log(`💰 Kwota: ${formatAmount(deal.OPPORTUNITY, deal.CURRENCY_ID)}`, 'green');
  log(`📅 Data utworzenia: ${formatDate(deal.DATE_CREATE)}`, 'blue');
  log(`📅 Data modyfikacji: ${formatDate(deal.DATE_MODIFY)}`, 'blue');
  
  // Informacje o zamówieniu
  if (deal.ORIGIN_ID || deal.UF_CRM_ORDER_NUMBER) {
    log(`\n📦 INFORMACJE O ZAMÓWIENIU:`, 'bright');
    log(`   Numer zamówienia (ORIGIN_ID): ${deal.ORIGIN_ID || 'Brak'}`, 'cyan');
    log(`   Numer zamówienia (UF_CRM): ${deal.UF_CRM_ORDER_NUMBER || 'Brak'}`, 'cyan');
    log(`   Status płatności: ${deal.UF_CRM_PAYMENT_STATUS || 'Brak'}`, 'yellow');
    log(`   Metoda płatności: ${deal.UF_CRM_PAYMENT_METHOD || 'Brak'}`, 'yellow');
    log(`   Data zamówienia: ${deal.UF_CRM_ORDER_DATE || 'Brak'}`, 'blue');
    log(`   Źródło zamówienia: ${deal.UF_CRM_ORDER_SOURCE || 'Brak'}`, 'blue');
  }
  
  // Informacje o źródle
  if (deal.ORIGINATOR_ID || deal.SOURCE_ID) {
    log(`\n🔗 INFORMACJE O ŹRÓDLE:`, 'bright');
    log(`   System źródłowy: ${deal.ORIGINATOR_ID || 'Brak'}`, 'cyan');
    log(`   ID źródła: ${deal.SOURCE_ID || 'Brak'}`, 'cyan');
    log(`   Opis źródła: ${deal.SOURCE_DESCRIPTION || 'Brak'}`, 'cyan');
  }
  
  // Informacje o kontakcie
  if (contact) {
    log(`\n👤 KONTAKT:`, 'bright');
    log(`   ID: ${contact.ID}`, 'cyan');
    log(`   Imię: ${contact.NAME || 'Brak'}`, 'cyan');
    log(`   Nazwisko: ${contact.LAST_NAME || 'Brak'}`, 'cyan');
    log(`   Email: ${contact.EMAIL?.[0]?.VALUE || 'Brak'}`, 'cyan');
    log(`   Telefon: ${contact.PHONE?.[0]?.VALUE || 'Brak'}`, 'cyan');
    log(`   Firma: ${contact.COMPANY_TITLE || 'Brak'}`, 'cyan');
  }
  
  // Produkty
  if (products && products.length > 0) {
    log(`\n🛍️ PRODUKTY (${products.length}):`, 'bright');
    products.forEach((product, index) => {
      log(`   ${index + 1}. ${product.PRODUCT_NAME || 'Nazwa nieznana'}`, 'cyan');
      log(`      Cena: ${formatAmount(product.PRICE, product.CURRENCY_ID)}`, 'green');
      log(`      Ilość: ${product.QUANTITY || 1}`, 'yellow');
      log(`      ID produktu: ${product.PRODUCT_ID || 'Brak'}`, 'blue');
    });
  }
  
  // Komentarze
  if (deal.COMMENTS) {
    log(`\n💬 KOMENTARZE:`, 'bright');
    log(`   ${deal.COMMENTS}`, 'cyan');
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Uruchamianie skryptu pobierania deali z etapu "Zamówienia ze strony opłacone"`, 'bright');
    log(`📋 Konfiguracja:`, 'bright');
    log(`   URL Webhook: ${BITRIX24_CONFIG.webhookUrl}`, 'cyan');
    log(`   Etap docelowy: ${BITRIX24_CONFIG.targetStageId}`, 'cyan');
    log(`   Kategoria: ${BITRIX24_CONFIG.categoryId}`, 'cyan');
    log(`   Maksymalna liczba deali: ${BITRIX24_CONFIG.maxDeals}`, 'cyan');
    
    if (!BITRIX24_CONFIG.enabled) {
      log(`❌ Integracja Bitrix24 jest wyłączona!`, 'red');
      log(`   Ustaw BITRIX24_WEBHOOK_ENABLED=true w zmiennych środowiskowych`, 'yellow');
      return;
    }

    // Test połączenia
    log(`\n🔍 Testowanie połączenia z Bitrix24...`, 'blue');
    try {
      const userResponse = await makeBitrix24Request('user.current');
      log(`✅ Połączenie z Bitrix24 działa! Użytkownik: ${userResponse.result?.NAME || 'Nieznany'}`, 'green');
    } catch (error) {
      log(`❌ Nie można połączyć się z Bitrix24: ${error.message}`, 'red');
      return;
    }

    // Pobierz deali z etapu "Zamówienia ze strony opłacone"
    log(`\n🔍 Pobieranie deali z etapu "Zamówienia ze strony opłacone"...`, 'blue');
    const deals = await getDealsFromStage(BITRIX24_CONFIG.targetStageId, BITRIX24_CONFIG.categoryId);
    
    log(`\n📊 WYNIKI:`, 'bright');
    log(`   Znaleziono ${deals.length} deali w etapie "Zamówienia ze strony opłacone"`, 'green');
    
    if (deals.length === 0) {
      log(`\n⚠️  Nie znaleziono żadnych deali w etapie "Zamówienia ze strony opłacone"`, 'yellow');
      log(`   Sprawdź czy:`, 'yellow');
      log(`   - Etap ID jest poprawny (${BITRIX24_CONFIG.targetStageId})`, 'yellow');
      log(`   - Istnieją deali w tym etapie`, 'yellow');
      log(`   - Masz odpowiednie uprawnienia`, 'yellow');
      return;
    }

    // Wyświetl podsumowanie
    log(`\n📋 PODSUMOWANIE DEALI:`, 'bright');
    deals.forEach((deal, index) => {
      log(`   ${index + 1}. ${deal.TITLE} (ID: ${deal.ID}) - ${formatAmount(deal.OPPORTUNITY, deal.CURRENCY_ID)}`, 'cyan');
    });

    // Pobierz szczegółowe informacje dla każdego deala
    log(`\n🔍 Pobieranie szczegółowych informacji...`, 'blue');
    
    for (let i = 0; i < Math.min(deals.length, BITRIX24_CONFIG.maxDeals); i++) {
      const deal = deals[i];
      log(`\n⏳ Przetwarzanie deala ${i + 1}/${Math.min(deals.length, BITRIX24_CONFIG.maxDeals)}: ${deal.TITLE}`, 'blue');
      
      try {
        // Pobierz szczegóły deala
        const dealDetails = await getDealDetails(deal.ID);
        
        // Pobierz informacje o kontakcie
        let contact = null;
        if (deal.CONTACT_ID) {
          contact = await getContactDetails(deal.CONTACT_ID);
        }
        
        // Pobierz produkty deala
        const products = await getDealProducts(deal.ID);
        
        // Wyświetl szczegóły
        displayDealDetails(dealDetails || deal, contact, products);
        
        // Krótka pauza między żądaniami
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        log(`❌ Błąd podczas przetwarzania deala ${deal.ID}: ${error.message}`, 'red');
      }
    }

    log(`\n✅ Skrypt zakończony pomyślnie!`, 'green');
    log(`📊 Przetworzono ${Math.min(deals.length, BITRIX24_CONFIG.maxDeals)} z ${deals.length} deali`, 'green');

  } catch (error) {
    log(`❌ Błąd krytyczny: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Uruchom skrypt
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getDealsFromStage,
  getDealDetails,
  getDealProducts,
  getContactDetails,
  displayDealDetails
};
