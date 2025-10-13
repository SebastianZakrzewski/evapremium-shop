import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

// Import funkcji pomocniczych
import { getYearsForModel, getModelData, findGenerationByYear, getAvailableBrands, getAvailableModels } from '../src/data/car-model-years.utils';

async function testYearGeneration(): Promise<void> {
  console.log('🧪 Testowanie generowania roczników...\n');

  try {
    // Test 1: Pobierz dostępne marki
    console.log('📋 TEST 1: Dostępne marki');
    const brands = getAvailableBrands();
    console.log(`   Liczba marek: ${brands.length}`);
    console.log(`   Przykłady: ${brands.slice(0, 5).join(', ')}...\n`);

    // Test 2: Pobierz modele dla BMW
    console.log('🚗 TEST 2: Modele BMW');
    const bmwModels = getAvailableModels('BMW');
    console.log(`   Liczba modeli BMW: ${bmwModels.length}`);
    console.log(`   Przykłady: ${bmwModels.slice(0, 5).join(', ')}...\n`);

    // Test 3: Sprawdź roczniki dla BMW 3
    console.log('📅 TEST 3: Roczniki BMW 3');
    const bmw3Years = getYearsForModel('BMW', '3');
    console.log(`   Dostępne roczniki: ${bmw3Years.length}`);
    console.log(`   Zakres: ${bmw3Years[0]} - ${bmw3Years[bmw3Years.length - 1]}`);
    console.log(`   Przykłady: ${bmw3Years.slice(0, 10).join(', ')}...\n`);

    // Test 4: Sprawdź dane modelu BMW 3
    console.log('🔍 TEST 4: Dane modelu BMW 3');
    const bmw3Data = getModelData('BMW', '3');
    if (bmw3Data) {
      console.log(`   Liczba generacji: ${bmw3Data.generations.length}`);
      bmw3Data.generations.forEach((gen, index) => {
        console.log(`   Generacja ${index + 1}: ${gen.generation} (${gen.yearRange.min}-${gen.yearRange.max})`);
      });
    } else {
      console.log('   ❌ Brak danych dla BMW 3');
    }
    console.log('');

    // Test 5: Sprawdź generację dla konkretnego roku
    console.log('🎯 TEST 5: Generacja dla konkretnego roku');
    const testYears = [2015, 2018, 2020, 2023];
    for (const year of testYears) {
      const generation = findGenerationByYear('BMW', '3', year);
      console.log(`   Rok ${year}: ${generation || 'Brak generacji'}`);
    }
    console.log('');

    // Test 6: Sprawdź modele z wieloma generacjami
    console.log('🔄 TEST 6: Modele z wieloma generacjami');
    const multiGenBrands = ['Audi', 'Mercedes-Benz', 'Volkswagen'];
    for (const brand of multiGenBrands) {
      const models = getAvailableModels(brand);
      if (models.length > 0) {
        const firstModel = models[0];
        const modelData = getModelData(brand, firstModel);
        if (modelData && modelData.generations.length > 1) {
          console.log(`   ${brand} ${firstModel}: ${modelData.generations.length} generacji`);
          console.log(`     Zakres lat: ${modelData.yearRange.min}-${modelData.yearRange.max}`);
        }
      }
    }
    console.log('');

    // Test 7: Sprawdź modele z "+" w generacji
    console.log('➕ TEST 7: Modele z generacją "+"');
    const currentYear = new Date().getFullYear();
    const testBrands = ['Tesla', 'Aixam'];
    for (const brand of testBrands) {
      const models = getAvailableModels(brand);
      if (models.length > 0) {
        const firstModel = models[0];
        const modelData = getModelData(brand, firstModel);
        if (modelData) {
          const plusGen = modelData.generations.find(gen => gen.generation.includes('+'));
          if (plusGen) {
            console.log(`   ${brand} ${firstModel}: ${plusGen.generation}`);
            console.log(`     Lata: ${plusGen.yearRange.min}-${plusGen.yearRange.max} (aktualny: ${currentYear})`);
          }
        }
      }
    }

    console.log('\n✅ Wszystkie testy zakończone pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error);
    throw error;
  }
}

// Uruchom testy
if (require.main === module) {
  testYearGeneration()
    .then(() => {
      console.log('\n✅ Skrypt testowy zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt testowy zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { testYearGeneration };
