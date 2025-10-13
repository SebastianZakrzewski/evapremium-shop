import * as fs from 'fs';
import * as path from 'path';

interface CarModelData {
  generations: CarModelGeneration[];
  availableYears: number[];
  yearRange: { min: number; max: number };
  bodyTypes?: { [year: string]: string[] };
  allBodyTypes?: string[];
}

interface CarModelGeneration {
  id: number;
  generation: string;
  years: number[];
  yearRange: { min: number; max: number };
}

interface CarModelYearsData {
  [brand: string]: {
    [model: string]: CarModelData;
  };
}

function updateCarModelYearsWithBodyTypes() {
  console.log('🔄 Aktualizacja car-model-years.json z typami nadwozia...\n');

  try {
    // Wczytaj istniejące dane z rocznikami
    const carModelYearsPath = path.join(process.cwd(), 'src', 'data', 'car-model-years.json');
    const carModelYearsData: CarModelYearsData = JSON.parse(fs.readFileSync(carModelYearsPath, 'utf8'));

    // Wczytaj przetworzone dane z typami nadwozia
    const processedBodyTypesPath = path.join(process.cwd(), 'output', 'processed-body-types.json');
    const processedBodyTypes = JSON.parse(fs.readFileSync(processedBodyTypesPath, 'utf8'));

    console.log(`📊 Łączenie danych:`);
    console.log(`   Marki w rocznikach: ${Object.keys(carModelYearsData).length}`);
    console.log(`   Marki w typach nadwozia: ${Object.keys(processedBodyTypes).length}`);

    let updatedModels = 0;
    let addedBodyTypes = 0;

    // Dla każdej marki w danych roczników
    Object.entries(carModelYearsData).forEach(([brand, models]) => {
      if (processedBodyTypes[brand]) {
        Object.entries(models).forEach(([model, modelData]) => {
          if (processedBodyTypes[brand][model]) {
            const bodyTypeData = processedBodyTypes[brand][model];
            
            // Dodaj typy nadwozia do danych modelu
            modelData.bodyTypes = bodyTypeData.bodyTypes;
            modelData.allBodyTypes = bodyTypeData.allBodyTypes;
            
            updatedModels++;
            addedBodyTypes += bodyTypeData.allBodyTypes.length;
          }
        });
      }
    });

    // Zapisz zaktualizowane dane
    const updatedDataPath = path.join(process.cwd(), 'src', 'data', 'car-model-years.json');
    fs.writeFileSync(updatedDataPath, JSON.stringify(carModelYearsData, null, 2));

    console.log(`\n✅ Aktualizacja zakończona:`);
    console.log(`   Zaktualizowane modele: ${updatedModels}`);
    console.log(`   Dodane typy nadwozia: ${addedBodyTypes}`);
    console.log(`   Zapisano do: ${updatedDataPath}`);

    // Przykłady zaktualizowanych danych
    console.log('\n📋 Przykłady zaktualizowanych modeli:');
    
    const exampleBrands = Object.keys(carModelYearsData).slice(0, 3);
    exampleBrands.forEach(brand => {
      console.log(`\n🏷️ ${brand}:`);
      const models = Object.keys(carModelYearsData[brand]).slice(0, 2);
      models.forEach(model => {
        const modelData = carModelYearsData[brand][model];
        console.log(`   ${model}:`);
        console.log(`     Lata: ${modelData.availableYears.length} (${modelData.yearRange.min}-${modelData.yearRange.max})`);
        console.log(`     Typy nadwozia: ${modelData.allBodyTypes?.length || 0} typów`);
        if (modelData.allBodyTypes && modelData.allBodyTypes.length > 0) {
          console.log(`     Dostępne: ${modelData.allBodyTypes.join(', ')}`);
        }
        
        // Pokaż przykłady dla konkretnych lat
        if (modelData.bodyTypes) {
          const years = Object.keys(modelData.bodyTypes).slice(0, 2);
          years.forEach(year => {
            const types = modelData.bodyTypes![year];
            console.log(`     ${year}: ${types.join(', ')}`);
          });
        }
      });
    });

    // Statystyki końcowe
    console.log('\n📊 Statystyki końcowe:');
    
    let totalModelsWithBodyTypes = 0;
    let totalBodyTypes = 0;
    let modelsWithMultipleTypes = 0;

    Object.values(carModelYearsData).forEach(brandData => {
      Object.values(brandData).forEach(modelData => {
        if (modelData.allBodyTypes && modelData.allBodyTypes.length > 0) {
          totalModelsWithBodyTypes++;
          totalBodyTypes += modelData.allBodyTypes.length;
          
          if (modelData.allBodyTypes.length > 1) {
            modelsWithMultipleTypes++;
          }
        }
      });
    });

    console.log(`   Modele z typami nadwozia: ${totalModelsWithBodyTypes}`);
    console.log(`   Modele z wieloma typami: ${modelsWithMultipleTypes}`);
    console.log(`   Łączna liczba typów nadwozia: ${totalBodyTypes}`);

    // Sprawdź czy wszystkie modele mają typy nadwozia
    const totalModels = Object.values(carModelYearsData).reduce((sum, brand) => 
      sum + Object.keys(brand).length, 0
    );
    const coveragePercentage = Math.round((totalModelsWithBodyTypes / totalModels) * 100);
    
    console.log(`   Pokrycie typami nadwozia: ${coveragePercentage}% (${totalModelsWithBodyTypes}/${totalModels})`);

  } catch (error) {
    console.error('❌ Błąd podczas aktualizacji:', error);
  }
}

updateCarModelYearsWithBodyTypes();
