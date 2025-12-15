/**
 * Sprawdź wartości enum dla pola wariantu kompletu
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

async function checkVariantEnum() {
  try {
    console.log('🔍 Sprawdzanie wartości enum dla pola wariantu kompletu...\n');
    
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result) {
      console.log('❌ Nie udało się pobrać pól');
      return;
    }
    
    // Sprawdź pole UF_CRM_1757024931236 (Wariant kompletu)
    const variantField = fieldsResponse.result['UF_CRM_1757024931236'];
    
    if (!variantField) {
      console.log('❌ Pole UF_CRM_1757024931236 nie zostało znalezione');
      return;
    }
    
    console.log('📋 Pole: UF_CRM_1757024931236');
    console.log(`   Nazwa: ${variantField.formLabel || variantField.listLabel || 'Brak nazwy'}`);
    console.log(`   Typ: ${variantField.type || variantField.USER_TYPE_ID || 'Nieznany'}`);
    
    const enumValues = variantField.items || variantField.ENUM || [];
    
    if (enumValues.length === 0) {
      console.log('⚠️ Pole nie ma wartości enum');
      return;
    }
    
    console.log(`\n📊 Wartości enum (${enumValues.length}):`);
    console.log('='.repeat(80));
    
    enumValues.forEach((item, idx) => {
      const id = item.ID || item.id || 'brak';
      const value = item.VALUE || item.value || 'brak';
      console.log(`${idx + 1}. ID: ${id} | Wartość: "${value}"`);
    });
    
    console.log('\n📝 Mapowanie TypeScript:');
    console.log('```typescript');
    console.log('const variantMap: Record<string, number> = {');
    
    // Mapowanie wartości na klucze
    enumValues.forEach(item => {
      const id = item.ID || item.id;
      const value = (item.VALUE || item.value || '').toLowerCase();
      
      let key = '';
      if (value.includes('przód') && value.includes('tył') && value.includes('bagażnik')) {
        key = 'premium';
      } else if (value.includes('przód') && value.includes('tył')) {
        key = 'basic';
      } else if (value.includes('przód') && !value.includes('tył')) {
        key = 'front';
      } else if (value.includes('mata') || value.includes('bagażnik')) {
        key = 'complete';
      } else {
        key = value.replace(/[ąćęłńóśźż\s+]/g, '').substring(0, 10);
      }
      
      console.log(`  '${key}': ${id},  // ${item.VALUE || item.value}`);
    });
    
    console.log('};');
    console.log('```');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkVariantEnum();












