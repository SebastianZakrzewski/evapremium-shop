/**
 * Znajdź pole koloru materiału w Bitrix24
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

async function findMaterialColorField() {
  try {
    console.log('🔍 Wyszukiwanie pola koloru materiału w Bitrix24...\n');
    
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result) {
      console.log('❌ Nie udało się pobrać pól');
      return;
    }
    
    const allFields = fieldsResponse.result;
    const customFields = Object.keys(allFields).filter(key => key.startsWith('UF_'));
    
    console.log(`📋 Sprawdzanie ${customFields.length} pól niestandardowych...\n`);
    
    // Szukaj pól związanych z kolorem materiału
    const materialColorKeywords = ['materiał', 'material', 'kolor materiału', 'material color'];
    
    const matchingFields = [];
    
    customFields.forEach(fieldCode => {
      const field = allFields[fieldCode];
      const name = (field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || field.formLabel || field.listLabel || '').toLowerCase();
      const type = field.USER_TYPE_ID || field.type || 'Nieznany';
      const hasEnum = (field.ENUM && field.ENUM.length > 0) || (field.items && field.items.length > 0);
      const enumValues = field.ENUM || field.items || [];
      
      // Sprawdź czy pole zawiera słowa kluczowe związane z kolorem materiału
      const matchesKeyword = materialColorKeywords.some(keyword => name.includes(keyword));
      
      if (matchesKeyword || (hasEnum && enumValues.length > 0)) {
        matchingFields.push({
          code: fieldCode,
          name: field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || field.formLabel || field.listLabel || 'Brak nazwy',
          type: type,
          hasEnum: hasEnum,
          enumCount: enumValues.length,
          enum: enumValues
        });
      }
    });
    
    console.log(`🎨 Znaleziono ${matchingFields.length} potencjalnych pól:\n`);
    console.log('='.repeat(100));
    
    matchingFields.forEach((field, index) => {
      console.log(`\n${index + 1}. ${field.code}`);
      console.log(`   Nazwa: ${field.name}`);
      console.log(`   Typ: ${field.type}`);
      console.log(`   Ma enum: ${field.hasEnum ? 'TAK (' + field.enumCount + ' wartości)' : 'NIE'}`);
      
      if (field.hasEnum && field.enum.length > 0) {
        console.log(`\n   Wartości enum:`);
        field.enum.forEach((item, idx) => {
          const id = item.ID || item.id || 'brak';
          const value = item.VALUE || item.value || 'brak';
          console.log(`   ${idx + 1}. ID: ${id} | Wartość: "${value}"`);
        });
        
        // Generuj mapowanie jeśli to pole koloru materiału
        if (field.name.toLowerCase().includes('materiał') || field.name.toLowerCase().includes('material')) {
          console.log(`\n   ✅ TO JEST POLE KOLORU MATERIAŁU!`);
          console.log(`\n   Mapowanie TypeScript:`);
          console.log(`   const materialColorMap: Record<string, number> = {`);
          field.enum.forEach(item => {
            const id = item.ID || item.id;
            const value = (item.VALUE || item.value || '').toLowerCase().trim();
            const polishToEnglish = {
              'niebieski': 'blue',
              'czarny': 'black',
              'szary': 'gray',
              'ciemnoszary': 'darkgray',
              'jasnoszary': 'lightgray',
              'brązowy': 'brown',
              'beżowy': 'beige',
              'czerwony': 'red',
              'granatowy': 'navy',
              'zielony': 'green',
              'pomarańczowy': 'orange',
              'żółty': 'yellow',
              'bordowy': 'maroon',
              'fioletowy': 'purple',
              'różowy': 'pink',
            };
            const normalized = polishToEnglish[value] || value.replace(/[ąćęłńóśźż]/g, (char) => {
              const map = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' };
              return map[char] || char;
            });
            console.log(`     '${normalized}': ${id},  // ${item.VALUE || item.value}`);
          });
          console.log(`   };`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(100));
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

findMaterialColorField();












