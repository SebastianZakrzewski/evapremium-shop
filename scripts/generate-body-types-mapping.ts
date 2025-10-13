import * as fs from 'fs';
import * as path from 'path';

interface CarModelRecord {
  id: number;
  brand_name: string;
  model_name: string;
  generation: string | null;
  body_type: string | null;
}

interface BodyTypesMapping {
  [brand: string]: {
    [model: string]: {
      [year: string]: string[];
    };
  };
}

interface ProcessedBodyTypes {
  [brand: string]: {
    [model: string]: {
      bodyTypes: { [year: string]: string[] };
      allBodyTypes: string[];
      yearRange: { min: number; max: number };
    };
  };
}

function parseGenerationToYears(generation: string | null): number[] {
  if (!generation) return [];
  
  // Obsługa formatu YYYY-YYYY
  if (generation.includes('-')) {
    const [startYear, endYear] = generation.split('-').map(y => parseInt(y.trim()));
    if (!isNaN(startYear) && !isNaN(endYear)) {
      const years: number[] = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }
      return years;
    }
  }
  
  // Obsługa formatu YYYY+
  if (generation.endsWith('+')) {
    const startYear = parseInt(generation.slice(0, -1));
    if (!isNaN(startYear)) {
      const currentYear = new Date().getFullYear();
      const years: number[] = [];
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    }
  }
  
  // Obsługa pojedynczego roku
  const singleYear = parseInt(generation);
  if (!isNaN(singleYear)) {
    return [singleYear];
  }
  
  return [];
}

function normalizeBodyType(bodyType: string | null): string[] {
  if (!bodyType) return [];
  
  // Podziel na typy jeśli są oddzielone przecinkami
  const types = bodyType.split(',').map(t => t.trim()).filter(Boolean);
  
  // Normalizuj każdy typ
  return types.map(type => {
    // Usuń dodatkowe spacje i znormalizuj
    return type
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^[a-z]/, c => c.toUpperCase()); // Pierwsza litera wielka
  });
}

function generateBodyTypesMapping() {
  console.log('🔧 Generowanie mapowania typów nadwozia...\n');

  try {
    // Wczytaj dane
    const dataPath = path.join(process.cwd(), 'output', 'car-models-with-body-types.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const records: CarModelRecord[] = JSON.parse(rawData);

    console.log(`📊 Przetwarzanie ${records.length} rekordów...`);

    const mapping: BodyTypesMapping = {};
    const processedData: ProcessedBodyTypes = {};

    records.forEach(record => {
      const { brand_name, model_name, generation, body_type } = record;
      
      if (!brand_name || !model_name || !body_type) return;

      // Inicjalizuj strukturę
      if (!mapping[brand_name]) {
        mapping[brand_name] = {};
      }
      if (!mapping[brand_name][model_name]) {
        mapping[brand_name][model_name] = {};
      }

      if (!processedData[brand_name]) {
        processedData[brand_name] = {};
      }
      if (!processedData[brand_name][model_name]) {
        processedData[brand_name][model_name] = {
          bodyTypes: {},
          allBodyTypes: [],
          yearRange: { min: Infinity, max: -Infinity }
        };
      }

      // Parsuj generację na lata
      const years = parseGenerationToYears(generation);
      
      // Normalizuj typy nadwozia
      const bodyTypes = normalizeBodyType(body_type);

      // Dla każdego roku przypisz typy nadwozia
      years.forEach(year => {
        const yearStr = year.toString();
        
        if (!mapping[brand_name][model_name][yearStr]) {
          mapping[brand_name][model_name][yearStr] = [];
        }
        
        // Dodaj typy nadwozia (bez duplikatów)
        bodyTypes.forEach(type => {
          if (!mapping[brand_name][model_name][yearStr].includes(type)) {
            mapping[brand_name][model_name][yearStr].push(type);
          }
        });

        // Aktualizuj processedData
        if (!processedData[brand_name][model_name].bodyTypes[yearStr]) {
          processedData[brand_name][model_name].bodyTypes[yearStr] = [];
        }
        
        bodyTypes.forEach(type => {
          if (!processedData[brand_name][model_name].bodyTypes[yearStr].includes(type)) {
            processedData[brand_name][model_name].bodyTypes[yearStr].push(type);
          }
        });

        // Aktualizuj zakres lat
        processedData[brand_name][model_name].yearRange.min = Math.min(
          processedData[brand_name][model_name].yearRange.min, 
          year
        );
        processedData[brand_name][model_name].yearRange.max = Math.max(
          processedData[brand_name][model_name].yearRange.max, 
          year
        );
      });

      // Zbierz wszystkie unikalne typy nadwozia dla modelu
      bodyTypes.forEach(type => {
        if (!processedData[brand_name][model_name].allBodyTypes.includes(type)) {
          processedData[brand_name][model_name].allBodyTypes.push(type);
        }
      });
    });

    // Sortuj allBodyTypes alfabetycznie
    Object.values(processedData).forEach(brandData => {
      Object.values(brandData).forEach(modelData => {
        modelData.allBodyTypes.sort();
      });
    });

    // Zapisz mapowanie
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const mappingPath = path.join(outputDir, 'body-types-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

    const processedPath = path.join(outputDir, 'processed-body-types.json');
    fs.writeFileSync(processedPath, JSON.stringify(processedData, null, 2));

    console.log(`💾 Mapowanie zapisane do: ${mappingPath}`);
    console.log(`💾 Przetworzone dane zapisane do: ${processedPath}`);

    // Statystyki
    const totalBrands = Object.keys(processedData).length;
    const totalModels = Object.values(processedData).reduce((sum, brand) => 
      sum + Object.keys(brand).length, 0
    );

    console.log('\n📊 Statystyki mapowania:');
    console.log(`   Marki: ${totalBrands}`);
    console.log(`   Modele: ${totalModels}`);

    // Przykłady mapowania
    console.log('\n📋 Przykłady mapowania:');
    
    const exampleBrands = Object.keys(processedData).slice(0, 3);
    exampleBrands.forEach(brand => {
      console.log(`\n🏷️ ${brand}:`);
      const models = Object.keys(processedData[brand]).slice(0, 2);
      models.forEach(model => {
        const modelData = processedData[brand][model];
        console.log(`   ${model}:`);
        console.log(`     Wszystkie typy: ${modelData.allBodyTypes.join(', ')}`);
        console.log(`     Zakres lat: ${modelData.yearRange.min}-${modelData.yearRange.max}`);
        
        // Pokaż przykłady dla konkretnych lat
        const years = Object.keys(modelData.bodyTypes).slice(0, 3);
        years.forEach(year => {
          const types = modelData.bodyTypes[year];
          console.log(`     ${year}: ${types.join(', ')}`);
        });
      });
    });

    // Sprawdź modele z wieloma typami nadwozia
    console.log('\n🚗 Modele z wieloma typami nadwozia:');
    let multiTypeCount = 0;
    Object.entries(processedData).forEach(([brand, models]) => {
      Object.entries(models).forEach(([model, data]) => {
        if (data.allBodyTypes.length > 1) {
          multiTypeCount++;
          if (multiTypeCount <= 10) {
            console.log(`   ${brand} ${model}: ${data.allBodyTypes.join(', ')}`);
          }
        }
      });
    });
    console.log(`   Łącznie modeli z wieloma typami: ${multiTypeCount}`);

  } catch (error) {
    console.error('❌ Błąd podczas generowania mapowania:', error);
  }
}

generateBodyTypesMapping();
