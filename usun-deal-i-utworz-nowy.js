// Usuń istniejący deal i utwórz nowy z poprawnym mapowaniem
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

async function deleteAndRecreateDeal() {
  try {
    console.log('🗑️ Usuwanie istniejącego deala ID: 1738...\n');
    
    // Usuń deal
    const deleteResponse = await makeBitrix24Request('crm.deal.delete', { id: '1738' });
    
    if (deleteResponse.result) {
      console.log('✅ Deal usunięty pomyślnie');
    } else {
      console.log('❌ Nie udało się usunąć deala:', deleteResponse);
    }
    
    console.log('\n🔄 Teraz uruchom test synchronizacji, aby utworzyć nowy deal...');
    console.log('   node test-sync-order.js');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

deleteAndRecreateDeal().catch(console.error);
