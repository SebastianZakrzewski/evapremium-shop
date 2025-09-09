const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testowanie integracji konfiguratora z Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConfiguratorIntegration() {
  try {
    console.log('\n📋 Test 1: Sprawdzanie dostępnych typów mat...');
    const { data: types, error: typesError } = await supabase
      .from('CarMat')
      .select('matType')
      .order('matType', { ascending: true });
    
    if (typesError) {
      console.log('❌ Błąd:', typesError.message);
    } else {
      const uniqueTypes = [...new Set(types.map(item => item.matType))];
      console.log(`✅ Dostępne typy mat (${uniqueTypes.length}):`, uniqueTypes.join(', '));
    }

    console.log('\n📋 Test 2: Sprawdzanie dostępnych struktur komórek...');
    const { data: cellStructures, error: cellError } = await supabase
      .from('CarMat')
      .select('cellStructure')
      .order('cellStructure', { ascending: true });
    
    if (cellError) {
      console.log('❌ Błąd:', cellError.message);
    } else {
      const uniqueStructures = [...new Set(cellStructures.map(item => item.cellStructure))];
      console.log(`✅ Dostępne struktury komórek (${uniqueStructures.length}):`, uniqueStructures.join(', '));
    }

    console.log('\n📋 Test 3: Test konfiguracji konfiguratora...');
    
    // Symuluj wybory z konfiguratora
    const testConfigurations = [
      {
        name: "3D Z rantami + Romby + Czarny + Beżowy",
        matType: '3d-with-rims',
        cellType: 'rhombus',
        color: 'czarny',
        edgeColor: 'beżowy'
      },
      {
        name: "3D Z rantami + Romby + Niebieski + Czarny",
        matType: '3d-with-rims',
        cellType: 'rhombus',
        color: 'niebieski',
        edgeColor: 'czarny'
      },
      {
        name: "3D bez rantów + Romby + Czerwony + Beżowy",
        matType: '3d-without-rims',
        cellType: 'rhombus',
        color: 'czerwony',
        edgeColor: 'beżowy'
      }
    ];

    for (const config of testConfigurations) {
      console.log(`\n🔍 Testowanie: ${config.name}`);
      
      const { data, error } = await supabase
        .from('CarMat')
        .select('*')
        .eq('matType', config.matType)
        .eq('cellStructure', config.cellType)
        .eq('materialColor', config.color)
        .eq('borderColor', config.edgeColor)
        .limit(1);
      
      if (error) {
        console.log(`❌ Błąd: ${error.message}`);
      } else if (data && data.length > 0) {
        const mat = data[0];
        console.log(`✅ Znaleziono matę:`);
        console.log(`   ID: ${mat.id}`);
        console.log(`   Obraz: ${mat.imagePath}`);
        console.log(`   Typ: ${mat.matType}`);
        console.log(`   Struktura: ${mat.cellStructure}`);
        console.log(`   Kolor: ${mat.materialColor}`);
        console.log(`   Obszycie: ${mat.borderColor}`);
      } else {
        console.log(`❌ Nie znaleziono maty dla konfiguracji: ${config.name}`);
      }
    }

    console.log('\n📋 Test 4: Test API endpoints...');
    
    // Test różnych kombinacji kolorów
    const testColors = ['czarny', 'niebieski', 'czerwony', 'beżowy'];
    const testEdgeColors = ['beżowy', 'czarny', 'brązowy'];
    
    for (const color of testColors) {
      for (const edgeColor of testEdgeColors) {
        const { data, error } = await supabase
          .from('CarMat')
          .select('*')
          .eq('matType', '3d-with-rims')
          .eq('cellStructure', 'rhombus')
          .eq('materialColor', color)
          .eq('borderColor', edgeColor)
          .limit(1);
        
        if (data && data.length > 0) {
          console.log(`✅ ${color} + ${edgeColor}: Znaleziono (${data[0].imagePath})`);
        } else {
          console.log(`❌ ${color} + ${edgeColor}: Brak`);
        }
      }
    }

  } catch (err) {
    console.log('💥 Exception:', err.message);
  }
}

testConfiguratorIntegration();
