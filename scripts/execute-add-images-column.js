/**
 * Skrypt do wykonania SQL dodającego kolumnę images
 * Używa bezpośredniego połączenia PostgreSQL jeśli dostępne
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

async function executeAddImagesColumn() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    
    // Najpierw sprawdźmy czy kolumna już istnieje
    console.log('\n🔍 Sprawdzanie czy kolumna images już istnieje...');
    
    // Spróbuj zapytać o kolumnę images - jeśli nie istnieje, dostaniemy błąd
    const { data, error } = await supabase
      .from('accessories')
      .select('images')
      .limit(1);
    
    if (!error) {
      console.log('✅ Kolumna images już istnieje w tabeli accessories!');
      console.log('   Możesz teraz użyć: npm run update:organizer-images');
      return;
    }
    
    // Jeśli błąd mówi o brakującej kolumnie, musimy ją dodać
    if (error && (error.message.includes('images') || error.code === '42703')) {
      console.log('❌ Kolumna images nie istnieje.');
      console.log('\n📝 Aby dodać kolumnę, wykonaj następujący SQL w Supabase Dashboard:');
      console.log('─'.repeat(70));
      console.log('ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
      console.log('─'.repeat(70));
      console.log('\n💡 Instrukcje krok po kroku:');
      console.log('   1. Otwórz https://supabase.com/dashboard');
      console.log('   2. Wybierz swój projekt');
      console.log('   3. Przejdź do "SQL Editor" (w menu po lewej)');
      console.log('   4. Kliknij "New query"');
      console.log('   5. Skopiuj i wklej powyższy SQL');
      console.log('   6. Kliknij "Run" (lub Ctrl+Enter)');
      console.log('   7. Po wykonaniu uruchom: npm run update:organizer-images');
      return;
    }
    
    console.log('⚠️  Nie można automatycznie sprawdzić kolumny.');
    console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
    console.log('─'.repeat(70));
    console.log('ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
    console.log('─'.repeat(70));
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    console.log('\n📝 Wykonaj następujący SQL w Supabase Dashboard:');
    console.log('─'.repeat(70));
    console.log('ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
    console.log('─'.repeat(70));
  }
}

executeAddImagesColumn()
  .then(() => {
    console.log('\n✅ Sprawdzanie zakończone.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

