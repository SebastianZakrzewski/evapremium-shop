const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
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

function convertNumberToUuid(id) {
  return `${id.toString(16).padStart(8, '0')}-0000-0000-0000-000000000000`;
}

function convertIdToNumber(uuid) {
  return parseInt(uuid.split('-')[0], 16) || 0;
}

async function testCarMatMapping() {
  try {
    console.log('🧪 Testowanie mapowania CarMat <-> Mats...\n');

    // Test 1: Pobierz przykładowe dane z CarMat
    console.log('📋 Test 1: Pobieranie danych z CarMat...');
    const { data: carMatData, error: fetchError } = await supabase
      .from('CarMat')
      .select('*')
      .limit(3);

    if (fetchError) {
      console.error('❌ Błąd pobierania danych:', fetchError);
      return;
    }

    if (!carMatData || carMatData.length === 0) {
      console.log('⚠️ Brak danych w tabeli CarMat');
      return;
    }

    console.log(`✅ Pobrano ${carMatData.length} rekordów z CarMat\n`);

    // Test 2: Mapowanie CarMat -> Mats
    console.log('📋 Test 2: Mapowanie CarMat -> Mats...');
    const matsData = carMatData.map(mapCarMatToMats);
    
    console.log('Przykładowe mapowanie:');
    console.log('CarMat:', JSON.stringify(carMatData[0], null, 2));
    console.log('Mats:', JSON.stringify(matsData[0], null, 2));
    console.log('');

    // Test 3: Mapowanie Mats -> CarMat
    console.log('📋 Test 3: Mapowanie Mats -> CarMat...');
    const backToCarMat = matsData.map(mapMatsToCarMat);
    
    console.log('Mapowanie z powrotem:');
    console.log('Mats:', JSON.stringify(matsData[0], null, 2));
    console.log('CarMat:', JSON.stringify(backToCarMat[0], null, 2));
    console.log('');

    // Test 4: Konwersja ID
    console.log('📋 Test 4: Konwersja ID...');
    const originalId = carMatData[0].id;
    const convertedNumber = convertIdToNumber(originalId);
    const backToUuid = convertNumberToUuid(convertedNumber);
    
    console.log(`UUID -> Number: ${originalId} -> ${convertedNumber}`);
    console.log(`Number -> UUID: ${convertedNumber} -> ${backToUuid}`);
    console.log(`Round-trip: ${originalId === backToUuid ? '✅' : '❌'}`);
    console.log('');

    // Test 5: Sprawdzenie struktury tabeli
    console.log('📋 Test 5: Analiza struktury tabeli CarMat...');
    const firstRecord = carMatData[0];
    console.log('Kolumny w CarMat:');
    Object.keys(firstRecord).forEach(key => {
      console.log(`  - ${key}: ${typeof firstRecord[key]} (${firstRecord[key]})`);
    });
    console.log('');

    // Test 6: Sprawdzenie unikalnych wartości
    console.log('📋 Test 6: Unikalne wartości w CarMat...');
    const uniqueMatTypes = [...new Set(carMatData.map(item => item.matType))];
    const uniqueMaterialColors = [...new Set(carMatData.map(item => item.materialColor))];
    const uniqueCellStructures = [...new Set(carMatData.map(item => item.cellStructure))];
    const uniqueBorderColors = [...new Set(carMatData.map(item => item.borderColor))];

    console.log(`Typy mat: ${uniqueMatTypes.join(', ')}`);
    console.log(`Kolory materiału: ${uniqueMaterialColors.join(', ')}`);
    console.log(`Struktury komórek: ${uniqueCellStructures.join(', ')}`);
    console.log(`Kolory obszycia: ${uniqueBorderColors.join(', ')}`);
    console.log('');

    // Test 7: Test round-trip mapping
    console.log('📋 Test 7: Test round-trip mapping...');
    const originalMats = matsData[0];
    const carMatFromMats = mapMatsToCarMat(originalMats);
    const matsFromCarMat = mapCarMatToMats({
      ...carMatFromMats,
      id: originalId,
      createdAt: carMatData[0].createdAt,
      updatedAt: carMatData[0].updatedAt
    });

    const isRoundTripValid = JSON.stringify(originalMats) === JSON.stringify(matsFromCarMat);
    console.log(`Round-trip mapping: ${isRoundTripValid ? '✅' : '❌'}`);
    
    if (!isRoundTripValid) {
      console.log('Oryginalne Mats:', JSON.stringify(originalMats, null, 2));
      console.log('Po round-trip:', JSON.stringify(matsFromCarMat, null, 2));
    }

    console.log('\n🎉 Testy mapowania zakończone!');

  } catch (error) {
    console.error('💥 Błąd podczas testowania:', error);
  }
}

testCarMatMapping();
