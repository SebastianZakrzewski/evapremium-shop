const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Sprawdzam rzeczywiste tabele w Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  // Sprawdź różne możliwe nazwy tabel
  const possibleTables = [
    'mats', 'Mats', 'MATS',
    'car_brands', 'CarBrands', 'CAR_BRANDS',
    'car_models', 'CarModels', 'CAR_MODELS',
    'CarMat', 'carMat', 'CARMAT',
    'CarBrand', 'carBrand', 'CARBRAND',
    'CarModel', 'carModel', 'CARMODEL'
  ];
  
  for (const table of possibleTables) {
    try {
      console.log(`\n📋 Sprawdzam tabelę: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST205') {
          console.log(`❌ Tabela '${table}' nie istnieje`);
        } else {
          console.log(`❌ Błąd: ${error.message}`);
        }
      } else {
        console.log(`✅ Tabela '${table}' istnieje! Liczba rekordów: ${count || 0}`);
        if (data && data.length > 0) {
          console.log(`   Przykładowy rekord:`, JSON.stringify(data[0], null, 2));
        }
      }
    } catch (err) {
      console.log(`💥 Exception: ${err.message}`);
    }
  }
}

checkTables().catch(console.error);
