/**
 * Skrypt do sprawdzenia deali z paginacją i limitami
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
 * Pobierz deali z paginacją
 */
async function getDealsWithPagination() {
  try {
    log(`🔍 Pobieranie deali z paginacją...`, 'blue');
    
    let allDeals = [];
    let start = 0;
    const limit = 50; // Limit na stronę
    let hasMore = true;
    let page = 1;

    while (hasMore) {
      log(`   📄 Strona ${page} (start: ${start})...`, 'cyan');
      
      const params = {
        select: [
          'ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 
          'CONTACT_ID', 'CATEGORY_ID', 'DATE_CREATE', 'DATE_MODIFY',
          'ORIGIN_ID', 'ORIGINATOR_ID', 'SOURCE_ID', 'SOURCE_DESCRIPTION',
          'UF_CRM_ORDER_NUMBER', 'UF_CRM_PAYMENT_STATUS', 'UF_CRM_PAYMENT_METHOD',
          'UF_CRM_ORDER_DATE', 'UF_CRM_ORDER_SOURCE', 'COMMENTS'
        ],
        start: start,
        order: { DATE_CREATE: 'DESC' }
      };

      const response = await makeBitrix24Request('crm.deal.list', params);
      const deals = response.result || [];
      
      log(`   📊 Znaleziono ${deals.length} deali na stronie ${page}`, 'cyan');
      
      if (deals.length === 0) {
        hasMore = false;
      } else {
        allDeals = allDeals.concat(deals);
        start += limit;
        page++;
        
        // Ograniczenie do 200 deali (4 strony)
        if (allDeals.length >= 200) {
          log(`   ⚠️  Osiągnięto limit 200 deali`, 'yellow');
          hasMore = false;
        }
        
        // Krótka pauza między żądaniami
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    log(`✅ Pobrano łącznie ${allDeals.length} deali`, 'green');
    return allDeals;

  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z paginacją: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z konkretnej kategorii
 */
async function getDealsByCategory(categoryId) {
  try {
    log(`🔍 Pobieranie deali z kategorii ${categoryId}...`, 'blue');
    
    const params = {
      filter: {
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
    log(`❌ Błąd podczas pobierania deali z kategorii ${categoryId}: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z etapu "Zamówienia ze strony opłacone"
 */
async function getDealsFromOpłaconeStage() {
  try {
    log(`🔍 Pobieranie deali z etapu "Zamówienia ze strony opłacone" (UC_DMBNNJ)...`, 'blue');
    
    const params = {
      filter: {
        STAGE_ID: 'UC_DMBNNJ'
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
function displayDealSummary(deal) {
  log(`   📋 ${deal.TITLE}`, 'cyan');
  log(`      ID: ${deal.ID}`, 'blue');
  log(`      Etap: ${deal.STAGE_ID}`, 'yellow');
  log(`      Kategoria: ${deal.CATEGORY_ID}`, 'magenta');
  log(`      Kwota: ${formatAmount(deal.OPPORTUNITY, deal.CURRENCY_ID)}`, 'green');
  log(`      Data: ${formatDate(deal.DATE_CREATE)}`, 'blue');
  if (deal.ORIGIN_ID) {
    log(`      Numer zamówienia: ${deal.ORIGIN_ID}`, 'magenta');
  }
  if (deal.UF_CRM_ORDER_NUMBER) {
    log(`      UF_CRM_ORDER_NUMBER: ${deal.UF_CRM_ORDER_NUMBER}`, 'magenta');
  }
  if (deal.UF_CRM_PAYMENT_STATUS) {
    log(`      Status płatności: ${deal.UF_CRM_PAYMENT_STATUS}`, 'yellow');
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie deali z paginacją w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie deali z paginacją
    log(`\n1️⃣ Pobieranie wszystkich deali z paginacją...`, 'blue');
    const allDeals = await getDealsWithPagination();
    
    log(`\n📊 WSZYSTKIE DEALI W SYSTEMIE (${allDeals.length}):`, 'bright');
    
    if (allDeals.length === 0) {
      log(`❌ Nie znaleziono żadnych deali w systemie`, 'red');
      return;
    }

    // Grupuj deali według kategorii
    const dealsByCategory = {};
    allDeals.forEach(deal => {
      const categoryId = deal.CATEGORY_ID || 'unknown';
      if (!dealsByCategory[categoryId]) {
        dealsByCategory[categoryId] = [];
      }
      dealsByCategory[categoryId].push(deal);
    });

    // Wyświetl statystyki według kategorii
    log(`\n📊 DEALI WEDŁUG KATEGORII:`, 'bright');
    Object.entries(dealsByCategory).forEach(([categoryId, deals]) => {
      const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      const categoryName = categoryId === '0' ? 'Deale' : categoryId === '2' ? 'Leady z Reklam' : `Kategoria ${categoryId}`;
      log(`   ${categoryName} (${categoryId}): ${deals.length} deali, ${totalValue.toFixed(2)} PLN`, 'cyan');
      
      // Sprawdź etapy w tej kategorii
      const stagesInCategory = {};
      deals.forEach(deal => {
        const stageId = deal.STAGE_ID;
        if (!stagesInCategory[stageId]) {
          stagesInCategory[stageId] = 0;
        }
        stagesInCategory[stageId]++;
      });
      
      Object.entries(stagesInCategory).forEach(([stageId, count]) => {
        const isTargetStage = stageId === 'UC_DMBNNJ';
        const color = isTargetStage ? 'green' : 'cyan';
        const marker = isTargetStage ? '🎯' : '  ';
        log(`      ${marker} ${stageId}: ${count} deali`, color);
        
        if (isTargetStage) {
          log(`         ✅ ZNALEZIONO DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
        }
      });
    });

    // 2. Sprawdź deali z etapu "Zamówienia ze strony opłacone"
    log(`\n2️⃣ Sprawdzanie deali z etapu "Zamówienia ze strony opłacone"...`, 'blue');
    const opłaconeDeals = await getDealsFromOpłaconeStage();
    
    log(`\n📊 DEALI Z ETAPU "ZAMÓWIENIA ZE STRONY OPŁACONE" (${opłaconeDeals.length}):`, 'bright');
    
    if (opłaconeDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "Zamówienia ze strony opłacone"`, 'red');
      log(`   Sprawdź czy nowe zamówienie zostało dodane do tego etapu`, 'yellow');
    } else {
      log(`✅ Znaleziono ${opłaconeDeals.length} deali w etapie "Zamówienia ze strony opłacone"!`, 'green');
      
      const totalValue = opłaconeDeals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl szczegóły deali
      log(`\n📋 SZCZEGÓŁY DEALI:`, 'bright');
      opłaconeDeals.forEach((deal, index) => {
        log(`\n${index + 1}. DEAL:`, 'bright');
        displayDealSummary(deal);
      });
    }

    // 3. Sprawdź deali w kategorii "Deale" (ID: 0)
    log(`\n3️⃣ Sprawdzanie deali w kategorii "Deale" (ID: 0)...`, 'blue');
    const dealeDeals = await getDealsByCategory(0);
    
    log(`\n📊 DEALI W KATEGORII "DEALE" (${dealeDeals.length}):`, 'bright');
    
    if (dealeDeals.length > 0) {
      log(`✅ Znaleziono ${dealeDeals.length} deali w kategorii "Deale"!`, 'green');
      
      // Sprawdź czy są deali w etapie "Zamówienia ze strony opłacone"
      const opłaconeInDeale = dealeDeals.filter(deal => deal.STAGE_ID === 'UC_DMBNNJ');
      if (opłaconeInDeale.length > 0) {
        log(`🎯 ZNALEZIONO ${opłaconeInDeale.length} DEALI W ETAPIE "Zamówienia ze strony opłacone" W KATEGORII "DEALE"!`, 'green');
        
        opłaconeInDeale.forEach((deal, index) => {
          log(`\n${index + 1}. DEAL W KATEGORII "DEALE":`, 'bright');
          displayDealSummary(deal);
        });
      }
    }

    // 4. Sprawdź deali w kategorii "Leady z Reklam" (ID: 2)
    log(`\n4️⃣ Sprawdzanie deali w kategorii "Leady z Reklam" (ID: 2)...`, 'blue');
    const leadyDeals = await getDealsByCategory(2);
    
    log(`\n📊 DEALI W KATEGORII "LEADY Z REKLAM" (${leadyDeals.length}):`, 'bright');
    
    if (leadyDeals.length > 0) {
      log(`✅ Znaleziono ${leadyDeals.length} deali w kategorii "Leady z Reklam"!`, 'green');
      
      // Sprawdź czy są deali w etapie "Zamówienia ze strony opłacone"
      const opłaconeInLeady = leadyDeals.filter(deal => deal.STAGE_ID === 'UC_DMBNNJ');
      if (opłaconeInLeady.length > 0) {
        log(`🎯 ZNALEZIONO ${opłaconeInLeady.length} DEALI W ETAPIE "Zamówienia ze strony opłacone" W KATEGORII "LEADY Z REKLAM"!`, 'green');
        
        opłaconeInLeady.forEach((deal, index) => {
          log(`\n${index + 1}. DEAL W KATEGORII "LEADY Z REKLAM":`, 'bright');
          displayDealSummary(deal);
        });
      }
    }

    log(`\n✅ Analiza zakończona!`, 'green');

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
  getDealsWithPagination,
  getDealsByCategory,
  getDealsFromOpłaconeStage,
  displayDealSummary
};
