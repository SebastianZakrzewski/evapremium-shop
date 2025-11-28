/**
 * Pobiera szczegóły konkretnych pól z Bitrix24
 */

import https from 'https';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (error) {
    try {
      const envPath = join(__dirname, '.env');
      const envContent = readFileSync(envPath, 'utf-8');
      const env = {};
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      return env;
    } catch (error2) {
      return {};
    }
  }
}

const env = loadEnv();
const BITRIX24_WEBHOOK_URL = env.BITRIX24_WEBHOOK_URL || process.env.BITRIX24_WEBHOOK_URL;

if (!BITRIX24_WEBHOOK_URL) {
  console.error('❌ Brak BITRIX24_WEBHOOK_URL');
  process.exit(1);
}

function makeBitrix24Request(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BITRIX24_WEBHOOK_URL}${method}`;
    const postData = JSON.stringify(params);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(`API Error: ${result.error.error_description || result.error.error}`));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });
    req.on('error', (error) => {
      reject(new Error(`Connection error: ${error.message}`));
    });
    req.write(postData);
    req.end();
  });
}

async function getFieldDetails() {
  try {
    const colorFields = [
      'UF_CRM_1757177134448', // Kolor materiału
      'UF_CRM_1757177281489', // Kolor obszycia
    ];
    
    console.log('🔍 Pobieranie szczegółów pól kolorów z Bitrix24...\n');
    
    // Pobierz wszystkie pola deali
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result) {
      console.log('❌ Nie udało się pobrać pól');
      return;
    }
    
    colorFields.forEach(fieldCode => {
      const field = fieldsResponse.result[fieldCode];
      
      if (!field) {
        console.log(`\n❌ Pole ${fieldCode} nie zostało znalezione`);
        return;
      }
      
      console.log(`\n📋 Pole: ${fieldCode}`);
      console.log('='.repeat(80));
      console.log(JSON.stringify(field, null, 2));
      
      // Sprawdź czy ma enum
      if (field.ENUM && field.ENUM.length > 0) {
        console.log(`\n✅ Pole ma ${field.ENUM.length} wartości enum:`);
        field.ENUM.forEach((item, idx) => {
          console.log(`   ${idx + 1}. ID: ${item.ID} | VALUE: "${item.VALUE}" | XML_ID: ${item.XML_ID || 'brak'}`);
        });
      } else {
        console.log(`\n⚠️ Pole nie ma wartości enum`);
        console.log(`   Typ pola: ${field.USER_TYPE_ID || 'Nieznany'}`);
        console.log(`   Nazwa: ${field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy'}`);
      }
    });
    
    // Spróbuj pobrać przykładowy deal, żeby zobaczyć jakie wartości są używane
    console.log('\n\n🔍 Sprawdzanie przykładowych deali...\n');
    
    const dealsResponse = await makeBitrix24Request('crm.deal.list', {
      select: ['ID', 'TITLE', 'UF_CRM_1757177134448', 'UF_CRM_1757177281489'],
      start: 0,
      limit: 5
    });
    
    if (dealsResponse.result && dealsResponse.result.length > 0) {
      console.log(`Znaleziono ${dealsResponse.result.length} deali:`);
      dealsResponse.result.forEach((deal, idx) => {
        console.log(`\n${idx + 1}. Deal ID: ${deal.ID}`);
        console.log(`   Tytuł: ${deal.TITLE || 'Brak'}`);
        console.log(`   UF_CRM_1757177134448 (kolor materiału): ${deal.UF_CRM_1757177134448 || 'brak'}`);
        console.log(`   UF_CRM_1757177281489 (kolor obszycia): ${deal.UF_CRM_1757177281489 || 'brak'}`);
      });
    } else {
      console.log('⚠️ Nie znaleziono deali z wartościami kolorów');
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

getFieldDetails();





