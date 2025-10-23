/**
 * Skrypt do pobierania deali używając nowej metody crm.item.list
 * zgodnie z dokumentacją Bitrix24
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
 * Pobierz deali z konkretnego etapu i kategorii (nowa metoda)
 */
async function getDealsByStageAndCategory(stageId, categoryId) {
  try {
    log(`🔍 Pobieranie deali z etapu ${stageId} w kategorii ${categoryId}...`, 'blue');
    
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
        "stageId": [stageId],
        "categoryId": categoryId
      },
      start: 0,
      order: { "id": "DESC" }
    };

    const response = await makeBitrix24Request('crm.item.list', params);
    return response.result?.items || response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z konkretnego etapu (wszystkie kategorie)
 */
async function getDealsByStage(stageId) {
  try {
    log(`🔍 Pobieranie deali z etapu ${stageId} (wszystkie kategorie)...`, 'blue');
    
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
    log(`❌ Błąd podczas pobierania deali z etapu: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z konkretnej kategorii (wszystkie etapy)
 */
async function getDealsByCategory(categoryId) {
  try {
    log(`🔍 Pobieranie deali z kategorii ${categoryId} (wszystkie etapy)...`, 'blue');
    
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
        "categoryId": categoryId
      },
      start: 0,
      order: { "id": "DESC" }
    };

    const response = await makeBitrix24Request('crm.item.list', params);
    return response.result?.items || response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z kategorii: ${error.message}`, 'red');
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
        start: start,
        order: { "id": "DESC" }
      };

      const response = await makeBitrix24Request('crm.item.list', params);
      const items = response.result?.items || response.result || [];
      
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
  log(`   📋 Tytuł: ${deal.title}`, 'cyan');
  log(`   🆔 ID: ${deal.id}`, 'blue');
  log(`   📊 Etap: ${deal.stageId}`, 'yellow');
  log(`   📁 Kategoria: ${deal.categoryId}`, 'magenta');
  log(`   💰 Kwota: ${formatAmount(deal.opportunity)}`, 'green');
  log(`   👤 Przypisany do: ${deal.assignedById}`, 'cyan');
  log(`   📅 Data utworzenia: ${formatDate(deal.createdTime)}`, 'blue');
  log(`   📅 Data modyfikacji: ${formatDate(deal.updatedTime)}`, 'blue');
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Pobieranie deali używając nowej metody crm.item.list`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie deali z paginacją
    log(`\n1️⃣ Pobieranie wszystkich deali z paginacją...`, 'blue');
    const allDeals = await getAllDealsWithPagination();
    
    log(`\n📊 WSZYSTKIE DEALI W SYSTEMIE (${allDeals.length}):`, 'bright');
    
    if (allDeals.length === 0) {
      log(`❌ Nie znaleziono żadnych deali w systemie`, 'red');
      return;
    }

    // Grupuj deali według kategorii i etapów
    const dealsByCategoryAndStage = {};
    allDeals.forEach(deal => {
      const categoryId = deal.categoryId || 'unknown';
      const stageId = deal.stageId || 'unknown';
      const key = `${categoryId}_${stageId}`;
      
      if (!dealsByCategoryAndStage[key]) {
        dealsByCategoryAndStage[key] = {
          categoryId,
          stageId,
          deals: [],
          totalValue: 0
        };
      }
      
      dealsByCategoryAndStage[key].deals.push(deal);
      dealsByCategoryAndStage[key].totalValue += Number(deal.opportunity) || 0;
    });

    // Wyświetl statystyki według kategorii i etapów
    log(`\n📊 DEALI WEDŁUG KATEGORII I ETAPÓW:`, 'bright');
    Object.values(dealsByCategoryAndStage).forEach(group => {
      const categoryName = group.categoryId === 0 ? 'Deale' : group.categoryId === 2 ? 'Leady z Reklam' : `Kategoria ${group.categoryId}`;
      const isTargetStage = group.stageId === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${categoryName} - ${group.stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, color);
      
      if (isTargetStage) {
        log(`     ✅ ZNALEZIONO DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 2. Sprawdź deali z etapu "Zamówienia ze strony opłacone"
    log(`\n2️⃣ Sprawdzanie deali z etapu "Zamówienia ze strony opłacone"...`, 'blue');
    const opłaconeDeals = await getDealsByStage('UC_DMBNNJ');
    
    log(`\n📊 DEALI Z ETAPU "ZAMÓWIENIA ZE STRONY OPŁACONE" (${opłaconeDeals.length}):`, 'bright');
    
    if (opłaconeDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "Zamówienia ze strony opłacone"`, 'red');
    } else {
      log(`✅ Znaleziono ${opłaconeDeals.length} deali w etapie "Zamówienia ze strony opłacone"!`, 'green');
      
      const totalValue = opłaconeDeals.reduce((sum, deal) => sum + (Number(deal.opportunity) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl szczegóły deali
      log(`\n📋 SZCZEGÓŁY DEALI:`, 'bright');
      opłaconeDeals.forEach((deal, index) => {
        displayDealDetails(deal, index);
      });
    }

    // 3. Sprawdź deali w kategorii "Deale" (ID: 0)
    log(`\n3️⃣ Sprawdzanie deali w kategorii "Deale" (ID: 0)...`, 'blue');
    const dealeDeals = await getDealsByCategory(0);
    
    log(`\n📊 DEALI W KATEGORII "DEALE" (${dealeDeals.length}):`, 'bright');
    
    if (dealeDeals.length > 0) {
      log(`✅ Znaleziono ${dealeDeals.length} deali w kategorii "Deale"!`, 'green');
      
      // Sprawdź czy są deali w etapie "Zamówienia ze strony opłacone"
      const opłaconeInDeale = dealeDeals.filter(deal => deal.stageId === 'UC_DMBNNJ');
      if (opłaconeInDeale.length > 0) {
        log(`🎯 ZNALEZIONO ${opłaconeInDeale.length} DEALI W ETAPIE "Zamówienia ze strony opłacone" W KATEGORII "DEALE"!`, 'green');
        
        opłaconeInDeale.forEach((deal, index) => {
          displayDealDetails(deal, index);
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
      const opłaconeInLeady = leadyDeals.filter(deal => deal.stageId === 'UC_DMBNNJ');
      if (opłaconeInLeady.length > 0) {
        log(`🎯 ZNALEZIONO ${opłaconeInLeady.length} DEALI W ETAPIE "Zamówienia ze strony opłacone" W KATEGORII "LEADY Z REKLAM"!`, 'green');
        
        opłaconeInLeady.forEach((deal, index) => {
          displayDealDetails(deal, index);
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
  getDealsByStageAndCategory,
  getDealsByStage,
  getDealsByCategory,
  getAllDealsWithPagination,
  displayDealDetails
};
