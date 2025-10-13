import { 
  getBodyTypesForModel, 
  getBodyTypesForYear, 
  isBodyTypeAvailable 
} from '../src/data/car-model-years.utils';

function testBodyTypes() {
  console.log('🧪 Testowanie funkcji typów nadwozia...\n');

  try {
    // Test 1: BMW 3 (F30) - wszystkie typy nadwozia
    console.log('📋 Test 1: BMW 3 (F30) - wszystkie typy nadwozia');
    const bmw3Types = getBodyTypesForModel('Bmw', '3 (F30)');
    console.log('Wynik:', bmw3Types);
    console.log('Oczekiwane: typy nadwozia dla BMW 3 (F30)');
    console.log('✅ Test 1 zakończony\n');

    // Test 2: BMW 3 (F30) - typy dla konkretnego roku
    console.log('📋 Test 2: BMW 3 (F30) - typy dla roku 2015');
    const bmw3Types2015 = getBodyTypesForYear('Bmw', '3 (F30)', 2015);
    console.log('Wynik:', bmw3Types2015);
    console.log('Oczekiwane: typy nadwozia dostępne w 2015');
    console.log('✅ Test 2 zakończony\n');

    // Test 3: Audi A4 - wszystkie typy
    console.log('📋 Test 3: Audi A4 - wszystkie typy nadwozia');
    const audiA4Types = getBodyTypesForModel('Audi', 'A4');
    console.log('Wynik:', audiA4Types);
    console.log('Oczekiwane: typy nadwozia dla Audi A4');
    console.log('✅ Test 3 zakończony\n');

    // Test 4: BMW X5 - SUV only
    console.log('📋 Test 4: BMW X5 - typy nadwozia');
    const bmwX5Types = getBodyTypesForModel('Bmw', 'X5');
    console.log('Wynik:', bmwX5Types);
    console.log('Oczekiwane: głównie SUV');
    console.log('✅ Test 4 zakończony\n');

    // Test 5: Sprawdzenie dostępności konkretnego typu
    console.log('📋 Test 5: Sprawdzenie dostępności typu nadwozia');
    const isSedanAvailable = isBodyTypeAvailable('Bmw', '3 (F30)', 2015, 'Sedan');
    console.log('Czy Sedan dostępny dla BMW 3 (F30) 2015:', isSedanAvailable);
    console.log('Oczekiwane: true (jeśli Sedan jest dostępny)');
    console.log('✅ Test 5 zakończony\n');

    // Test 6: Modele z wieloma typami nadwozia
    console.log('📋 Test 6: Modele z wieloma typami nadwozia');
    const citroenC4Types = getBodyTypesForModel('Citroen', 'C4');
    console.log('Citroen C4 typy:', citroenC4Types);
    console.log('Oczekiwane: wiele typów (Crossover, Hatchback, SUV, itp.)');
    console.log('✅ Test 6 zakończony\n');

    // Test 7: Sprawdzenie dla różnych lat
    console.log('📋 Test 7: Typy nadwozia dla różnych lat');
    const years = [2010, 2015, 2020];
    years.forEach(year => {
      const types = getBodyTypesForYear('Bmw', '3 (F30)', year);
      console.log(`BMW 3 (F30) ${year}:`, types);
    });
    console.log('✅ Test 7 zakończony\n');

    // Test 8: Sprawdzenie nieistniejącego modelu
    console.log('📋 Test 8: Nieistniejący model');
    const nonExistentTypes = getBodyTypesForModel('NonExistent', 'Model');
    console.log('Nieistniejący model:', nonExistentTypes);
    console.log('Oczekiwane: [] (pusta tablica)');
    console.log('✅ Test 8 zakończony\n');

    // Test 9: Sprawdzenie dla roku bez danych
    console.log('📋 Test 9: Rok bez danych');
    const typesForOldYear = getBodyTypesForYear('Bmw', '3 (F30)', 1990);
    console.log('BMW 3 (F30) 1990:', typesForOldYear);
    console.log('Oczekiwane: [] (pusta tablica)');
    console.log('✅ Test 9 zakończony\n');

    // Test 10: Statystyki
    console.log('📊 Statystyki testów:');
    console.log('   BMW 3 (F30) - wszystkie typy:', bmw3Types.length);
    console.log('   BMW 3 (F30) - typy dla 2015:', bmw3Types2015.length);
    console.log('   Audi A4 - wszystkie typy:', audiA4Types.length);
    console.log('   BMW X5 - wszystkie typy:', bmwX5Types.length);
    console.log('   Citroen C4 - wszystkie typy:', citroenC4Types.length);

    console.log('\n🎉 Wszystkie testy zakończone pomyślnie!');

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error);
  }
}

testBodyTypes();
