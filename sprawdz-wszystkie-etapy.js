/**
 * Skrypt do sprawdzenia wszystkich etapów deali w Bitrix24
 * zgodnie z dokumentacją API
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
 * Pobierz wszystkie etapy deali
 */
async function getAllDealStages() {
  try {
    log(`🔍 Pobieranie wszystkich etapów deali...`, 'blue');
    
    const response = await makeBitrix24Request('crm.dealcategory.stage.list');
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania etapów: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z konkretnego etapu używając nowej metody crm.item.list
 */
async function getDealsByStageNew(stageId) {
  try {
    log(`🔍 Pobieranie deali z etapu ${stageId} (nowa metoda)...`, 'blue');
    
    const params = {
      entityTypeId: 2, // 2 = Deali
      select: [
        "id", 
        "title",
        "assignedById", 
        "opportunity",
        "stageId",
        "categoryId",
        "createdTime",
        "updatedTime"
      ],
      filter: {
        "stageId": [stageId]
      },
      start: 0,
      order: { "id": "DESC" }
    };

    const response = await makeBitrix24Request('crm.item.list', params);
    return response.result?.items || response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z etapu (nowa metoda): ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z konkretnego etapu używając starej metody crm.deal.list
 */
async function getDealsByStageOld(stageId) {
  try {
    log(`🔍 Pobieranie deali z etapu ${stageId} (stara metoda)...`, 'blue');
    
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
    log(`❌ Błąd podczas pobierania deali z etapu (stara metoda): ${error.message}`, 'red');
    return [];
  }
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
  log(`   📋 Tytuł: ${deal.TITLE || deal.title}`, 'cyan');
  log(`   🆔 ID: ${deal.ID || deal.id}`, 'blue');
  log(`   📊 Etap: ${deal.STAGE_ID || deal.stageId}`, 'yellow');
  log(`   📁 Kategoria: ${deal.CATEGORY_ID || deal.categoryId}`, 'magenta');
  log(`   💰 Kwota: ${formatAmount(deal.OPPORTUNITY || deal.opportunity, deal.CURRENCY_ID || deal.currencyId)}`, 'green');
  log(`   📅 Data utworzenia: ${formatDate(deal.DATE_CREATE || deal.createdTime)}`, 'blue');
  log(`   📅 Data modyfikacji: ${formatDate(deal.DATE_MODIFY || deal.updatedTime)}`, 'blue');
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie wszystkich etapów deali w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie etapy deali
    log(`\n1️⃣ Pobieranie wszystkich etapów deali...`, 'blue');
    const stages = await getAllDealStages();
    
    log(`\n📊 WSZYSTKIE ETAPY DEALI (${stages.length}):`, 'bright');
    
    if (stages.length === 0) {
      log(`❌ Nie znaleziono etapów deali`, 'red');
      return;
    }

    // Wyświetl wszystkie etapy
    stages.forEach((stage, index) => {
      const isTargetStage = stage.ID === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${index + 1}. ${stage.NAME} (ID: ${stage.ID})`, color);
      
      if (isTargetStage) {
        log(`     ✅ TO JEST ETAP "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 2. Sprawdź czy etap UC_DMBNNJ istnieje
    const targetStage = stages.find(stage => stage.ID === 'UC_DMBNNJ');
    
    if (!targetStage) {
      log(`\n❌ ETAP "UC_DMBNNJ" NIE ZNALEZIONY!`, 'red');
      log(`📋 Dostępne etapy:`, 'yellow');
      stages.forEach((stage, index) => {
        log(`   ${index + 1}. ${stage.NAME} (ID: ${stage.ID})`, 'cyan');
      });
    } else {
      log(`\n✅ ETAP "UC_DMBNNJ" ZNALEZIONY: ${targetStage.NAME}`, 'green');
    }

    // 3. Pobierz wszystkie deali z paginacją
    log(`\n2️⃣ Pobieranie wszystkich deali z paginacją...`, 'blue');
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

    // 4. Sprawdź deali w etapie UC_DMBNNJ (stara metoda)
    log(`\n3️⃣ Sprawdzanie deali w etapie "UC_DMBNNJ" (stara metoda)...`, 'blue');
    const opłaconeDealsOld = await getDealsByStageOld('UC_DMBNNJ');
    
    log(`\n📊 DEALI Z ETAPU "UC_DMBNNJ" - STARA METODA (${opłaconeDealsOld.length}):`, 'bright');
    
    if (opłaconeDealsOld.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "UC_DMBNNJ" (stara metoda)`, 'red');
    } else {
      log(`✅ Znaleziono ${opłaconeDealsOld.length} deali w etapie "UC_DMBNNJ" (stara metoda)!`, 'green');
      
      const totalValue = opłaconeDealsOld.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl szczegóły deali
      log(`\n📋 SZCZEGÓŁY DEALI (STARA METODA):`, 'bright');
      opłaconeDealsOld.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    }

    // 5. Sprawdź deali w etapie UC_DMBNNJ (nowa metoda)
    log(`\n4️⃣ Sprawdzanie deali w etapie "UC_DMBNNJ" (nowa metoda)...`, 'blue');
    const opłaconeDealsNew = await getDealsByStageNew('UC_DMBNNJ');
    
    log(`\n📊 DEALI Z ETAPU "UC_DMBNNJ" - NOWA METODA (${opłaconeDealsNew.length}):`, 'bright');
    
    if (opłaconeDealsNew.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "UC_DMBNNJ" (nowa metoda)`, 'red');
    } else {
      log(`✅ Znaleziono ${opłaconeDealsNew.length} deali w etapie "UC_DMBNNJ" (nowa metoda)!`, 'green');
      
      const totalValue = opłaconeDealsNew.reduce((sum, deal) => sum + (Number(deal.opportunity) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl szczegóły deali
      log(`\n📋 SZCZEGÓŁY DEALI (NOWA METODA):`, 'bright');
      opłaconeDealsNew.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    }

    // 6. Sprawdź inne etapy, które mogą zawierać "opłacone" deali
    log(`\n5️⃣ Sprawdzanie innych etapów z "opłacone" deali...`, 'blue');
    
    const opłaconeStages = Object.keys(dealsByStage).filter(stageId => {
      const stage = stages.find(s => s.ID === stageId);
      return stage && stage.NAME && stage.NAME.toLowerCase().includes('opłacone');
    });

    if (opłaconeStages.length > 0) {
      log(`\n🎯 ZNALEZIONO ETAPY Z "OPŁACONE":`, 'green');
      opłaconeStages.forEach(stageId => {
        const stage = stages.find(s => s.ID === stageId);
        const group = dealsByStage[stageId];
        log(`   📊 ${stage.NAME} (${stageId}): ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, 'green');
      });
    } else {
      log(`❌ Nie znaleziono etapów z "opłacone" w nazwie`, 'red');
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
  getAllDealStages,
  getDealsByStageNew,
  getDealsByStageOld,
  getAllDealsWithPagination,
  displayDealDetails
};
