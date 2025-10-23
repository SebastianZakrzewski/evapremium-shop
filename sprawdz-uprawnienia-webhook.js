/**
 * Skrypt do sprawdzenia uprawnień webhooka Bitrix24
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
 * Sprawdź uprawnienia webhooka
 */
async function checkWebhookPermissions() {
  const tests = [
    {
      name: 'Użytkownik',
      method: 'user.current',
      description: 'Sprawdza czy webhook ma dostęp do informacji o użytkowniku'
    },
    {
      name: 'Deali - lista',
      method: 'crm.deal.list',
      description: 'Sprawdza czy webhook może pobierać listę deali'
    },
    {
      name: 'Deali - pola',
      method: 'crm.deal.fields',
      description: 'Sprawdza czy webhook ma dostęp do pól deali'
    },
    {
      name: 'Kontakty - lista',
      method: 'crm.contact.list',
      description: 'Sprawdza czy webhook może pobierać listę kontaktów'
    },
    {
      name: 'Leady - lista',
      method: 'crm.lead.list',
      description: 'Sprawdza czy webhook może pobierać listę leadów'
    },
    {
      name: 'Kategorie deali',
      method: 'crm.dealcategory.list',
      description: 'Sprawdza czy webhook ma dostęp do kategorii deali'
    },
    {
      name: 'Etapy deali',
      method: 'crm.dealcategory.stage.list',
      description: 'Sprawdza czy webhook ma dostęp do etapów deali'
    },
    {
      name: 'Produkty',
      method: 'crm.product.list',
      description: 'Sprawdza czy webhook ma dostęp do produktów'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      log(`🔍 Testowanie: ${test.name}...`, 'blue');
      const response = await makeBitrix24Request(test.method);
      
      const result = {
        name: test.name,
        method: test.method,
        success: true,
        description: test.description,
        dataCount: Array.isArray(response.result) ? response.result.length : (response.result ? 1 : 0),
        hasData: !!response.result
      };
      
      results.push(result);
      log(`   ✅ ${test.name}: DZIAŁA (${result.dataCount} rekordów)`, 'green');
      
    } catch (error) {
      const result = {
        name: test.name,
        method: test.method,
        success: false,
        description: test.description,
        error: error.message
      };
      
      results.push(result);
      log(`   ❌ ${test.name}: BŁĄD - ${error.message}`, 'red');
    }
  }

  return results;
}

/**
 * Sprawdź czy webhook może pobierać deali z różnych kategorii
 */
async function checkDealAccess() {
  log(`\n🔍 Sprawdzanie dostępu do deali...`, 'blue');
  
  const categories = [0, 1, 2, 3, 4, 5];
  const results = [];

  for (const categoryId of categories) {
    try {
      const params = {
        filter: { CATEGORY_ID: categoryId },
        select: ['ID', 'TITLE', 'STAGE_ID', 'CATEGORY_ID'],
        start: 0
      };

      const response = await makeBitrix24Request('crm.deal.list', params);
      const deals = response.result || [];
      
      results.push({
        categoryId,
        dealCount: deals.length,
        accessible: true
      });
      
      if (deals.length > 0) {
        log(`   ✅ Kategoria ${categoryId}: ${deals.length} deali`, 'green');
      } else {
        log(`   ⚠️  Kategoria ${categoryId}: 0 deali`, 'yellow');
      }
      
    } catch (error) {
      results.push({
        categoryId,
        dealCount: 0,
        accessible: false,
        error: error.message
      });
      
      log(`   ❌ Kategoria ${categoryId}: BŁĄD - ${error.message}`, 'red');
    }
  }

  return results;
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    log(`🚀 Sprawdzanie uprawnień webhooka Bitrix24`, 'bright');
    log(`📋 Webhook URL: ${BITRIX24_WEBHOOK_URL}`, 'cyan');

    // 1. Sprawdź uprawnienia webhooka
    log(`\n1️⃣ Sprawdzanie uprawnień webhooka...`, 'blue');
    const permissions = await checkWebhookPermissions();
    
    log(`\n📊 WYNIKI TESTÓW UPRAWNIEŃ:`, 'bright');
    permissions.forEach((test, index) => {
      const color = test.success ? 'green' : 'red';
      const status = test.success ? '✅' : '❌';
      log(`   ${status} ${test.name}: ${test.success ? 'DZIAŁA' : 'BŁĄD'}`, color);
      if (test.success && test.dataCount > 0) {
        log(`      📊 Dane: ${test.dataCount} rekordów`, 'cyan');
      }
      if (!test.success) {
        log(`      ❌ Błąd: ${test.error}`, 'red');
      }
    });

    // 2. Sprawdź dostęp do deali
    log(`\n2️⃣ Sprawdzanie dostępu do deali w różnych kategoriach...`, 'blue');
    const dealAccess = await checkDealAccess();
    
    log(`\n📊 DOSTĘP DO DEALI:`, 'bright');
    dealAccess.forEach(result => {
      if (result.accessible) {
        const color = result.dealCount > 0 ? 'green' : 'yellow';
        log(`   Kategoria ${result.categoryId}: ${result.dealCount} deali`, color);
      } else {
        log(`   Kategoria ${result.categoryId}: BŁĄD - ${result.error}`, 'red');
      }
    });

    // 3. Podsumowanie
    log(`\n📋 PODSUMOWANIE:`, 'bright');
    
    const workingTests = permissions.filter(p => p.success).length;
    const totalTests = permissions.length;
    
    log(`   Uprawnienia: ${workingTests}/${totalTests} testów przeszło`, workingTests === totalTests ? 'green' : 'yellow');
    
    const accessibleCategories = dealAccess.filter(d => d.accessible).length;
    const totalCategories = dealAccess.length;
    
    log(`   Kategorie deali: ${accessibleCategories}/${totalCategories} dostępnych`, accessibleCategories > 0 ? 'green' : 'red');
    
    // 4. Rekomendacje
    log(`\n💡 REKOMENDACJE:`, 'bright');
    
    if (workingTests < totalTests) {
      log(`   ⚠️  Webhook ma ograniczone uprawnienia`, 'yellow');
      log(`   🔧 Sprawdź konfigurację webhooka w Bitrix24`, 'yellow');
      log(`   📝 Upewnij się, że webhook ma uprawnienia do odczytu CRM`, 'yellow');
    }
    
    if (accessibleCategories === 0) {
      log(`   ⚠️  Webhook nie ma dostępu do żadnych kategorii deali`, 'yellow');
      log(`   🔧 Sprawdź czy webhook ma uprawnienia do deali`, 'yellow');
    }
    
    if (workingTests === totalTests && accessibleCategories > 0) {
      log(`   ✅ Webhook ma wszystkie potrzebne uprawnienia!`, 'green');
    }

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
  checkWebhookPermissions,
  checkDealAccess
};
