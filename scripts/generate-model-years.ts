import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

interface CarModelWithGeneration {
  id: number;
  brand_name: string;
  model_name: string;
  generation: string | null;
}

interface GenerationInfo {
  generation: string;
  years: number[];
}

interface ModelYearData {
  brand_name: string;
  model_name: string;
  generations: GenerationInfo[];
  available_years: number[];
  year_range: {
    min: number;
    max: number;
  };
}

interface YearGenerationReport {
  totalModels: number;
  modelsWithMultipleGenerations: number;
  modelsWithSingleGeneration: number;
  modelsWithoutGeneration: number;
  yearRange: {
    globalMin: number;
    globalMax: number;
  };
  models: Record<string, Record<string, ModelYearData>>;
}

function parseGeneration(generation: string): number[] {
  if (!generation || generation.trim() === '') {
    return [];
  }

  const cleanGeneration = generation.trim();
  const currentYear = new Date().getFullYear();

  // Format: "1999-2009"
  if (cleanGeneration.includes('-') && !cleanGeneration.includes('+')) {
    const [startStr, endStr] = cleanGeneration.split('-');
    const startYear = parseInt(startStr.trim());
    const endYear = parseInt(endStr.trim());
    
    if (!isNaN(startYear) && !isNaN(endYear)) {
      const years: number[] = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }
      return years;
    }
  }

  // Format: "2019+" lub "2019 +"
  if (cleanGeneration.includes('+')) {
    const yearStr = cleanGeneration.replace('+', '').trim();
    const startYear = parseInt(yearStr);
    
    if (!isNaN(startYear)) {
      const years: number[] = [];
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    }
  }

  // Format: pojedynczy rok "2015"
  const singleYear = parseInt(cleanGeneration);
  if (!isNaN(singleYear)) {
    return [singleYear];
  }

  console.warn(`⚠️  Nieznany format generation: "${generation}"`);
  return [];
}

function generateModelYears(data: CarModelWithGeneration[]): YearGenerationReport {
  console.log('🔍 Rozpoczynam generowanie roczników dla modeli...\n');

  const modelsMap: Record<string, Record<string, ModelYearData>> = {};
  let totalModels = 0;
  let modelsWithMultipleGenerations = 0;
  let modelsWithSingleGeneration = 0;
  let modelsWithoutGeneration = 0;
  let globalMinYear = Infinity;
  let globalMaxYear = -Infinity;

  // Grupuj rekordy po marce i modelu
  for (const record of data) {
    const { brand_name, model_name, generation } = record;
    
    if (!modelsMap[brand_name]) {
      modelsMap[brand_name] = {};
    }
    
    if (!modelsMap[brand_name][model_name]) {
      modelsMap[brand_name][model_name] = {
        brand_name,
        model_name,
        generations: [],
        available_years: [],
        year_range: { min: Infinity, max: -Infinity }
      };
    }

    // Parsuj generation jeśli istnieje
    if (generation) {
      const years = parseGeneration(generation);
      if (years.length > 0) {
        modelsMap[brand_name][model_name].generations.push({
          generation,
          years
        });
      }
    }
  }

  // Przetwórz każdy model
  for (const brandName in modelsMap) {
    for (const modelName in modelsMap[brandName]) {
      const model = modelsMap[brandName][modelName];
      totalModels++;

      if (model.generations.length === 0) {
        modelsWithoutGeneration++;
        continue;
      }

      if (model.generations.length === 1) {
        modelsWithSingleGeneration++;
      } else {
        modelsWithMultipleGenerations++;
      }

      // Zbierz wszystkie lata z wszystkich generacji
      const allYears: number[] = [];
      for (const gen of model.generations) {
        allYears.push(...gen.years);
      }

      // Usuń duplikaty i posortuj
      const uniqueYears = [...new Set(allYears)].sort((a, b) => a - b);
      model.available_years = uniqueYears;

      // Znajdź min i max rok
      if (uniqueYears.length > 0) {
        model.year_range.min = uniqueYears[0];
        model.year_range.max = uniqueYears[uniqueYears.length - 1];
        
        globalMinYear = Math.min(globalMinYear, model.year_range.min);
        globalMaxYear = Math.max(globalMaxYear, model.year_range.max);
      }
    }
  }

  const report: YearGenerationReport = {
    totalModels,
    modelsWithMultipleGenerations,
    modelsWithSingleGeneration,
    modelsWithoutGeneration,
    yearRange: {
      globalMin: globalMinYear === Infinity ? 0 : globalMinYear,
      globalMax: globalMaxYear === -Infinity ? 0 : globalMaxYear
    },
    models: modelsMap
  };

  return report;
}

async function generateModelYearsReport(): Promise<void> {
  console.log('🚀 Rozpoczynam generowanie raportu roczników modeli...\n');

  try {
    // Wczytaj dane
    const dataPath = path.join(process.cwd(), 'output', 'car-models-with-generation.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Plik z danymi nie istnieje: ${dataPath}`);
    }

    const data: CarModelWithGeneration[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`📊 Wczytano ${data.length} rekordów do analizy\n`);

    // Generuj roczniki
    const report = generateModelYears(data);

    // Zapisz raport
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'model-years-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Wyświetl podsumowanie
    console.log('📊 PODSUMOWANIE GENEROWANIA ROCZNIKÓW:');
    console.log(`📈 Łączna liczba modeli: ${report.totalModels}`);
    console.log(`🔄 Modele z wieloma generacjami: ${report.modelsWithMultipleGenerations}`);
    console.log(`📝 Modele z jedną generacją: ${report.modelsWithSingleGeneration}`);
    console.log(`❌ Modele bez generacji: ${report.modelsWithoutGeneration}`);
    console.log(`📅 Globalny zakres lat: ${report.yearRange.globalMin} - ${report.yearRange.globalMax}\n`);

    // Pokaż przykłady modeli z wieloma generacjami
    console.log('🔄 PRZYKŁADY MODELI Z WIELOMA GENERACJAMI:');
    let examplesShown = 0;
    for (const brandName in report.models) {
      for (const modelName in report.models[brandName]) {
        const model = report.models[brandName][modelName];
        if (model.generations.length > 1 && examplesShown < 5) {
          console.log(`   • ${brandName} ${modelName}:`);
          model.generations.forEach(gen => {
            console.log(`     - ${gen.generation} → [${gen.years[0]}-${gen.years[gen.years.length - 1]}]`);
          });
          console.log(`     → Dostępne lata: [${model.year_range.min}-${model.year_range.max}] (${model.available_years.length} lat)`);
          examplesShown++;
        }
      }
    }

    // Pokaż przykłady modeli z jedną generacją
    console.log('\n📝 PRZYKŁADY MODELI Z JEDNĄ GENERACJĄ:');
    examplesShown = 0;
    for (const brandName in report.models) {
      for (const modelName in report.models[brandName]) {
        const model = report.models[brandName][modelName];
        if (model.generations.length === 1 && examplesShown < 5) {
          const gen = model.generations[0];
          console.log(`   • ${brandName} ${modelName}: ${gen.generation} → [${gen.years[0]}-${gen.years[gen.years.length - 1]}] (${gen.years.length} lat)`);
          examplesShown++;
        }
      }
    }

    console.log(`\n💾 Zapisano raport do: ${reportPath}`);
    console.log('\n✅ Generowanie roczników zakończone pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas generowania roczników:', error);
    throw error;
  }
}

// Uruchom generowanie
if (require.main === module) {
  generateModelYearsReport()
    .then(() => {
      console.log('\n✅ Skrypt zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { generateModelYearsReport, type ModelYearData, type YearGenerationReport };
