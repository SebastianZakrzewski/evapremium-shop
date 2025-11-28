/**
 * Lista wszystkich pól niestandardowych w Bitrix24
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

async function listAllCustomFields() {
  try {
    console.log('🔍 Wyszukiwanie wszystkich pól niestandardowych w Bitrix24...\n');
    
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result) {
      console.log('❌ Nie udało się pobrać pól');
      return;
    }
    
    const allFields = fieldsResponse.result;
    const customFields = Object.keys(allFields).filter(key => key.startsWith('UF_'));
    
    console.log(`📋 Znaleziono ${customFields.length} pól niestandardowych\n`);
    console.log('='.repeat(100));
    
    // Szukaj pól związanych z kolorami
    const colorKeywords = ['kolor', 'color', 'materiał', 'material', 'obszycie', 'trim', 'edge'];
    
    customFields.forEach((fieldCode, index) => {
      const field = allFields[fieldCode];
      const name = field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy';
      const type = field.USER_TYPE_ID || 'Nieznany';
      const hasEnum = field.ENUM && field.ENUM.length > 0;
      const nameLower = name.toLowerCase();
      const isColorField = colorKeywords.some(keyword => nameLower.includes(keyword));
      
      // Wyświetl wszystkie pola, ale zaznacz te związane z kolorami
      const marker = isColorField ? '🎨' : '  ';
      console.log(`\n${marker} ${index + 1}. ${fieldCode}`);
      console.log(`     Nazwa: ${name}`);
      console.log(`     Typ: ${type}`);
      console.log(`     Ma enum: ${hasEnum ? 'TAK (' + field.ENUM.length + ' wartości)' : 'NIE'}`);
      
      if (hasEnum && field.ENUM.length > 0) {
        console.log(`     Wartości enum:`);
        field.ENUM.forEach((item, idx) => {
          console.log(`       ${idx + 1}. ID: ${item.ID} | Wartość: "${item.VALUE}"`);
        });
      }
    });
    
    // Podsumowanie pól kolorów
    console.log('\n\n' + '='.repeat(100));
    console.log('🎨 PODSUMOWANIE PÓL KOLORÓW:');
    console.log('='.repeat(100));
    
    const colorFields = customFields.filter(fieldCode => {
      const field = allFields[fieldCode];
      const name = (field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || '').toLowerCase();
      return colorKeywords.some(keyword => name.includes(keyword));
    });
    
    if (colorFields.length === 0) {
      console.log('\n⚠️ Nie znaleziono pól z kolorami w nazwie');
      console.log('\n💡 Sprawdź powyższe pola - mogą być tam pola kolorów z innymi nazwami');
    } else {
      console.log(`\nZnaleziono ${colorFields.length} pól związanych z kolorami:\n`);
      colorFields.forEach((fieldCode, index) => {
        const field = allFields[fieldCode];
        const name = field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy';
        const hasEnum = field.ENUM && field.ENUM.length > 0;
        
        console.log(`${index + 1}. ${fieldCode} - ${name}`);
        if (hasEnum && field.ENUM.length > 0) {
          console.log(`\n   Mapowanie TypeScript:`);
          console.log(`   const colorMap: Record<string, number> = {`);
          field.ENUM.forEach(item => {
            const valueLower = item.VALUE.toLowerCase().trim();
            const polishToEnglish = {
              'niebieski': 'blue',
              'czarny': 'black',
              'szary': 'gray',
              'brązowy': 'brown',
              'beżowy': 'beige',
            };
            const normalized = polishToEnglish[valueLower] || valueLower.replace(/[ąćęłńóśźż]/g, (char) => {
              const map = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' };
              return map[char] || char;
            });
            console.log(`     '${normalized}': ${item.ID},  // ${item.VALUE}`);
          });
          console.log(`   };`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

listAllCustomFields();





