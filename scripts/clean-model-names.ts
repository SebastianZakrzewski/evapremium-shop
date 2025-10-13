import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

interface CarModelRecord {
  id: number;
  brand_name: string;
  model_name: string;
}

interface CleanedRecord {
  id: number;
  brand_name: string;
  model_name_original: string;
  model_name_cleaned: string;
  needsCleaning: boolean;
}

interface CleaningReport {
  totalRecords: number;
  recordsNeedingCleaning: number;
  recordsAlreadyClean: number;
  cleaningStats: {
    byBrand: Record<string, {
      total: number;
      cleaned: number;
      alreadyClean: number;
    }>;
  };
  examples: Array<{
    brand: string;
    original: string;
    cleaned: string;
    needsCleaning: boolean;
  }>;
}

// Marki które używają kodów generacji (z analizy)
const BRANDS_WITH_GENERATION_CODES = ['Bmw'];

// Wzorce do usuwania (nadprogramowe informacje)
const REMOVAL_PATTERNS = [
  // Lata produkcji (różne formaty)
  /\d{4}[\-\+]\d{4}/g,  // 2015-2020
  /\d{4}\+\s*/g,        // 2015+
  /\d{4}\s*-\s*\d{4}/g, // 2015 - 2020
  /\d{4}\s*-\s*now/g,   // 2015 - now
  /\d{4}\s*-\s*present/g, // 2015 - present
  
  // Silniki i jednostki napędowe
  /\d+\.\d+\s*[A-Z]*\s*/gi,  // 1.6, 2.0 TDI
  /\d+\.\d+\s*[A-Z]+\s*/gi,  // 1.6 HDI, 2.0 CRDi
  /\b(TDI|HDI|CRDi|dCi|PureTech|BlueHDi|EcoBoost|Hybrid|Electric|PHEV|Plug-in|MHEV|Mild Hybrid)\b/gi,
  
  // Opisy nadwozia
  /\b(Sedan|SUV|Hatchback|Kombi|Wagon|Coupe|Van|Pickup|Gran Turismo|Gran Coupe|Touring|Estate|Cabriolet|Convertible|Roadster|Crossover|MPV|Minivan|Liftback|Fastback|Shooting Brake)\b/gi,
  
  // Opisy techniczne i wersje
  /\b(AMG|M Sport|S-Line|GTI|GTD|GT|RS|S|SE|LE|Limited|Premium|Luxury|Comfort|Dynamic|Elegance|Ambition|Style|Trend|Trendline|Comfortline|Highline|Exclusive|Edition|Special|Sport|Performance|Turbo|Supercharged|AWD|4WD|FWD|RWD|Quattro|xDrive|4MATIC|Allroad|All-Terrain)\b/gi,
  
  // Dodatkowe opisy
  /\b(Allroad|Quattro|xDrive|4MATIC|4WD|AWD|FWD|RWD|Front|Rear|Manual|Automatic|CVT|DSG|S-Tronic|Tiptronic|Steptronic)\b/gi,
  
  // Wersje specjalne
  /\b(Black|White|Silver|Gold|Platinum|Titanium|Titan|Chrome|Carbon|Aluminum|Steel|Edition|Limited|Special|Anniversary|Heritage|Classic|Vintage|Retro|Modern|Contemporary|Future|Next|New|Old|Original|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\b/gi,
  
  // Rozmiary i pojemności
  /\b(Small|Medium|Large|Compact|Mid-size|Full-size|Subcompact|Micro|Mini|Maxi|Mega|Ultra|Super|Hyper|Mega|Giga|Tera|Peta|Exa|Zetta|Yotta)\b/gi,
  
  // Dodatkowe słowa kluczowe
  /\b(Plus|Pro|Max|Ultra|Premium|Luxury|Deluxe|Executive|Business|Corporate|Professional|Commercial|Industrial|Military|Police|Emergency|Rescue|Ambulance|Fire|Truck|Bus|Coach|Trailer|Caravan|Motorhome|RV|Camper|Van|Minivan|Pickup|Truck|Lorry|Heavy|Light|Medium|Heavy-duty|Light-duty|Medium-duty)\b/gi
];

// Wzorce do wykrywania kodów generacji
const GENERATION_CODE_PATTERNS = [
  /\([A-Z0-9\-]+\)/g,  // (F34), (G05), (B9), (E-87)
  /\([A-Z][a-z]+\d+\)/g,  // (Mk7), (Mk8)
  /\([A-Z]+\d+[A-Z]*\)/g,  // (W205), (E213)
  /\([A-Z]+\d+\)/g,  // (F30), (G20)
  /\([A-Z]+\d+[A-Z]+\d*\)/g  // (B9), (E3)
];

function detectGenerationCodes(modelName: string): boolean {
  return GENERATION_CODE_PATTERNS.some(pattern => pattern.test(modelName));
}

function extractGenerationCode(modelName: string): string | null {
  for (const pattern of GENERATION_CODE_PATTERNS) {
    const match = modelName.match(pattern);
    if (match) {
      return match[0]; // Zwróć pierwszy znaleziony kod
    }
  }
  return null;
}

function cleanModelNameStandard(modelName: string): string {
  let cleaned = modelName;
  
  // Usuń wszystkie wzorce do usunięcia
  REMOVAL_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Wyczyść białe znaki i weź pierwszą część
  cleaned = cleaned.trim().split(/\s+/)[0];
  
  // Jeśli zostało puste, zwróć oryginalną nazwę
  return cleaned || modelName;
}

function cleanModelNameWithGenerationCode(modelName: string): string {
  const generationCode = extractGenerationCode(modelName);
  if (!generationCode) {
    return cleanModelNameStandard(modelName);
  }
  
  // Wyciągnij nazwę modelu przed kodem generacji
  const beforeCode = modelName.split(generationCode)[0].trim();
  const modelNamePart = beforeCode.split(/\s+/)[0];
  
  return `${modelNamePart} ${generationCode}`;
}

function cleanModelName(brandName: string, modelName: string): { cleaned: string; needsCleaning: boolean } {
  // Sprawdź czy marka używa kodów generacji
  const hasGenerationCodes = BRANDS_WITH_GENERATION_CODES.includes(brandName);
  
  let cleaned: string;
  let needsCleaning = false;
  
  if (hasGenerationCodes) {
    // Dla marek z kodami generacji - zachowaj model + kod
    cleaned = cleanModelNameWithGenerationCode(modelName);
  } else {
    // Dla marek standardowych - tylko nazwa modelu
    cleaned = cleanModelNameStandard(modelName);
  }
  
  // Sprawdź czy nazwa się zmieniła
  needsCleaning = cleaned !== modelName;
  
  return { cleaned, needsCleaning };
}

async function cleanAllModelNames(): Promise<void> {
  console.log('🧹 Rozpoczynam czyszczenie nazw modeli...\n');

  try {
    // Wczytaj pobrane dane
    const rawDataPath = path.join(process.cwd(), 'output', 'all-car-models-raw.json');
    if (!fs.existsSync(rawDataPath)) {
      throw new Error(`Plik z danymi nie istnieje: ${rawDataPath}`);
    }

    const rawData: CarModelRecord[] = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
    console.log(`📊 Wczytano ${rawData.length} rekordów do czyszczenia\n`);

    const cleanedRecords: CleanedRecord[] = [];
    const cleaningStats: Record<string, { total: number; cleaned: number; alreadyClean: number }> = {};
    const examples: Array<{ brand: string; original: string; cleaned: string; needsCleaning: boolean }> = [];

    // Przetwórz każdy rekord
    for (const record of rawData) {
      const { cleaned, needsCleaning } = cleanModelName(record.brand_name, record.model_name);
      
      const cleanedRecord: CleanedRecord = {
        id: record.id,
        brand_name: record.brand_name,
        model_name_original: record.model_name,
        model_name_cleaned: cleaned,
        needsCleaning
      };
      
      cleanedRecords.push(cleanedRecord);
      
      // Aktualizuj statystyki
      if (!cleaningStats[record.brand_name]) {
        cleaningStats[record.brand_name] = { total: 0, cleaned: 0, alreadyClean: 0 };
      }
      
      cleaningStats[record.brand_name].total++;
      if (needsCleaning) {
        cleaningStats[record.brand_name].cleaned++;
      } else {
        cleaningStats[record.brand_name].alreadyClean++;
      }
      
      // Zbierz przykłady (maksymalnie 20)
      if (examples.length < 20) {
        examples.push({
          brand: record.brand_name,
          original: record.model_name,
          cleaned,
          needsCleaning
        });
      }
    }

    // Oblicz statystyki
    const totalRecords = cleanedRecords.length;
    const recordsNeedingCleaning = cleanedRecords.filter(r => r.needsCleaning).length;
    const recordsAlreadyClean = totalRecords - recordsNeedingCleaning;

    const report: CleaningReport = {
      totalRecords,
      recordsNeedingCleaning,
      recordsAlreadyClean,
      cleaningStats,
      examples
    };

    // Zapisz oczyszczone dane
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const cleanedDataPath = path.join(outputDir, 'cleaned-models.json');
    fs.writeFileSync(cleanedDataPath, JSON.stringify(cleanedRecords, null, 2));

    const reportPath = path.join(outputDir, 'cleaning-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Wyświetl podsumowanie
    console.log('📊 PODSUMOWANIE CZYSZCZENIA:');
    console.log(`📈 Łączna liczba rekordów: ${totalRecords}`);
    console.log(`🧹 Rekordy wymagające czyszczenia: ${recordsNeedingCleaning} (${((recordsNeedingCleaning / totalRecords) * 100).toFixed(1)}%)`);
    console.log(`✅ Rekordy już czyste: ${recordsAlreadyClean} (${((recordsAlreadyClean / totalRecords) * 100).toFixed(1)}%)\n`);

    // Pokaż statystyki dla marek z największą liczbą zmian
    const brandsWithChanges = Object.entries(cleaningStats)
      .filter(([_, stats]) => stats.cleaned > 0)
      .sort((a, b) => b[1].cleaned - a[1].cleaned)
      .slice(0, 10);

    if (brandsWithChanges.length > 0) {
      console.log('🔧 MARKI Z NAJWIĘKSZĄ LICZBĄ ZMIAN:');
      brandsWithChanges.forEach(([brand, stats]) => {
        console.log(`   • ${brand}: ${stats.cleaned}/${stats.total} (${((stats.cleaned / stats.total) * 100).toFixed(1)}%)`);
      });
    } else {
      console.log('✅ Wszystkie marki mają już czyste nazwy modeli!');
    }

    console.log('\n📝 PRZYKŁADY CZYSZCZENIA:');
    examples.slice(0, 10).forEach(example => {
      const status = example.needsCleaning ? '🧹' : '✅';
      console.log(`   ${status} ${example.brand}: "${example.original}" → "${example.cleaned}"`);
    });

    console.log(`\n💾 Zapisano oczyszczone dane do: ${cleanedDataPath}`);
    console.log(`📊 Zapisano raport do: ${reportPath}`);
    console.log('\n✅ Czyszczenie zakończone pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia:', error);
    throw error;
  }
}

// Uruchom czyszczenie
if (require.main === module) {
  cleanAllModelNames()
    .then(() => {
      console.log('\n✅ Skrypt czyszczenia zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt czyszczenia zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { cleanAllModelNames, type CleanedRecord, type CleaningReport };
