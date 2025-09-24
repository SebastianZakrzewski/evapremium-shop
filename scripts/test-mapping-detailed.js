const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import funkcji mapowania (symulacja)
function mapCarMatToMats(carMat) {
  return {
    id: parseInt(carMat.id.split('-')[0], 16) || 0,
    type: carMat.matType,
    color: carMat.materialColor,
    cellType: carMat.cellStructure,
    edgeColor: carMat.borderColor,
    image: carMat.imagePath
  };
}

function mapMatsToCarMat(mats) {
  return {
    matType: mats.type,
    materialColor: mats.color,
    cellStructure: mats.cellType,
    borderColor: mats.edgeColor,
    imagePath: mats.image
  };
}

function validateMatsModel(model) {
  return !!(
    model.id !== undefined &&
    model.type &&
    model.color &&
    model.cellType &&
    model.edgeColor &&
    model.image
  );
}

function validateCarMatRecord(record) {
  return !!(
    record.matType &&
    record.materialColor &&
    record.cellStructure &&
    record.borderColor &&
    record.imagePath
  );
}

function convertIdToNumber(uuid) {
  return parseInt(uuid.split('-')[0], 16) || 0;
}

function convertNumberToUuid(id) {
  return `${id.toString(16).padStart(8, '0')}-0000-0000-0000-000000000000`;
}

async function runDetailedTests() {
  console.log('🧪 Szczegółowe testy mapowania CarMat <-> Mats...\n');

  let allTestsPassed = true;
  let testCount = 0;
  let passedTests = 0;

  // Test 1: Pobierz dane z Supabase
  console.log('📋 Test 1: Pobieranie danych z Supabase...');
  testCount++;
  try {
    const { data: carMatData, error } = await supabase
      .from('CarMat')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Błąd pobierania danych:', error.message);
      allTestsPassed = false;
    } else {
      console.log(`✅ Pobrano ${carMatData.length} rekordów z Supabase`);
      passedTests++;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 2: Mapowanie CarMat -> Mats
  console.log('\n📋 Test 2: Mapowanie CarMat -> Mats...');
  testCount++;
  try {
    const { data: carMatData } = await supabase
      .from('CarMat')
      .select('*')
      .limit(3);

    const matsData = carMatData.map(mapCarMatToMats);
    
    // Sprawdź czy wszystkie pola zostały poprawnie zmapowane
    const isValid = matsData.every(mat => 
      typeof mat.id === 'number' &&
      typeof mat.type === 'string' &&
      typeof mat.color === 'string' &&
      typeof mat.cellType === 'string' &&
      typeof mat.edgeColor === 'string' &&
      typeof mat.image === 'string'
    );

    if (isValid) {
      console.log('✅ Mapowanie CarMat -> Mats działa poprawnie');
      console.log(`   Przykład: ${matsData[0].type} - ${matsData[0].color} (${matsData[0].cellType})`);
      passedTests++;
    } else {
      console.log('❌ Mapowanie CarMat -> Mats zawiera błędy');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 3: Mapowanie Mats -> CarMat
  console.log('\n📋 Test 3: Mapowanie Mats -> CarMat...');
  testCount++;
  try {
    const sampleMats = {
      id: 1234567890,
      type: '3d-with-rims',
      color: 'czarny',
      cellType: 'rhombus',
      edgeColor: 'czarny',
      image: '/test/image.jpg'
    };

    const carMatData = mapMatsToCarMat(sampleMats);
    
    const isValid = !!(
      carMatData.matType === '3d-with-rims' &&
      carMatData.materialColor === 'czarny' &&
      carMatData.cellStructure === 'rhombus' &&
      carMatData.borderColor === 'czarny' &&
      carMatData.imagePath === '/test/image.jpg'
    );

    if (isValid) {
      console.log('✅ Mapowanie Mats -> CarMat działa poprawnie');
      console.log(`   Przykład: ${carMatData.matType} - ${carMatData.materialColor}`);
      passedTests++;
    } else {
      console.log('❌ Mapowanie Mats -> CarMat zawiera błędy');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 4: Walidacja modelu Mats
  console.log('\n📋 Test 4: Walidacja modelu Mats...');
  testCount++;
  try {
    const validMats = {
      id: 1,
      type: '3d',
      color: 'czarny',
      cellType: 'rhombus',
      edgeColor: 'czarny',
      image: '/test.jpg'
    };

    const invalidMats = {
      id: 1,
      type: '3d',
      // brakuje color
      cellType: 'rhombus',
      edgeColor: 'czarny',
      image: '/test.jpg'
    };

    const validResult = validateMatsModel(validMats);
    const invalidResult = validateMatsModel(invalidMats);

    if (validResult && !invalidResult) {
      console.log('✅ Walidacja modelu Mats działa poprawnie');
      passedTests++;
    } else {
      console.log('❌ Walidacja modelu Mats zawiera błędy');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 5: Walidacja rekordu CarMat
  console.log('\n📋 Test 5: Walidacja rekordu CarMat...');
  testCount++;
  try {
    const validCarMat = {
      matType: '3d',
      materialColor: 'czarny',
      cellStructure: 'rhombus',
      borderColor: 'czarny',
      imagePath: '/test.jpg'
    };

    const invalidCarMat = {
      matType: '3d',
      // brakuje materialColor
      cellStructure: 'rhombus',
      borderColor: 'czarny',
      imagePath: '/test.jpg'
    };

    const validResult = validateCarMatRecord(validCarMat);
    const invalidResult = validateCarMatRecord(invalidCarMat);

    if (validResult && !invalidResult) {
      console.log('✅ Walidacja rekordu CarMat działa poprawnie');
      passedTests++;
    } else {
      console.log('❌ Walidacja rekordu CarMat zawiera błędy');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 6: Konwersja ID
  console.log('\n📋 Test 6: Konwersja ID...');
  testCount++;
  try {
    const testUuid = 'a1b2c3d4-0000-0000-0000-000000000000';
    const expectedNumber = 2712847316;
    
    const convertedNumber = convertIdToNumber(testUuid);
    const backToUuid = convertNumberToUuid(convertedNumber);
    
    if (convertedNumber === expectedNumber) {
      console.log('✅ Konwersja UUID -> Number działa poprawnie');
      console.log(`   ${testUuid} -> ${convertedNumber}`);
      passedTests++;
    } else {
      console.log('❌ Konwersja UUID -> Number zawiera błędy');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 7: Round-trip mapping
  console.log('\n📋 Test 7: Round-trip mapping...');
  testCount++;
  try {
    const { data: carMatData } = await supabase
      .from('CarMat')
      .select('*')
      .limit(1);

    if (carMatData && carMatData.length > 0) {
      const originalCarMat = carMatData[0];
      const matsModel = mapCarMatToMats(originalCarMat);
      const backToCarMat = mapMatsToCarMat(matsModel);
      
      // Sprawdź czy dane są identyczne (pomijając id i timestampy)
      const isRoundTripValid = 
        backToCarMat.matType === originalCarMat.matType &&
        backToCarMat.materialColor === originalCarMat.materialColor &&
        backToCarMat.cellStructure === originalCarMat.cellStructure &&
        backToCarMat.borderColor === originalCarMat.borderColor &&
        backToCarMat.imagePath === originalCarMat.imagePath;

      if (isRoundTripValid) {
        console.log('✅ Round-trip mapping działa poprawnie');
        passedTests++;
      } else {
        console.log('❌ Round-trip mapping zawiera błędy');
        allTestsPassed = false;
      }
    } else {
      console.log('⚠️ Brak danych do testowania round-trip mapping');
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 8: Test z różnymi typami danych
  console.log('\n📋 Test 8: Test z różnymi typami danych...');
  testCount++;
  try {
    const testCases = [
      { type: '3d-with-rims', color: 'czarny', cellType: 'rhombus', edgeColor: 'czarny' },
      { type: '3d-without-rims', color: 'biały', cellType: 'honeycomb', edgeColor: 'czarny' },
      { type: 'classic', color: 'czerwony', cellType: 'rhombus', edgeColor: 'czerwony' }
    ];

    let allCasesValid = true;
    testCases.forEach((testCase, index) => {
      const matsModel = {
        id: 1000000 + index,
        ...testCase,
        image: `/test/${testCase.type}-${testCase.color}.jpg`
      };

      const carMatData = mapMatsToCarMat(matsModel);
      const backToMats = mapCarMatToMats({
        ...carMatData,
        id: `test${index}-0000-0000-0000-000000000000`,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      });

      const isValid = 
        backToMats.type === testCase.type &&
        backToMats.color === testCase.color &&
        backToMats.cellType === testCase.cellType &&
        backToMats.edgeColor === testCase.edgeColor;

      if (!isValid) {
        allCasesValid = false;
      }
    });

    if (allCasesValid) {
      console.log('✅ Test z różnymi typami danych przeszedł pomyślnie');
      passedTests++;
    } else {
      console.log('❌ Test z różnymi typami danych zawiera błędy');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Podsumowanie testów
  console.log('\n' + '='.repeat(50));
  console.log('📊 PODSUMOWANIE TESTÓW');
  console.log('='.repeat(50));
  console.log(`✅ Przeszło: ${passedTests}/${testCount} testów`);
  console.log(`❌ Nie przeszło: ${testCount - passedTests}/${testCount} testów`);
  console.log(`📈 Sukces: ${Math.round((passedTests / testCount) * 100)}%`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Wszystkie testy mapowania przeszły pomyślnie!');
    console.log('✅ Mapowanie CarMat <-> Mats działa poprawnie');
  } else {
    console.log('\n⚠️ Niektóre testy nie przeszły - sprawdź logi powyżej');
  }

  return allTestsPassed;
}

runDetailedTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('💥 Błąd podczas wykonywania testów:', err);
  process.exit(1);
});
