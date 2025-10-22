/**
 * Znajdź deal z poprawnym numerem zamówienia
 */

require('dotenv').config();
const fetch = require('node-fetch').default;

async function findCorrectDeal() {
  console.log('🔍 Wyszukiwanie deala z numerem zamówienia ORD-2025-000003');
  
  const BITRIX24_WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL;
  
  try {
    // 1. Wyszukaj deal po numerze zamówienia
    console.log('\n1️⃣ Wyszukiwanie deala po numerze zamówienia...');
    const searchUrl = `${BITRIX24_WEBHOOK_URL}crm.deal.list`;
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          'UF_CRM_ORDER_NUMBER': 'ORD-2025-000003'
        },
        select: ['ID', 'TITLE', 'STAGE_ID', 'UF_CRM_PAYMENT_STATUS', 'UF_CRM_ORDER_STATUS', 'UF_CRM_ORDER_NUMBER', 'DATE_CREATE']
      })
    });

    const searchResult = await response.json();
    
    if (searchResult.result && searchResult.result.length > 0) {
      console.log(`   ✅ Znaleziono ${searchResult.result.length} deali:`);
      searchResult.result.forEach((deal, index) => {
        console.log(`   ${index + 1}. ID: ${deal.ID}`);
        console.log(`      Tytuł: ${deal.TITLE}`);
        console.log(`      Etap: ${deal.STAGE_ID}`);
        console.log(`      Status płatności: ${deal.UF_CRM_PAYMENT_STATUS}`);
        console.log(`      Status zamówienia: ${deal.UF_CRM_ORDER_STATUS}`);
        console.log(`      Numer zamówienia: ${deal.UF_CRM_ORDER_NUMBER}`);
        console.log(`      Data utworzenia: ${deal.DATE_CREATE}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Nie znaleziono deala z numerem zamówienia ORD-2025-000003');
    }

    // 2. Wyszukaj wszystkie deali z "ORD-2025" w tytule
    console.log('\n2️⃣ Wyszukiwanie deali z "ORD-2025" w tytule...');
    const titleSearchUrl = `${BITRIX24_WEBHOOK_URL}crm.deal.list`;
    const titleResponse = await fetch(titleSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          '%TITLE': 'ORD-2025'
        },
        select: ['ID', 'TITLE', 'STAGE_ID', 'UF_CRM_PAYMENT_STATUS', 'UF_CRM_ORDER_STATUS', 'UF_CRM_ORDER_NUMBER', 'DATE_CREATE']
      })
    });

    const titleResult = await titleResponse.json();
    
    if (titleResult.result && titleResult.result.length > 0) {
      console.log(`   ✅ Znaleziono ${titleResult.result.length} deali z "ORD-2025" w tytule:`);
      titleResult.result.forEach((deal, index) => {
        console.log(`   ${index + 1}. ID: ${deal.ID}`);
        console.log(`      Tytuł: ${deal.TITLE}`);
        console.log(`      Etap: ${deal.STAGE_ID}`);
        console.log(`      Status płatności: ${deal.UF_CRM_PAYMENT_STATUS}`);
        console.log(`      Status zamówienia: ${deal.UF_CRM_ORDER_STATUS}`);
        console.log(`      Numer zamówienia: ${deal.UF_CRM_ORDER_NUMBER}`);
        console.log(`      Data utworzenia: ${deal.DATE_CREATE}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Nie znaleziono deali z "ORD-2025" w tytule');
    }

    // 3. Sprawdź ostatnie 10 deali
    console.log('\n3️⃣ Ostatnie 10 deali...');
    const recentUrl = `${BITRIX24_WEBHOOK_URL}crm.deal.list`;
    const recentResponse = await fetch(recentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order: { 'DATE_CREATE': 'DESC' },
        select: ['ID', 'TITLE', 'STAGE_ID', 'UF_CRM_PAYMENT_STATUS', 'UF_CRM_ORDER_STATUS', 'UF_CRM_ORDER_NUMBER', 'DATE_CREATE'],
        start: 0
      })
    });

    const recentResult = await recentResponse.json();
    
    if (recentResult.result && recentResult.result.length > 0) {
      console.log(`   Ostatnie ${Math.min(10, recentResult.result.length)} deali:`);
      recentResult.result.slice(0, 10).forEach((deal, index) => {
        console.log(`   ${index + 1}. ID: ${deal.ID} - ${deal.TITLE}`);
        console.log(`      Etap: ${deal.STAGE_ID}, Numer: ${deal.UF_CRM_ORDER_NUMBER || 'Brak'}`);
      });
    }

  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

findCorrectDeal().catch(console.error);
