/**
 * Skrypt do sprawdzenia wszystkich etapów deali w Bitrix24
 * i weryfikacji czy etap UC_DMBNNJ rzeczywiście istnieje
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
    throw error;
  }
}

/**
 * Pobierz wszystkie deali (bez filtrowania po etapie)
 */
async function getAllDeals() {
  try {
    log(`🔍 Pobieranie wszystkich deali...`, 'blue');
    
    const params = {
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CATEGORY_ID', 'DATE_CREATE'],
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
 * Pobierz deali z konkretnego etapu
 */
async function getDealsByStage(stageId) {
  try {
    log(`🔍 Pobieranie deali z etapu: ${stageId}`, 'blue');
    
    const params = {
      filter: {
        STAGE_ID: stageId
      },
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CATEGORY_ID', 'DATE_CREATE'],
      start: 0,
      order: { DATE_CREATE: 'DESC' }
    };

    const response = await makeBitrix24Request('crm.deal.list', params);
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z etapu ${stageId}: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie etapów deali w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Pobierz wszystkie etapy deali
    log(`\n1️⃣ Pobieranie wszystkich etapów deali...`, 'blue');
    const stages = await getAllDealStages();
    
    log(`\n📊 ZNALEZIONE ETAPY DEALI (${stages.length}):`, 'bright');
    stages.forEach((stage, index) => {
      const isTargetStage = stage.STATUS_ID === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      log(`${marker} ${index + 1}. ${stage.NAME} (ID: ${stage.STATUS_ID})`, color);
      if (isTargetStage) {
        log(`     ✅ TO JEST ETAP "Zamówienia ze strony opłacone"!`, 'green');
      }
    });

    // 2. Sprawdź czy etap UC_DMBNNJ istnieje
    const targetStage = stages.find(stage => stage.STATUS_ID === 'UC_DMBNNJ');
    if (!targetStage) {
      log(`\n❌ Etap UC_DMBNNJ nie został znaleziony w liście etapów!`, 'red');
      log(`   Sprawdź czy nazwa etapu w Bitrix24 to rzeczywiście "Zamówienia ze strony opłacone"`, 'yellow');
      return;
    }

    log(`\n✅ Etap UC_DMBNNJ istnieje: ${targetStage.NAME}`, 'green');

    // 3. Pobierz wszystkie deali
    log(`\n2️⃣ Pobieranie wszystkich deali...`, 'blue');
    const allDeals = await getAllDeals();
    
    log(`\n📊 WSZYSTKIE DEALI (${allDeals.length}):`, 'bright');
    
    // Grupuj deali według etapów
    const dealsByStage = {};
    allDeals.forEach(deal => {
      const stageId = deal.STAGE_ID;
      if (!dealsByStage[stageId]) {
        dealsByStage[stageId] = [];
      }
      dealsByStage[stageId].push(deal);
    });

    // Wyświetl statystyki według etapów
    Object.entries(dealsByStage).forEach(([stageId, deals]) => {
      const stage = stages.find(s => s.STATUS_ID === stageId);
      const stageName = stage ? stage.NAME : `Nieznany etap (${stageId})`;
      const isTargetStage = stageId === 'UC_DMBNNJ';
      const color = isTargetStage ? 'green' : 'cyan';
      const marker = isTargetStage ? '🎯' : '  ';
      
      const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      
      log(`${marker} ${stageName} (${stageId}): ${deals.length} deali, ${totalValue.toFixed(2)} PLN`, color);
      
      if (isTargetStage) {
        log(`     ✅ ZNALEZIONO ${deals.length} DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
        
        // Wyświetl szczegóły deali z tego etapu
        deals.forEach((deal, index) => {
          log(`        ${index + 1}. ${deal.TITLE} - ${Number(deal.OPPORTUNITY).toFixed(2)} ${deal.CURRENCY_ID}`, 'green');
        });
      }
    });

    // 4. Sprawdź deali z konkretnego etapu UC_DMBNNJ
    log(`\n3️⃣ Sprawdzanie deali z etapu UC_DMBNNJ...`, 'blue');
    const targetDeals = await getDealsByStage('UC_DMBNNJ');
    
    log(`\n📊 DEALI Z ETAPU UC_DMBNNJ (${targetDeals.length}):`, 'bright');
    if (targetDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie UC_DMBNNJ`, 'red');
      log(`   Możliwe przyczyny:`, 'yellow');
      log(`   - Dealie są w innej kategorii (CATEGORY_ID)`, 'yellow');
      log(`   - Problem z uprawnieniami`, 'yellow');
      log(`   - Dealie zostały przeniesione do innego etapu`, 'yellow');
    } else {
      log(`✅ Znaleziono ${targetDeals.length} deali w etapie UC_DMBNNJ!`, 'green');
      targetDeals.forEach((deal, index) => {
        log(`   ${index + 1}. ${deal.TITLE} - ${Number(deal.OPPORTUNITY).toFixed(2)} ${deal.CURRENCY_ID}`, 'green');
      });
    }

    // 5. Sprawdź deali z różnych kategorii
    log(`\n4️⃣ Sprawdzanie deali z różnych kategorii...`, 'blue');
    
    // Sprawdź kategorię 0 (Deale)
    const dealsCategory0 = await getDealsByStage('UC_DMBNNJ');
    log(`   Kategoria 0 (Deale): ${dealsCategory0.length} deali`, 'cyan');
    
    // Sprawdź bez filtrowania kategorii
    const params = {
      filter: {
        STAGE_ID: 'UC_DMBNNJ'
      },
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CATEGORY_ID'],
      start: 0
    };
    
    const response = await makeBitrix24Request('crm.deal.list', params);
    const dealsNoCategoryFilter = response.result || [];
    log(`   Bez filtrowania kategorii: ${dealsNoCategoryFilter.length} deali`, 'cyan');

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
  getAllDeals,
  getDealsByStage
};
