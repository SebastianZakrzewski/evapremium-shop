/**
 * Skrypt do znalezienia pól kolorów w Bitrix24
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

async function findColorFields() {
  try {
    console.log('🔍 Wyszukiwanie pól kolorów w Bitrix24...\n');
    
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result) {
      console.log('❌ Nie udało się pobrać pól');
      return;
    }
    
    const allFields = fieldsResponse.result;
    const customFields = Object.keys(allFields).filter(key => key.startsWith('UF_'));
    
    console.log(`📋 Znaleziono ${customFields.length} pól niestandardowych\n`);
    
    // Szukaj pól związanych z kolorami
    const colorKeywords = ['kolor', 'color', 'materiał', 'material', 'obszycie', 'trim', 'edge'];
    
    const colorFields = [];
    
    customFields.forEach(fieldCode => {
      const field = allFields[fieldCode];
      const name = (field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || '').toLowerCase();
      const type = field.USER_TYPE_ID || '';
      
      // Sprawdź czy pole zawiera słowa kluczowe związane z kolorami
      const matchesKeyword = colorKeywords.some(keyword => name.includes(keyword));
      
      // Sprawdź czy ma wartości enum
      const hasEnum = field.ENUM && field.ENUM.length > 0;
      
      if (matchesKeyword || hasEnum) {
        colorFields.push({
          code: fieldCode,
          name: field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy',
          type: type,
          hasEnum: hasEnum,
          enumCount: hasEnum ? field.ENUM.length : 0,
          enum: field.ENUM || []
        });
      }
    });
    
    console.log(`🎨 Znaleziono ${colorFields.length} pól związanych z kolorami:\n`);
    console.log('='.repeat(80));
    
    colorFields.forEach((field, index) => {
      console.log(`\n${index + 1}. ${field.code}`);
      console.log(`   Nazwa: ${field.name}`);
      console.log(`   Typ: ${field.type}`);
      console.log(`   Ma enum: ${field.hasEnum ? 'TAK' : 'NIE'}`);
      
      if (field.hasEnum && field.enum.length > 0) {
        console.log(`\n   Wartości enum (${field.enum.length}):`);
        field.enum.forEach((item, idx) => {
          console.log(`   ${idx + 1}. ID: ${item.ID} | Wartość: "${item.VALUE}"`);
        });
        
        // Generuj mapowanie
        console.log(`\n   Mapowanie TypeScript:`);
        console.log(`   const colorMap: Record<string, number> = {`);
        field.enum.forEach(item => {
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
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    process.exit(1);
  }
}

findColorFields();












