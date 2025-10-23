/**
 * Skrypt do sprawdzenia deali w kategorii "Leady z Reklam" (ID: 2)
 * i poszukania etapu "Zamówienia ze strony opłacone"
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
 * Pobierz wszystkie deali z kategorii "Leady z Reklam" (ID: 2)
 */
async function getDealsFromLeadyCategory() {
  try {
    log(`🔍 Pobieranie deali z kategorii "Leady z Reklam" (ID: 2)...`, 'blue');
    
    const params = {
      filter: {
        CATEGORY_ID: 2
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
    log(`❌ Błąd podczas pobierania deali z kategorii "Leady z Reklam": ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z etapu "Zamówienia ze strony opłacone" w kategorii "Leady z Reklam"
 */
async function getDealsFromOpłaconeStageInLeady() {
  try {
    log(`🔍 Pobieranie deali z etapu "Zamówienia ze strony opłacone" w kategorii "Leady z Reklam"...`, 'blue');
    
    const params = {
      filter: {
        STAGE_ID: 'UC_DMBNNJ',
        CATEGORY_ID: 2
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
 * Pobierz wszystkie deali (bez filtrowania kategorii)
 */
async function getAllDealsUnfiltered() {
  try {
    log(`🔍 Pobieranie wszystkich deali (bez filtrów)...`, 'blue');
    
    const params = {
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
    log(`❌ Błąd podczas pobierania wszystkich deali: ${error.message}`, 'red');
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
    log(`🚀 Sprawdzanie deali w kategorii "Leady z Reklam"`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie deali
    log(`\n1️⃣ Pobieranie wszystkich deali...`, 'blue');
    const allDeals = await getAllDealsUnfiltered();
    
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
      log(`   Kategoria ${categoryId}: ${deals.length} deali, ${totalValue.toFixed(2)} PLN`, 'cyan');
      
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

    // 2. Pobierz deali z kategorii "Leady z Reklam"
    log(`\n2️⃣ Pobieranie deali z kategorii "Leady z Reklam"...`, 'blue');
    const leadyDeals = await getDealsFromLeadyCategory();
    
    log(`\n📊 DEALI W KATEGORII "LEADY Z REKLAM" (${leadyDeals.length}):`, 'bright');
    
    if (leadyDeals.length === 0) {
      log(`❌ Nie znaleziono deali w kategorii "Leady z Reklam"`, 'red');
      return;
    }

    // Grupuj deali według etapów
    const dealsByStage = {};
    leadyDeals.forEach(deal => {
      const stageId = deal.STAGE_ID;
      if (!dealsByStage[stageId]) {
        dealsByStage[stageId] = [];
      }
      dealsByStage[stageId].push(deal);
    });

    // Wyświetl statystyki według etapów
    log(`\n📊 DEALI WEDŁUG ETAPÓW W KATEGORII "LEADY Z REKLAM":`, 'bright');
    Object.entries(dealsByStage).forEach(([stageId, deals]) => {
      const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      const isTargetStage = stageId === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${stageId}: ${deals.length} deali, ${totalValue.toFixed(2)} PLN`, color);
      
      if (isTargetStage) {
        log(`     ✅ ZNALEZIONO ${deals.length} DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 3. Sprawdź deali z etapu "Zamówienia ze strony opłacone" w kategorii "Leady z Reklam"
    log(`\n3️⃣ Sprawdzanie deali z etapu "Zamówienia ze strony opłacone"...`, 'blue');
    const opłaconeDeals = await getDealsFromOpłaconeStageInLeady();
    
    log(`\n📊 DEALI Z ETAPU "ZAMÓWIENIA ZE STRONY OPŁACONE" (${opłaconeDeals.length}):`, 'bright');
    
    if (opłaconeDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "Zamówienia ze strony opłacone" w kategorii "Leady z Reklam"`, 'red');
      log(`   Sprawdź czy nowe zamówienie zostało dodane do tej kategorii`, 'yellow');
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

    // 4. Wyświetl wszystkie deali z kategorii "Leady z Reklam" (ostatnie 10)
    log(`\n4️⃣ Ostatnie 10 deali z kategorii "Leady z Reklam":`, 'blue');
    const recentDeals = leadyDeals.slice(0, 10);
    
    recentDeals.forEach((deal, index) => {
      log(`\n${index + 1}. DEAL:`, 'bright');
      displayDealSummary(deal);
    });

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
  getDealsFromLeadyCategory,
  getDealsFromOpłaconeStageInLeady,
  getAllDealsUnfiltered,
  displayDealSummary
};
