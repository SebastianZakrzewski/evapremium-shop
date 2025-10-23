/**
 * Skrypt do pobierania deali z kategorii "Deale" (ID: 0) w Bitrix24
 * 
 * Ten skrypt:
 * 1. Sprawdza wszystkie kategorie deali
 * 2. Pobiera deali z kategorii "Deale" (ID: 0)
 * 3. Filtruje deali z etapu "Zamówienia ze strony opłacone" (UC_DMBNNJ)
 * 4. Wyświetla szczegółowe informacje o znalezionych dealach
 */

require('dotenv').config();

const https = require('https');

// Konfiguracja Bitrix24
const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL;

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
    const url = new URL(`${BITRIX24_WEBHOOK_URL}${method}`);
    
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

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`Bitrix24 API Error: ${response.error.error_description || response.error.error}`));
            return;
          }

          resolve(response);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Pobierz wszystkie kategorie deali
 */
async function getAllDealCategories() {
  try {
    log(`🔍 Pobieranie wszystkich kategorii deali...`, 'blue');
    
    const response = await makeBitrix24Request('crm.dealcategory.list');
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania kategorii deali: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z kategorii "Deale" (ID: 0)
 */
async function getDealsFromDealeCategory() {
  try {
    log(`🔍 Pobieranie deali z kategorii "Deale" (ID: 0)...`, 'blue');
    
    const params = {
      filter: {
        CATEGORY_ID: 0
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
    log(`❌ Błąd podczas pobierania deali z kategorii "Deale": ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z etapu "Zamówienia ze strony opłacone" w kategorii "Deale"
 */
async function getDealsFromOpłaconeStage() {
  try {
    log(`🔍 Pobieranie deali z etapu "Zamówienia ze strony opłacone" w kategorii "Deale"...`, 'blue');
    
    const params = {
      filter: {
        STAGE_ID: 'UC_DMBNNJ',
        CATEGORY_ID: 0
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
    log(`❌ Błąd podczas pobierania deali z etapu "Zamówienia ze strony opłacone": ${error.message}`, 'red');
    return [];
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
    log(`🚀 Pobieranie deali z kategorii "Deale" w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie kategorie deali
    log(`\n1️⃣ Pobieranie wszystkich kategorii deali...`, 'blue');
    const categories = await getAllDealCategories();
    
    log(`\n📊 KATEGORIE DEALI (${categories.length}):`, 'bright');
    categories.forEach((category, index) => {
      const isDealeCategory = category.ID === '0';
      const color = isDealeCategory ? 'green' : 'cyan';
      const marker = isDealeCategory ? '🎯' : '  ';
      
      log(`${marker} ${index + 1}. ${category.NAME} (ID: ${category.ID})`, color);
      if (isDealeCategory) {
        log(`     ✅ TO JEST KATEGORIA "Deale"!`, 'green');
      }
    });

    // 2. Pobierz wszystkie deali z kategorii "Deale"
    log(`\n2️⃣ Pobieranie wszystkich deali z kategorii "Deale"...`, 'blue');
    const allDealsInDealeCategory = await getDealsFromDealeCategory();
    
    log(`\n📊 WSZYSTKIE DEALI W KATEGORII "DEALE" (${allDealsInDealeCategory.length}):`, 'bright');
    
    if (allDealsInDealeCategory.length === 0) {
      log(`❌ Nie znaleziono deali w kategorii "Deale"`, 'red');
      return;
    }

    // Grupuj deali według etapów
    const dealsByStage = {};
    allDealsInDealeCategory.forEach(deal => {
      const stageId = deal.STAGE_ID;
      if (!dealsByStage[stageId]) {
        dealsByStage[stageId] = [];
      }
      dealsByStage[stageId].push(deal);
    });

    // Wyświetl statystyki według etapów
    log(`\n📊 DEALI WEDŁUG ETAPÓW:`, 'bright');
    Object.entries(dealsByStage).forEach(([stageId, deals]) => {
      const isTargetStage = stageId === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      
      log(`${marker} ${stageId}: ${deals.length} deali, ${totalValue.toFixed(2)} PLN`, color);
      
      if (isTargetStage) {
        log(`     ✅ ZNALEZIONO ${deals.length} DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 3. Pobierz deali z etapu "Zamówienia ze strony opłacone"
    log(`\n3️⃣ Pobieranie deali z etapu "Zamówienia ze strony opłacone"...`, 'blue');
    const opłaconeDeals = await getDealsFromOpłaconeStage();
    
    log(`\n📊 DEALI Z ETAPU "ZAMÓWIENIA ZE STRONY OPŁACONE" (${opłaconeDeals.length}):`, 'bright');
    
    if (opłaconeDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "Zamówienia ze strony opłacone"`, 'red');
      log(`   Sprawdź czy deali są rzeczywiście w tym etapie`, 'yellow');
    } else {
      log(`✅ Znaleziono ${opłaconeDeals.length} deali w etapie "Zamówienia ze strony opłacone"!`, 'green');
      
      // Wyświetl podsumowanie
      const totalValue = opłaconeDeals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl listę deali
      opłaconeDeals.forEach((deal, index) => {
        log(`   ${index + 1}. ${deal.TITLE} - ${formatAmount(deal.OPPORTUNITY, deal.CURRENCY_ID)}`, 'cyan');
      });

      // 4. Pobierz szczegółowe informacje dla każdego deala
      log(`\n4️⃣ Pobieranie szczegółowych informacji...`, 'blue');
      
      for (let i = 0; i < Math.min(opłaconeDeals.length, 5); i++) { // Ograniczenie do 5 deali
        const deal = opłaconeDeals[i];
        log(`\n⏳ Przetwarzanie deala ${i + 1}/${Math.min(opłaconeDeals.length, 5)}: ${deal.TITLE}`, 'blue');
        
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
    }

    log(`\n✅ Analiza zakończona pomyślnie!`, 'green');
    log(`📊 Podsumowanie:`, 'bright');
    log(`   - Kategoria "Deale": ${allDealsInDealeCategory.length} deali`, 'cyan');
    log(`   - Etap "Zamówienia ze strony opłacone": ${opłaconeDeals.length} deali`, 'cyan');

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
  getAllDealCategories,
  getDealsFromDealeCategory,
  getDealsFromOpłaconeStage,
  getDealDetails,
  getDealProducts,
  getContactDetails,
  displayDealDetails
};
