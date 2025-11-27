/**
 * Skrypt do dodania kolumny images do tabeli accessories
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
    
    // Sprawdź czy kolumna już istnieje
    console.log('\n🔍 Sprawdzanie czy kolumna images już istnieje...');
    const { data: columns, error: checkError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'accessories' 
          AND column_name = 'images';
        `
      });
    
    // Spróbuj dodać kolumnę przez SQL
    console.log('\n➕ Dodawanie kolumny images...');
    const sql = `
      ALTER TABLE accessories 
      ADD COLUMN IF NOT EXISTS images TEXT[];
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', { sql });
    
    if (alterError) {
      console.log('⚠️  Nie można wykonać przez RPC, sprawdzam alternatywną metodę...');
      console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
      console.log('─'.repeat(60));
      console.log(sql);
      console.log('─'.repeat(60));
      console.log('\n💡 Po wykonaniu SQL, uruchom ponownie skrypt dodawania organizera.');
      return;
    }
    
    console.log('✅ Kolumna images została dodana pomyślnie!');
    console.log('\n💡 Teraz możesz dodać rekord z wieloma obrazami.');
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
    console.log('─'.repeat(60));
    console.log('ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
    console.log('─'.repeat(60));
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

