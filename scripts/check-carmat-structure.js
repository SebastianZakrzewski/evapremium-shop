const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations

console.log('🔍 Sprawdzam strukturę tabeli CarMat...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCarMatStructure() {
  try {
    console.log('\n📋 Pobieram przykładowe rekordy z tabeli CarMat...');
    
    const { data, error } = await supabase
      .from('CarMat')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ Błąd:', error.message);
      return;
    }
    
    console.log(`✅ Znaleziono ${data.length} przykładowych rekordów:`);
    console.log('\n📊 Struktura tabeli CarMat:');
    
    if (data.length > 0) {
      const firstRecord = data[0];
      console.log('Kolumny:');
      Object.keys(firstRecord).forEach(key => {
        console.log(`  - ${key}: ${typeof firstRecord[key]} (${firstRecord[key]})`);
      });
      
      console.log('\n📝 Przykładowe rekordy:');
      data.forEach((record, index) => {
        console.log(`\nRekord ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      });
    }
    
    // Sprawdź liczbę wszystkich rekordów
    const { count, error: countError } = await supabase
      .from('CarMat')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 Łączna liczba rekordów w CarMat: ${count}`);
    }
    
  } catch (err) {
    console.log('💥 Exception:', err.message);
  }
}

checkCarMatStructure();
