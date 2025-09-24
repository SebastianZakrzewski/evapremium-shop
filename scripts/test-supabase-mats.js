const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testowanie SupabaseMatsService...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMatsService() {
  try {
    console.log('\n📋 Test 1: Pobieranie wszystkich mat...');
    const { data: allMats, error: allError } = await supabase
      .from('CarMat')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.log('❌ Błąd:', allError.message);
    } else {
      console.log(`✅ Znaleziono ${allMats.length} mat (pierwsze 5):`);
      allMats.forEach((mat, index) => {
        console.log(`  ${index + 1}. ${mat.matType} - ${mat.materialColor} (${mat.cellStructure})`);
      });
    }

    console.log('\n📋 Test 2: Filtrowanie po kolorze...');
    const { data: blackMats, error: blackError } = await supabase
      .from('CarMat')
      .select('*')
      .eq('materialColor', 'czarny')
      .limit(3);
    
    if (blackError) {
      console.log('❌ Błąd:', blackError.message);
    } else {
      console.log(`✅ Znaleziono ${blackMats.length} czarnych mat:`);
      blackMats.forEach((mat, index) => {
        console.log(`  ${index + 1}. ${mat.matType} - ${mat.materialColor} (${mat.cellStructure})`);
      });
    }

    console.log('\n📋 Test 3: Unikalne kolory...');
    const { data: colors, error: colorsError } = await supabase
      .from('CarMat')
      .select('materialColor')
      .order('materialColor', { ascending: true });
    
    if (colorsError) {
      console.log('❌ Błąd:', colorsError.message);
    } else {
      const uniqueColors = [...new Set(colors.map(item => item.materialColor))];
      console.log(`✅ Unikalne kolory (${uniqueColors.length}):`, uniqueColors.slice(0, 10).join(', '));
    }

    console.log('\n📋 Test 4: Unikalne typy...');
    const { data: types, error: typesError } = await supabase
      .from('CarMat')
      .select('matType')
      .order('matType', { ascending: true });
    
    if (typesError) {
      console.log('❌ Błąd:', typesError.message);
    } else {
      const uniqueTypes = [...new Set(types.map(item => item.matType))];
      console.log(`✅ Unikalne typy (${uniqueTypes.length}):`, uniqueTypes.join(', '));
    }

  } catch (err) {
    console.log('💥 Exception:', err.message);
  }
}

testMatsService();
