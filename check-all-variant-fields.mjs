/**
 * Sprawdź wszystkie pola związane z wariantem kompletu
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

async function checkAllVariantFields() {
  try {
    console.log('🔍 Sprawdzanie wszystkich pól związanych z wariantem kompletu...\n');
    
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result) {
      console.log('❌ Nie udało się pobrać pól');
      return;
    }
    
    const allFields = fieldsResponse.result;
    const variantKeywords = ['wariant', 'variant', 'kompletu', 'komplet'];
    
    const variantFields = [];
    
    Object.keys(allFields).forEach(fieldCode => {
      if (!fieldCode.startsWith('UF_')) return;
      
      const field = allFields[fieldCode];
      const name = (field.formLabel || field.listLabel || field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || '').toLowerCase();
      
      if (variantKeywords.some(keyword => name.includes(keyword))) {
        const enumValues = field.items || field.ENUM || [];
        variantFields.push({
          code: fieldCode,
          name: field.formLabel || field.listLabel || field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy',
          enumCount: enumValues.length,
          enum: enumValues
        });
      }
    });
    
    console.log(`📊 Znaleziono ${variantFields.length} pól związanych z wariantem:\n`);
    console.log('='.repeat(100));
    
    variantFields.forEach((field, index) => {
      console.log(`\n${index + 1}. ${field.code}`);
      console.log(`   Nazwa: ${field.name}`);
      console.log(`   Liczba wartości: ${field.enumCount}`);
      
      if (field.enum.length > 0) {
        console.log(`\n   Wartości enum:`);
        field.enum.forEach((item, idx) => {
          const id = item.ID || item.id || 'brak';
          const value = item.VALUE || item.value || 'brak';
          console.log(`   ${idx + 1}. ID: ${id} | Wartość: "${value}"`);
          
          // Sprawdź czy jest wartość dla "Mata do Bagażnika"
          if (value.toLowerCase().includes('mata') || value.toLowerCase().includes('bagażnik')) {
            console.log(`      ⭐ ZNALEZIONO WARTOŚĆ DLA "Mata do Bagażnika"!`);
          }
        });
      }
    });
    
    // Sprawdź pole używane w kodzie
    console.log('\n\n' + '='.repeat(100));
    console.log('🎯 POLA UŻYWANE W KODZIE:');
    console.log('='.repeat(100));
    
    const codeFields = ['UF_CRM_1757024931236', 'UF_CRM_68F37838A9550'];
    
    codeFields.forEach(fieldCode => {
      const field = allFields[fieldCode];
      if (field) {
        const enumValues = field.items || field.ENUM || [];
        console.log(`\n📋 ${fieldCode}`);
        console.log(`   Nazwa: ${field.formLabel || field.listLabel || field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy'}`);
        console.log(`   Wartości enum:`);
        enumValues.forEach((item, idx) => {
          const id = item.ID || item.id || 'brak';
          const value = item.VALUE || item.value || 'brak';
          console.log(`   ${idx + 1}. ID: ${id} | Wartość: "${value}"`);
        });
      } else {
        console.log(`\n❌ ${fieldCode} - Pole nie istnieje`);
      }
    });
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkAllVariantFields();





