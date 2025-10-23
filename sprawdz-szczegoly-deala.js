// Sprawdź szczegóły deala w Bitrix24
require('dotenv').config();

const https = require('https');

const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL;

async function makeBitrix24Request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BITRIX24_WEBHOOK_URL}${method}`);
    
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

async function checkDealDetails() {
  try {
    console.log('🔍 Sprawdzanie szczegółów deala ID: 1750...\n');
    
    // Pobierz szczegóły deala
    const dealResponse = await makeBitrix24Request('crm.deal.get', { id: '1750' });
    
    if (dealResponse.result) {
      const deal = dealResponse.result;
      console.log('📋 SZCZEGÓŁY DEALA:');
      console.log('   ID:', deal.ID);
      console.log('   Tytuł:', deal.TITLE);
      console.log('   Etap:', deal.STAGE_ID);
      console.log('   Kategoria:', deal.CATEGORY_ID);
      console.log('   Kwota:', deal.OPPORTUNITY, deal.CURRENCY_ID);
      console.log('   Data utworzenia:', deal.DATE_CREATE);
      console.log('   Data modyfikacji:', deal.DATE_MODIFY);
      console.log('   Numer zamówienia:', deal.UF_CRM_ORDER_NUMBER);
      console.log('   Status płatności:', deal.UF_CRM_PAYMENT_STATUS);
      console.log('   Marka samochodu:', deal.UF_CRM_1760788285332);
      console.log('   Model samochodu:', deal.UF_CRM_1760788302371);
      console.log('   Rok samochodu:', deal.UF_CRM_1760788317619);
      console.log('   Typ nadwozia:', deal.UF_CRM_1760788343011);
      console.log('   Wariant kompletu:', deal.UF_CRM_1757024835301);
      console.log('   Rodzaj kompletu:', deal.UF_CRM_1757024931236);
      console.log('   Kształt komórek:', deal.UF_CRM_1757025126670);
      console.log('   Kolor materiału:', deal.UF_CRM_1757177134448);
      console.log('   Kolor obszycia:', deal.UF_CRM_1757177281489);
      
      console.log('\n🎯 ANALIZA ETAPU:');
      if (deal.STAGE_ID === 'UC_DMBNNJ') {
        console.log('   ✅ Deal jest w poprawnym etapie "UC_DMBNNJ"');
      } else {
        console.log('   ❌ Deal jest w niepoprawnym etapie:', deal.STAGE_ID);
        console.log('   📋 Oczekiwany etap: UC_DMBNNJ');
      }
      
      console.log('\n🎯 ANALIZA PÓL SAMOCHODU:');
      const carFields = {
        brand: deal.UF_CRM_1760788285332,
        model: deal.UF_CRM_1760788302371,
        year: deal.UF_CRM_1760788317619,
        bodyType: deal.UF_CRM_1760788343011
      };
      
      Object.entries(carFields).forEach(([field, value]) => {
        if (value) {
          console.log(`   ✅ ${field}: ${value}`);
        } else {
          console.log(`   ❌ ${field}: PUSTE`);
        }
      });
      
    } else {
      console.log('❌ Nie znaleziono deala');
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

checkDealDetails().catch(console.error);
