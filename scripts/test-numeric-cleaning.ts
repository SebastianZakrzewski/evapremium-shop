import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Funkcja do czyszczenia nazw z samych cyfr + dodatkowe informacje
function cleanNumericModelNames(modelName: string, brandName: string): { cleaned: string; changes: string[] } {
  let cleaned = modelName;
  const changes: string[] = [];
  
  // Sprawdź czy nazwa zaczyna się od cyfry
  const numericMatch = modelName.match(/^([0-9]+)(.*)$/);
  if (!numericMatch) return { cleaned, changes };
  
  const [, numericPart, suffix] = numericMatch;
  
  // Usuń nadmiarowe informacje z sufiksu
  let cleanedSuffix = suffix;
  
  // Usuń benzyna, hybryda, USA, ANGLIK
  const suffixPatterns = [
    /\s+benzyna\b/gi,
    /\s+hybryda\b/gi,
    /\s+USA\b/gi,
    /\s+ANGLIK\b/gi,
    /\s+Japonia\b/gi,
    /\s+Europa\b/gi,
  ];
  
  suffixPatterns.forEach(pattern => {
    const matches = cleanedSuffix.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const trimmed = match.trim();
        if (trimmed) {
          changes.push(`Usunięto z nazwy numerycznej: "${trimmed}"`);
          cleanedSuffix = cleanedSuffix.replace(pattern, '');
        }
      });
    }
  });
  
  // Usuń nadmiarowe spacje
  cleanedSuffix = cleanedSuffix.replace(/\s+/g, ' ').trim();
  
  // Zbuduj nową nazwę
  cleaned = numericPart + (cleanedSuffix ? ' ' + cleanedSuffix : '');
  
  return { cleaned, changes };
}

async function testNumericCleaning() {
  console.log('🧪 Testowanie czyszczenia nazw numerycznych...\n');
  
  // Test cases z problematycznych rekordów
  const testCases = [
    { name: "3 benzyna", brand: "Ds" },
    { name: "4 benzyna", brand: "Ds" },
    { name: "2 hybryda", brand: "Mazda" },
    { name: "6 ANGLIK", brand: "Mazda" },
    { name: "Silverado USA", brand: "Chevrolet" },
    { name: "Suburban 12gen. USA", brand: "Chevrolet" },
    { name: "2008 benzyna", brand: "Peugeot" },
    { name: "208 benzyna", brand: "Peugeot" },
    { name: "3008 PHEV", brand: "Peugeot" },
    { name: "Niro EV", brand: "Kia" },
  ];
  
  testCases.forEach(testCase => {
    console.log(`"${testCase.name}" (${testCase.brand})`);
    const result = cleanNumericModelNames(testCase.name, testCase.brand);
    console.log(`  → "${result.cleaned}"`);
    if (result.changes.length > 0) {
      console.log(`  Zmiany: ${result.changes.join(', ')}`);
    }
    console.log('');
  });
}

testNumericCleaning().catch(console.error);
