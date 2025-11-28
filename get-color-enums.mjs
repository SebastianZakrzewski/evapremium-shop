/**
 * Skrypt do pobrania rzeczywistych wartości enum dla pól kolorów z Bitrix24
 * 
 * Użycie: node get-color-enums.mjs
 */

import https from 'https';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Wczytaj zmienne środowiskowe z .env.local lub .env
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
    // Spróbuj .env
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
      console.error('❌ Nie można wczytać pliku .env:', error2.message);
      return {};
    }
  }
}

const env = loadEnv();
const BITRIX24_WEBHOOK_URL = env.BITRIX24_WEBHOOK_URL || process.env.BITRIX24_WEBHOOK_URL;

if (!BITRIX24_WEBHOOK_URL) {
  console.error('❌ Brak BITRIX24_WEBHOOK_URL w zmiennych środowiskowych');
  process.exit(1);
}

console.log('📡 URL webhook:', BITRIX24_WEBHOOK_URL);

/**
 * Wykonuje zapytanie do API Bitrix24
 */
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
        'User-Agent': 'EVA-Website-Color-Enum-Finder/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(`Błąd API Bitrix24: ${result.error.error_description || result.error.error}`));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Błąd parsowania odpowiedzi: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Błąd połączenia: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Pobiera szczegóły pola z enum wartościami
 */
async function getFieldEnumValues(fieldCode) {
  try {
    console.log(`\n🔍 Pobieranie szczegółów pola: ${fieldCode}...`);
    
    // Pobierz wszystkie pola deali
    const fieldsResponse = await makeBitrix24Request('crm.deal.fields');
    
    if (!fieldsResponse.result || !fieldsResponse.result[fieldCode]) {
      console.log(`❌ Pole ${fieldCode} nie zostało znalezione`);
      return null;
    }
    
    const field = fieldsResponse.result[fieldCode];
    
    console.log(`\n📋 Pole: ${fieldCode}`);
    console.log(`   Nazwa: ${field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy'}`);
    console.log(`   Typ: ${field.USER_TYPE_ID || 'Nieznany'}`);
    
    if (field.ENUM && field.ENUM.length > 0) {
      console.log(`\n📊 Wartości enum (${field.ENUM.length}):`);
      console.log('='.repeat(80));
      
      const enumValues = field.ENUM.map((item, index) => {
        return {
          id: item.ID,
          value: item.VALUE,
          xmlId: item.XML_ID || null,
        };
      });
      
      // Sortuj alfabetycznie po VALUE
      enumValues.sort((a, b) => a.value.localeCompare(b.value));
      
      enumValues.forEach((item, index) => {
        console.log(`\n${index + 1}. ID: ${item.id}`);
        console.log(`   Wartość: "${item.value}"`);
        if (item.xmlId) {
          console.log(`   XML_ID: ${item.xmlId}`);
        }
      });
      
      return {
        fieldCode,
        fieldName: field.EDIT_FORM_LABEL || field.LIST_COLUMN_LABEL || 'Brak nazwy',
        enumValues: enumValues
      };
    } else {
      console.log(`\n⚠️ Pole ${fieldCode} nie ma wartości enum`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Błąd podczas pobierania pola ${fieldCode}:`, error.message);
    return null;
  }
}

/**
 * Główna funkcja
 */
async function main() {
  try {
    console.log('🎨 Pobieranie wartości enum dla pól kolorów z Bitrix24\n');
    console.log('='.repeat(80));
    
    // Pola kolorów do sprawdzenia
    const colorFields = [
      'UF_CRM_1757177134448', // Kolor materiału
      'UF_CRM_1757177281489', // Kolor obszycia
    ];
    
    const results = [];
    
    for (const fieldCode of colorFields) {
      const result = await getFieldEnumValues(fieldCode);
      if (result) {
        results.push(result);
      }
    }
    
    // Podsumowanie
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 PODSUMOWANIE');
    console.log('='.repeat(80));
    
    if (results.length === 0) {
      console.log('\n❌ Nie znaleziono żadnych pól z wartościami enum');
      return;
    }
    
    results.forEach(result => {
      console.log(`\n📋 ${result.fieldCode} - ${result.fieldName}`);
      console.log(`   Liczba wartości: ${result.enumValues.length}`);
      
      // Utwórz mapowanie dla kodu TypeScript
      console.log('\n   Mapowanie dla kodu:');
      console.log('   ```typescript');
      console.log(`   const colorMap: Record<string, number> = {`);
      
      result.enumValues.forEach(item => {
        // Spróbuj znormalizować nazwę koloru
        const polishCharMap = {
          'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l',
          'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
        };
        
        const normalizedValue = item.value.toLowerCase()
          .replace(/[ąćęłńóśźż]/g, (char) => polishCharMap[char] || char)
          .trim();
        
        // Mapowanie polskich nazw na angielskie
        const polishToEnglish = {
          'niebieski': 'blue',
          'czarny': 'black',
          'szary': 'gray',
          'brązowy': 'brown',
          'beżowy': 'beige',
        };
        
        const englishKey = polishToEnglish[normalizedValue] || normalizedValue;
        
        console.log(`     '${englishKey}': ${item.id},  // ${item.value}`);
      });
      
      console.log('   };');
      console.log('   ```');
    });
    
    console.log('\n✅ Zakończono pobieranie wartości enum\n');
    
  } catch (error) {
    console.error('\n❌ Błąd:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Uruchom skrypt
main();

