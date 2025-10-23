/**
 * Skrypt do sprawdzenia uprawnień i kategorii deali w Bitrix24
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
 * Pobierz wszystkie kategorie deali
 */
async function getDealCategories() {
  try {
    const response = await makeBitrix24Request('crm.dealcategory.list');
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania kategorii deali: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz deali z określonej kategorii
 */
async function getDealsByCategory(categoryId) {
  try {
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
 * Pobierz deali z określonego etapu w określonej kategorii
 */
async function getDealsByStageAndCategory(stageId, categoryId) {
  try {
    const params = {
      filter: {
        STAGE_ID: stageId,
        CATEGORY_ID: categoryId
      },
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CATEGORY_ID', 'DATE_CREATE'],
      start: 0,
      order: { DATE_CREATE: 'DESC' }
    };

    const response = await makeBitrix24Request('crm.deal.list', params);
    return response.result || [];
  } catch (error) {
    log(`❌ Błąd podczas pobierania deali z etapu ${stageId} w kategorii ${categoryId}: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Pobierz wszystkie deali (bez żadnych filtrów)
 */
async function getAllDealsUnfiltered() {
  try {
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
 * Sprawdź uprawnienia do CRM
 */
async function checkCrmPermissions() {
  try {
    // Sprawdź uprawnienia do deali
    const dealFieldsResponse = await makeBitrix24Request('crm.deal.fields');
    const dealFields = dealFieldsResponse.result || {};
    
    // Sprawdź uprawnienia do kontaktów
    const contactFieldsResponse = await makeBitrix24Request('crm.contact.fields');
    const contactFields = contactFieldsResponse.result || {};
    
    return {
      deals: Object.keys(dealFields).length > 0,
      contacts: Object.keys(contactFields).length > 0,
      dealFieldsCount: Object.keys(dealFields).length,
      contactFieldsCount: Object.keys(contactFields).length
    };
  } catch (error) {
    log(`❌ Błąd podczas sprawdzania uprawnień: ${error.message}`, 'red');
    return { deals: false, contacts: false, dealFieldsCount: 0, contactFieldsCount: 0 };
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie uprawnień i kategorii deali w Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Sprawdź informacje o użytkowniku
    log(`\n1️⃣ Sprawdzanie informacji o użytkowniku...`, 'blue');
    const user = await getCurrentUser();
    if (user) {
      log(`✅ Użytkownik: ${user.NAME || 'Nieznany'} (ID: ${user.ID})`, 'green');
      log(`   Email: ${user.EMAIL || 'Brak'}`, 'cyan');
      log(`   Aktywny: ${user.ACTIVE === 'Y' ? 'Tak' : 'Nie'}`, 'cyan');
    } else {
      log(`❌ Nie można pobrać informacji o użytkowniku`, 'red');
    }

    // 2. Sprawdź uprawnienia do CRM
    log(`\n2️⃣ Sprawdzanie uprawnień do CRM...`, 'blue');
    const permissions = await checkCrmPermissions();
    log(`   Uprawnienia do deali: ${permissions.deals ? '✅ Tak' : '❌ Nie'}`, permissions.deals ? 'green' : 'red');
    log(`   Uprawnienia do kontaktów: ${permissions.contacts ? '✅ Tak' : '❌ Nie'}`, permissions.contacts ? 'green' : 'red');
    log(`   Liczba pól deali: ${permissions.dealFieldsCount}`, 'cyan');
    log(`   Liczba pól kontaktów: ${permissions.contactFieldsCount}`, 'cyan');

    // 3. Pobierz wszystkie kategorie deali
    log(`\n3️⃣ Pobieranie kategorii deali...`, 'blue');
    const categories = await getDealCategories();
    
    log(`\n📊 KATEGORIE DEALI (${categories.length}):`, 'bright');
    categories.forEach((category, index) => {
      log(`   ${index + 1}. ${category.NAME} (ID: ${category.ID})`, 'cyan');
    });

    // 4. Sprawdź deali w każdej kategorii
    log(`\n4️⃣ Sprawdzanie deali w każdej kategorii...`, 'blue');
    
    for (const category of categories) {
      log(`\n🔍 Kategoria: ${category.NAME} (ID: ${category.ID})`, 'yellow');
      
      // Pobierz wszystkie deali z tej kategorii
      const dealsInCategory = await getDealsByCategory(category.ID);
      log(`   Wszystkie deali: ${dealsInCategory.length}`, 'cyan');
      
      // Sprawdź deali w etapie UC_DMBNNJ w tej kategorii
      const dealsInStage = await getDealsByStageAndCategory('UC_DMBNNJ', category.ID);
      log(`   W etapie "Zamówienia ze strony opłacone": ${dealsInStage.length}`, 'cyan');
      
      if (dealsInStage.length > 0) {
        log(`   ✅ ZNALEZIONO DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
        dealsInStage.forEach((deal, index) => {
          log(`      ${index + 1}. ${deal.TITLE} - ${Number(deal.OPPORTUNITY).toFixed(2)} ${deal.CURRENCY_ID}`, 'green');
        });
      }
      
      // Wyświetl etapy deali w tej kategorii
      const stagesInCategory = {};
      dealsInCategory.forEach(deal => {
        const stageId = deal.STAGE_ID;
        if (!stagesInCategory[stageId]) {
          stagesInCategory[stageId] = 0;
        }
        stagesInCategory[stageId]++;
      });
      
      if (Object.keys(stagesInCategory).length > 0) {
        log(`   Etapy w tej kategorii:`, 'cyan');
        Object.entries(stagesInCategory).forEach(([stageId, count]) => {
          const isTargetStage = stageId === 'UC_DMBNNJ';
          const color = isTargetStage ? 'green' : 'cyan';
          const marker = isTargetStage ? '🎯' : '  ';
          log(`      ${marker} ${stageId}: ${count} deali`, color);
        });
      }
    }

    // 5. Sprawdź wszystkie deali bez filtrów
    log(`\n5️⃣ Sprawdzanie wszystkich deali (bez filtrów)...`, 'blue');
    const allDeals = await getAllDealsUnfiltered();
    log(`   Wszystkie deali w systemie: ${allDeals.length}`, 'cyan');
    
    if (allDeals.length > 0) {
      log(`\n📊 PRZEGLĄD WSZYSTKICH DEALI:`, 'bright');
      
      // Grupuj według kategorii i etapów
      const dealsByCategoryAndStage = {};
      allDeals.forEach(deal => {
        const categoryId = deal.CATEGORY_ID || 'unknown';
        const stageId = deal.STAGE_ID || 'unknown';
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
        dealsByCategoryAndStage[key].totalValue += Number(deal.OPPORTUNITY) || 0;
      });
      
      Object.values(dealsByCategoryAndStage).forEach(group => {
        const category = categories.find(c => c.ID === group.categoryId);
        const categoryName = category ? category.NAME : `Kategoria ${group.categoryId}`;
        const isTargetStage = group.stageId === 'UC_DMBNNJ';
        const color = isTargetStage ? 'green' : 'cyan';
        const marker = isTargetStage ? '🎯' : '  ';
        
        log(`${marker} ${categoryName} - ${group.stageId}: ${group.deals.length} deali, ${group.totalValue.toFixed(2)} PLN`, color);
        
        if (isTargetStage) {
          log(`     ✅ ZNALEZIONO DEALI W ETAPIE "Zamówienia ze strony opłacone"!`, 'green');
          group.deals.forEach((deal, index) => {
            log(`        ${index + 1}. ${deal.TITLE} - ${Number(deal.OPPORTUNITY).toFixed(2)} ${deal.CURRENCY_ID}`, 'green');
          });
        }
      });
    }

    log(`\n✅ Analiza uprawnień i kategorii zakończona!`, 'green');

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
  getCurrentUser,
  getDealCategories,
  getDealsByCategory,
  getDealsByStageAndCategory,
  getAllDealsUnfiltered,
  checkCrmPermissions
};
