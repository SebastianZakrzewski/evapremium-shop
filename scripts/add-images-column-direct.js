/**
 * Skrypt do dodania kolumny images do tabeli accessories
 * Próbuje wykonać SQL bezpośrednio przez Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych SUPABASE_URL lub SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addImagesColumn() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    
    // SQL do dodania kolumny
    const sql = `ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];`;
    
    console.log('\n➕ Próba dodania kolumny images...');
    console.log('   SQL:', sql);
    
    // Spróbuj przez RPC (jeśli funkcja exec_sql istnieje)
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql });
    
    if (!rpcError) {
      console.log('✅ Kolumna images została dodana przez RPC!');
      return;
    }
    
    // Jeśli RPC nie działa, spróbuj przez bezpośrednie zapytanie
    console.log('⚠️  RPC nie działa, próbuję alternatywnej metody...');
    
    // Sprawdź czy kolumna już istnieje przez próbę zapytania
    const { data: testData, error: testError } = await supabase
      .from('accessories')
      .select('images')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Kolumna images już istnieje w tabeli!');
      return;
    }
    
    // Jeśli kolumna nie istnieje, pokaż instrukcje
    if (testError && testError.message.includes('images')) {
      console.log('\n❌ Kolumna images nie istnieje i nie można jej dodać automatycznie.');
      console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
      console.log('─'.repeat(70));
      console.log(sql);
      console.log('─'.repeat(70));
      console.log('\n💡 Instrukcje:');
      console.log('   1. Otwórz Supabase Dashboard');
      console.log('   2. Przejdź do SQL Editor');
      console.log('   3. Skopiuj i wykonaj powyższy SQL');
      console.log('   4. Po wykonaniu uruchom: npm run update:organizer-images');
      return;
    }
    
    console.log('⚠️  Nie można automatycznie dodać kolumny.');
    console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
    console.log('─'.repeat(70));
    console.log(sql);
    console.log('─'.repeat(70));
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
    console.log('─'.repeat(70));
    console.log('ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
    console.log('─'.repeat(70));
  }
}

addImagesColumn()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

