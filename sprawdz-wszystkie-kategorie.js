/**
 * Skrypt do sprawdzenia wszystkich kategorii deali w Bitrix24
 * i próby znalezienia deali w różnych kategoriach
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
 * Pobierz wszystkie deali bez filtrowania kategorii
 */
async function getAllDealsUnfiltered() {
  try {
    log(`🔍 Pobieranie wszystkich deali (bez filtrów)...`, 'blue');
    
    const params = {
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CATEGORY_ID', 'DATE_CREATE'],
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
 * Pobierz deali z konkretnej kategorii
 */
async function getDealsByCategory(categoryId) {
  try {
    log(`🔍 Pobieranie deali z kategorii ${categoryId}...`, 'blue');
    
    const params = {
      filter: {
        CATEGORY_ID: categoryId
      },
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CATEGORY_ID', 'DATE_CREATE'],
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
 * Pobierz deali z konkretnego etapu (bez filtrowania kategorii)
 */
async function getDealsByStage(stageId) {
  try {
    log(`🔍 Pobieranie deali z etapu ${stageId}...`, 'blue');
    
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
    return [];
  }
}

/**
 * Pobierz informacje o użytkowniku
 */
async function getCurrentUser() {
  try {
    const response = await makeBitrix24Request('user.current');
    return response.result;
  } catch (error) {
    log(`❌ Błąd podczas pobierania informacji o użytkowniku: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Sprawdź uprawnienia do różnych modułów
 */
async function checkPermissions() {
  try {
    const modules = ['crm', 'crm.deal', 'crm.contact', 'crm.lead'];
    const permissions = {};
    
    for (const module of modules) {
      try {
        const response = await makeBitrix24Request(`${module}.fields`);
        permissions[module] = {
          accessible: true,
          fieldsCount: Object.keys(response.result || {}).length
        };
      } catch (error) {
        permissions[module] = {
          accessible: false,
          error: error.message
        };
      }
    }
    
    return permissions;
  } catch (error) {
    log(`❌ Błąd podczas sprawdzania uprawnień: ${error.message}`, 'red');
    return {};
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie wszystkich kategorii i deali w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Sprawdź informacje o użytkowniku
    log(`\n1️⃣ Sprawdzanie informacji o użytkowniku...`, 'blue');
    const user = await getCurrentUser();
    if (user) {
      log(`✅ Użytkownik: ${user.NAME || 'Nieznany'} (ID: ${user.ID})`, 'green');
      log(`   Email: ${user.EMAIL || 'Brak'}`, 'cyan');
      log(`   Aktywny: ${user.ACTIVE === 'Y' ? 'Tak' : 'Nie'}`, 'cyan');
      log(`   Administrator: ${user.ADMIN === 'Y' ? 'Tak' : 'Nie'}`, 'cyan');
    }

    // 2. Sprawdź uprawnienia
    log(`\n2️⃣ Sprawdzanie uprawnień...`, 'blue');
    const permissions = await checkPermissions();
    Object.entries(permissions).forEach(([module, perm]) => {
      if (perm.accessible) {
        log(`   ✅ ${module}: dostępny (${perm.fieldsCount} pól)`, 'green');
      } else {
        log(`   ❌ ${module}: niedostępny (${perm.error})`, 'red');
      }
    });

    // 3. Pobierz wszystkie deali
    log(`\n3️⃣ Pobieranie wszystkich deali...`, 'blue');
    const allDeals = await getAllDealsUnfiltered();
    
    log(`\n📊 WSZYSTKIE DEALI W SYSTEMIE (${allDeals.length}):`, 'bright');
    
    if (allDeals.length === 0) {
      log(`❌ Nie znaleziono żadnych deali w systemie`, 'red');
      log(`   Możliwe przyczyny:`, 'yellow');
      log(`   - Użytkownik nie ma uprawnień do deali`, 'yellow');
      log(`   - Deali nie istnieją w systemie`, 'yellow');
      log(`   - Deali są w innym module (np. Leads)`, 'yellow');
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

    // 4. Sprawdź deali z etapu UC_DMBNNJ bez filtrowania kategorii
    log(`\n4️⃣ Sprawdzanie deali z etapu UC_DMBNNJ...`, 'blue');
    const opłaconeDeals = await getDealsByStage('UC_DMBNNJ');
    
    log(`\n📊 DEALI Z ETAPU "ZAMÓWIENIA ZE STRONY OPŁACONE" (${opłaconeDeals.length}):`, 'bright');
    
    if (opłaconeDeals.length === 0) {
      log(`❌ Nie znaleziono deali w etapie "Zamówienia ze strony opłacone"`, 'red');
    } else {
      log(`✅ Znaleziono ${opłaconeDeals.length} deali w etapie "Zamówienia ze strony opłacone"!`, 'green');
      
      const totalValue = opłaconeDeals.reduce((sum, deal) => sum + (Number(deal.OPPORTUNITY) || 0), 0);
      log(`💰 Łączna wartość: ${totalValue.toFixed(2)} PLN`, 'green');
      
      // Wyświetl szczegóły deali
      opłaconeDeals.forEach((deal, index) => {
        log(`   ${index + 1}. ${deal.TITLE} - ${Number(deal.OPPORTUNITY).toFixed(2)} ${deal.CURRENCY_ID} (Kategoria: ${deal.CATEGORY_ID})`, 'green');
      });
    }

    // 5. Sprawdź różne kategorie (0, 1, 2, 3, 4, 5)
    log(`\n5️⃣ Sprawdzanie różnych kategorii...`, 'blue');
    const categoriesToCheck = [0, 1, 2, 3, 4, 5];
    
    for (const categoryId of categoriesToCheck) {
      const dealsInCategory = await getDealsByCategory(categoryId);
      if (dealsInCategory.length > 0) {
        log(`   Kategoria ${categoryId}: ${dealsInCategory.length} deali`, 'cyan');
        
        // Sprawdź czy są deali w etapie UC_DMBNNJ
        const opłaconeInCategory = dealsInCategory.filter(deal => deal.STAGE_ID === 'UC_DMBNNJ');
        if (opłaconeInCategory.length > 0) {
          log(`     🎯 ZNALEZIONO ${opłaconeInCategory.length} DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
          opłaconeInCategory.forEach((deal, index) => {
            log(`        ${index + 1}. ${deal.TITLE} - ${Number(deal.OPPORTUNITY).toFixed(2)} ${deal.CURRENCY_ID}`, 'green');
          });
        }
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
  getAllDealsUnfiltered,
  getDealsByCategory,
  getDealsByStage,
  getCurrentUser,
  checkPermissions
};
