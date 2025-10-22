/**
 * Usunięcie testowego deala
 */

require('dotenv').config();
const fetch = require('node-fetch').default;

async function cleanupTestDeal() {
  console.log('🗑️ Usuwanie testowego deala ID: 1544');
  
  const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL;
  const deleteUrl = `${BITRIX24_WEBHOOK_URL}crm.deal.delete`;
  
  try {
    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 1544 })
    });

    const result = await response.json();
    
    if (result.result) {
      console.log('✅ Testowy deal usunięty pomyślnie');
    } else {
      console.log('❌ Błąd usuwania deala:', JSON.stringify(result));
    }
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

cleanupTestDeal().catch(console.error);
