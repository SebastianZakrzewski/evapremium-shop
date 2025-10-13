import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

interface ModelYearData {
  brand_name: string;
  model_name: string;
  generations: Array<{
    generation: string;
    years: number[];
  }>;
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

interface FrontendCarModelData {
  [brandName: string]: {
    [modelName: string]: {
      generations: Array<{
        id: number;
        generation: string;
        years: number[];
        yearRange: {
          min: number;
          max: number;
        };
      }>;
      availableYears: number[];
      yearRange: {
        min: number;
        max: number;
      };
    };
  };
}

function createFrontendData(report: YearGenerationReport): FrontendCarModelData {
  console.log('🔧 Tworzę dane dla frontendu...\n');

  const frontendData: FrontendCarModelData = {};

  for (const brandName in report.models) {
    frontendData[brandName] = {};

    for (const modelName in report.models[brandName]) {
      const model = report.models[brandName][modelName];
      
      // Przekształć generacje na format frontendu
      const generations = model.generations.map((gen, index) => ({
        id: index + 1,
        generation: gen.generation,
        years: gen.years,
        yearRange: {
          min: gen.years[0],
          max: gen.years[gen.years.length - 1]
        }
      }));

      frontendData[brandName][modelName] = {
        generations,
        availableYears: model.available_years,
        yearRange: model.year_range
      };
    }
  }

  return frontendData;
}

async function createFrontendDataFile(): Promise<void> {
  console.log('🚀 Tworzę plik danych dla frontendu...\n');

  try {
    // Wczytaj raport
    const reportPath = path.join(process.cwd(), 'output', 'model-years-report.json');
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Plik raportu nie istnieje: ${reportPath}`);
    }

    const report: YearGenerationReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    console.log(`📊 Wczytano raport z ${report.totalModels} modelami\n`);

    // Utwórz dane dla frontendu
    const frontendData = createFrontendData(report);

    // Zapisz do katalogu src/data
    const srcDataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(srcDataDir)) {
      fs.mkdirSync(srcDataDir, { recursive: true });
    }

    const frontendDataPath = path.join(srcDataDir, 'car-model-years.json');
    fs.writeFileSync(frontendDataPath, JSON.stringify(frontendData, null, 2));

    // Utwórz również plik TypeScript z typami
    const typesPath = path.join(srcDataDir, 'car-model-years.types.ts');
    const typesContent = `// Auto-generated types for car model years data
export interface CarModelGeneration {
  id: number;
  generation: string;
  years: number[];
  yearRange: {
    min: number;
    max: number;
  };
}

export interface CarModelData {
  generations: CarModelGeneration[];
  availableYears: number[];
  yearRange: {
    min: number;
    max: number;
  };
}

export interface CarModelYearsData {
  [brandName: string]: {
    [modelName: string]: CarModelData;
  };
}

// Import the actual data
import carModelYearsData from './car-model-years.json';
export default carModelYearsData as CarModelYearsData;
`;

    fs.writeFileSync(typesPath, typesContent);

    // Utwórz funkcje pomocnicze
    const utilsPath = path.join(srcDataDir, 'car-model-years.utils.ts');
    const utilsContent = `import carModelYearsData, { CarModelYearsData, CarModelData } from './car-model-years.types';

/**
 * Pobiera dostępne lata dla danej marki i modelu
 */
export function getYearsForModel(brandName: string, modelName: string): number[] {
  const brand = carModelYearsData[brandName];
  if (!brand) return [];
  
  const model = brand[modelName];
  if (!model) return [];
  
  return model.availableYears;
}

/**
 * Pobiera dane modelu dla danej marki i modelu
 */
export function getModelData(brandName: string, modelName: string): CarModelData | null {
  const brand = carModelYearsData[brandName];
  if (!brand) return null;
  
  const model = brand[modelName];
  if (!model) return null;
  
  return model;
}

/**
 * Znajduje generację dla danego roku
 */
export function findGenerationByYear(brandName: string, modelName: string, year: number): string | null {
  const modelData = getModelData(brandName, modelName);
  if (!modelData) return null;
  
  for (const generation of modelData.generations) {
    if (generation.years.includes(year)) {
      return generation.generation;
    }
  }
  
  return null;
}

/**
 * Pobiera wszystkie dostępne marki
 */
export function getAvailableBrands(): string[] {
  return Object.keys(carModelYearsData);
}

/**
 * Pobiera wszystkie dostępne modele dla danej marki
 */
export function getAvailableModels(brandName: string): string[] {
  const brand = carModelYearsData[brandName];
  if (!brand) return [];
  
  return Object.keys(brand);
}

/**
 * Sprawdza czy dany rok jest dostępny dla modelu
 */
export function isYearAvailable(brandName: string, modelName: string, year: number): boolean {
  const years = getYearsForModel(brandName, modelName);
  return years.includes(year);
}
`;

    fs.writeFileSync(utilsPath, utilsContent);

    // Wyświetl podsumowanie
    console.log('📊 PODSUMOWANIE TWORZENIA DANYCH FRONTENDU:');
    console.log(`📈 Łączna liczba marek: ${Object.keys(frontendData).length}`);
    
    let totalModels = 0;
    for (const brandName in frontendData) {
      totalModels += Object.keys(frontendData[brandName]).length;
    }
    console.log(`📈 Łączna liczba modeli: ${totalModels}`);

    // Pokaż przykłady
    console.log('\n📝 PRZYKŁADY DANYCH:');
    const exampleBrands = Object.keys(frontendData).slice(0, 3);
    for (const brandName of exampleBrands) {
      const models = Object.keys(frontendData[brandName]);
      console.log(`   • ${brandName}: ${models.length} modeli`);
      
      if (models.length > 0) {
        const firstModel = models[0];
        const modelData = frontendData[brandName][firstModel];
        console.log(`     - ${firstModel}: ${modelData.availableYears.length} lat (${modelData.yearRange.min}-${modelData.yearRange.max})`);
      }
    }

    console.log(`\n💾 Zapisano pliki:`);
    console.log(`   • ${frontendDataPath}`);
    console.log(`   • ${typesPath}`);
    console.log(`   • ${utilsPath}`);
    console.log('\n✅ Tworzenie danych frontendu zakończone pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas tworzenia danych frontendu:', error);
    throw error;
  }
}

// Uruchom tworzenie danych
if (require.main === module) {
  createFrontendDataFile()
    .then(() => {
      console.log('\n✅ Skrypt zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { createFrontendDataFile, type FrontendCarModelData };
