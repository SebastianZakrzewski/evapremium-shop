/**
 * Skrypt do czyszczenia kolumny model_name w tabeli car_models_extended
 * Usuwa nadmiarowe informacje zachowując kody generacji dla marek premium
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Załaduj zmienne środowiskowe
config();

// Konfiguracja Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Brak klucza Supabase. Ustaw SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CarModel {
  id: number;
  brand_name: string;
  model_name: string;
  generation: string;
  body_type: string;
  year_from: number | null;
  year_to: number | null;
  is_currently_produced: boolean;
}

interface CleaningResult {
  id: number;
  original: string;
  cleaned: string;
  changes: string[];
}

// Ulepszone wzorce regex do czyszczenia
const cleaningPatterns = {
  // Generacje (do usunięcia)
  generations: [
    /\s*(I{1,3}|[0-9IІ]+)\s*generacji?/gi,  // 7 generacji, II generacja, ІІ generacja
    /\s*[0-9]\s*lub\s*[0-9]\s*generacji/gi,
    /\s*[0-9]st\s*generacji/gi,
    /\s*[0-9]nd\s*generacji/gi,
    /\s*[0-9]rd\s*generacji/gi,
    /\s*[0-9]th\s*generacji/gi,
    /\s*[0-9]+\s*gen\.?/gi,  // 4 gen, 5 gen, etc.
    /\s*[0-9]+gen\.?/gi,     // 4gen, 5gen, etc.
    /\s*[0-9]+\s*generacja/gi,  // 6 generacja, 7 generacja, etc.
    /\s*[0-9]+\s*generacj[ai]?/gi,   // 2 generacj, 2 generacji (skrócona forma)
    /\s*ІІ\s*generacja/gi,   // ІІ generacja (cyrylica)
    /\s*ІІ\s*generacji/gi,   // ІІ generacji (cyrylica)
  ],
  
  // Kabiny/nadwozia (do usunięcia)
  cabins: [
    /\s*Półtorej kabiny/gi,
    /\s*półtorej kabiny/gi,
    /\s*[0-9],?[0-9]?\s*kabiny/gi,  // 1,5 kabiny, 1 kabiny
    /\s*1,5 kabiny/gi,
    /\s*Double Cab/gi,
    /\s*Extended Cab/gi,
    /\s*Single Cab/gi,
    /\s*Crew Cab/gi,
    /\s*Regular Cab/gi,
    /\s*Super Cab/gi,
    /\s*Quad Cab/gi,
    /\s*Mega Cab/gi,
    /\s*długa kabina/gi,
    /\s*krótka kabina/gi,
    /\s*Ram długa kabina/gi,
    /\s*Ram krótka kabina/gi,
  ],
  
  // Warianty nadwozia (do usunięcia)
  bodyTypes: [
    /\s*Gran Coupe/gi,
    /\s*Gran Turismo/gi,
    /\s*Gran Tourismo/gi,
    /\s*Gran Tourer/gi,
    /\s*Active Tourer/gi,
    /\s*Coupe\b/gi,
    /\s*Cabriolet/gi,
    /\s*Cabrio\b/gi,
    /\s*Sedan\b/gi,
    /\s*Touring\b/gi,
    /\s*Compact\b/gi,
    /\s*Kombi\b/gi,  // NOWY
    /\s*hatchback\b/gi,  // NOWY
    /\s*Hatchback\b/gi,  // NOWY
  ],

  // Konfiguracje siedzeń/wersje (do usunięcia)
  configurations: [
    /\s*ławka/gi,
    /\s*long/gi,
    /\s*zwykla/gi,
    /\s*Zwykły/gi,  // NOWY
    /\s*na [0-9] fotele/gi,
    /\s*\d+os\./gi,  // NOWY: "5os.", "7os."
    /\s*\((\d+)os\.\)/gi,  // NOWY: "(7os.)"
    /\s*\+\s*/gi,  // usunąć samotne "+"
  ],

  // NOWA KATEGORIA: Warianty silnika (do usunięcia)
  engineVariants: [
    /\s+benzyna\b/gi,
    /\s+diesel\b/gi,
    /\s+hybryda\b/gi,
    /\s+hybryd\b/gi,
    /\s+PHEV\b/gi,
    /\s+MHEV\b/gi,
    /\s+HEV\b/gi,
    /\s+Electro\b/gi,
    /\s+elektryczny\b/gi,
    /\s+4x4\b/gi,
    /\s+4X4\b/gi,
    /\s+AWD\b/gi,
    /\s+FWD\b/gi,
    /\s+RWD\b/gi,
    /\s+HTRAC\b/gi,
  ],

  // NOWA KATEGORIA: Pochodzenie (do usunięcia)
  origin: [
    /\s+USA\b/gi,
    /\s+ANGLIK\b/gi,
    /\s+Japonia\b/gi,
    /\s+Europa\b/gi,
  ],

  // NOWA KATEGORIA: Inne szumy
  noise: [
    /\s+\d+,?\s*generacji/gi,  // "30, generacji"
  ],

  // Warianty wyposażenia (do usunięcia)
  variants: [
    /\s*Heavy Duty/gi,
    /\s*Long Wheelbase/gi,
    /\s*Short Wheelbase/gi,
    // Usunięto wzorce Sport - zbyt agresywne, usuwają oficjalne nazwy modeli
    /\s*Limited/gi,
    /\s*XL\b/gi,  // Tylko "XL" jako słowo
    /\s*XLT/gi,
    /\s*Lariat/gi,
    /\s*Platinum/gi,
    /\s*King Ranch/gi,
    /\s*Raptor/gi,
    /\s*Tremor/gi,
    /\s*FX4/gi,
    /\s*Z71/gi,
    /\s*Denali/gi,
    /\s*Escalade/gi,
    /\s*Yukon/gi,
    /\s*Tahoe/gi,
    /\s*Suburban/gi,
    /\s*Silverado/gi,
    /\s*Sierra/gi,
    /\s*Camper/gi,
    /\s*Kamper/gi,
    /\s*po lifting/gi,
    /\s*Ocean/gi,  // Tylko dla "California Ocean"
  ],
  
  // Lata produkcji (do usunięcia)
  years: [
    /\s*\([0-9]{4}-[0-9]{4}\)/g,
    /\s*\([0-9]{4}\+\)/g,
    /\s*\([0-9]{4}\)-/g,
    /\s*[0-9]{4}-[0-9]{4}/g,
    /\s*[0-9]{4}\+/g,
  ],
  
  // Kody generacji premium (do zachowania)
  premiumCodes: [
    /\s*\([A-Z][0-9]{2,3}\)/g,  // BMW (F40), Mercedes (W205), Audi (B9)
    /\s*\([A-Z][0-9]{2}\)/g,    // BMW (E46), Mercedes (W203)
    /\s*\([A-Z][0-9]{3}\)/g,    // BMW (F30), Mercedes (W212)
    /\s*\([A-Z][0-9]{1}\)/g,    // BMW (I01)
  ],
  
  // Inne wzorce
  other: [
    /\s*\([^)]*kraj[^)]*\)/gi,
    /\s*\([^)]*origin[^)]*\)/gi,
    /\s*\([^)]*made in[^)]*\)/gi,
    /\s*\([^)]*assembled[^)]*\)/gi,
    /\s*MK[0-9]+/gi,  // Ford MK2, MK3, etc.
    /\s*[0-9]+\s*gen\.?/gi,  // 4 gen, 5 gen, etc.
  ]
};

// Marki premium z kodami generacji (do zachowania)
const premiumBrands = [
  'BMW', 'Bmw', 'bmw',
  'Mercedes', 'Mercedes-Benz', 'mercedes',
  'Audi', 'audi',
  'Porsche', 'porsche',
  'Volkswagen', 'VW', 'vw'
];

// Funkcja do sprawdzania czy marka ma kody generacji
function hasGenerationCodes(brandName: string, modelName: string): boolean {
  const isPremiumBrand = premiumBrands.some(brand => 
    brandName.toLowerCase().includes(brand.toLowerCase())
  );
  
  if (!isPremiumBrand) return false;
  
  // Sprawdź czy model ma kod generacji
  return cleaningPatterns.premiumCodes.some(pattern => pattern.test(modelName));
}

// Modele z "Sport" jako częścią oficjalnej nazwy (nie usuwaj)
const sportModelNames = [
  'EcoSport', 'Bronco Sport', 'Sportback', 'Sportage', 'Sportage',
  'Sportvan', 'Sportwagon', 'Sportline', 'Sportster', 'Sport',
  'Explorer Sport', 'F-150 Sport', 'Mustang Sport', 'Focus Sport',
  'Discovery Sport', 'Range Rover Sport', 'SportCoupe', 'Grand Sport',
  'Sports Tourer'
];

// Funkcja do sprawdzania czy "Sport" jest częścią oficjalnej nazwy modelu
function isSportPartOfModelName(modelName: string): boolean {
  return sportModelNames.some(sportModel => 
    modelName.toLowerCase().includes(sportModel.toLowerCase())
  );
}

// Funkcja do poprawiania błędnych kodów generacji BMW
function fixBMWGenerationCode(modelName: string, brandName: string): string {
  if (brandName.toLowerCase() !== 'bmw') return modelName;
  
  // Znajdź i popraw błędne kody Gt* → (G*)
  return modelName.replace(/\s*Gt([0-9]+)/gi, ' (G$1)');
}

// Funkcja do normalizacji kodów generacji (dodaj nawiasy)
function normalizeGenerationCode(modelName: string): string {
  // Znajdź kody generacji bez nawiasów i dodaj je (obsługuje E-90, F40, G70, itp.)
  return modelName.replace(/\s+([EFGU][-]?[0-9]{2,3})\b(?!\))/gi, ' ($1)');
}

// Funkcja do normalizacji kodów generacji dla marek non-premium
function normalizeNonPremiumCodes(modelName: string, brandName: string): string {
  // Dla marek non-premium (Infiniti, Smart) dodaj nawiasy do kodów
  const nonPremiumBrands = ['infiniti', 'smart'];
  if (!nonPremiumBrands.includes(brandName.toLowerCase())) return modelName;
  
  // V37, W453 → (V37), (W453)
  return modelName.replace(/\s+([VW][0-9]{3})\b(?!\))/gi, ' ($1)');
}

// Specjalna funkcja czyszczenia dla BMW
function cleanBMWModel(modelName: string): string {
  let cleaned = modelName;
  
  // 1. Popraw błędne kody Gt* → (G*)
  cleaned = cleaned.replace(/\s*Gt([0-9]+)/gi, ' (G$1)');
  
  // 2. Normalizuj kody bez nawiasów (obsługuje E-90, F40, G70, itp.)
  cleaned = cleaned.replace(/\s+([EFGU][-]?[0-9]{2,3})\b(?!\))/gi, ' ($1)');
  
  return cleaned;
}

// FAZA 4: Nowe funkcje czyszczące

// 1. Usuń slash i wszystko po nim
function removeSlashVariants(modelName: string): { cleaned: string; changes: string[] } {
  const changes: string[] = [];
  const slashMatch = modelName.match(/\s*\/.*$/);
  
  if (slashMatch) {
    const removed = slashMatch[0];
    changes.push(`Usunięto warianty po slash: "${removed.trim()}"`);
    return {
      cleaned: modelName.replace(/\s*\/.*$/, '').trim(),
      changes
    };
  }
  
  return { cleaned: modelName, changes };
}

// 2. Usuń informację o liczbie drzwi
function removeDoorInfo(modelName: string): { cleaned: string; changes: string[] } {
  const changes: string[] = [];
  let cleaned = modelName;
  
  const patterns = [
    /\s+\d+\s*drzwi(owy|owych)?/gi,  // "3 drzwi", "5 drzwiowy"
    /\s+\d+drzwi/gi,                  // "2drzwi", "5drzwi"
  ];
  
  patterns.forEach(pattern => {
    const matches = cleaned.match(pattern);
    if (matches) {
      matches.forEach(match => {
        changes.push(`Usunięto informację o drzwiach: "${match.trim()}"`);
        cleaned = cleaned.replace(pattern, '');
      });
    }
  });
  
  return { cleaned: cleaned.trim(), changes };
}

// 3. Usuń "zwykła/zwykły"
function removeZwykla(modelName: string): { cleaned: string; changes: string[] } {
  const changes: string[] = [];
  const pattern = /\s+zwykł[aąy]/gi;
  const matches = modelName.match(pattern);
  
  if (matches) {
    matches.forEach(match => {
      changes.push(`Usunięto wariant: "${match.trim()}"`);
    });
    return {
      cleaned: modelName.replace(pattern, '').trim(),
      changes
    };
  }
  
  return { cleaned: modelName, changes };
}

// 4. Usuń "krótki/long/short"
function removeShortLong(modelName: string): { cleaned: string; changes: string[] } {
  const changes: string[] = [];
  const pattern = /\s+(long|short|krótki)/gi;
  const matches = modelName.match(pattern);
  
  if (matches) {
    matches.forEach(match => {
      changes.push(`Usunięto wariant: "${match.trim()}"`);
    });
    return {
      cleaned: modelName.replace(pattern, '').trim(),
      changes
    };
  }
  
  return { cleaned: modelName, changes };
}

// 5. Dodaj nawiasy do kodów generacji (dla wszystkich marek)
function addParenthesesToGenerationCodes(modelName: string, brandName: string): { cleaned: string; changes: string[] } {
  const changes: string[] = [];
  let cleaned = modelName;
  
  // Wzorce dla różnych marek
  const brandPatterns: { [key: string]: RegExp[] } = {
    'audi': [
      /\s+(B\d{1,2}|C\d|D\d|F\d{1,2})\s*$/i,  // B3, B4, C8, D5, F5
      /\s+(RS\s*\d+\s+C\d)\s*$/i,              // RS 6 C8
    ],
    'mercedes-benz': [
      /\s+(W\d{3}|C\d{3}|S\d{3}|V\d{3}|X\d{3}|R\d{3}|A\d{3})\s*$/i,
    ],
    'land rover': [
      /\s+(L\d{3}|P\d{3})\s*$/i,
    ],
    'lexus': [
      /\s+(J\d{2})\s*$/i,
    ],
    'jaguar': [
      /\s+(X\d{3})\s*$/i,
    ],
  };
  
  // Ogólny wzorzec dla innych marek
  const generalPattern = /\s+([A-Z]\d{2,3})\s*$/;
  
  const brand = brandName.toLowerCase();
  const patterns = brandPatterns[brand] || [generalPattern];
  
  patterns.forEach(pattern => {
    const match = cleaned.match(pattern);
    if (match) {
      const code = match[1].trim();
      // Sprawdź czy kod nie jest już w nawiasach
      if (!cleaned.includes(`(${code})`)) {
        const newName = cleaned.replace(pattern, ` (${code})`);
        if (newName !== cleaned) {
          changes.push(`Dodano nawiasy do kodu generacji: "${code}" → "(${code})"`);
          cleaned = newName;
        }
      }
    }
  });
  
  return { cleaned: cleaned.trim(), changes };
}

// Funkcja do czyszczenia nazw z samych cyfr + dodatkowe informacje
function cleanNumericModelNames(modelName: string, brandName: string): { cleaned: string; changes: string[] } {
  let cleaned = modelName;
  const changes: string[] = [];
  
  // Sprawdź czy nazwa zaczyna się od cyfry i ma problematyczne sufixy
  const numericMatch = modelName.match(/^([0-9]+)(.*)$/);
  if (!numericMatch) return { cleaned, changes };
  
  const [, numericPart, suffix] = numericMatch;
  
  // Sprawdź czy suffix zawiera problematyczne słowa
  const problematicPatterns = [
    /\s+benzyna\b/gi,
    /\s+hybryda\b/gi,
    /\s+USA\b/gi,
    /\s+ANGLIK\b/gi,
    /\s+Japonia\b/gi,
    /\s+Europa\b/gi,
  ];
  
  const hasProblematicSuffix = problematicPatterns.some(pattern => pattern.test(suffix));
  
  // Jeśli nie ma problematycznych sufixów, nie rób nic
  if (!hasProblematicSuffix) return { cleaned, changes };
  
  // Usuń nadmiarowe informacje z sufiksu
  let cleanedSuffix = suffix;
  
  problematicPatterns.forEach(pattern => {
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

// Funkcja do czyszczenia nazwy modelu
function cleanModelName(modelName: string, brandName: string): { cleaned: string; changes: string[] } {
  let cleaned = modelName;
  const changes: string[] = [];
  
  // FAZA 4 - KROK 1: Usuń slash i warianty po nim
  const slashResult = removeSlashVariants(cleaned);
  if (slashResult.cleaned !== cleaned) {
    cleaned = slashResult.cleaned;
    changes.push(...slashResult.changes);
  }
  
  // FAZA 4 - KROK 2: Usuń informację o liczbie drzwi
  const doorResult = removeDoorInfo(cleaned);
  if (doorResult.cleaned !== cleaned) {
    cleaned = doorResult.cleaned;
    changes.push(...doorResult.changes);
  }
  
  // FAZA 4 - KROK 3: Usuń "zwykła/zwykły"
  const zwyklaResult = removeZwykla(cleaned);
  if (zwyklaResult.cleaned !== cleaned) {
    cleaned = zwyklaResult.cleaned;
    changes.push(...zwyklaResult.changes);
  }
  
  // FAZA 4 - KROK 4: Usuń "krótki/long/short"
  const shortLongResult = removeShortLong(cleaned);
  if (shortLongResult.cleaned !== cleaned) {
    cleaned = shortLongResult.cleaned;
    changes.push(...shortLongResult.changes);
  }
  
  // KROK 1: Specjalne czyszczenie dla BMW (popraw kody generacji)
  if (brandName.toLowerCase() === 'bmw') {
    const beforeBMW = cleaned;
    cleaned = cleanBMWModel(cleaned);
    if (cleaned !== beforeBMW) {
      changes.push(`Poprawiono kody generacji BMW: "${beforeBMW}" → "${cleaned}"`);
    }
  }
  
  // KROK 2: Normalizuj kody generacji dla wszystkich marek
  const beforeNormalize = cleaned;
  cleaned = normalizeGenerationCode(cleaned);
  if (cleaned !== beforeNormalize) {
    changes.push(`Znormalizowano kody generacji: "${beforeNormalize}" → "${cleaned}"`);
  }

  // KROK 2.5: Normalizuj kody generacji dla marek non-premium (Infiniti, Smart)
  const beforeNonPremium = cleaned;
  cleaned = normalizeNonPremiumCodes(cleaned, brandName);
  if (cleaned !== beforeNonPremium) {
    changes.push(`Znormalizowano kody generacji non-premium: "${beforeNonPremium}" → "${cleaned}"`);
  }

  // KROK 2.6: Specjalne czyszczenie dla nazw numerycznych (3 benzyna, 6 ANGLIK, etc.)
  const beforeNumeric = cleaned;
  const numericResult = cleanNumericModelNames(cleaned, brandName);
  let wasNumericCleaned = false;
  if (numericResult.cleaned !== beforeNumeric) {
    cleaned = numericResult.cleaned;
    changes.push(...numericResult.changes);
    wasNumericCleaned = true;
    console.log(`🔧 Czyszczenie numeryczne: "${beforeNumeric}" → "${cleaned}"`);
  }
  
  // Sprawdź czy to marka premium z kodami generacji
  const isPremiumWithCodes = hasGenerationCodes(brandName, modelName);
  
  if (isPremiumWithCodes) {
    console.log(`🔒 Zachowuję kody generacji dla ${brandName}: ${modelName}`);
  }
  
  // KROK 3: Usuń wszystkie wzorce nadmiarowych informacji (tylko dla nazw nie-numerycznych)
  const isNumericName = /^[0-9]/.test(modelName);
  
  if (!isNumericName) {
    Object.entries(cleaningPatterns).forEach(([category, patterns]) => {
      // Dla marek premium, nie usuwaj kodów generacji
      if (category === 'premiumCodes' && isPremiumWithCodes) {
        return;
      }
      
      // Dla BMW, nie usuwaj kodów generacji w nawiasach
      if (brandName.toLowerCase() === 'bmw' && category === 'premiumCodes') {
        return;
      }
      
      patterns.forEach(pattern => {
        const matches = cleaned.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const trimmed = match.trim();
            if (trimmed) {
              // Sprawdź czy to nie jest kod generacji BMW w nawiasach
              if (brandName.toLowerCase() === 'bmw' && /^\([EFGU][-]?[0-9]{2,3}\)$/.test(trimmed)) {
                return; // Nie usuwaj kodów generacji BMW
              }
              
              changes.push(`Usunięto ${category}: "${trimmed}"`);
              cleaned = cleaned.replace(pattern, '');
            }
          });
        }
      });
    });
  }
  
  // Usuń nadmiarowe spacje i znaki
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Usuń znaki na początku i końcu
  cleaned = cleaned.replace(/^[,\/\s]+|[,\/\s]+$/g, '');
  
  // Jeśli po czyszczeniu zostało puste, przywróć oryginalną nazwę
  if (!cleaned) {
    console.log(`⚠️ Ostrzeżenie: Nazwa modelu "${modelName}" została zbyt mocno oczyszczona, przywracam oryginalną`);
    return { cleaned: modelName, changes: ['Przywrócono oryginalną nazwę - zbyt agresywne czyszczenie'] };
  }
  
  // Jeśli po czyszczeniu zostało bardzo krótkie (ale nie dla celowego czyszczenia numerycznego), przywróć oryginalną nazwę
  if (cleaned.length < 2 && !wasNumericCleaned) {
    console.log(`⚠️ Ostrzeżenie: Nazwa modelu "${modelName}" została zbyt mocno oczyszczona, przywracam oryginalną`);
    return { cleaned: modelName, changes: ['Przywrócono oryginalną nazwę - zbyt agresywne czyszczenie'] };
  }
  
  // Jeśli po czyszczeniu zostało tylko cyfra, przywróć oryginalną nazwę (chyba że to było celowe czyszczenie numeryczne)
  if (/^[0-9]+$/.test(cleaned) && !wasNumericCleaned) {
    console.log(`⚠️ Ostrzeżenie: Nazwa modelu "${modelName}" została zbyt mocno oczyszczona (tylko cyfra), przywracam oryginalną`);
    return { cleaned: modelName, changes: ['Przywrócono oryginalną nazwę - zbyt agresywne czyszczenie'] };
  }
  
  // FAZA 4 - KROK 5: Dodaj nawiasy do kodów generacji (dla wszystkich marek) - NA KOŃCU
  const parenthesesResult = addParenthesesToGenerationCodes(cleaned, brandName);
  if (parenthesesResult.cleaned !== cleaned) {
    cleaned = parenthesesResult.cleaned;
    changes.push(...parenthesesResult.changes);
  }
  
  return { cleaned, changes };
}

// Funkcja do pobierania danych
async function getCarModels(): Promise<CarModel[]> {
  console.log('🔍 Pobieranie danych z tabeli car_models_extended...');
  
  // Pobierz wszystkie rekordy (bez limitu)
  let allModels: CarModel[] = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: models, error } = await supabase
      .from('car_models_extended')
      .select('*')
      .order('brand_name', { ascending: true })
      .order('model_name', { ascending: true })
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('❌ Błąd podczas pobierania danych:', error);
      throw error;
    }
    
    if (!models || models.length === 0) {
      break;
    }
    
    allModels = allModels.concat(models);
    
    if (models.length < pageSize) {
      break;
    }
    
    from += pageSize;
  }
  
  console.log(`✅ Pobrano ${allModels.length} rekordów`);
  return allModels;
}

// Funkcja do generowania preview zmian
async function generatePreview(): Promise<CleaningResult[]> {
  const models = await getCarModels();
  const results: CleaningResult[] = [];
  
  console.log('🧹 Generowanie preview zmian...');
  
  models.forEach(model => {
    const { cleaned, changes } = cleanModelName(model.model_name, model.brand_name);
    
    if (cleaned !== model.model_name) {
      results.push({
        id: model.id,
        original: model.model_name,
        cleaned,
        changes
      });
    }
  });
  
  console.log(`📊 Znaleziono ${results.length} rekordów do zmiany`);
  return results;
}

// Funkcja do wykonania czyszczenia
async function performCleaning(dryRun: boolean = true): Promise<void> {
  const models = await getCarModels();
  const results: CleaningResult[] = [];
  
  console.log(`🧹 ${dryRun ? 'Symulacja' : 'Wykonywanie'} czyszczenia...`);
  
  // Generuj zmiany
  models.forEach(model => {
    const { cleaned, changes } = cleanModelName(model.model_name, model.brand_name);
    
    if (cleaned !== model.model_name) {
      results.push({
        id: model.id,
        original: model.model_name,
        cleaned,
        changes
      });
    }
  });
  
  console.log(`📊 Znaleziono ${results.length} rekordów do zmiany`);
  
  if (dryRun) {
    // Tylko preview
    console.log('\n📋 Preview zmian (pierwsze 20):');
    results.slice(0, 20).forEach(result => {
      console.log(`ID ${result.id}: "${result.original}" → "${result.cleaned}"`);
      if (result.changes.length > 0) {
        console.log(`  Zmiany: ${result.changes.join(', ')}`);
      }
    });
    
    if (results.length > 20) {
      console.log(`... i ${results.length - 20} więcej`);
    }
  } else {
    // Wykonaj rzeczywiste zmiany
    console.log('💾 Wykonywanie zmian w bazie danych...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const result of results) {
      try {
        const { error } = await supabase
          .from('car_models_extended')
          .update({ model_name: result.cleaned })
          .eq('id', result.id);
        
        if (error) {
          console.error(`❌ Błąd przy ID ${result.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Błąd przy ID ${result.id}:`, err);
        errorCount++;
      }
    }
    
    console.log(`✅ Zakończono: ${successCount} sukcesów, ${errorCount} błędów`);
  }
  
  // Zapisz raport
  const reportPath = path.join(process.cwd(), 'scripts', 'cleaning-report.md');
  const report = generateCleaningReport(results);
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 Raport zapisany w: ${reportPath}`);
}

// Funkcja do generowania raportu czyszczenia
function generateCleaningReport(results: CleaningResult[]): string {
  let report = '# Raport czyszczenia kolumny model_name\n\n';
  
  report += `## Podsumowanie\n`;
  report += `- **Łączna liczba rekordów do zmiany:** ${results.length}\n`;
  report += `- **Data wykonania:** ${new Date().toISOString()}\n\n`;
  
  // Grupowanie po typach zmian
  const changesByType: { [key: string]: number } = {};
  results.forEach(result => {
    result.changes.forEach(change => {
      const type = change.split(':')[0];
      changesByType[type] = (changesByType[type] || 0) + 1;
    });
  });
  
  if (Object.keys(changesByType).length > 0) {
    report += `## Typy zmian\n\n`;
    Object.entries(changesByType).forEach(([type, count]) => {
      report += `- **${type}:** ${count} wystąpień\n`;
    });
    report += '\n';
  }
  
  // Przykłady zmian
  report += `## Przykłady zmian\n\n`;
  results.slice(0, 50).forEach(result => {
    report += `### ID ${result.id}\n`;
    report += `- **Przed:** "${result.original}"\n`;
    report += `- **Po:** "${result.cleaned}"\n`;
    if (result.changes.length > 0) {
      report += `- **Zmiany:** ${result.changes.join(', ')}\n`;
    }
    report += '\n';
  });
  
  if (results.length > 50) {
    report += `... i ${results.length - 50} więcej zmian\n\n`;
  }
  
  return report;
}

// Główna funkcja
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  try {
    if (dryRun) {
      console.log('🔍 Tryb symulacji - żadne zmiany nie zostaną zapisane');
      console.log('💡 Aby wykonać rzeczywiste zmiany, uruchom z flagą --execute');
    } else {
      console.log('⚠️ Tryb wykonania - zmiany zostaną zapisane w bazie danych!');
    }
    
    await performCleaning(dryRun);
    
    if (dryRun) {
      console.log('\n✅ Symulacja zakończona pomyślnie!');
      console.log('💡 Aby wykonać rzeczywiste zmiany, uruchom: npx tsx scripts/clean-car-models.ts --execute');
    } else {
      console.log('\n✅ Czyszczenie zakończone pomyślnie!');
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia:', error);
    process.exit(1);
  }
}

// Uruchom skrypt
if (require.main === module) {
  main();
}

export { cleanModelName, performCleaning, generatePreview };
