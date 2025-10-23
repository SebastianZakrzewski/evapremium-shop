/**
 * Skrypt do sprawdzenia etapów deali używając alternatywnych metod API
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
 * Pobierz wszystkie deali z paginacją
 */
async function getAllDealsWithPagination() {
  try {
    log(`🔍 Pobieranie wszystkich deali z paginacją...`, 'blue');
    
    const allResults = [];
    let start = 0;
    const batchSize = 50;
    let hasMore = true;
    let page = 1;

    while (hasMore) {
      log(`   📄 Strona ${page} (start: ${start})...`, 'cyan');
      
      const params = {
        select: [
          'ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 
          'CONTACT_ID', 'CATEGORY_ID', 'DATE_CREATE', 'DATE_MODIFY'
        ],
        start: start,
        order: { DATE_CREATE: 'DESC' }
      };

      const response = await makeBitrix24Request('crm.deal.list', params);
      const items = response.result || [];
      
      log(`   📊 Znaleziono ${items.length} deali na stronie ${page}`, 'cyan');
      
      if (items.length === 0) {
        hasMore = false;
      } else {
        allResults.push(...items);
        start += batchSize;
        page++;
        
        // Ograniczenie do 200 deali (4 strony)
        if (allResults.length >= 200) {
          log(`   ⚠️  Osiągnięto limit 200 deali`, 'yellow');
          hasMore = false;
        }
        
        // Krótka pauza między żądaniami
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    log(`✅ Pobrano łącznie ${allResults.length} deali`, 'green');
    return allResults;

  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z paginacją: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z konkretnego etapu
 */
async function getDealsByStage(stageId) {
  try {
    log(`🔍 Pobieranie deali z etapu ${stageId}...`, 'blue');
    
    const params = {
      filter: {
        STAGE_ID: stageId
      },
      select: [
        'ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 
        'CONTACT_ID', 'CATEGORY_ID', 'DATE_CREATE', 'DATE_MODIFY'
      ],
      start: 0,
      order: { DATE_CREATE: 'DESC' }
    };

    const response = await makeBitrix24Request('crm.deal.list', params);
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z etapu: ${error.message}`, 'red');
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
function displayDealDetails(deal, index) {
  log(`\n${index + 1}. DEAL:`, 'bright');
  log(`   📋 Tytuł: ${deal.TITLE}`, 'cyan');
  log(`   🆔 ID: ${deal.ID}`, 'blue');
  log(`   📊 Etap: ${deal.STAGE_ID}`, 'yellow');
  log(`   📁 Kategoria: ${deal.CATEGORY_ID}`, 'magenta');
  log(`   💰 Kwota: ${formatAmount(deal.OPPORTUNITY, deal.CURRENCY_ID)}`, 'green');
  log(`   📅 Data utworzenia: ${formatDate(deal.DATE_CREATE)}`, 'blue');
  log(`   📅 Data modyfikacji: ${formatDate(deal.DATE_MODIFY)}`, 'blue');
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie etapów deali w Bitrix24 - alternatywna metoda`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie deali z paginacją
    log(`\n1️⃣ Pobieranie wszystkich deali z paginacją...`, 'blue');
    const allDeals = await getAllDealsWithPagination();
    
    log(`\n📊 WSZYSTKIE DEALI W SYSTEMIE (${allDeals.length}):`, 'bright');
    
    if (allDeals.length === 0) {
      log(`❌ Nie znaleziono żadnych deali w systemie`, 'red');
      return;
    }

    // Grupuj deali według etapów
    const dealsByStage = {};
    allDeals.forEach(deal => {
      const stageId = deal.STAGE_ID || 'unknown';
      
      if (!dealsByStage[stageId]) {
        dealsByStage[stageId] = {
          stageId,
          deals: [],
          totalValue: 0
        };
      }
      
      dealsByStage[stageId].deals.push(deal);
      dealsByStage[stageId].totalValue += Number(deal.OPPORTUNITY) || 0;
    });

    // Wyświetl statystyki według etapów
    log(`\n📊 DEALI WEDŁUG ETAPÓW:`, 'bright');
    Object.values(dealsByStage).forEach(group => {
      const isTargetStage = group.stageId === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${group.stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, color);
      
      if (isTargetStage) {
        log(`     ✅ ZNALEZIONO DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 2. Sprawdź deali w etapie UC_DMBNNJ
    log(`\n2️⃣ Sprawdzanie deali w etapie "UC_DMBNNJ"...`, 'blue');
    const opłaconeDeals = await getDealsByStage('UC_DMBNNJ');
    
    log(`\n📊 DEALI Z ETAPU "UC_DMBNNJ" (${opłaconeDeals.length}):`, 'bright');
    
    if (opłaconeDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "UC_DMBNNJ"`, 'red');
    } else {
      log(`✅ Znaleziono ${opłaconeDeals.length} deali w etapie "UC_DMBNNJ"!`, 'green');
      
      const totalValue = opłaconeDeals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl szczegóły deali
      log(`\n📋 SZCZEGÓŁY DEALI:`, 'bright');
      opłaconeDeals.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    }

    // 3. Sprawdź inne etapy, które mogą zawierać "opłacone" deali
    log(`\n3️⃣ Sprawdzanie innych etapów z "opłacone" deali...`, 'blue');
    
    const opłaconeStages = Object.keys(dealsByStage).filter(stageId => {
      return stageId && stageId.toLowerCase().includes('opłacone');
    });

    if (opłaconeStages.length > 0) {
      log(`\n🎯 ZNALEZIONO ETAPY Z "OPŁACONE":`, 'green');
      opłaconeStages.forEach(stageId => {
        const group = dealsByStage[stageId];
        log(`   📊 ${stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, 'green');
      });
    } else {
      log(`❌ Nie znaleziono etapów z "opłacone" w ID`, 'red');
    }

    // 4. Sprawdź etapy z "WON" (zamknięte wygrane)
    log(`\n4️⃣ Sprawdzanie etapów "WON" (zamknięte wygrane)...`, 'blue');
    
    const wonStages = Object.keys(dealsByStage).filter(stageId => {
      return stageId && stageId.includes('WON');
    });

    if (wonStages.length > 0) {
      log(`\n🎯 ZNALEZIONO ETAPY "WON":`, 'green');
      wonStages.forEach(stageId => {
        const group = dealsByStage[stageId];
        log(`   📊 ${stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, 'green');
      });
    } else {
      log(`❌ Nie znaleziono etapów "WON"`, 'red');
    }

    // 5. Sprawdź etapy z "EXECUTING" (wysłane do realizacji)
    log(`\n5️⃣ Sprawdzanie etapów "EXECUTING" (wysłane do realizacji)...`, 'blue');
    
    const executingStages = Object.keys(dealsByStage).filter(stageId => {
      return stageId && stageId.includes('EXECUTING');
    });

    if (executingStages.length > 0) {
      log(`\n🎯 ZNALEZIONO ETAPY "EXECUTING":`, 'green');
      executingStages.forEach(stageId => {
        const group = dealsByStage[stageId];
        log(`   📊 ${stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, 'green');
      });
    } else {
      log(`❌ Nie znaleziono etapów "EXECUTING"`, 'red');
    }

    // 6. Sprawdź etapy z "FINAL_INVOICE" (faktura końcowa)
    log(`\n6️⃣ Sprawdzanie etapów "FINAL_INVOICE" (faktura końcowa)...`, 'blue');
    
    const finalInvoiceStages = Object.keys(dealsByStage).filter(stageId => {
      return stageId && stageId.includes('FINAL_INVOICE');
    });

    if (finalInvoiceStages.length > 0) {
      log(`\n🎯 ZNALEZIONO ETAPY "FINAL_INVOICE":`, 'green');
      finalInvoiceStages.forEach(stageId => {
        const group = dealsByStage[stageId];
        log(`   📊 ${stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, 'green');
      });
    } else {
      log(`❌ Nie znaleziono etapów "FINAL_INVOICE"`, 'red');
    }

    // 7. Sprawdź etapy z "C2:" (kategoria 2)
    log(`\n7️⃣ Sprawdzanie etapów "C2:" (kategoria 2)...`, 'blue');
    
    const c2Stages = Object.keys(dealsByStage).filter(stageId => {
      return stageId && stageId.startsWith('C2:');
    });

    if (c2Stages.length > 0) {
      log(`\n🎯 ZNALEZIONO ETAPY "C2:":`, 'green');
      c2Stages.forEach(stageId => {
        const group = dealsByStage[stageId];
        log(`   📊 ${stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, 'green');
      });
    } else {
      log(`❌ Nie znaleziono etapów "C2:"`, 'red');
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
  getAllDealsWithPagination,
  getDealsByStage,
  displayDealDetails
};
