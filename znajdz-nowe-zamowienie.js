/**
 * Skrypt do znalezienia nowego zamówienia w Bitrix24
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
 * Pobierz wszystkie deali z kategorii "Leady z Reklam"
 */
async function getAllDealsFromLeadyCategory() {
  try {
    log(`🔍 Pobieranie wszystkich deali z kategorii "Leady z Reklam"...`, 'blue');
    
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
 * Pobierz wszystkie etapy deali
 */
async function getAllDealStages() {
  try {
    log(`🔍 Pobieranie wszystkich etapów deali...`, 'blue');
    
    const response = await makeBitrix24Request('crm.dealcategory.stage.list');
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania etapów deali: ${error.message}`, 'red');
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
  log(`   💰 Kwota: ${formatAmount(deal.OPPORTUNITY, deal.CURRENCY_ID)}`, 'green');
  log(`   📅 Data utworzenia: ${formatDate(deal.DATE_CREATE)}`, 'blue');
  log(`   📅 Data modyfikacji: ${formatDate(deal.DATE_MODIFY)}`, 'blue');
  
  if (deal.ORIGIN_ID) {
    log(`   🔗 Numer zamówienia (ORIGIN_ID): ${deal.ORIGIN_ID}`, 'magenta');
  }
  if (deal.UF_CRM_ORDER_NUMBER) {
    log(`   🔗 Numer zamówienia (UF_CRM): ${deal.UF_CRM_ORDER_NUMBER}`, 'magenta');
  }
  if (deal.UF_CRM_PAYMENT_STATUS) {
    log(`   💳 Status płatności: ${deal.UF_CRM_PAYMENT_STATUS}`, 'yellow');
  }
  if (deal.UF_CRM_PAYMENT_METHOD) {
    log(`   💳 Metoda płatności: ${deal.UF_CRM_PAYMENT_METHOD}`, 'yellow');
  }
  if (deal.ORIGINATOR_ID) {
    log(`   🔗 System źródłowy: ${deal.ORIGINATOR_ID}`, 'magenta');
  }
  if (deal.SOURCE_ID) {
    log(`   🔗 ID źródła: ${deal.SOURCE_ID}`, 'magenta');
  }
  if (deal.COMMENTS) {
    log(`   💬 Komentarze: ${deal.COMMENTS}`, 'cyan');
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Wyszukiwanie nowego zamówienia w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie etapy deali
    log(`\n1️⃣ Pobieranie wszystkich etapów deali...`, 'blue');
    const stages = await getAllDealStages();
    
    log(`\n📊 ETAPY DEALI (${stages.length}):`, 'bright');
    stages.forEach((stage, index) => {
      const isTargetStage = stage.STATUS_ID === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${index + 1}. ${stage.NAME} (ID: ${stage.STATUS_ID})`, color);
      if (isTargetStage) {
        log(`     ✅ TO JEST ETAP "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 2. Pobierz wszystkie deali z kategorii "Leady z Reklam"
    log(`\n2️⃣ Pobieranie wszystkich deali z kategorii "Leady z Reklam"...`, 'blue');
    const leadyDeals = await getAllDealsFromLeadyCategory();
    
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
    log(`\n📊 DEALI WEDŁUG ETAPÓW:`, 'bright');
    Object.entries(dealsByStage).forEach(([stageId, deals]) => {
      const stage = stages.find(s => s.STATUS_ID === stageId);
      const stageName = stage ? stage.NAME : `Nieznany etap (${stageId})`;
      const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      const isTargetStage = stageId === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${stageName} (${stageId}): ${deals.length} deali, ${totalValue.toFixed(2)} PLN`, color);
      
      if (isTargetStage) {
        log(`     ✅ ZNALEZIONO DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 3. Wyświetl ostatnie 10 deali (najnowsze)
    log(`\n3️⃣ Ostatnie 10 deali (najnowsze):`, 'blue');
    const recentDeals = leadyDeals.slice(0, 10);
    
    recentDeals.forEach((deal, index) => {
      displayDealDetails(deal, index);
    });

    // 4. Szukaj deali z numerami zamówień
    log(`\n4️⃣ Szukanie deali z numerami zamówień...`, 'blue');
    const dealsWithOrderNumbers = leadyDeals.filter(deal => 
      deal.ORIGIN_ID || deal.UF_CRM_ORDER_NUMBER
    );
    
    if (dealsWithOrderNumbers.length > 0) {
      log(`✅ Znaleziono ${dealsWithOrderNumbers.length} deali z numerami zamówień:`, 'green');
      dealsWithOrderNumbers.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    } else {
      log(`❌ Nie znaleziono deali z numerami zamówień`, 'red');
    }

    // 5. Szukaj deali z statusem płatności
    log(`\n5️⃣ Szukanie deali ze statusem płatności...`, 'blue');
    const dealsWithPaymentStatus = leadyDeals.filter(deal => 
      deal.UF_CRM_PAYMENT_STATUS
    );
    
    if (dealsWithPaymentStatus.length > 0) {
      log(`✅ Znaleziono ${dealsWithPaymentStatus.length} deali ze statusem płatności:`, 'green');
      dealsWithPaymentStatus.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    } else {
      log(`❌ Nie znaleziono deali ze statusem płatności`, 'red');
    }

    // 6. Szukaj deali z systemem źródłowym "EVA Website"
    log(`\n6️⃣ Szukanie deali z systemem źródłowym "EVA Website"...`, 'blue');
    const dealsFromEvaWebsite = leadyDeals.filter(deal => 
      deal.ORIGINATOR_ID === 'EVA Website' || 
      deal.SOURCE_DESCRIPTION === 'EVA Website' ||
      deal.UF_CRM_ORDER_SOURCE === 'EVA Website'
    );
    
    if (dealsFromEvaWebsite.length > 0) {
      log(`✅ Znaleziono ${dealsFromEvaWebsite.length} deali z systemu "EVA Website":`, 'green');
      dealsFromEvaWebsite.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    } else {
      log(`❌ Nie znaleziono deali z systemu "EVA Website"`, 'red');
    }

    log(`\n✅ Analiza zakończona!`, 'green');
    log(`📊 Podsumowanie:`, 'bright');
    log(`   - Wszystkie deali: ${leadyDeals.length}`, 'cyan');
    log(`   - Z numerami zamówień: ${dealsWithOrderNumbers.length}`, 'cyan');
    log(`   - Ze statusem płatności: ${dealsWithPaymentStatus.length}`, 'cyan');
    log(`   - Z systemu EVA Website: ${dealsFromEvaWebsite.length}`, 'cyan');

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
  getAllDealsFromLeadyCategory,
  getAllDealStages,
  displayDealDetails
};
