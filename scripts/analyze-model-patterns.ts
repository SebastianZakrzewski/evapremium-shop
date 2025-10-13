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

interface BrandAnalysis {
  count: number;
  hasGenerationCodes: boolean;
  examples: Array<{
    id: number;
    original: string;
    cleaned?: string;
  }>;
  patterns: {
    withGenerationCodes: string[];
    withoutGenerationCodes: string[];
    commonSuffixes: string[];
  };
}

interface AnalysisReport {
  totalRecords: number;
  brands: Record<string, BrandAnalysis>;
  summary: {
    brandsWithGenerationCodes: string[];
    brandsWithoutGenerationCodes: string[];
    totalBrands: number;
  };
}

// Lista marek które prawdopodobnie używają kodów generacji
const SUSPECTED_GENERATION_CODE_BRANDS = [
  'BMW', 'Bmw',
  'Mercedes-Benz', 'Mercedes',
  'Audi',
  'Porsche',
  'Volkswagen', 'VW',
  'Skoda', 'SKODA', 'Škoda',
  'Seat', 'SEAT',
  'Cupra',
  'Lexus',
  'Alfa romeo', 'Alfa Romeo',
  'Volvo', 'VOLVO',
  'Land rover', 'Land Rover',
  'Jaguar',
  'Bentley',
  'Rolls-Royce',
  'Aston martin', 'Aston Martin',
  'Ferrari',
  'Lamborghini',
  'Maserati',
  'McLaren'
];

// Wzorce do wykrywania kodów generacji
const GENERATION_CODE_PATTERNS = [
  /\([A-Z0-9\-]+\)/g,  // (F34), (G05), (B9)
  /\([A-Z][a-z]+\d+\)/g,  // (Mk7), (Mk8)
  /\([A-Z]+\d+[A-Z]*\)/g,  // (W205), (E213)
  /\([A-Z]+\d+\)/g,  // (F30), (G20)
  /\([A-Z]+\d+[A-Z]+\d*\)/g  // (B9), (E3)
];

// Wzorce do usuwania (nadprogramowe informacje)
const REMOVAL_PATTERNS = [
  // Lata produkcji
  /\d{4}[\-\+]?\d{0,4}/g,
  // Silniki
  /\d+\.\d+\s*[A-Z]*\s*/gi,
  /\d+\.\d+\s*[A-Z]+\s*/gi,
  // Opisy nadwozia
  /\b(Sedan|SUV|Hatchback|Kombi|Wagon|Coupe|Van|Pickup|Gran Turismo|Gran Coupe|Touring|Estate|Cabriolet|Convertible|Roadster|Crossover|MPV|Minivan)\b/gi,
  // Opisy techniczne
  /\b(AMG|M Sport|S-Line|GTI|GTD|GT|TDI|HDI|CRDi|dCi|PureTech|BlueHDi|EcoBoost|Hybrid|Electric|PHEV|Plug-in)\b/gi,
  // Dodatkowe opisy
  /\b(Allroad|Quattro|xDrive|4MATIC|4WD|AWD|FWD|RWD)\b/gi
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
  
  return cleaned || modelName; // Fallback do oryginalnej nazwy
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

function analyzeBrand(brandName: string, records: CarModelRecord[]): BrandAnalysis {
  const brandRecords = records.filter(r => r.brand_name === brandName);
  const examples = brandRecords.slice(0, 10).map(r => ({
    id: r.id,
    original: r.model_name
  }));
  
  // Sprawdź czy marka używa kodów generacji
  const recordsWithCodes = brandRecords.filter(r => detectGenerationCodes(r.model_name));
  const hasGenerationCodes = recordsWithCodes.length > brandRecords.length * 0.3; // 30% próg
  
  // Przykłady z kodami generacji
  const withGenerationCodes = recordsWithCodes.slice(0, 5).map(r => r.model_name);
  
  // Przykłady bez kodów generacji
  const withoutGenerationCodes = brandRecords
    .filter(r => !detectGenerationCodes(r.model_name))
    .slice(0, 5)
    .map(r => r.model_name);
  
  // Wspólne sufiksy (do usunięcia)
  const allSuffixes = brandRecords.flatMap(r => {
    const parts = r.model_name.split(/\s+/);
    return parts.slice(1); // Wszystkie części oprócz pierwszej
  });
  
  const suffixCounts = allSuffixes.reduce((acc, suffix) => {
    acc[suffix] = (acc[suffix] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const commonSuffixes = Object.entries(suffixCounts)
    .filter(([_, count]) => count > brandRecords.length * 0.2) // 20% próg
    .map(([suffix, _]) => suffix)
    .slice(0, 10);
  
  return {
    count: brandRecords.length,
    hasGenerationCodes,
    examples,
    patterns: {
      withGenerationCodes,
      withoutGenerationCodes,
      commonSuffixes
    }
  };
}

async function analyzeModelPatterns(): Promise<void> {
  console.log('🔍 Rozpoczynam analizę wzorców nazewnictwa...\n');

  try {
    // Wczytaj pobrane dane
    const rawDataPath = path.join(process.cwd(), 'output', 'all-car-models-raw.json');
    if (!fs.existsSync(rawDataPath)) {
      throw new Error(`Plik z danymi nie istnieje: ${rawDataPath}`);
    }

    const rawData: CarModelRecord[] = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));
    console.log(`📊 Wczytano ${rawData.length} rekordów do analizy\n`);

    // Grupuj według marek
    const brands = [...new Set(rawData.map(r => r.brand_name))].sort();
    console.log(`🏷️  Analizuję ${brands.length} marek...\n`);

    const analysis: AnalysisReport = {
      totalRecords: rawData.length,
      brands: {},
      summary: {
        brandsWithGenerationCodes: [],
        brandsWithoutGenerationCodes: [],
        totalBrands: brands.length
      }
    };

    // Analizuj każdą markę
    for (const brand of brands) {
      console.log(`⏳ Analizuję markę: ${brand}`);
      
      const brandAnalysis = analyzeBrand(brand, rawData);
      analysis.brands[brand] = brandAnalysis;
      
      if (brandAnalysis.hasGenerationCodes) {
        analysis.summary.brandsWithGenerationCodes.push(brand);
        console.log(`   ✅ Wykryto kody generacji (${brandAnalysis.patterns.withGenerationCodes.length} przykładów)`);
      } else {
        analysis.summary.brandsWithoutGenerationCodes.push(brand);
        console.log(`   📝 Standardowe nazewnictwo (${brandAnalysis.count} modeli)`);
      }
    }

    // Zapisz raport analizy
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'model-names-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

    console.log('\n📊 PODSUMOWANIE ANALIZY:');
    console.log(`📈 Łączna liczba rekordów: ${analysis.totalRecords}`);
    console.log(`🏷️  Łączna liczba marek: ${analysis.summary.totalBrands}`);
    console.log(`🔢 Marki z kodami generacji: ${analysis.summary.brandsWithGenerationCodes.length}`);
    console.log(`📝 Marki standardowe: ${analysis.summary.brandsWithoutGenerationCodes.length}\n`);

    console.log('🔢 MARKI Z KODAMI GENERACJI:');
    analysis.summary.brandsWithGenerationCodes.forEach(brand => {
      const brandData = analysis.brands[brand];
      console.log(`   • ${brand} (${brandData.count} modeli)`);
      console.log(`     Przykłady: ${brandData.patterns.withGenerationCodes.slice(0, 3).join(', ')}`);
    });

    console.log('\n📝 MARKI STANDARDOWE (pierwsze 10):');
    analysis.summary.brandsWithoutGenerationCodes.slice(0, 10).forEach(brand => {
      const brandData = analysis.brands[brand];
      console.log(`   • ${brand} (${brandData.count} modeli)`);
    });

    console.log(`\n💾 Zapisano raport do: ${reportPath}`);
    console.log('\n✅ Analiza zakończona pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas analizy:', error);
    throw error;
  }
}

// Uruchom analizę
if (require.main === module) {
  analyzeModelPatterns()
    .then(() => {
      console.log('\n✅ Skrypt analizy zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt analizy zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { analyzeModelPatterns, type AnalysisReport, type BrandAnalysis };
